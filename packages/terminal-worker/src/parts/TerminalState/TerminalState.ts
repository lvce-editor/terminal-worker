export interface TerminalState {
  readonly backend: string
  readonly renderer: string
}

const state = {
  terminals: Object.create(null) as Record<number, TerminalState>,
}

export const get = (id: number): TerminalState | undefined => {
  return state.terminals[id]
}

export const set = (id: number, terminal: TerminalState): void => {
  state.terminals[id] = terminal
}

export const remove = (id: number): void => {
  delete state.terminals[id]
}
