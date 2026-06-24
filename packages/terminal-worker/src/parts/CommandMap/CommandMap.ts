import * as OffscreenCanvas from '../OffscreenCanvas/OffscreenCanvas.ts'
import * as Terminal from '../Terminal/Terminal.ts'

export const commandMap = {
  'OffscreenCanvas.handleResult': OffscreenCanvas.handleResult,
  'Terminal.create': Terminal.create,
  'Terminal.dispose': Terminal.dispose,
  'Terminal.handleBlur': Terminal.handleBlur,
  'Terminal.handleKeyDown': Terminal.handleKeyDown,
  'Terminal.handleMouseDown': Terminal.handleMouseDown,
  'Terminal.resize': Terminal.resize,
  'Terminal.write': Terminal.write,
  'Viewlet.send': Terminal.handleMessage,
}
