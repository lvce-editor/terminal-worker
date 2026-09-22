import { expect, jest, test } from '@jest/globals'

const invoke = jest.fn<(...args: any[]) => Promise<void>>()
const send = jest.fn()
const release = jest.fn(async () => {})
const rendererInvoke = jest.fn(async (..._args: unknown[]) => {})
jest.unstable_mockModule('@lvce-editor/rpc-registry', () => ({ RendererWorker: { invoke: rendererInvoke } }))
jest.unstable_mockModule('../src/parts/TerminalProcess/TerminalProcess.ts', () => ({
  acquire: () => ({ ready: Promise.resolve({ invoke, send }), release }),
}))
const Terminal = await import('../src/parts/Terminal/Terminal.ts')

test('close during creation waits for creation and releases exactly once', async () => {
  const created = Promise.withResolvers<void>()
  invoke.mockImplementation(async (method) => {
    if (method === 'Terminal.create') await created.promise
  })
  const opening = Terminal.create(201, '/', 'bash', [])
  const closing = Terminal.dispose(201)
  await Terminal.dispose(201)
  await Terminal.write(201, 'ignored')
  expect(release).not.toHaveBeenCalled()
  created.resolve()
  await Promise.all([opening, closing])
  expect(invoke.mock.calls.map(([method]) => method)).toEqual(['Terminal.create', 'Terminal.dispose'])
  expect(release).toHaveBeenCalledTimes(1)
  expect(send).not.toHaveBeenCalled()
})

test('failed terminal creation releases its reservation and removes state', async () => {
  release.mockClear()
  invoke.mockRejectedValueOnce(new Error('spawn failed'))
  await expect(Terminal.create(202, '/', 'bash', [])).rejects.toThrow('spawn failed')
  await Terminal.dispose(202)
  expect(release).toHaveBeenCalledTimes(1)
})

test('persistent creation forwards the capability and restore-only flag', async () => {
  invoke.mockResolvedValueOnce({ attached: true } as never)
  const options = { restoreOnly: true, sessionToken: 'a'.repeat(64) }
  expect(await Terminal.create(203, '/', 'bash', [], options)).toEqual({ attached: true })
  expect(invoke).toHaveBeenLastCalledWith('Terminal.create', 203, '/', 'bash', [], options)
  await Terminal.dispose(203)
})

test('expired restore releases its connection without spawning or keeping terminal state', async () => {
  release.mockClear()
  invoke.mockResolvedValueOnce({ attached: false } as never)
  expect(await Terminal.create(204, '/', 'bash', [], { restoreOnly: true, sessionToken: 'b'.repeat(64) })).toEqual({ attached: false })
  await Terminal.dispose(204)
  expect(release).toHaveBeenCalledTimes(1)
})

test('screen snapshots are forwarded intact before live output', async () => {
  rendererInvoke.mockClear()
  const snapshot = { columns: 100, data: 'screen', rows: 30 }
  await Terminal.handleMessage(205, 'handleRestore', snapshot)
  await Terminal.handleMessage(205, 'handleData', 'live')
  expect(rendererInvoke.mock.calls).toEqual([
    ['Viewlet.send', 205, 'handleRestore', snapshot],
    ['Viewlet.send', 205, 'handleData', new TextEncoder().encode('live')],
  ])
})
