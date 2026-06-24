export const name = 'viewlet.terminal-xterm-unknown-command'

const runCommand = async (terminal, KeyBoard, command) => {
  await terminal.type(command)
  await KeyBoard.press('Enter')
}

const openXtermTerminal = async ({ Command, expect, Locator, Settings }) => {
  await Settings.update({
    'terminal.backend': 'mock',
    'terminal.renderer': 'xterm',
  })

  await Command.execute('Layout.showPanel', 'Terminals')
  await Command.execute('Panel.selectIndex', 3)

  const terminal = Locator('.XtermTerminal')
  await expect(terminal).toBeVisible()
  // eslint-disable-next-line e2e/no-direct-click
  await terminal.click()
  return terminal
}

export const test = async ({ Command, expect, KeyBoard, Locator, Settings }) => {
  const terminal = await openXtermTerminal({ Command, expect, Locator, Settings })

  await runCommand(terminal, KeyBoard, 'wat')

  await expect(terminal).toContainText('wat: command not found')
}
