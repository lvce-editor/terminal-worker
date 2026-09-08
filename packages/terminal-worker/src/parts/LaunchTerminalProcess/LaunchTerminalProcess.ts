import type { Rpc } from '@lvce-editor/rpc'
import { PlatformType } from '@lvce-editor/constants'
import { createElectronRpc } from '../IpcParentWithElectron/IpcParentWithElectron.ts'
import { createWebSocketRpc } from '../IpcParentWithWebSocket/IpcParentWithWebSocket.ts'
import { get, set } from '../IpcState/IpcState.ts'
import { platform } from '../Platform/Platform.ts'
import { VError } from '../VError/VError.ts'

const doCreate = (onClose: () => void) => {
  const options = {
    initialCommand: 'HandleMessagePortForTerminalProcess.handleMessagePortForTerminalProcess',
    name: 'Terminal Process',
    type: 'terminal-process',
  }
  if (platform === PlatformType.Electron) {
    return createElectronRpc({ ...options, onClose })
  }
  return createWebSocketRpc({ ...options, onClose })
}

export const launchTerminalProcess = async () => {
  try {
    const connection: { closed: boolean; rpc?: Rpc } = { closed: false }
    const onClose = (): void => {
      connection.closed = true
      if (connection.rpc && get() === connection.rpc) set(undefined)
    }
    const rpc = await doCreate(onClose)
    connection.rpc = rpc
    if (connection.closed) {
      await rpc.dispose()
      throw new Error('Terminal connection closed during initialization')
    }
    set(rpc)
  } catch (error) {
    throw new VError(error, 'Failed to create terminal connection')
  }
}
