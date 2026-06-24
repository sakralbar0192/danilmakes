/**
 * Отложить refresh виртуализатора до завершения patch ячеек / layout (nextTick + 2× rAF).
 *
 * @param {() => void} run
 * @param {{ nextTick?: (fn: () => void) => void | Promise<void>, requestAnimationFrame?: (fn: () => void) => number }} [schedulers]
 */
// eslint-disable-next-line import/prefer-default-export
export function scheduleVirtualizerLayoutRefresh(
  run,
  { nextTick, requestAnimationFrame: raf } = {},
) {
  const scheduleNextTick = nextTick || ((fn) => {
    Promise.resolve().then(fn);
  });

  scheduleNextTick(() => {
    if (typeof raf === "function") {
      raf(() => {
        raf(run);
      });
      return;
    }
    run();
  });
}
