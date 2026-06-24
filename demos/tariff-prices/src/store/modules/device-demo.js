function desktopBreakpoint() {
  return {
    name: "lg",
    mobile: false,
    tablet: false,
    desktop: true,
    xs: true,
    sm: true,
    md: true,
    lg: true,
    xl: false,
  };
}

export default {
  namespaced: true,
  state: {
    innerWidth: 1400,
    innerHeight: 900,
    breakpoint: desktopBreakpoint(),
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouch: false,
    isDragging: false,
  },
  mutations: {
    setDeviceData(state, data) {
      Object.assign(state, data);
    },
    setMobilePreview(state, enabled) {
      state.breakpoint = enabled
        ? { name: "xs", mobile: true, tablet: false, desktop: false, xs: true, sm: false, md: false, lg: false, xl: false }
        : desktopBreakpoint();
      state.isMobile = enabled;
      state.isDesktop = !enabled;
    },
  },
};
