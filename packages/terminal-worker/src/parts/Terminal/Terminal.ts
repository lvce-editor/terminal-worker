import { RendererWorker } from '@lvce-editor/rpc-registry'
import * as OffscreenCanvas from '../OffscreenCanvas/OffscreenCanvas.ts'
import * as TerminalBackendType from '../TerminalBackendType/TerminalBackendType.ts'
import * as TerminalEmulator from '../TerminalEmulator/TerminalEmulator.ts'
import * as TerminalEmulatorState from '../TerminalEmulatorState/TerminalEmulatorState.ts'
import * as TerminalMockBackend from '../TerminalMockBackend/TerminalMockBackend.ts'
import * as TerminalProcess from '../TerminalProcess/TerminalProcess.ts'
import * as TerminalState from '../TerminalState/TerminalState.ts'
import * as ToUint8Array from '../ToUint8Array/ToUint8Array.ts'

const rendererXterm = 'xterm'

const createLegacy = async (canvasTextId: number, canvasCursorId: number, id: number, cwd: string, command: string, args: readonly string[]): Promise<void> => {
  await TerminalProcess.listen()
  const canvasCursor = await OffscreenCanvas.create(canvasCursorId)
  const canvasText = await OffscreenCanvas.create(canvasTextId)
  const emulator = await TerminalEmulator.create({
    focusTextArea() {
      // TODO
    },
    handleInput(input) {
      TerminalProcess.send('Terminal.write', id, input)
    },
    offscreenCanvasCursor: canvasCursor,
    offscreenCanvasText: canvasText,
  })
  TerminalEmulatorState.set(id, emulator)
  await TerminalProcess.invoke('Terminal.create', id, cwd, command, args)
}

const forwardData = async (id: number, data: unknown): Promise<void> => {
  const parsedData = ToUint8Array.toUint8Array(data)
  await RendererWorker.invoke('Viewlet.send', id, 'handleData', parsedData)
}

const createTransport = async (
  id: number,
  cwd: string,
  command: string,
  args: readonly string[],
  options: { readonly backend?: string; readonly renderer?: string } = {},
): Promise<void> => {
  const backend = options.backend || TerminalBackendType.Real
  TerminalState.set(id, {
    backend,
    renderer: options.renderer || rendererXterm,
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

export const create = async (...args: readonly any[]): Promise<void> => {
  if (typeof args[1] === 'number') {
    await createLegacy(args[0], args[1], args[2], args[3], args[4], args[5])
    return
  }
  await createTransport(args[0], args[1], args[2], args[3], args[4])
}

export const handleMessage = async (id: any, method: string, ...args: readonly any[]): Promise<void> => {
  const emulator = TerminalEmulatorState.get(id)
  if (method === 'handleData') {
    const data = args[0]
    const parsedData = ToUint8Array.toUint8Array(data)
    if (!emulator) {
      await forwardData(id, parsedData)
      return
    }
    emulator.write(parsedData)
  }
}

export const handleBlur = (id: any) => {
  const emulator = TerminalEmulatorState.get(id)
  if (!emulator) {
    return
  }
  emulator.handleBlur()
}

export const handleKeyDown = (id: any, key: any) => {
  const emulator = TerminalEmulatorState.get(id)
  if (!emulator) {
    return
  }
  emulator.handleKeyDown(key)
}

export const handleMouseDown = (id: any) => {
  const emulator = TerminalEmulatorState.get(id)
  if (!emulator) {
    return
  }
  emulator.handleMouseDown()
}

export const write = async (id: number, data: string): Promise<void> => {
  const terminal = TerminalState.get(id)
  if (terminal?.backend === TerminalBackendType.Mock) {
    await TerminalMockBackend.write(id, data)
    return
  }
  await TerminalProcess.listen()
  TerminalProcess.send('Terminal.write', id, data)
}

export const resize = async (id: number, columns: number, rows: number): Promise<void> => {
  const terminal = TerminalState.get(id)
  if (terminal?.backend === TerminalBackendType.Mock) {
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
  TerminalEmulatorState.remove(id)
}
