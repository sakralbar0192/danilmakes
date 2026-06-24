import Vue from "@/shims/vue2-compat";
import { computePriceCellMainMenuPosition, computePriceCellResetMenuPosition } from "../logic/surface/compute-price-cell-tooltip-menu-position.js";
import { shouldBlockPriceCellTooltipOpen } from "../logic/surface/should-block-price-cell-tooltip-open.js";

const OPEN_DELAY_MAIN_MS = 280;
const OPEN_DELAY_RESET_MS = 320;
const HIDE_AFTER_LEAVE_MS = 120;
const MAIN_TOOLTIP_MAX_WIDTH = 192;

/** Fallback, если модуль импортируют вне браузера (unit/import без `window`). */
function readViewport() {
  if (typeof window === "undefined") {
    return { innerWidth: 1024, innerHeight: 768 };
  }
  return {
    innerWidth: window.innerWidth || 1024,
    innerHeight: window.innerHeight || 768,
  };
}

/**
 * Singleton-контроллер тултипов ячейки цены (одно открытое меню на таблицу).
 * @returns {object}
 */
// eslint-disable-next-line import/prefer-default-export -- фабрика рядом с `createTariffTableProvide`, без default
export function createPriceCellTooltipController() {
  const state = Vue.observable({
    show: false,
    mode: null,
    anchorEl: null,
    /** Корень ячейки `[data-cell-root]` — для возврата с тултипа курсором в ячейку */
    relatedCellRootEl: null,
    /** Колбэк для повторного main после reset / прихода с оверлея в ячейку */
    persistGetMainSnapshot: null,
    mainSnapshot: null,
    resetSnapshot: null,
    menuX: 0,
    menuY: 0,
    maxWidth: 192,
    /** v-menu: основной — right + offset-x; reset — offset-y */
    menuRight: true,
    menuOffsetY: false,
  });

  let openTimerId = null;
  let hideTimerId = null;
  let scheduleGeneration = 0;

  function clearOpenTimer() {
    if (openTimerId != null) {
      clearTimeout(openTimerId);
      openTimerId = null;
    }
  }

  function clearHideTimer() {
    if (hideTimerId != null) {
      clearTimeout(hideTimerId);
      hideTimerId = null;
    }
  }

  function applyMainPosition(anchorEl) {
    const rect = anchorEl.getBoundingClientRect();
    const pos = computePriceCellMainMenuPosition(rect, readViewport(), { maxWidth: MAIN_TOOLTIP_MAX_WIDTH });
    state.menuX = pos.menuX;
    state.menuY = pos.menuY;
    state.maxWidth = pos.maxWidth;
    state.menuRight = true;
    state.menuOffsetY = false;
  }

  function applyResetPosition(anchorEl) {
    const rect = anchorEl.getBoundingClientRect();
    const pos = computePriceCellResetMenuPosition(rect, readViewport());
    state.menuX = pos.menuX;
    state.menuY = pos.menuY;
    state.maxWidth = pos.maxWidth;
    state.menuRight = false;
    state.menuOffsetY = true;
  }

  function openMain(anchorEl, snapshot, getMainSnapshot = null) {
    clearOpenTimer();
    clearHideTimer();
    if (shouldBlockPriceCellTooltipOpen()) {
      return;
    }
    if (!anchorEl?.isConnected || !snapshot) {
      return;
    }
    state.anchorEl = anchorEl;
    state.relatedCellRootEl = anchorEl;
    state.persistGetMainSnapshot = typeof getMainSnapshot === "function" ? getMainSnapshot : state.persistGetMainSnapshot;
    state.mainSnapshot = snapshot;
    state.resetSnapshot = null;
    state.mode = "main";
    applyMainPosition(anchorEl);
    state.show = true;
  }

  function runScheduledMainOpen(anchorEl, getSnapshot, gen) {
    if (gen !== scheduleGeneration) {
      return;
    }
    if (!anchorEl?.isConnected) {
      return;
    }
    const snapshot = typeof getSnapshot === "function" ? getSnapshot() : null;
    if (!snapshot) {
      return;
    }
    openMain(anchorEl, snapshot, getSnapshot);
  }

  function openReset(anchorEl, snapshot, getMainSnapshot = null) {
    clearOpenTimer();
    clearHideTimer();
    if (shouldBlockPriceCellTooltipOpen()) {
      return;
    }
    if (!anchorEl?.isConnected || !snapshot) {
      return;
    }
    state.anchorEl = anchorEl;
    const cellRoot = typeof anchorEl?.closest === "function"
      ? anchorEl.closest("[data-cell-root]")
      : null;
    state.relatedCellRootEl = cellRoot || anchorEl;
    if (typeof getMainSnapshot === "function") {
      state.persistGetMainSnapshot = getMainSnapshot;
    }
    state.resetSnapshot = snapshot;
    state.mainSnapshot = null;
    state.mode = "reset";
    applyResetPosition(anchorEl);
    state.show = true;
  }

  function repositionIfOpen() {
    if (!state.show || !state.anchorEl?.isConnected) {
      return false;
    }
    if (state.mode === "main") {
      applyMainPosition(state.anchorEl);
      return true;
    }
    if (state.mode === "reset") {
      applyResetPosition(state.anchorEl);
      return true;
    }
    return false;
  }

  const api = {
    state,

    cancelPending() {
      scheduleGeneration += 1;
      clearOpenTimer();
    },

    hide() {
      scheduleGeneration += 1;
      clearOpenTimer();
      clearHideTimer();
      state.show = false;
      state.mode = null;
      state.anchorEl = null;
      state.relatedCellRootEl = null;
      state.persistGetMainSnapshot = null;
      state.mainSnapshot = null;
      state.resetSnapshot = null;
    },

    scheduleHideSoon() {
      clearHideTimer();
      hideTimerId = setTimeout(() => {
        hideTimerId = null;
        api.hide();
      }, HIDE_AFTER_LEAVE_MS);
    },

    cancelHideSoon() {
      clearHideTimer();
    },

    /**
     * @param {{ anchorEl: HTMLElement, getSnapshot: () => object|null }} args
     */
    scheduleShowMain(args) {
      const { anchorEl, getSnapshot } = args;
      api.cancelPending();
      api.cancelHideSoon();
      const gen = scheduleGeneration;
      openTimerId = setTimeout(() => {
        openTimerId = null;
        runScheduledMainOpen(anchorEl, getSnapshot, gen);
      }, OPEN_DELAY_MAIN_MS);
    },

    /**
     * @param {{ anchorEl: HTMLElement, getSnapshot: () => object|null, getMainSnapshot?: () => object|null }} args
     */
    scheduleShowReset(args) {
      const {
        anchorEl, getSnapshot, getMainSnapshot,
      } = args;
      api.cancelPending();
      api.cancelHideSoon();
      const gen = scheduleGeneration;
      openTimerId = setTimeout(() => {
        openTimerId = null;
        if (gen !== scheduleGeneration) {
          return;
        }
        if (!anchorEl?.isConnected) {
          return;
        }
        const snapshot = typeof getSnapshot === "function" ? getSnapshot() : null;
        if (!snapshot) {
          return;
        }
        openReset(anchorEl, snapshot, getMainSnapshot);
      }, OPEN_DELAY_RESET_MS);
    },

    /** Сразу показать reset (без задержки), если уже наведены на кнопку. */
    showResetNow(args) {
      const {
        anchorEl, getSnapshot, getMainSnapshot,
      } = args;
      api.cancelPending();
      api.cancelHideSoon();
      if (!anchorEl?.isConnected) {
        return;
      }
      const snapshot = typeof getSnapshot === "function" ? getSnapshot() : null;
      if (!snapshot) {
        return;
      }
      openReset(anchorEl, snapshot, getMainSnapshot);
    },

    /** После ухода с кнопки — снова main, если курсор остался в ячейке. */
    scheduleShowMainAfterResetLeave(args) {
      const { cellRootEl, getSnapshot } = args;
      api.cancelPending();
      api.cancelHideSoon();
      const gen = scheduleGeneration;
      openTimerId = setTimeout(() => {
        openTimerId = null;
        runScheduledMainOpen(cellRootEl, getSnapshot, gen);
      }, OPEN_DELAY_MAIN_MS);
    },

    /**
     * Курсор ушёл с оверлея: если вернулся в ту же ячейку — снова показать main без ожидания.
     * @param {EventTarget|null} relatedTarget
     */
    resumeMainIfPointerReturnedToCell(relatedTarget) {
      const root = state.relatedCellRootEl;
      if (!(relatedTarget instanceof Node) || !root?.contains(relatedTarget)) {
        api.scheduleHideSoon();
        return;
      }
      const snap = typeof state.persistGetMainSnapshot === "function"
        ? state.persistGetMainSnapshot()
        : null;
      if (!snap) {
        api.scheduleHideSoon();
        return;
      }
      openMain(root, snap, state.persistGetMainSnapshot);
    },

    onExternalScrollOrResize() {
      api.cancelPending();
      if (!state.show) {
        return;
      }
      if (!state.anchorEl?.isConnected) {
        api.hide();
        return;
      }
      repositionIfOpen();
    },

    onMenuInput(v) {
      if (!v) {
        api.hide();
      }
    },

    destroy() {
      api.hide();
    },
  };

  return api;
}
