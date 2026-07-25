import { expect, test } from '@jest/globals'
import * as ToUint8Array from '../src/parts/ToUint8Array/ToUint8Array.ts'

test('returns uint8 arrays unchanged', () => {
  const data = new Uint8Array([1, 2, 3])
  expect(ToUint8Array.toUint8Array(data)).toBe(data)
})

test('encodes strings', () => {
  expect(ToUint8Array.toUint8Array('abc')).toEqual(new Uint8Array([97, 98, 99]))
})

test('restores websocket payloads', () => {
  expect(ToUint8Array.toUint8Array({ data: [97, 98, 99] })).toEqual(new Uint8Array([97, 98, 99]))
})

test('rejects unsupported payloads', () => {
  expect(() => ToUint8Array.toUint8Array({})).toThrow(new Error('unexpected data type'))
})
