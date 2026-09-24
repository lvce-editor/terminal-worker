import type { Rpc } from '@lvce-editor/rpc'
import { get, set } from '../IpcState/IpcState.ts'
import * as LaunchTerminalProcess from '../LaunchTerminalProcess/LaunchTerminalProcess.ts'

const state: { generation: number; pending: Promise<Rpc> | undefined } = { generation: 0, pending: undefined }

const launch = async (generation: number): Promise<Rpc> => {
  try {
    const rpc = await LaunchTerminalProcess.launchTerminalProcess()
    if (generation !== state.generation) {
      await rpc.dispose()
      throw new Error('Workspace changed while starting the terminal. Create a new terminal to retry.')
    }
    set(rpc)
    return rpc
  } finally {
    if (generation === state.generation) state.pending = undefined
  }
}

export const listen = async () => {
  const rpc = get()
  if (rpc) {
    return rpc
  }
  state.pending ||= launch(state.generation)
  return state.pending
}

export const invoke = (method, ...params) => {
  const rpc = get()
  if (!rpc) {
    throw new Error('RPC is not initialized')
  }
  return rpc.invoke(method, ...params)
}

interface Connection {
  readonly owners: Set<object>
  readonly ready: Promise<Rpc>
  readonly result: { rpc?: Rpc }
}
const connections: { current?: Connection } = {}

// Existing terminals retain their leased RPC; only new terminals follow the workspace.
export const resetWorkspaceConnection = (): void => {
  state.generation++
  state.pending = undefined
  connections.current = undefined
  set(undefined)
}

export const acquire = () => {
  if (!connections.current || (connections.current.result.rpc && connections.current.result.rpc !== get())) {
    const result: { rpc?: Rpc } = {}
    const connection: Connection = {
      owners: new Set(),
      ready: (async () => {
        const rpc = await listen()
        if (!rpc) throw new Error('Terminal connection closed')
        result.rpc = rpc
        return rpc
      })(),
      result,
    }
    connections.current = connection
  }
  const connection = connections.current
  const owner = {}
  connection.owners.add(owner)
  const release = async (): Promise<void> => {
    if (!connection.owners.delete(owner)) return
    if (connection.owners.size > 0) return
    if (connections.current === connection) connections.current = undefined
    if (get() === connection.result.rpc) set(undefined)
    await connection.result.rpc?.dispose()
  }
  return { ready: connection.ready, release }
}
