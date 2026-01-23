import * as GetData from '../GetData/GetData.ts'
import * as IpcParentWithElectron from '../IpcParentWithElectron/IpcParentWithElectron.ts'
import * as IpcParentWithWebSocket from '../IpcParentWithWebSocket/IpcParentWithWebSocket.ts'
import * as Platform from '../Platform/Platform.ts'
import * as PlatformType from '../PlatformType/PlatformType.ts'

export const create = async (options) => {
  switch (Platform.platform) {
    case PlatformType.Electron:
      return IpcParentWithElectron.createElectronRpc(options)
    case PlatformType.Remote:
    case PlatformType.Web:
      const module = IpcParentWithWebSocket
      const rawIpc = await module.create(options)
      if (options.raw) {
        return rawIpc
      }
      return {
        module,
        rawIpc,
      }
    default:
      throw new Error('unsupported platform')
  }
}

export const wrap = (port) => {
  if (!(port instanceof MessagePort)) {
    return port.module.wrap(port.rawIpc)
  }
  return {
    /**
     * @type {any}
     */
    listener: undefined,
    get onmessage() {
      return this.listener
    },
    set onmessage(listener) {
      this.listener = listener
      const wrappedListener = (event) => {
        const data = GetData.getData(event)
        // @ts-ignore
        listener({
          data,
          target: this,
        })
      }
      this.port.onmessage = wrappedListener
    },
    port,
    send(message) {
      this.port.postMessage(message)
    },
    sendAndTransfer(message, transfer) {
      this.port.postMessage(message, transfer)
    },
  }
}
