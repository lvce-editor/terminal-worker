import type { Test } from '@lvce-editor/test-with-playwright'

export const test: Test = async ({ Editor, expect, FileSystem, Locator, Main, QuickPick, SideBar, Workspace }) => {
  // arrange
  await SideBar.open('Extensions')

  // act
  const first = Locator('.ExtensionListItem[aria-posinset="1"]')
  await expect(first).toBeVisible()
  await first.click()

  // assert
  // TODO
}
