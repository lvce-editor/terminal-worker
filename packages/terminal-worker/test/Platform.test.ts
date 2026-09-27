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
