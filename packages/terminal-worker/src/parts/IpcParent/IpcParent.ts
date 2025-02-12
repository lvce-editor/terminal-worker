import * as IpcParentModule from '../IpcParentModule/IpcParentModule.ts'

export const create = async ({ method, ...options }) => {
  const module = IpcParentModule.getModule(method)
  // @ts-ignore
  const rawIpc = await module.create(options)
  if (options.raw) {
    return rawIpc
  }
  const ipc = module.wrap(rawIpc)
  return ipc
}
