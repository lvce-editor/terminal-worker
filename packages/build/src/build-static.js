import { join } from 'node:path'
import { root } from './root.js'
import { cp } from 'node:fs/promises'

const sharedProcess = await import('@lvce-editor/shared-process')

process.env.PATH_PREFIX = '/terminal-worker'
const { commitHash } = await sharedProcess.exportStatic({
  root,
  extensionPath: '',
})

const workerPath = join(root, '.tmp', 'dist', 'dist', 'terminalWorkerMain.js')
const workerStaticPath = join(root, 'dist', commitHash, 'packages', 'terminal-worker', 'dist', 'terminalWorkerMain.js')
const serverWorkerStaticPath = join(
  root,
  'packages',
  'server',
  'node_modules',
  '@lvce-editor',
  'static-server',
  'static',
  commitHash,
  'packages',
  'terminal-worker',
  'dist',
  'terminalWorkerMain.js',
)

await cp(workerPath, workerStaticPath)
await cp(workerPath, serverWorkerStaticPath)
await cp(join(root, 'dist'), join(root, '.tmp', 'static'), { recursive: true })
