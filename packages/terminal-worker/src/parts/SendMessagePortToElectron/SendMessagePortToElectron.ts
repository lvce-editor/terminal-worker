import { RendererWorker } from '@lvce-editor/rpc-registry'

export const sendMessagePortToElectron = async (port, initialCommand) => {
  await RendererWorker.invokeAndTransfer('SendMessagePortToElectron.sendMessagePortToElectron', port, initialCommand)
}
