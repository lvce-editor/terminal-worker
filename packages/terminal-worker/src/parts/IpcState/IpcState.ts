import type { Rpc } from '@lvce-editor/rpc'

interface State {
  rpc: Rpc | undefined
}

const state: State = {
  rpc: undefined,
}

export const set = (rpc: Rpc | undefined): void => {
  state.rpc = rpc
}

export const get = () => {
  return state.rpc
}
