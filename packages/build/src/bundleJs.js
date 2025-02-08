import pluginTypeScript from '@babel/preset-typescript'
import { babel } from '@rollup/plugin-babel'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { join } from 'path'
import { rollup } from 'rollup'
import { root } from './root.js'

/**
 * @type {import('rollup').RollupOptions}
 */
const options = {
  input: join(root, 'packages/extension-search-view-worker/src/extensionSearchViewWorkerMain.ts'),
  preserveEntrySignatures: 'strict',
  treeshake: {
    propertyReadSideEffects: false,
  },
  output: {
    file: join(root, '.tmp/dist/dist/extensionSearchViewWorkerMain.js'),
    format: 'es',
    freeze: false,
    generatedCode: {
      constBindings: true,
      objectShorthand: true,
    },
  },
  external: ['ws', 'electron'],
  plugins: [
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      presets: [pluginTypeScript],
    }),
    nodeResolve(),
  ],
}

export const bundleJs = async () => {
  const input = await rollup(options)
  // @ts-ignore
  await input.write(options.output)
}
