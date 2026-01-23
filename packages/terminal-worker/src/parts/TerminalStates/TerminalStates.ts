import * as ViewletRegistry from '@lvce-editor//viewlet-registry'
import type { TerminalState as TerminalState } from '../TerminalState/TerminalState.ts'

export const { get, getCommandIds, registerCommands, set, wrapGetter } = ViewletRegistry.create<TerminalState>()
