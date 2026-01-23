import { TransferMessagePortRpcParent } from '@lvce-editor/rpc'
import * as CommandMapRef from '../CommandMapRef/CommandMapRef.ts'
import * as SendMessagePortToElectron from '../SendMessagePortToElectron/SendMessagePortToElectron.ts'

export const createElectronRpc = async (options) => {
  const rpc = await TransferMessagePortRpcParent.create({
    commandMap: CommandMapRef.commandMapRef,
    send(port) {
      return SendMessagePortToElectron.sendMessagePortToElectron(port, options.initialCommand)
    },
  })
  return rpc
}
