import uaParserJs from "ua-parser-js";

// eslint-disable-next-line import/no-cycle
import ApplicationService from "@/services/application";
import store from "../index";

// eslint-disable-next-line func-names
const getWindowSize = function () {
  return {
    innerWidth: document.documentElement.clientWidth,
    innerHeight: window.innerHeight,
    outerWidth: window.outerWidth,
    outerHeight: window.outerHeight,
    scrollTop: document.documentElement.scrollTop,
  };
};
// eslint-disable-next-line func-names
const recalculateWindowSize = function () {
  store.commit("device/setDeviceData", getWindowSize());
};

window.addEventListener("resize", recalculateWindowSize);
window.addEventListener("scroll", recalculateWindowSize);

const mobileKey = ApplicationService.MOBILE_BREAKPOINT;
const tabletKey = ApplicationService.TABLET_BREAKPOINT;

const breakpoints = { ...ApplicationService.BREAKPOINTS };

function updateBreakpoint(state) {
  const width = window.innerWidth;
  const breakpointKeys = Object.keys(breakpoints);
  let newBreakpoint = ApplicationService.DEFAULT_BREAKPOINT;
  const updatedBreakpoint = {};

  breakpointKeys.forEach((key, index) => {
    const minWidth = breakpoints[key];
    const nextKey = breakpointKeys[index + 1];
    const maxWidth = nextKey ? breakpoints[nextKey] - 1 : Infinity;

    if (width >= minWidth) {
      newBreakpoint = key;
    }

    updatedBreakpoint[key] = width >= minWidth && (!nextKey || width < breakpoints[nextKey]);
    updatedBreakpoint[`${key}AndDown`] = width <= maxWidth;
    updatedBreakpoint[`${key}AndUp`] = width >= minWidth;
  });

  state.breakpoint = { ...state.breakpoint, ...updatedBreakpoint };

  if (newBreakpoint !== state.breakpoint.name) {
    state.breakpoint.name = newBreakpoint;

    const current = breakpoints[state.breakpoint.name];
    const maxMobile = breakpoints[mobileKey];
    const maxTablet = breakpoints[tabletKey];

    state.breakpoint.mobile = current < maxMobile;
    state.breakpoint.tablet = current < maxTablet && !state.breakpoint.mobile;
    state.breakpoint.desktop = !state.breakpoint.tablet && !state.breakpoint.mobile;
  }
}

const determineDeviceType = (state) => {
  state.isMobile = false;
  state.isTablet = false;
  state.isDesktop = false;

  if (state.innerWidth < breakpoints[mobileKey]) {
    state.type = "mobile";
    state.isMobile = true;
    return;
  }
  if (state.innerWidth < breakpoints[tabletKey]) {
    state.type = "tablet";
    state.isTablet = true;
    return;
  }
  state.type = "desktop";
  state.isDesktop = true;
};

export default {
  namespaced: true,
  state: {
    scrollTop: 0,
    innerWidth: 0,
    outerWidth: 0,
    innerHeight: 0,
    outerHeight: 0,
    isSafari: false,
    isChrome: false,
    isIos: false,
    isMacOs: false,
    isIe: false,
    isInStandaloneMode: false,
    isAndroid: false,
    isAndroidWebView: false,
    type: "desktop",
    deviceReady: false,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isDragging: false,
    isTouch: false,
    mobileBreakpoint: breakpoints[mobileKey],
    tabletBreakpoint: breakpoints[tabletKey],

    breakpoint: {
      name: "",
      mobile: false,
      tablet: false,
      desktop: false,
    },
  },
  mutations: {
    setDeviceData(state, opts) {
      // eslint-disable-next-line guard-for-in,no-restricted-syntax
      for (const prop in opts) {
        state[prop] = opts[prop];
      }
      state.isAndroidWebView = state.isMobile && state.isAndroid && window.navigator.userAgent.toLowerCase().includes("wv");
      determineDeviceType(state);
      updateBreakpoint(state);
      // eslint-disable-next-line no-underscore-dangle
      window.__$device = state;
    },
    setDragging(state, value) {
      state.isDragging = value;
    },
  },
  actions: {
    init({ commit }) {
      const device = uaParserJs();
      const opts = getWindowSize();
      opts.isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);
      opts.isIos = (/iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) && !window.MSStream;
      if (opts.isIos) {
        const html = document.querySelector("html");
        if (html) {
          html.classList.add("is-ios");
        }
      }
      opts.isIe = device.browser.name.toLowerCase()
        .indexOf("explorer") !== -1 || device.browser.name.toLowerCase()
        .indexOf("trident") !== -1;
      opts.isInStandaloneMode = ("standalone" in window.navigator) && (window.navigator.standalone);
      opts.isAndroid = navigator.userAgent.match(/android.*mobile safari.*/i) != null;
      opts.isMacOs = device?.os?.name === "Mac OS";
      opts.isChrome = device?.browser?.name === "Chrome";
      opts.deviceReady = true;
      opts.isTouch = (("ontouchstart" in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
      commit("setDeviceData", opts);
    },
  },
};
