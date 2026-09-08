import { MessagePortRpcParent } from '@lvce-editor/rpc'
import * as CommandMapRef from '../CommandMapRef/CommandMapRef.ts'
import * as SendMessagePortToElectron from '../SendMessagePortToElectron/SendMessagePortToElectron.ts'

export const createElectronRpc = async (options) => {
  const { port1, port2 } = new MessageChannel()
  if (options.onClose) {
    port2.addEventListener('close', options.onClose, { once: true })
  }
  try {
    await SendMessagePortToElectron.sendMessagePortToElectron(port1, options.initialCommand)
    const rpc = await MessagePortRpcParent.create({ commandMap: CommandMapRef.commandMapRef, isMessagePortOpen: true, messagePort: port2 })
    port2.start()
    return rpc
  } catch (error) {
    port1.close()
    port2.close()
    throw error
  }
}
