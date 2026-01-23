import { get } from '../IpcState/IpcState.ts'
import * as LaunchTerminalProcess from '../LaunchTerminalProcess/LaunchTerminalProcess.ts'

export const listen = async () => {
  if (get()) {
    return
  }
  await LaunchTerminalProcess.launchTerminalProcess()
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
