import { PlatformType } from '@lvce-editor/constants'
import * as IpcParentType from '../IpcParentType/IpcParentType.ts'
import { createElectronRpc } from '../IpcParentWithElectron/IpcParentWithElectron.ts'
import { createWebSocketRpc } from '../IpcParentWithWebSocket/IpcParentWithWebSocket.ts'
import { platform } from '../Platform/Platform.ts'
import { VError } from '../VError/VError.ts'

export const launchTerminalProcess = async () => {
  try {
    const options = {
      initialCommand: 'HandleMessagePortForTerminalProcess.handleMessagePortForTerminalProcess',
      method: IpcParentType.NodeAlternate,
      name: 'Terminal Process',
      type: 'terminal-process',
    }
    if (platform === PlatformType.Electron) {
      return createElectronRpc(options)
    }
    return createWebSocketRpc(options)
  } catch (error) {
    throw new VError(error, 'Failed to create terminal connection')
  }
}
