import { PlatformType } from '@lvce-editor/constants'
import { createElectronRpc } from '../IpcParentWithElectron/IpcParentWithElectron.ts'
import { createWebSocketRpc } from '../IpcParentWithWebSocket/IpcParentWithWebSocket.ts'
import { set } from '../IpcState/IpcState.ts'
import { platform } from '../Platform/Platform.ts'
import { VError } from '../VError/VError.ts'

const doCreate = () => {
  const options = {
    initialCommand: 'HandleMessagePortForTerminalProcess.handleMessagePortForTerminalProcess',
    name: 'Terminal Process',
    type: 'terminal-process',
  }
  if (platform === PlatformType.Electron) {
    return createElectronRpc(options)
  }
  return createWebSocketRpc(options)
}

export const launchTerminalProcess = async () => {
  try {
    const rpc = await doCreate()
    set(rpc)
  } catch (error) {
    throw new VError(error, 'Failed to create terminal connection')
  }
}
