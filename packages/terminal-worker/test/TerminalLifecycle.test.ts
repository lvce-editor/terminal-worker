import { expect, jest, test } from '@jest/globals'

const invoke = jest.fn<(...args: any[]) => Promise<void>>()
const send = jest.fn()
const release = jest.fn(async () => {})
jest.unstable_mockModule('@lvce-editor/rpc-registry', () => ({ RendererWorker: { invoke: async () => {} } }))
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
