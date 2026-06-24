import { MOBILE_KEYBOARD_INTRUSION_OPEN_PX } from "../../config/table-grid-metrics.js";
import { didKeyboardLikelyClose,
  didKeyboardIntrusionLikelyClose } from "./mobile-keyboard-viewport.js";
import { evaluateGrowthDismissGeometry } from "../editing/keyboard-dismiss-shared.js";

/**
 * Переход «VK geometry открыта» → «закрыта» (Chromium overlay dismiss).
 * @param {boolean} prevOpen
 * @param {boolean} nextOpen
 */
export function didVirtualKeyboardGeometryClose(prevOpen = false, nextOpen = false) {
  return Boolean(prevOpen) && !nextOpen;
}

export function shouldSkipKeyboardDismiss({
  isSuppressed = false,
  isScrollSessionPending = false,
} = {}) {
  return Boolean(isSuppressed || isScrollSessionPending);
}

export function shouldConfirmKeyboardDismiss({
  prevLikelyOpen = false,
  nextLikelyOpen = false,
  isSuppressed = false,
  isScrollSessionPending = false,
} = {}) {
  if (!didKeyboardLikelyClose(prevLikelyOpen, nextLikelyOpen)) {
    return false;
  }
  return !shouldSkipKeyboardDismiss({ isSuppressed, isScrollSessionPending });
}

export function shouldApplyKeyboardDismissOnConfirm({
  hasMobileEditCell = false,
  isMobileDevice = false,
  prevLikelyOpen = false,
  nextLikelyOpen = false,
  isSuppressed = false,
  isScrollSessionPending = false,
  vvHeight = NaN,
  windowInnerHeight = 0,
  sessionVvMinHeight = null,
  /** Фокус всё ещё в инпуте активной ячейки — блокируем только fallback по росту vv (ложные срабатывания при вводе / подскролле). */
  activeCellInputFocused = false,
  prevIntrusionPx = 0,
  nextIntrusionPx = 0,
  intrusionThresholdPx = MOBILE_KEYBOARD_INTRUSION_OPEN_PX,
  sawKeyboardIntrusion = false,
  /** Сессия focus-in: dismiss заблокирован до стабилизации клавиатуры. */
  focusInSessionActive = false,
  /** Android overlay VK: рост VV от footer hide, не закрытие клавиатуры. */
  vkOverlaySessionActive = false,
  /** Клавиатура стабильно открыта — обязательно для growth fallback при фокусе в инпуте. */
  keyboardStableOpen = false,
  /** Закрытие по `virtualKeyboard.geometrychange` (Chrome overlay). */
  vkGeometryClosed = false,
  prevVkGeometryOpen = false,
  nextVkGeometryOpen = false,
} = {}) {
  if (!hasMobileEditCell || !isMobileDevice) {
    return false;
  }
  if (focusInSessionActive) {
    return false;
  }
  if (shouldSkipKeyboardDismiss({ isSuppressed, isScrollSessionPending })) {
    return false;
  }
  if (
    vkGeometryClosed
    || didVirtualKeyboardGeometryClose(prevVkGeometryOpen, nextVkGeometryOpen)
  ) {
    return true;
  }
  if (didKeyboardLikelyClose(prevLikelyOpen, nextLikelyOpen)) {
    return true;
  }
  if (
    sawKeyboardIntrusion
    && didKeyboardIntrusionLikelyClose(prevIntrusionPx, nextIntrusionPx, intrusionThresholdPx)
  ) {
    return true;
  }
  const growthGeometryClosed = nextIntrusionPx <= intrusionThresholdPx;
  const allowGrowthWithFocusedInput = Boolean(sawKeyboardIntrusion && growthGeometryClosed);
  const growthFallbackGeometry = evaluateGrowthDismissGeometry({
    vvHeight,
    windowInnerHeight,
    sessionVvMinHeight,
    nextLikelyOpen,
  });
  if (vkOverlaySessionActive && growthFallbackGeometry) {
    return false;
  }
  if (
    !activeCellInputFocused
    && growthFallbackGeometry
  ) {
    return true;
  }
  if (
    allowGrowthWithFocusedInput
    && activeCellInputFocused
    && growthFallbackGeometry
    && keyboardStableOpen
  ) {
    return true;
  }
  return false;
}

export function shouldBlurActiveMobileInputOnKeyboardDismiss({
  activeElement = null,
  activeCellRoot = null,
  activeCellKey = "",
  activeElementCellRoot = null,
} = {}) {
  if (!activeElement) {
    return false;
  }
  if (activeElement.nodeName !== "INPUT") {
    return false;
  }
  if (activeCellRoot?.contains?.(activeElement)) {
    return true;
  }
  if (!activeCellKey || !activeElementCellRoot?.getAttribute) {
    return false;
  }
  return activeElementCellRoot.getAttribute("data-cell-key") === activeCellKey;
}
