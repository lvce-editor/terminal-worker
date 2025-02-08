import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'extension-detail.feature-commands'

export const test: Test = async ({ Main, Locator, expect, Extension }) => {
  // arrange
  const extensionUri = import.meta.resolve('../fixtures/extension-commands')
  await Extension.addWebExtension(extensionUri)
  await Main.openUri('extension-detail://test.commands-test')
  const tabFeatures = Locator('.ExtensionDetailTab[name="Features"]')
  const featureCommands = Locator('.Feature[name="Commands"]')
  await tabFeatures.click()

  // act
  await featureCommands.click()

  // assert
  const heading = Locator('.FeatureContent h1')
  await expect(heading).toBeVisible()
  await expect(heading).toHaveText('Commands')
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
