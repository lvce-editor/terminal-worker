import { WebSocketRpcParent2 } from '@lvce-editor/rpc'
import * as Assert from '../Assert/Assert.ts'
import * as CommandMapRef from '../CommandMapRef/CommandMapRef.ts'

export const createWebSocketRpc = async ({ type }: { type: string }) => {
  Assert.string(type)
  const rpc = WebSocketRpcParent2.create({
    commandMap: CommandMapRef.commandMapRef,

    type,
  })
  return rpc
}
