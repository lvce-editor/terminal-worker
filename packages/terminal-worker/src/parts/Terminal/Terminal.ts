import * as OffscreenCanvas from '../OffscreenCanvas/OffscreenCanvas.ts'
import * as TerminalEmulator from '../TerminalEmulator/TerminalEmulator.ts'
import * as TerminalEmulatorState from '../TerminalEmulatorState/TerminalEmulatorState.ts'
import * as TerminalProcess from '../TerminalProcess/TerminalProcess.ts'
import * as ToUint8Array from '../ToUint8Array/ToUint8Array.ts'

export const create = async (canvasTextId: number, canvasCursorId: number, id: number, cwd: string, command: string, args: readonly string[]) => {
  await TerminalProcess.listen()
  const canvasCursor = await OffscreenCanvas.create(canvasCursorId)
  const canvasText = await OffscreenCanvas.create(canvasTextId)
  const emulator = await TerminalEmulator.create({
    offscreenCanvasCursor: canvasCursor,
    offscreenCanvasText: canvasText,
    focusTextArea() {
      // TODO
    },
    handleInput(input) {
      TerminalProcess.send('Terminal.write', id, input)
    },
  })
  TerminalEmulatorState.set(id, emulator)
  await TerminalProcess.invoke('Terminal.create', id, cwd, command, args)
}

export const handleMessage = (id: any, method: string, ...args: readonly any[]) => {
  const emulator = TerminalEmulatorState.get(id)
  if (method === 'handleData') {
    const data = args[0]
    const parsedData = ToUint8Array.toUint8Array(data)
    emulator.write(parsedData)
  }
}

export const handleBlur = (id: any) => {
  const emulator = TerminalEmulatorState.get(id)
  emulator.handleBlur()
}

export const handleKeyDown = (id: any, key: any) => {
  const emulator = TerminalEmulatorState.get(id)
  emulator.handleKeyDown(key)
}

export const handleMouseDown = (id: any) => {
  const emulator = TerminalEmulatorState.get(id)
  emulator.handleMouseDown()
}
