import * as Assert from '../Assert/Assert.ts'
import { createOffscreenTerminal } from 'termterm'

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
