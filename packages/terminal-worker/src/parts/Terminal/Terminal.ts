import { RendererWorker } from '@lvce-editor/rpc-registry'
import * as TerminalBackendType from '../TerminalBackendType/TerminalBackendType.ts'
import * as TerminalMockBackend from '../TerminalMockBackend/TerminalMockBackend.ts'
import * as TerminalProcess from '../TerminalProcess/TerminalProcess.ts'
import * as TerminalState from '../TerminalState/TerminalState.ts'
import * as ToUint8Array from '../ToUint8Array/ToUint8Array.ts'

const forwardData = async (id: number, data: unknown): Promise<void> => {
  const parsedData = ToUint8Array.toUint8Array(data)
  await RendererWorker.invoke('Viewlet.send', id, 'handleData', parsedData)
}

export const create = async (
  id: number,
  cwd: string,
  command: string,
  args: readonly string[],
  options: { readonly backend?: string } = {},
): Promise<void> => {
  const backend = options.backend || TerminalBackendType.Real
  TerminalState.set(id, {
    backend,
  })
  if (backend === TerminalBackendType.Mock) {
    TerminalMockBackend.create(id, cwd, (data) => {
      void forwardData(id, data)
    })
    return
  }
  await TerminalProcess.listen()
  await TerminalProcess.invoke('Terminal.create', id, cwd, command, args)
}

export const handleMessage = async (id: number, method: string, data: unknown): Promise<void> => {
  if (method === 'handleData') {
    await forwardData(id, data)
  }
}

export const write = async (id: number, data: string): Promise<void> => {
  const terminal = TerminalState.get(id)
  if (!terminal) {
    return
  }
  if (terminal.backend === TerminalBackendType.Mock) {
    await TerminalMockBackend.write(id, data)
    return
  }
  await TerminalProcess.listen()
  TerminalProcess.send('Terminal.write', id, data)
}

export const resize = async (id: number, columns: number, rows: number): Promise<void> => {
  const terminal = TerminalState.get(id)
  if (!terminal) {
    return
  }
  if (terminal.backend === TerminalBackendType.Mock) {
    TerminalMockBackend.resize(id, columns, rows)
    return
  }
  await TerminalProcess.listen()
  TerminalProcess.send('Terminal.resize', id, columns, rows)
}

export const dispose = async (id: number): Promise<void> => {
  const terminal = TerminalState.get(id)
  if (terminal?.backend === TerminalBackendType.Mock) {
    TerminalMockBackend.dispose(id)
  } else if (terminal) {
    await TerminalProcess.listen()
    TerminalProcess.send('Terminal.dispose', id)
  }
  TerminalState.remove(id)
}
