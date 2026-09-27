import { expect, test } from '@jest/globals'
import { PlatformType } from '@lvce-editor/constants'
import * as Platform from '../src/parts/Platform/Platform.ts'

test('platform', () => {
  expect(typeof Platform.platform).toBe('string')
})

test('detects Electron when the runtime appends a worker id', () => {
  expect(Platform.getPlatformFromWorkerName('Terminal Worker (Electron) [worker-19]')).toBe(PlatformType.Electron)
})

test('keeps workers without the Electron marker on the remote platform', () => {
  expect(Platform.getPlatformFromWorkerName('Terminal Worker [worker-20]')).toBe(PlatformType.Remote)
})

test('selects Electron for the runtime worker name', () => {
  const originalName = Object.getOwnPropertyDescriptor(globalThis, 'name')
  const globalWithName = globalThis as typeof globalThis & { name?: string }
  Object.defineProperty(globalThis, 'name', {
    configurable: true,
    value: 'Terminal Worker (Electron) [worker-19]',
  })
  try {
    expect(Platform.getPlatform()).toBe(PlatformType.Electron)
  } finally {
    if (originalName) {
      Object.defineProperty(globalThis, 'name', originalName)
    } else {
      delete globalWithName.name
    }
  }
})
