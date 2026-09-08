import { expect, test } from '@jest/globals'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import { createWebSocketRpc } from '../src/parts/IpcParentWithWebSocket/IpcParentWithWebSocket.ts'

test('uses the workspace extension port in a browser host without a terminal WebSocket', async () => {
  let serverPort: MessagePort | undefined
  using renderer = RendererWorker.registerMockRpc({
    'SendMessagePortToElectron.sendMessagePortToElectron': (port: MessagePort) => {
      serverPort = port
      port.onmessage = (event) => port.postMessage({ id: event.data.id, jsonrpc: '2.0', result: 'remote terminal' })
      port.start()
    },
    'WebSocketCapability.create': () => ({ type: 'message-port' }),
  })
  const rpc = await createWebSocketRpc({ type: 'terminal-process' })
  try {
    await expect(rpc.invoke('Terminal.create', 1, 'remote-ssh://host/work', 'bash', [])).resolves.toBe('remote terminal')
    expect(renderer.invocations[1]?.[0]).toBe('SendMessagePortToElectron.sendMessagePortToElectron')
  } finally {
    await rpc.dispose()
    serverPort?.close()
  }
})

test('reports transport failures without falling back to a local WebSocket', async () => {
  using renderer = RendererWorker.registerMockRpc({
    'SendMessagePortToElectron.sendMessagePortToElectron': () => {
      throw new Error('SSH disconnected')
    },
    'WebSocketCapability.create': () => ({ type: 'message-port' }),
  })
  await expect(createWebSocketRpc({ type: 'terminal-process' })).rejects.toThrow('SSH disconnected')
  expect(renderer.invocations).toHaveLength(2)
})

test('notifies the terminal owner when its workspace port closes', async () => {
  let serverPort: MessagePort | undefined
  const { promise: closed, resolve: onClose } = Promise.withResolvers<void>()
  using _renderer = RendererWorker.registerMockRpc({
    'SendMessagePortToElectron.sendMessagePortToElectron': (port: MessagePort) => {
      serverPort = port
    },
    'WebSocketCapability.create': () => ({ type: 'message-port' }),
  })
  const rpc = await createWebSocketRpc({ onClose, type: 'terminal-process' })
  serverPort?.close()
  await expect(closed).resolves.toBeUndefined()
  await rpc.dispose()
})
