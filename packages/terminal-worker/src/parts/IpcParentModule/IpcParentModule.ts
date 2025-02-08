import * as IpcParentType from '../IpcParentType/IpcParentType.ts'
import * as IpcParentWithNodeAlternate from '../IpcParentWithNodeAlternate/IpcParentWithNodeAlternate.ts'

export const getModule = (method) => {
  switch (method) {
    case IpcParentType.NodeAlternate:
      return IpcParentWithNodeAlternate
    default:
      throw new Error('unexpected ipc type')
  }
}
