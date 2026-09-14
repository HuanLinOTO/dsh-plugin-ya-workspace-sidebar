/** Platform opener commands for revealing a path in the OS file manager. */
import { spawn } from 'node:child_process'
import { dirname } from 'node:path'

/**
 * Build the opener invocation that reveals/selects a path (pure, platform injectable).
 * @param path - absolute path to reveal.
 * @param platform - Node platform selector; win32 selects the entry, darwin
 *   reveals with `open -R`, everything else opens the parent directory.
 * @returns the argv invocation (never a shell string).
 */
export function revealCommand(path: string, platform: NodeJS.Platform): { command: string; args: string[] } {
  switch (platform) {
    case 'darwin':
      return { command: 'open', args: ['-R', path] }
    case 'win32':
      // Explorer expects /select,<path> as ONE argument; never a shell string.
      return { command: 'explorer.exe', args: [`/select,${path}`] }
    default:
      return { command: 'xdg-open', args: [dirname(path)] }
  }
}

/**
 * Launch the reveal opener detached and return immediately.
 * @param path - absolute path to reveal in the OS file manager.
 * @returns started acknowledgement; opener failures after the spawn surface
 *   through the OS (the child's error event is swallowed on purpose).
 */
export function launchReveal(path: string): { started: true } {
  const spec = revealCommand(path, process.platform)
  const child = spawn(spec.command, spec.args, { detached: true, stdio: 'ignore' })
  child.on('error', () => { /* opener missing/denied: the OS dialog is the outcome */ })
  child.unref()
  return { started: true }
}
