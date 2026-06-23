import { expect, jest, test } from '@jest/globals'

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

jest.unstable_mockModule('../src/parts/TerminalEmulator/TerminalEmulator.ts', () => {
  return {
    create: jest.fn(),
  }
})

const Terminal = await import('../src/parts/Terminal/Terminal.ts')

const getText = (data: Uint8Array): string => {
  return new TextDecoder().decode(data)
}

test('create - real backend by default', async () => {
  await Terminal.create(100, '/test', 'bash', [])
  expect(terminalProcessListen).toHaveBeenCalledTimes(1)
  expect(terminalProcessInvoke).toHaveBeenCalledWith('Terminal.create', 100, '/test', 'bash', [])
})

test('create - mock backend', async () => {
  await Terminal.create(101, '/test', 'bash', [], { backend: 'mock' })
  expect(terminalProcessInvoke).not.toHaveBeenCalledWith('Terminal.create', 101, '/test', 'bash', [])
})

test('write - mock backend stores files across commands', async () => {
  rendererInvoke.mockClear()
  await Terminal.create(102, '/test', 'bash', [], { backend: 'mock' })
  await Terminal.write(102, 'echo hello > file.txt\r')
  await Terminal.write(102, 'cat file.txt\r')

  const text = rendererInvoke.mock.calls.map((call) => getText(call[3] as Uint8Array)).join('')
  expect(text).toContain('echo hello > file.txt')
  expect(text).toContain('cat file.txt')
  expect(text).toContain('hello')
})

test('handleMessage - forwards xterm backend data to renderer worker', async () => {
  rendererInvoke.mockClear()
  await Terminal.create(103, '/test', 'bash', [], { backend: 'mock' })
  await Terminal.handleMessage(103, 'handleData', 'abc')
  expect(rendererInvoke).toHaveBeenCalledWith('Viewlet.send', 103, 'handleData', new TextEncoder().encode('abc'))
})
