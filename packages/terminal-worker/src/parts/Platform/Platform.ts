import { PlatformType } from '@lvce-editor/constants'

// TODO pass this as argument

export const getPlatformFromWorkerName = (workerName: string) => {
  if (workerName.includes('(Electron)')) {
    return PlatformType.Electron
  }
  return PlatformType.Remote
}

const getPlatform = () => {
  // @ts-ignore
  if (typeof PLATFORM !== 'undefined') {
    // @ts-ignore
    return PLATFORM
  }
  const workerName = (globalThis as typeof globalThis & { name?: string }).name
  if (typeof workerName === 'string') {
    const workerPlatform = getPlatformFromWorkerName(workerName)
    if (workerPlatform === PlatformType.Electron) {
      return workerPlatform
    }
  }
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    return 'test'
  }
  return PlatformType.Remote
}

export const platform = getPlatform() // TODO tree-shake this out in production
