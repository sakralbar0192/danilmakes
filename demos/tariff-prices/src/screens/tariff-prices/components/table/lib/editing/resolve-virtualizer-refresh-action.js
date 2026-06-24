/**
 * Разрешить ли refresh виртуализатора сейчас или отложить до конца inline-edit.
 *
 * @param {{ force?: boolean, inlineEditSessionActive?: boolean }} args
 * @returns {{ action: 'defer' } | { action: 'run', fullPoolReset: boolean }}
 */
// eslint-disable-next-line import/prefer-default-export
export function resolveVirtualizerRefreshAction({
  force = false,
  inlineEditSessionActive = false,
} = {}) {
  if (inlineEditSessionActive) {
    return { action: "defer" };
  }
  return {
    action: "run",
    fullPoolReset: Boolean(force),
  };
}
