import * as Assert from '../Assert/Assert.ts'

export const create = async ({ offscreenCanvasCursor, offscreenCanvasText, focusTextArea, handleInput }) => {
  Assert.object(offscreenCanvasCursor)
  Assert.object(offscreenCanvasText)
  const url = '/static/js/termterm.js'
  // @ts-ignore
  const { createOffscreenTerminal } = await import(url)
  const terminal = createOffscreenTerminal({
    canvasCursor: offscreenCanvasCursor,
    canvasText: offscreenCanvasText,
    focusTextArea,
    handleInput,
  })
  return terminal
}
