import { get } from '../IpcState/IpcState.ts'
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

export const send = (method, ...params) => {
  const rpc = get()
  if (!rpc) {
    throw new Error('RPC is not initialized')
  }

  return rpc.send(method, ...params)
}
