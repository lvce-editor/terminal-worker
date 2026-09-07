import { WebSocketRpcParent, WebSocketRpcParent2 } from '@lvce-editor/rpc'
import { RendererWorker } from '@lvce-editor/rpc-registry'
import * as Assert from '../Assert/Assert.ts'
import * as CommandMapRef from '../CommandMapRef/CommandMapRef.ts'

export const createWebSocketRpc = async ({ onClose, type }: { type: string; onClose?: () => void }) => {
  Assert.string(type)
  try {
    const { protocols, url } = (await RendererWorker.invoke('WebSocketCapability.create', type)) as {
      readonly protocols: string[]
      readonly url: string
    }
    const webSocket = new WebSocket(url, protocols)
    if (onClose) webSocket.addEventListener('close', onClose, { once: true })
    return WebSocketRpcParent.create({
      commandMap: CommandMapRef.commandMapRef,
      webSocket,
    })
  } catch (error) {
    if (
      !(
        error instanceof Error &&
        (error.message.includes('WebSocketCapability.create') || error.message.includes('module WebSocketCapability not found')) &&
        /command not found|not found/i.test(error.message)
      )
    ) {
      throw error
    }
  }
  return WebSocketRpcParent2.create({
    commandMap: CommandMapRef.commandMapRef,
    type,
  })
}
