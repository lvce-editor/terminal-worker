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

const runCommand = async (terminal: MockTerminal, command: string): Promise<void> => {
  const echoRedirectMatch = command.match(/^echo\s+(.+?)\s*>\s*(\S+)$/)
  if (echoRedirectMatch) {
    terminal.files[echoRedirectMatch[2]] = stripQuotes(echoRedirectMatch[1]) + '\n'
    return
  }
  const echoMatch = command.match(/^echo\s+(.+)$/)
  if (echoMatch) {
    terminal.onData(stripQuotes(echoMatch[1]) + '\n')
    return
  }
  const touchMatch = command.match(/^touch\s+(.+)$/)
  if (touchMatch) {
    for (const file of touchMatch[1].split(/\s+/)) {
      terminal.files[file] ||= ''
    }
    return
  }
  const catMatch = command.match(/^cat\s+(.+)$/)
  if (catMatch) {
    const file = catMatch[1]
    terminal.onData(terminal.files[file] || '')
    return
  }
  if (command === 'ls') {
    terminal.onData(Object.keys(terminal.files).sort().join('\n') + '\n')
    return
  }
  terminal.onData(`${command}: command not found\n`)
}

export const create = (id: number, cwd: string, onData: (data: string) => void): void => {
  void cwd
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

export const resize = (id: number, columns: number, rows: number): void => {
  getTerminal(id)
  void columns
  void rows
}

export const dispose = (id: number): void => {
  delete state.terminals[id]
}
