import { RendererWorker } from '@lvce-editor/rpc-registry'
import * as CommandMap from '../CommandMap/CommandMap.ts'
import * as CommandMapRef from '../CommandMapRef/CommandMapRef.ts'
import { registerCommands } from '../TerminalStates/TerminalStates.ts'

export const listen = async (): Promise<void> => {
  registerCommands(CommandMap.commandMap)
  Object.assign(CommandMapRef.commandMapRef, CommandMap.commandMap)
  await RendererWorker.initializeRendererWorkerForWorker(CommandMap.commandMap)
}
