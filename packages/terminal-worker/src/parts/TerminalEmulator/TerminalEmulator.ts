import { createOffscreenTerminal } from 'termterm'
import * as Assert from '../Assert/Assert.ts'

export const create = async ({ offscreenCanvasCursor, offscreenCanvasText, focusTextArea, handleInput }) => {
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
