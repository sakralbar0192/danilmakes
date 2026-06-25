import {
  detectTouchDevice,
  readViewportSize,
  resolveDeviceBreakpoint,
} from "./resolve-device-breakpoint.js";

function buildDeviceState(viewport = readViewportSize()) {
  const breakpoint = resolveDeviceBreakpoint(viewport.innerWidth);

  return {
    innerWidth: viewport.innerWidth,
    innerHeight: viewport.innerHeight,
    breakpoint,
    isMobile: breakpoint.mobile,
    isTablet: breakpoint.tablet,
    isDesktop: breakpoint.desktop,
    isTouch: detectTouchDevice(),
    isDragging: false,
  };
}

function desktopBreakpoint() {
  return resolveDeviceBreakpoint(1400);
}

let viewportResizeListener = null;

export default {
  namespaced: true,
  state: buildDeviceState(),
  mutations: {
    setDeviceData(state, data) {
      Object.assign(state, data);
    },
    setMobilePreview(state, enabled) {
      state.breakpoint = enabled
        ? { name: "xs", mobile: true, tablet: false, desktop: false, xs: true, sm: false, md: false, lg: false, xl: false, smAndDown: true, mdAndDown: true }
        : desktopBreakpoint();
      state.isMobile = enabled;
      state.isTablet = false;
      state.isDesktop = !enabled;
    },
  },
  actions: {
    syncViewport({ commit }) {
      commit("setDeviceData", buildDeviceState());
    },
    initViewportTracking({ dispatch }) {
      if (typeof window === "undefined") {
        return;
      }

      dispatch("syncViewport");

      if (viewportResizeListener) {
        window.removeEventListener("resize", viewportResizeListener);
      }

      viewportResizeListener = () => {
        dispatch("syncViewport");
      };
      window.addEventListener("resize", viewportResizeListener, { passive: true });
    },
    teardownViewportTracking() {
      if (typeof window === "undefined" || !viewportResizeListener) {
        return;
      }

      window.removeEventListener("resize", viewportResizeListener);
      viewportResizeListener = null;
    },
  },
};
