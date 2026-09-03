/** Build the host and DSH module-loader client artifacts. */
import { defineConfig, type UserConfig } from 'tsdown'

const ID = '@huanlin/dsh-plugin-ya-workspace-sidebar'

const CLIENT_EXTERNALS = [
  'react',
  'react/jsx-runtime',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-api-session-controller',
  '@deepseek-ai/dsh-api-session-controller/client',
  '@deepseek-ai/dsh-api-workspace-controller',
  '@deepseek-ai/dsh-api-workspace-controller/client',
  '@deepseek-ai/dsh-client-locale',
  '@deepseek-ai/dsh-client-locale/client',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-slots/client',
  '@deepseek-ai/dsh-client-ui-sidebar',
  '@deepseek-ai/dsh-client-ui-sidebar/client',
  '@deepseek-ai/dsh-client-ui-conversation',
  '@deepseek-ai/dsh-client-ui-conversation/client',
  '@deepseek-ai/dsh-client-ui-session',
  '@deepseek-ai/dsh-client-ui-session/client',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-session',
  '@deepseek-ai/dsh-session/types',
]

const host: UserConfig = {
  name: ID,
  entry: { index: 'src/index.ts' },
  outDir: 'lib',
  format: ['esm'],
  platform: 'node',
  target: 'es2024',
  fixedExtension: false,
  dts: false,
  clean: true,
  deps: { neverBundle: ['@deepseek-ai/cordis'] },
}

const client: UserConfig = {
  name: `${ID}/client`,
  entry: { client: 'src/client/index.ts' },
  outDir: 'lib',
  format: ['cjs'],
  platform: 'browser',
  target: 'es2024',
  dts: false,
  sourcemap: true,
  clean: false,
  deps: { neverBundle: CLIENT_EXTERNALS },
  outputOptions: {
    entryFileNames: 'client.js',
    banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(ID)}, factory: (require) => {`,
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;',
  },
}

export default defineConfig([host, client])
