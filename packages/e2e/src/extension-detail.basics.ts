import type { Test } from '@lvce-editor/test-with-playwright'

<<<<<<< HEAD
export const test: Test = async ({ Main }) => {
=======
export const test: Test = async ({ expect, Locator, Main }) => {
>>>>>>> origin/main
  // arrange

  // act
  await Main.openUri('extension-detail://builtin.theme-ayu')
}
