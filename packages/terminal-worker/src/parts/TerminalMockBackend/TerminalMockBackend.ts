interface MockTerminal {
  readonly files: Record<string, string>
  input: string
  onData(data: string): void
}

const prompt = '$ '

const state = {
  terminals: Object.create(null) as Record<number, MockTerminal>,
}

const createTerminal = (onData: (data: string) => void): MockTerminal => {
  return {
    files: Object.create(null),
    input: '',
    onData,
  }
}

const getTerminal = (id: number): MockTerminal => {
  const terminal = state.terminals[id]
  if (!terminal) {
    throw new Error(`mock terminal not found: ${id}`)
  }
  return terminal
}

const stripQuotes = (text: string): string => {
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    return text.slice(1, -1)
  }
  return text
}

const getCommandArguments = (command: string, name: string): string => {
  const prefix = `${name} `
  if (!command.startsWith(prefix)) {
    return ''
  }
  return command.slice(prefix.length)
}

const getEchoRedirect = (command: string): readonly [string, string] | undefined => {
  const echoArguments = getCommandArguments(command, 'echo')
  const redirectIndex = echoArguments.indexOf('>')
  if (redirectIndex === -1) {
    return undefined
  }
  const text = echoArguments.slice(0, redirectIndex).trimEnd()
  const file = echoArguments.slice(redirectIndex + 1).trim()
  if (!text || !file || file.includes(' ')) {
    return undefined
  }
  return [text, file]
}

const runCommand = async (terminal: MockTerminal, command: string): Promise<void> => {
  const echoRedirectMatch = getEchoRedirect(command)
  if (echoRedirectMatch) {
    const [text, file] = echoRedirectMatch
    terminal.files[file] = stripQuotes(text) + '\n'
    return
  }
  const echoText = getCommandArguments(command, 'echo')
  if (echoText) {
    terminal.onData(stripQuotes(echoText) + '\n')
    return
  }
  const touchFiles = getCommandArguments(command, 'touch')
  if (touchFiles) {
    const files = touchFiles.split(/\s+/)
    for (const file of files) {
      terminal.files[file] ||= ''
    }
    return
  }
  const catFile = getCommandArguments(command, 'cat')
  if (catFile) {
    const file = catFile
    terminal.onData(terminal.files[file] || '')
    return
  }
  if (command === 'ls') {
    terminal.onData(Object.keys(terminal.files).toSorted((a, b) => a.localeCompare(b)).join('\n') + '\n')
    return
  }
  terminal.onData(`${command}: command not found\n`)
}

export const create = (id: number, _cwd: string, onData: (data: string) => void): void => {
  state.terminals[id] = createTerminal(onData)
  onData(prompt)
}

export const write = async (id: number, data: string): Promise<void> => {
  const terminal = getTerminal(id)
  terminal.onData(data)
  terminal.input += data
  if (!terminal.input.includes('\r') && !terminal.input.includes('\n')) {
    return
  }
  const lines = terminal.input.split(/\r\n|\r|\n/)
  terminal.input = lines.pop() || ''
  for (const line of lines) {
    terminal.onData('\r\n')
    await runCommand(terminal, line)
    terminal.onData(prompt)
  }
}

export const resize = (id: number, _columns: number, _rows: number): void => {
  getTerminal(id)
}

export const dispose = (id: number): void => {
  delete state.terminals[id]
}
