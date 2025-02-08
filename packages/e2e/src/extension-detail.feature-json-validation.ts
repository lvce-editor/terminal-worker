import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'extension-detail.feature-json-validation'

export const test: Test = async ({ Main, Locator, expect, Extension }) => {
  // arrange
  const extensionUri = import.meta.resolve('../fixtures/extension-json-validation')
  await Extension.addWebExtension(extensionUri)
  await Main.openUri('extension-detail://test.json-validation-test')
  const tabFeatures = Locator('.ExtensionDetailTab[name="Features"]')
  const featureJsonValidation = Locator('.Feature[name="JsonValidation"]')
  await tabFeatures.click()

  // act
  await featureJsonValidation.click()

  // assert
  const heading = Locator('.FeatureContent h1')
  await expect(heading).toBeVisible()
  await expect(heading).toHaveText('Json Validation')
  const commandsTable = Locator('.FeatureContent .Table')
  await expect(commandsTable).toBeVisible()
  const heading1 = commandsTable.locator('th').nth(0)
  await expect(heading1).toHaveText('File Match')
  const heading2 = commandsTable.locator('th').nth(1)
  await expect(heading2).toHaveText('Schema')
  const cell1 = commandsTable.locator('tbody td').nth(0)
  await expect(cell1).toHaveText('*.test.json')
  const cell2 = commandsTable.locator('tbody td').nth(1)
  await expect(cell2).toHaveText('test://schema.json')
}
