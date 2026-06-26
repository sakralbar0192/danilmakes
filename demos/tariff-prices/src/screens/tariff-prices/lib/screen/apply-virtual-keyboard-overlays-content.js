let overlaysContentApplied = false;

/**
 * Один раз включает overlay-клавиатуру Chromium — повторная установка при каждом focusin
 * вызывает лишний geometrychange/layout.
 * @param {Navigator | undefined} nav
 */
export function applyVirtualKeyboardOverlaysContentOnce(nav) {
  if (overlaysContentApplied) {
    return;
  }
  if (typeof window !== "undefined" && window.self !== window.top) {
    return;
  }
  const vk = nav?.virtualKeyboard;
  if (!vk) {
    return;
  }
  try {
    vk.overlaysContent = true;
    overlaysContentApplied = true;
  } catch (err) {
    // ignore
  }
}

/** @internal test helper */
export function resetVirtualKeyboardOverlaysContentForTests() {
  overlaysContentApplied = false;
}
