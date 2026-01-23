import { createOffscreenTerminal } from 'termterm'
import * as Assert from '../Assert/Assert.ts'

export const create = async ({ focusTextArea, handleInput, offscreenCanvasCursor, offscreenCanvasText }) => {
  Assert.object(offscreenCanvasCursor)
  Assert.object(offscreenCanvasText)
  const terminal = createOffscreenTerminal({
    canvasCursor: offscreenCanvasCursor,
    canvasText: offscreenCanvasText,
    focusTextArea,
    handleInput,
  })
  return terminal
}
