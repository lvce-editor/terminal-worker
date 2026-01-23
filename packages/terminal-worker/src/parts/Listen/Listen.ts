import * as CommandMap from '../CommandMap/CommandMap.ts'
import * as CommandMapRef from '../CommandMapRef/CommandMapRef.ts'
import { initializeRendererWorker } from '../InitializeRendererWorker/initializeRendereWorker.ts'
import { registerCommands } from '../TerminalStates/TerminalStates.ts'

export const listen = async (): Promise<void> => {
  registerCommands(CommandMap.commandMap)
  Object.assign(CommandMapRef.commandMapRef, CommandMap.commandMap)
  await initializeRendererWorker()
}
