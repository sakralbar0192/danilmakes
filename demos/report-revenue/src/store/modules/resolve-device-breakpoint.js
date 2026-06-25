/** Пороги совпадают с `_custom-variables.scss` и `respondBelow(md)` в demo-shims. */
const BREAKPOINT_MD = 960;
const BREAKPOINT_SM = 640;
const BREAKPOINT_LG = 1280 - 6;
const BREAKPOINT_XL = 1440 - 6;

/**
 * @param {number} innerWidth
 */
export function resolveDeviceBreakpoint(innerWidth) {
  const width = Math.max(0, Number(innerWidth) || 0);
  const mobile = width < BREAKPOINT_MD;
  const tablet = width >= BREAKPOINT_SM && width < BREAKPOINT_MD;
  const desktop = width >= BREAKPOINT_MD;

  let name = "xs";
  if (width >= BREAKPOINT_LG) {
    name = "lg";
  } else if (width >= BREAKPOINT_MD) {
    name = "md";
  } else if (width >= BREAKPOINT_SM) {
    name = "sm";
  }

  return {
    name,
    mobile,
    tablet,
    desktop,
    xs: true,
    sm: width >= BREAKPOINT_SM,
    md: width >= BREAKPOINT_MD,
    lg: width >= BREAKPOINT_LG,
    xl: width >= BREAKPOINT_XL,
    smAndDown: width < BREAKPOINT_MD,
    mdAndDown: width < BREAKPOINT_LG,
  };
}

export function readViewportSize() {
  if (typeof window === "undefined") {
    return { innerWidth: 1400, innerHeight: 900 };
  }

  return {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
  };
}

export function detectTouchDevice() {
  if (typeof window === "undefined") {
    return false;
  }

  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}
