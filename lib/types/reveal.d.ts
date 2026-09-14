/**
 * Build the opener invocation that reveals/selects a path (pure, platform injectable).
 * @param path - absolute path to reveal.
 * @param platform - Node platform selector; win32 selects the entry, darwin
 *   reveals with `open -R`, everything else opens the parent directory.
 * @returns the argv invocation (never a shell string).
 */
export declare function revealCommand(path: string, platform: NodeJS.Platform): {
    command: string;
    args: string[];
};
/**
 * Launch the reveal opener detached and return immediately.
 * @param path - absolute path to reveal in the OS file manager.
 * @returns started acknowledgement; opener failures after the spawn surface
 *   through the OS (the child's error event is swallowed on purpose).
 */
export declare function launchReveal(path: string): {
    started: true;
};
