import * as HandleIpc from '../HandleIpc/HandleIpc.ts'
import * as IpcParent from '../IpcParent/IpcParent.ts'
import * as IpcParentType from '../IpcParentType/IpcParentType.ts'
import * as TerminalProcessState from '../TerminalProcessState/TerminalProcessState.ts'
import { VError } from '../VError/VError.ts'

export const launchTerminalProcess = async () => {
  try {
    const ipc = await IpcParent.create({
      initialCommand: 'HandleMessagePortForTerminalProcess.handleMessagePortForTerminalProcess',
      method: IpcParentType.NodeAlternate,
      name: 'Terminal Process',
      type: 'terminal-process',
    })
    TerminalProcessState.state.ipc = ipc
    HandleIpc.handleIpc(ipc)
  } catch (error) {
    throw new VError(error, 'Failed to create terminal connection')
  }
}
