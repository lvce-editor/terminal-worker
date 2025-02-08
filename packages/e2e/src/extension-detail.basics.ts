import type { Test } from '@lvce-editor/test-with-playwright'

export const test: Test = async ({ Main, Locator, expect }) => {
  // arrange

  // act
  await Main.openUri('extension-detail://builtin.theme-ayu')

  // assert
  const detailView = Locator('.ExtensionDetail')
  await expect(detailView).toBeVisible()
  const icon = Locator('.ExtensionDetailIcon')
  await expect(icon).toBeVisible()
  const name = Locator('.ExtensionDetailName')
  await expect(name).toBeVisible()
  const description = Locator('.ExtensionDetailDescription')
  await expect(description).toBeVisible()
  const tabs = Locator('.ExtensionDetailTabs')
  await expect(tabs).toBeVisible()
}
