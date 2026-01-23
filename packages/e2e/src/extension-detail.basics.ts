import type { Test } from '@lvce-editor/test-with-playwright'

export const test: Test = async ({ Main }) => {
  // arrange

  // act
  await Main.openUri('extension-detail://builtin.theme-ayu')
}
