import * as Terminal from '../Terminal/Terminal.ts'
import * as TerminalProcess from '../TerminalProcess/TerminalProcess.ts'

export const commandMap = {
  'Terminal.create': Terminal.create,
  'Terminal.dispose': Terminal.dispose,
  'Terminal.resize': Terminal.resize,
  'Terminal.resetWorkspaceConnection': TerminalProcess.resetWorkspaceConnection,
  'Terminal.write': Terminal.write,
  'Viewlet.send': Terminal.handleMessage,
}
