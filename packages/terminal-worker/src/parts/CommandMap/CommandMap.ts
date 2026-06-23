import * as OffscreenCanvas from '../OffscreenCanvas/OffscreenCanvas.ts'
import * as Terminal from '../Terminal/Terminal.ts'

export const commandMap = {
  'OffscreenCanvas.handleResult': OffscreenCanvas.handleResult,
  'Terminal.create': Terminal.create,
  'Terminal.handleBlur': Terminal.handleBlur,
  'Terminal.handleKeyDown': Terminal.handleKeyDown,
  'Terminal.handleMouseDown': Terminal.handleMouseDown,
  'Terminal.write': Terminal.write,
  'Terminal.resize': Terminal.resize,
  'Terminal.dispose': Terminal.dispose,
  'Viewlet.send': Terminal.handleMessage,
}
