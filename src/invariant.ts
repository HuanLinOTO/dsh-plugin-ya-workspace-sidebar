/** Package invariant companion for ya-workspace-sidebar. */
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = '@dsh-external/ya-workspace-sidebar'

export const name = 'ya-workspace-sidebar-invariant'
export const inject = ['invariants']

/** No runtime invariant: this package contributes client-only slot entries. */
const install: InvariantInstaller = () => {}

interface InvariantContext {
  invariants: { register: (name: string, installer: InvariantInstaller) => () => void }
}

/** Register package ownership with the invariant service. */
export const apply = (ctx: InvariantContext): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
