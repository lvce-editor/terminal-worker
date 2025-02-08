import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'extension-detail.feature-webviews'

export const test: Test = async ({ Main, Locator, expect, Extension }) => {
  // arrange
  const extensionUri = import.meta.resolve('../fixtures/extension-webviews')
  await Extension.addWebExtension(extensionUri)
  await Main.openUri('extension-detail://test.webviews-test')
  const tabFeatures = Locator('.ExtensionDetailTab[name="Features"]')
  const featureWebViews = Locator('.Feature[name="WebViews"]')
  await tabFeatures.click()

  // act
  await featureWebViews.click()

  // assert
  const heading = Locator('.FeatureContent h1')
  await expect(heading).toBeVisible()
  await expect(heading).toHaveText('WebViews')

  const id = Locator('.FeatureContent h2').nth(0)
  await expect(id).toBeVisible()
  await expect(id).toHaveText('ID')

  // const idValue = Locator('.FeatureWebView h2~p')
  // await expect(idValue).toBeVisible()
  // await expect(idValue).toHaveText('ID')
  // TODO
}
