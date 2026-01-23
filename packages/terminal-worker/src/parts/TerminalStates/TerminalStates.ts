import * as ViewletRegistry from '@lvce-editor//viewlet-registry'
import type { TerminalState as TerminalState } from '../TerminalState/TerminalState.ts'

export const {   registerCommands,   } = ViewletRegistry.create<TerminalState>()
