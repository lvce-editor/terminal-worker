import type { Rpc } from '@lvce-editor/rpc'
import { afterAll, beforeEach, expect, jest, test } from '@jest/globals'

const createRpc = jest.fn<() => Promise<Rpc>>()
const capability = jest.fn(async () => ({ protocols: [], url: 'wss://example.test/terminal' }))

jest.unstable_mockModule('@lvce-editor/rpc', () => ({
  WebSocketRpcParent: { create: createRpc },
  WebSocketRpcParent2: { create: createRpc },
}))
jest.unstable_mockModule('@lvce-editor/rpc-registry', () => ({ RendererWorker: { invoke: capability } }))
jest.unstable_mockModule('../src/parts/Platform/Platform.ts', () => ({ platform: 'Remote' }))
jest.unstable_mockModule('../src/parts/IpcParentWithElectron/IpcParentWithElectron.ts', () => ({ createElectronRpc: createRpc }))

const IpcState = await import('../src/parts/IpcState/IpcState.ts')
const TerminalProcess = await import('../src/parts/TerminalProcess/TerminalProcess.ts')
const sockets: EventTarget[] = []

class TestSocket extends EventTarget {
  constructor() {
    super()
    sockets.push(this)
  }
}

const rpc = (): Rpc => ({
  dispose: jest.fn(async () => {}),
  invoke: jest.fn(async () => {}),
  invokeAndTransfer: jest.fn(async () => {}),
  send: jest.fn(),
})

beforeEach(() => {
  jest.restoreAllMocks()
  jest.clearAllMocks()
  IpcState.set(undefined)
  sockets.length = 0
  jest.spyOn(globalThis, 'WebSocket').mockImplementation(() => new TestSocket() as unknown as WebSocket)
  createRpc.mockImplementation(async () => rpc())
})

afterAll(() => {
  jest.restoreAllMocks()
  IpcState.set(undefined)
})

test('reconnects after the relay closes the terminal socket', async () => {
  await TerminalProcess.listen()
  const first = IpcState.get()
  sockets[0].dispatchEvent(new Event('close'))
  expect(IpcState.get()).toBeUndefined()

  await TerminalProcess.listen()
  const second = IpcState.get()
  expect(second).not.toBe(first)
  await TerminalProcess.invoke('Terminal.create', 2, '/workspace', 'bash', [])
  expect(second?.invoke).toHaveBeenCalledWith('Terminal.create', 2, '/workspace', 'bash', [])
  expect(first?.invoke).not.toHaveBeenCalled()
})

test('shares a pending connection between terminal requests', async () => {
  await Promise.all([TerminalProcess.listen(), TerminalProcess.listen()])
  expect(createRpc).toHaveBeenCalledTimes(1)
})

test('an old socket closing cannot clear a newer connection', async () => {
  await TerminalProcess.listen()
  const replacement = rpc()
  IpcState.set(replacement)
  sockets[0].dispatchEvent(new Event('close'))
  expect(IpcState.get()).toBe(replacement)
})

test('does not cache a connection that closes during initialization', async () => {
  const started = Promise.withResolvers<void>()
  const connection = Promise.withResolvers<Rpc>()
  createRpc.mockImplementationOnce(() => {
    started.resolve()
    return connection.promise
  })
  const opening = TerminalProcess.listen()
  await started.promise
  sockets[0].dispatchEvent(new Event('close'))
  const closedRpc = rpc()
  connection.resolve(closedRpc)
  await expect(opening).rejects.toThrow('closed')
  expect(IpcState.get()).toBeUndefined()
  expect(closedRpc.dispose).toHaveBeenCalledTimes(1)
  await TerminalProcess.listen()
  expect(IpcState.get()).toBeDefined()
})

test('last owner closes the connection and reopening uses a fresh rpc', async () => {
  const first = TerminalProcess.acquire()
  const second = TerminalProcess.acquire()
  const firstRpc = await first.ready
  expect(await second.ready).toBe(firstRpc)
  await first.release()
  expect(firstRpc.dispose).not.toHaveBeenCalled()
  await second.release()
  expect(IpcState.get()).toBeUndefined()
  expect(firstRpc.dispose).toHaveBeenCalledTimes(1)
  await second.release()
  expect(firstRpc.dispose).toHaveBeenCalledTimes(1)
  const replacement = TerminalProcess.acquire()
  expect(await replacement.ready).not.toBe(firstRpc)
  await replacement.release()
})

test('old owners cannot dispose a replacement after disconnection', async () => {
  const first = TerminalProcess.acquire()
  await first.ready
  sockets[0].dispatchEvent(new Event('close'))
  const second = TerminalProcess.acquire()
  const replacement = await second.ready
  await first.release()
  expect(IpcState.get()).toBe(replacement)
  expect(replacement.dispose).not.toHaveBeenCalled()
  await second.release()
  expect(replacement.dispose).toHaveBeenCalledTimes(1)
})

test('failed acquisition can be released and retried', async () => {
  createRpc.mockRejectedValueOnce(new Error('launch failed'))
  const first = TerminalProcess.acquire()
  await expect(first.ready).rejects.toThrow('launch failed')
  await first.release()
  const second = TerminalProcess.acquire()
  await expect(second.ready).resolves.toBeDefined()
  await second.release()
})

test('a changed workspace capability must not use the existing local terminal connection', async () => {
  capability.mockResolvedValueOnce({ protocols: [], url: 'wss://local.test/terminal' })
  const local = TerminalProcess.acquire()
  const localRpc = await local.ready
  TerminalProcess.resetWorkspaceConnection()
  capability.mockResolvedValueOnce({ protocols: [], url: 'wss://remote.test/terminal' })
  const remote = TerminalProcess.acquire()
  try {
    expect(await remote.ready).not.toBe(localRpc)
  } finally {
    await local.release()
    await remote.release()
  }
})

test('a delayed connection from the previous workspace cannot replace the new connection', async () => {
  const started = Promise.withResolvers<void>()
  const delayed = Promise.withResolvers<Rpc>()
  createRpc.mockImplementationOnce(() => {
    started.resolve()
    return delayed.promise
  })
  const local = TerminalProcess.acquire()
  const rejected = local.ready.catch((error) => error)
  await started.promise
  TerminalProcess.resetWorkspaceConnection()
  const remote = TerminalProcess.acquire()
  const remoteRpc = await remote.ready
  const staleRpc = rpc()
  delayed.resolve(staleRpc)
  expect(await rejected).toEqual(expect.objectContaining({ message: expect.stringContaining('Workspace changed') }))
  await local.release()
  expect(staleRpc.dispose).toHaveBeenCalledTimes(1)
  expect(IpcState.get()).toBe(remoteRpc)
  expect(remoteRpc.dispose).not.toHaveBeenCalled()
  await remote.release()
})
