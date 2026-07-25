import { beforeEach, expect, jest, test } from '@jest/globals'

const rendererInvoke = jest.fn()
const terminalProcessInvoke = jest.fn()
const terminalProcessListen = jest.fn()
const terminalProcessSend = jest.fn()

jest.unstable_mockModule('@lvce-editor/rpc-registry', () => {
  return {
    RendererWorker: {
      invoke: rendererInvoke,
    },
  }
})

jest.unstable_mockModule('../src/parts/TerminalProcess/TerminalProcess.ts', () => {
  return {
    invoke: terminalProcessInvoke,
    listen: terminalProcessListen,
    send: terminalProcessSend,
  }
})

const Terminal = await import('../src/parts/Terminal/Terminal.ts')

const getText = (data: Uint8Array): string => {
  return new TextDecoder().decode(data)
}

beforeEach(() => {
  rendererInvoke.mockClear()
  terminalProcessInvoke.mockClear()
  terminalProcessListen.mockClear()
  terminalProcessSend.mockClear()
})

test('create - real backend by default', async () => {
  await Terminal.create(100, '/test', 'bash', [])
  expect(terminalProcessListen).toHaveBeenCalledTimes(1)
  expect(terminalProcessInvoke).toHaveBeenCalledWith('Terminal.create', 100, '/test', 'bash', [])
})

test('create - mock backend', async () => {
  await Terminal.create(101, '/test', 'bash', [], { backend: 'mock' })
  expect(terminalProcessListen).not.toHaveBeenCalled()
  expect(terminalProcessInvoke).not.toHaveBeenCalled()
  expect(rendererInvoke).toHaveBeenCalledWith('Viewlet.send', 101, 'handleData', new TextEncoder().encode('$ '))
})

test('write - mock backend stores files across commands', async () => {
  await Terminal.create(102, '/test', 'bash', [], { backend: 'mock' })
  await Terminal.write(102, 'echo hello > file.txt\r')
  await Terminal.write(102, 'cat file.txt\r')

  const text = rendererInvoke.mock.calls.map((call) => getText(call[3] as Uint8Array)).join('')
  expect(text).toContain('echo hello > file.txt')
  expect(text).toContain('cat file.txt')
  expect(text).toContain('hello')
})

test('write - real backend forwards input to pty host', async () => {
  await Terminal.create(103, '/test', 'bash', [])
  await Terminal.write(103, 'echo hello\r')
  expect(terminalProcessSend).toHaveBeenCalledWith('Terminal.write', 103, 'echo hello\r')
})

test('resize - real backend forwards dimensions to pty host', async () => {
  await Terminal.create(104, '/test', 'bash', [])
  await Terminal.resize(104, 120, 40)
  expect(terminalProcessSend).toHaveBeenCalledWith('Terminal.resize', 104, 120, 40)
})

test('resize - mock backend accepts dimensions', async () => {
  await Terminal.create(105, '/test', 'bash', [], { backend: 'mock' })
  await expect(Terminal.resize(105, 120, 40)).resolves.toBeUndefined()
  expect(terminalProcessSend).not.toHaveBeenCalled()
})

test('dispose - real backend disposes pty and removes state', async () => {
  await Terminal.create(106, '/test', 'bash', [])
  await Terminal.dispose(106)
  await Terminal.write(106, 'ignored')
  expect(terminalProcessSend).toHaveBeenCalledTimes(1)
  expect(terminalProcessSend).toHaveBeenCalledWith('Terminal.dispose', 106)
})

test('dispose - mock backend removes terminal', async () => {
  await Terminal.create(107, '/test', 'bash', [], { backend: 'mock' })
  await Terminal.dispose(107)
  await expect(Terminal.write(107, 'ignored')).resolves.toBeUndefined()
  expect(terminalProcessSend).not.toHaveBeenCalled()
})

test('handleMessage - forwards xterm backend data to renderer worker', async () => {
  await Terminal.handleMessage(108, 'handleData', 'abc')
  expect(rendererInvoke).toHaveBeenCalledWith('Viewlet.send', 108, 'handleData', new TextEncoder().encode('abc'))
})

test('handleMessage - ignores unrelated viewlet messages', async () => {
  await Terminal.handleMessage(109, 'focus', undefined)
  expect(rendererInvoke).not.toHaveBeenCalled()
})
