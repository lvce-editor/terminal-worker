import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'viewlet.terminal-xterm-real-pty'

const runCommand = async (textArea, KeyBoard, command) => {
  await textArea.type(command)
  // Renderer-process input is forwarded to the terminal worker asynchronously.
  await new Promise((resolve) => setTimeout(resolve, 50))
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
  await expect(textArea).toBeFocused()
  // The xterm view mounts before the spawned shell is ready to receive input.
  await new Promise((resolve) => setTimeout(resolve, 1000))
  await textArea.type('')
  await expect(textArea).toBeFocused()

  await runCommand(textArea, KeyBoard, 'echo lvce-xterm-real-pty')
  await expect(rows).toContainText('lvce-xterm-real-pty')

  await textArea.type('echo lvce-xterm-inputX')
  await new Promise((resolve) => setTimeout(resolve, 50))
  await KeyBoard.press('Backspace')
  await new Promise((resolve) => setTimeout(resolve, 50))
  await KeyBoard.press('Enter')
  await expect(rows).toContainText('lvce-xterm-input')

  await runCommand(textArea, KeyBoard, 'echo lvce-xterm-first')
  await expect(rows).toContainText('lvce-xterm-first')
  await runCommand(textArea, KeyBoard, 'echo lvce-xterm-second')
  await expect(rows).toContainText('lvce-xterm-second')

  await runCommand(textArea, KeyBoard, 'echo hello > file.txt')
  await runCommand(textArea, KeyBoard, 'cat file.txt')
  await expect(rows).toContainText('hello')

  await runCommand(textArea, KeyBoard, 'touch created.txt')
  await runCommand(textArea, KeyBoard, 'ls')
  await expect(rows).toContainText('created.txt')
}
