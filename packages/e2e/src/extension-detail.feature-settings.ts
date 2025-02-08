import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'extension-detail.feature-settings'

export const test: Test = async ({ Main, Locator, expect, Extension }) => {
  // arrange
  const extensionUri = import.meta.resolve('../fixtures/extension-settings')
  await Extension.addWebExtension(extensionUri)
  await Main.openUri('extension-detail://test.settings-test')
  const tabFeatures = Locator('.ExtensionDetailTab[name="Features"]')
  const featureSettings = Locator('.Feature[name="Settings"]')
  await tabFeatures.click()

  // act
  await featureSettings.click()

  // assert
  const heading = Locator('.FeatureContent h1')
  await expect(heading).toBeVisible()
  await expect(heading).toHaveText('Settings')
  const commandsTable = Locator('.FeatureContent .Table')
  await expect(commandsTable).toBeVisible()
  const heading1 = commandsTable.locator('th').nth(0)
  await expect(heading1).toHaveText('ID')
  const heading2 = commandsTable.locator('th').nth(1)
  await expect(heading2).toHaveText('Label')
  const cell1 = commandsTable.locator('tbody td').nth(0)
  await expect(cell1).toHaveText('test')
  const cell2 = commandsTable.locator('tbody td').nth(1)
  await expect(cell2).toHaveText('Test')
}
