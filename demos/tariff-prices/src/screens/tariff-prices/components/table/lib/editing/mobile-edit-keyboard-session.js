import { MOBILE_KEYBOARD_GROWTH_DISMISS_TICKS,
  MOBILE_KEYBOARD_INTRUSION_OPEN_PX } from "../../config/table-grid-metrics.js";
import { didKeyboardIntrusionLikelyClose,
  didKeyboardLikelyClose } from "../scroll/mobile-keyboard-viewport.js";
import { shouldConfirmKeyboardDismiss } from "../scroll/mobile-keyboard-dismiss.js";
import { evaluateGrowthDismissGeometry } from "./keyboard-dismiss-shared.js";

/**
 * Эвристика «vv вырос — клавиатура закрылась» (fallback dismiss).
 * Тонкая обёртка над `evaluateGrowthDismissGeometry` с историческим именованием параметров (`innerH`).
 */
export function isGrowthLikelyKeyboardClosed({
  vvHeight,
  innerH,
  sessionVvMinHeight,
  nextLikelyOpen,
} = {}) {
  return evaluateGrowthDismissGeometry({
    vvHeight,
    windowInnerHeight: innerH,
    sessionVvMinHeight,
    nextLikelyOpen,
  });
}

/**
 * Результат анализа кадра VisualViewport для dismiss-клавиатуры.
 */
export function probeMobileKeyboardDismissFromViewportChange({
  nextLikelyOpen,
  prevLikelyOpen,
  prevIntrusionPx,
  intrusionPx,
  vvHeight,
  innerH,
  sessionVvMinHeight,
  mobileEditVvSawKeyboardOpen,
  mobileEditVvSawKeyboardIntrusion,
  mobileEditVvSessionMaxIntrusion,
  mobileEditGrowthClosedTicks,
  hasOpenSheets,
  shouldBlockDismiss,
  intrusionThresholdPx = MOBILE_KEYBOARD_INTRUSION_OPEN_PX,
  vkGeometryJustClosed = false,
} = {}) {
  const growthLikelyKeyboardClosed = isGrowthLikelyKeyboardClosed({
    vvHeight,
    innerH,
    sessionVvMinHeight,
    nextLikelyOpen,
  });
  let growthClosedTicks = mobileEditGrowthClosedTicks;
  if (growthLikelyKeyboardClosed && !nextLikelyOpen) {
    growthClosedTicks = Math.min(8, (growthClosedTicks || 0) + 1);
  } else {
    growthClosedTicks = 0;
  }

  if (hasOpenSheets) {
    return {
      growthClosedTicks,
      clearDismissTimer: true,
      scheduleDismissConfirm: false,
      nextPrevLikelyOpen: nextLikelyOpen,
      nextPrevIntrusionPx: intrusionPx,
    };
  }

  if (nextLikelyOpen && !vkGeometryJustClosed) {
    return {
      growthClosedTicks,
      clearDismissTimer: true,
      scheduleDismissConfirm: false,
      nextPrevLikelyOpen: true,
      nextPrevIntrusionPx: intrusionPx,
    };
  }

  const dismissAllowed = Boolean(
    mobileEditVvSawKeyboardOpen
    || mobileEditVvSawKeyboardIntrusion
    || (mobileEditVvSessionMaxIntrusion > intrusionThresholdPx),
  );
  const heuristicTrueToFalse = dismissAllowed && shouldConfirmKeyboardDismiss({
    prevLikelyOpen,
    nextLikelyOpen,
    isSuppressed: false,
    isScrollSessionPending: false,
  });
  const intrusionDismiss = dismissAllowed && didKeyboardIntrusionLikelyClose(
    prevIntrusionPx ?? 0,
    intrusionPx,
    intrusionThresholdPx,
  );
  const growthFallback = Boolean(
    dismissAllowed
    && growthLikelyKeyboardClosed
    && (growthClosedTicks >= MOBILE_KEYBOARD_GROWTH_DISMISS_TICKS)
    && intrusionPx <= intrusionThresholdPx,
  );
  const scheduleDismissConfirm = Boolean(
    (heuristicTrueToFalse || intrusionDismiss || growthFallback)
    && !shouldBlockDismiss,
  );

  if (scheduleDismissConfirm) {
    return {
      growthClosedTicks,
      clearDismissTimer: false,
      scheduleDismissConfirm: true,
      nextPrevLikelyOpen: prevLikelyOpen,
      nextPrevIntrusionPx: prevIntrusionPx,
    };
  }

  if (didKeyboardLikelyClose(prevLikelyOpen, nextLikelyOpen)) {
    return {
      growthClosedTicks,
      clearDismissTimer: false,
      scheduleDismissConfirm: false,
      nextPrevLikelyOpen: prevLikelyOpen,
      nextPrevIntrusionPx: prevIntrusionPx,
    };
  }

  return {
    growthClosedTicks,
    clearDismissTimer: false,
    scheduleDismissConfirm: false,
    nextPrevLikelyOpen: nextLikelyOpen,
    nextPrevIntrusionPx: intrusionPx,
  };
}
