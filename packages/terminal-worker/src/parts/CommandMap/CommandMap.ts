import * as Terminal from '../Terminal/Terminal.ts'

export const commandMap = {
  'Terminal.create': Terminal.create,
  'Terminal.dispose': Terminal.dispose,
  'Terminal.resize': Terminal.resize,
  'Terminal.write': Terminal.write,
  'Viewlet.send': Terminal.handleMessage,
}
