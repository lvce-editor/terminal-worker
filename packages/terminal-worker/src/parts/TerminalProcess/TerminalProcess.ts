import type { Rpc } from '@lvce-editor/rpc'
import { get, set } from '../IpcState/IpcState.ts'
import * as LaunchTerminalProcess from '../LaunchTerminalProcess/LaunchTerminalProcess.ts'

const state: { pending: Promise<void> | undefined } = { pending: undefined }

const launch = async (): Promise<void> => {
  try {
    await LaunchTerminalProcess.launchTerminalProcess()
  } finally {
    state.pending = undefined
  }
}

export const listen = async () => {
  if (get()) {
    return
  }
  state.pending ||= launch()
  await state.pending
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

export const acquire = () => {
  if (!connections.current || (connections.current.result.rpc && connections.current.result.rpc !== get())) {
    const result: { rpc?: Rpc } = {}
    const connection: Connection = {
      owners: new Set(),
      ready: (async () => {
        await listen()
        const rpc = get()
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
