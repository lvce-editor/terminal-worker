import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.terminal-xterm-real-pty'

// The published server currently fails before the terminal mounts on Windows
// while resolving a built-in extension file URL.
export const skip = typeof navigator !== 'undefined' && navigator.userAgent.includes('Windows')

const runCommand = async (textArea, KeyBoard, command) => {
  await textArea.type(command)
  await KeyBoard.press('Enter')
}

export const test: Test = async ({ Command, expect, FileSystem, KeyBoard, Locator, Settings, Workspace }) => {
  const workspaceUri = await FileSystem.getTmpDir({ scheme: 'file' })
  await Workspace.setPath(workspaceUri.slice('file://'.length))
  await Settings.update({
    'terminal.backend': 'real',
    'terminal.renderer': 'xterm',
  })
  const renderer = await Command.execute('Preferences.get', 'terminal.renderer')
  if (renderer !== 'xterm') {
    throw new Error(`expected xterm renderer, received ${renderer}`)
  }

  await Command.execute('Layout.showPanel', 'Terminals')
  await Command.execute('Panel.selectIndex', 3)

  const terminal = Locator('.XtermTerminal')
  const textArea = Locator('.XtermTerminal .xterm-helper-textarea')
  const rows = Locator('.XtermTerminal .xterm-rows')
  await expect(terminal).toBeVisible()
  // eslint-disable-next-line e2e/no-direct-click
  await terminal.click()
  // Wait for the interactive zsh or bash prompt before sending input.
  const prompt = navigator.userAgent.includes('Mac') ? '%' : '$'
  await expect(rows).toContainText(prompt)
  await expect(textArea).toHaveCount(1)
  await textArea.type('')
  await expect(textArea).toBeFocused()

  await runCommand(textArea, KeyBoard, `node -e "console.log(['lvce-xterm-real','-pty'].join(''))"`)
  await expect(rows).toContainText('lvce-xterm-real-pty')

  const inputCommand = `node -e "console.log(['lvce-xterm','-input'].join(''))"`
  await textArea.type(`${inputCommand}X`)
  await expect(rows).toContainText(`${inputCommand}X`)
  await KeyBoard.press('Backspace')
  await expect(rows).toContainText(`${inputCommand} `)
  await KeyBoard.press('Enter')
  await expect(rows).toContainText('lvce-xterm-input')

  await runCommand(textArea, KeyBoard, `node -e "console.log(['lvce-xterm','-first'].join(''))"`)
  await expect(rows).toContainText('lvce-xterm-first')
  await runCommand(textArea, KeyBoard, `node -e "console.log(['lvce-xterm','-second'].join(''))"`)
  await expect(rows).toContainText('lvce-xterm-second')

  await runCommand(
    textArea,
    KeyBoard,
    `node -e "require('node:fs').writeFileSync('file.txt',['hel','lo'].join(''));console.log(['file','written'].join('-'))"`,
  )
  await expect(rows).toContainText('file-written')
  await runCommand(textArea, KeyBoard, `node -e "console.log(require('node:fs').readFileSync('file.txt','utf8'))"`)
  await expect(rows).toContainText('hello')

  await runCommand(
    textArea,
    KeyBoard,
    `node -e "require('node:fs').writeFileSync(['created','.txt'].join(''),'');console.log(['file','created'].join('-'))"`,
  )
  await expect(rows).toContainText('file-created')
  await runCommand(textArea, KeyBoard, `node -e "console.log(require('node:fs').readdirSync('.').join('\\n'))"`)
  await expect(rows).toContainText('created.txt')
}
