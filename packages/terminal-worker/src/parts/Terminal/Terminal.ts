import { RendererWorker } from '@lvce-editor/rpc-registry'
import * as TerminalBackendType from '../TerminalBackendType/TerminalBackendType.ts'
import * as TerminalMockBackend from '../TerminalMockBackend/TerminalMockBackend.ts'
import * as TerminalProcess from '../TerminalProcess/TerminalProcess.ts'
import * as TerminalState from '../TerminalState/TerminalState.ts'
import * as ToUint8Array from '../ToUint8Array/ToUint8Array.ts'

const closing = new Set<number>()
const sessions = new Map<number, { ready: Promise<void>; connection: ReturnType<typeof TerminalProcess.acquire> }>()

const forwardData = async (id: number, data: unknown): Promise<void> => {
  const parsedData = ToUint8Array.toUint8Array(data)
  await RendererWorker.invoke('Viewlet.send', id, 'handleData', parsedData)
}

const forwardExit = async (id: number, data: unknown): Promise<void> => {
  await RendererWorker.invoke('Viewlet.send', id, 'handleExit', data)
  await dispose(id)
}

export const create = async (
  id: number,
  cwd: string,
  command: string,
  args: readonly string[],
  options: { readonly backend?: string } = {},
): Promise<void> => {
  if (TerminalState.get(id) || closing.has(id)) throw new Error(`Terminal ${id} already exists`)
  const backend = options.backend || TerminalBackendType.Real
  TerminalState.set(id, {
    backend,
  })
  if (backend === TerminalBackendType.Mock) {
    TerminalMockBackend.create(
      id,
      cwd,
      (data) => forwardData(id, data),
      (data) => forwardExit(id, data),
    )
    return
  }
  const connection = TerminalProcess.acquire()
  const ready = (async () => {
    const rpc = await connection.ready
    await rpc.invoke('Terminal.create', id, cwd, command, args)
  })()
  const session = { connection, ready }
  sessions.set(id, session)
  try {
    await ready
  } catch (error) {
    if (sessions.get(id) === session) {
      sessions.delete(id)
      TerminalState.remove(id)
    }
    await connection.release()
    throw error
  }
}

export const handleMessage = async (id: number, method: string, data: unknown): Promise<void> => {
  if (method === 'handleData') {
    await forwardData(id, data)
    return
  }
  if (method === 'handleExit') {
    await forwardExit(id, data)
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
  const session = sessions.get(id)
  if (!session) return
  await session.ready
  if (sessions.get(id) !== session) return
  const rpc = await session.connection.ready
  rpc.send('Terminal.write', id, data)
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
  const session = sessions.get(id)
  if (!session) return
  await session.ready
  if (sessions.get(id) !== session) return
  const rpc = await session.connection.ready
  rpc.send('Terminal.resize', id, columns, rows)
}

export const dispose = async (id: number): Promise<void> => {
  const terminal = TerminalState.get(id)
  const session = sessions.get(id)
  TerminalState.remove(id)
  sessions.delete(id)
  if (terminal?.backend === TerminalBackendType.Mock) {
    TerminalMockBackend.dispose(id)
  } else if (session) {
    closing.add(id)
    try {
      await session.ready
      const rpc = await session.connection.ready
      await rpc.invoke('Terminal.dispose', id)
    } finally {
      closing.delete(id)
      await session.connection.release()
    }
  }
}
