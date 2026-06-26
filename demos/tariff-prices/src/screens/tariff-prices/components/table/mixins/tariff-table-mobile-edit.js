import { parseCellKey } from "../lib/cell-identity.js";
import { MOBILE_EDIT_FOCUS_IN_SESSION_MS,
  MOBILE_EDIT_FOCUS_RESTORE_GRACE_MS,
  MOBILE_EDIT_SCROLL_RO_THROTTLE_MS,
  MOBILE_EDIT_SUPPRESS_CLICK_MS,
  MOBILE_KEYBOARD_DISMISS_CONFIRM_MS,
  MOBILE_KEYBOARD_INTRUSION_OPEN_PX,
  MOBILE_KEYBOARD_STABLE_OPEN_TICKS,
  MOBILE_KEYBOARD_VV_COOLDOWN_MS } from "../config/table-grid-metrics.js";
import { disarmMobileEditFocusRestoreGrace } from "../lib/editing/disarm-mobile-edit-focus-restore-grace.js";
import { logMobileEditError } from "../lib/editing/log-mobile-edit-error.js";
import { trackDemoEvent } from "../../../../../../../shared/analytics/demo-analytics.ts";
import { resetPriceTextSelectGestureState } from "../lib/editing/price-text-selection-gesture.js";
import { getMobileEditLayoutSettleDelayedMs,
  shouldCancelDelayedLayoutSettle } from "../lib/editing/mobile-edit-layout-settle.js";
import { shouldBumpMobileEditScrollGeneration,
  shouldSkipMobileEditSessionStart } from "../lib/editing/mobile-edit-session.js";
import { probeMobileKeyboardDismissFromViewportChange } from "../lib/editing/mobile-edit-keyboard-session.js";
import { shouldRestoreMobileEditableCellFocus as computeShouldRestoreMobileEditableCellFocus } from "../lib/editing/should-restore-mobile-editable-cell-focus.js";
import { didKeyboardLikelyClose,
  getKeyboardIntrusionPx,
  isMobileKeyboardLikelyOpen,
  isVirtualKeyboardApiAvailable,
  isVirtualKeyboardGeometryLikelyOpen,
  isVisualViewportLikelyKeyboardOpen,
  rectsOverlap2D } from "../lib/scroll/mobile-keyboard-viewport.js";
import { shouldBlurActiveMobileInputOnKeyboardDismiss,
  shouldApplyKeyboardDismissOnConfirm } from "../lib/scroll/mobile-keyboard-dismiss.js";
import { cellOverlapsPageStickyZone,
  scrollCellIntoEditableViewport,
  scrollCellIntoEditableViewportHorizontally } from "../lib/scroll/mobile-edit-scroll-into-view.js";

/**
 * Мобильное inline-редактирование: VisualViewport (dismiss клавиатуры), sticky overlap.
 * Состояние «редактируется ячейка» определяется нативным фокусом в `<input>` внутри `[data-cell-root]`, без ключа `mobileEditCellKey`.
 * Зависит от `syncEditableCellDraftFromInput` (mixins/tariff-table-cell-events.js), `findCellRootByKey` на хосте.
 */
export default {
  data() {
    return {
      cellRootDomCache: {
        cellRootCacheKey: "",
        cellRootCacheEl: null,
      },
      /** На мобилке: фокус в редактируемом инпуте таблицы (для футера / z-index / VV). */
      mobileTableCellInputFocused: false,
      suppressTableClickUntilMs: 0,
      mobileEditVisualViewportHandler: null,
      mobileEditVvSessionMinHeight: null,
      mobileEditVvSessionMaxIntrusion: 0,
      mobileEditVvSawKeyboardIntrusion: false,
      mobileKeyboardDismissPrevIntrusionPx: 0,
      mobileKeyboardDismissPrevLikelyOpen: false,
      mobileKeyboardDismissConfirmTimer: null,
      mobileEditStickyOverlapsHeader: false,
      mobileEditStickyOverlapRafId: null,
      mobileLastFocusedEditableCellKey: "",
      /** Не обрабатывать dismiss по VV до этого времени (мс с epoch) после focus в ячейку. */
      mobileEditVvIgnoreUntilMs: 0,
      /** Был ли хотя бы один кадр с «клавиатура открыта» — без этого не запускаем dismiss (ложные закрытия при открытии). */
      mobileEditVvSawKeyboardOpen: false,
      /** Подряд условий growthLikelyKeyboardClosed при закрытой эвристике (антидребезг). */
      mobileEditGrowthClosedTicks: 0,
      /** Слушатель `geometrychange` для VirtualKeyboard API. */
      mobileEditVkGeometryHandler: null,
      /** Последнее значение «клавиатура открыта» по VirtualKeyboard.boundingRect. */
      mobileEditVkGeometryOpen: false,
      /** Закрытие VK по geometrychange — confirm dismiss с blur. */
      mobileEditVkGeometryDismissPending: false,
      /** ResizeObserver на скролл-контейнер таблицы — переподскролл при изменении его max-height. */
      mobileEditScrollContainerResizeObserver: null,
      /** Элемент, который сейчас наблюдает `mobileEditScrollContainerResizeObserver` (для idempotent attach). */
      mobileEditObservedScrollContainerEl: null,
      /** rAF id, дебаунсит переподскролл от ResizeObserver. */
      mobileEditScrollResizeRafId: null,
      /** Троттлинг ResizeObserver при открытой клавиатуре (меньше каскада пересчётов). */
      mobileEditScrollRoThrottleTimer: null,
      /** До этого времени (epoch ms) разрешён restore фокуса после resize viewport. */
      mobileEditFocusRestoreAllowedUntilMs: 0,
      /** До этого времени (epoch ms) активна сессия focus-in — dismiss заблокирован. */
      mobileEditFocusInSessionUntilMs: 0,
      /** Клавиатура стабильно открыта — можно обрабатывать dismiss. */
      mobileEditKeyboardStableOpen: false,
      /** Подряд кадров с открытой клавиатурой. */
      mobileEditKeyboardStableOpenTicks: 0,
      /** Chromium overlay VK: VV intrusion ≈ 0, рост VV — не dismiss. */
      mobileEditVkOverlaySession: false,
      /** Таймер отложенного settle после touch-hold occlusion. */
      mobileEditLayoutSettleDelayedTimer: null,
      /** data-cell-key ячейки из pointerdown при switch A→B (late focus на мобилке). */
      mobileEditPointerDownCellKey: "",
      /** Ячейка-B из pointerdown: блокирует dismiss/teardown до завершения switch. */
      mobileEditPendingSwitchCellKey: "",
      /** Целевая ячейка switch до завершения switchMobileEditToCell (dedup focusin). */
      mobileEditSwitchInProgressCellKey: "",
      /** Координаты последнего pointerdown (fallback elementFromPoint при blur-to-action). */
      mobileEditPointerDownCoords: null,
      /** cellKey последнего запланированного подскролла — поколение только при смене ячейки. */
      mobileEditScrollTargetCellKey: "",
      /** Поколение запроса подскролла активной ячейки — отменяет «зависшие» 2× rAF от прошлой ячейки. */
      mobileEditScrollGeneration: 0,
      /** Таймер отложенного retry подскролла после открытия overlay VK (Android Chrome). */
      mobileEditVkScrollRetryTimer: null,
      /** Extended retry (~100ms) когда scroll no-op до появления VK boundingRect. */
      mobileEditVkScrollExtendedRetryTimer: null,
      mobileEditVkScrollExtendedRetryCellKey: "",
      /** Поколение текущей edit-сессии (focusin) — отменяет delayed layout settle от прошлого focusin. */
      mobileEditSessionGeneration: 0,
    };
  },
  watch: {
    isMobileDevice(v) {
      if (!v) {
        this.detachMobileTableVisualViewport();
        this.mobileTableCellInputFocused = false;
        this.mobileLastFocusedEditableCellKey = "";
        this.mobileEditVvIgnoreUntilMs = 0;
        this.mobileEditVvSawKeyboardOpen = false;
        this.mobileEditVvSawKeyboardIntrusion = false;
        this.mobileEditVvSessionMaxIntrusion = 0;
        this.mobileKeyboardDismissPrevIntrusionPx = 0;
        this.mobileEditGrowthClosedTicks = 0;
        disarmMobileEditFocusRestoreGrace(this);
        this.mobileEditFocusInSessionUntilMs = 0;
        this.mobileEditKeyboardStableOpen = false;
        this.mobileEditKeyboardStableOpenTicks = 0;
        this.mobileEditVkOverlaySession = false;
        this.mobileEditPointerDownCellKey = "";
        this.mobileEditPendingSwitchCellKey = "";
        this.mobileEditSwitchInProgressCellKey = "";
        this.mobileEditPointerDownCoords = null;
        this.mobileEditScrollTargetCellKey = "";
        this.mobileEditVkScrollExtendedRetryCellKey = "";
        this.clearMobileEditVkScrollRetryTimer();
        this.clearMobileEditVkScrollExtendedRetryTimer();
        // Инкрементируем поколения, чтобы любые «зависшие» rAF / setTimeout от прошлых сессий
        // были отменены (вместо обнуления в 0, чтобы не совпасть со захваченным snapshot'ом).
        this.mobileEditScrollGeneration = (this.mobileEditScrollGeneration + 1) | 0;
        this.mobileEditSessionGeneration = (this.mobileEditSessionGeneration + 1) | 0;
        this.setCompactMode(false);
        this.booleanRestrictionSheet = null;
        this.dependentRestrictionReadonlySheet = null;
      }
      if (v) {
        if (this.tooltipAnchorClearTimer) {
          clearTimeout(this.tooltipAnchorClearTimer);
          this.tooltipAnchorClearTimer = null;
        }
        this.tooltipAnchorCellKey = null;
        if (this.$store.state.tariffPricesAndRestrictions?.compactRestrictions) {
          this.applyCompactRestrictionsViewMode(false);
        }
      }
    },
  },
  beforeDestroy() {
    if (this.mobileEditStickyOverlapRafId != null && typeof cancelAnimationFrame !== "undefined") {
      cancelAnimationFrame(this.mobileEditStickyOverlapRafId);
      this.mobileEditStickyOverlapRafId = null;
    }
    this.clearMobileKeyboardDismissConfirmTimer();
    this.clearMobileEditLayoutSettleDelayedTimer();
    this.clearMobileEditVkScrollRetryTimer();
    this.clearMobileEditVkScrollExtendedRetryTimer();
    // detachMobileTableVisualViewport чистит mobileEditScrollRoThrottleTimer и mobileEditScrollResizeRafId
    // через detachMobileEditScrollContainerResizeObserver, но если ресайз-обсервер не был подключён
    // (никогда не было focusin), таймера и так нет — safe.
    this.detachMobileTableVisualViewport();
  },
  methods: {
    isMobileEditableInputFocused() {
      if (!this.isMobileDevice || typeof document === "undefined") {
        return false;
      }
      const ae = document.activeElement;
      return Boolean(
        ae?.nodeName === "INPUT"
        && ae.closest?.("[data-cell-root]")
        && this.$el?.contains?.(ae),
      );
    },
    /** Публичный API для родителя: активен ли inline-ввод в ячейке этой таблицы. */
    hasActiveMobileEditableCellFocus() {
      return this.isMobileEditableInputFocused();
    },
    /** Разрешён ли restore фокуса при refreshVirtualizedTableLayout. */
    shouldRestoreMobileEditableCellFocus(explicitRestoreFocusCellKey = "") {
      if (!this.isMobileDevice) {
        return false;
      }
      return computeShouldRestoreMobileEditableCellFocus({
        nowMs: Date.now(),
        focusRestoreAllowedUntilMs: this.mobileEditFocusRestoreAllowedUntilMs,
        mobileTableCellInputFocused: this.mobileTableCellInputFocused,
        isMobileEditableInputFocused: this.isMobileEditableInputFocused(),
        explicitRestoreFocusCellKey: explicitRestoreFocusCellKey || "",
      });
    },
    /** Старт edit-сессии при focusin в ячейку (cold start). */
    startMobileEditSession(cellKey = "", { skipIfActiveCell = false } = {}) {
      if (!this.isMobileDevice) {
        return;
      }
      if (shouldSkipMobileEditSessionStart({
        cellKey,
        lastFocusedCellKey: this.mobileLastFocusedEditableCellKey || "",
        sessionActive: Boolean(this.mobileTableCellInputFocused),
        skipIfActiveCell,
        pendingSwitchCellKey: this.mobileEditPendingSwitchCellKey || "",
        switchInProgressCellKey: this.mobileEditSwitchInProgressCellKey || "",
      })) {
        return;
      }
      // Инкремент поколения сессии: новые focusin отменяют отложенные операции (settle, delayed pass)
      // от предыдущей ячейки. Безопасно для wrap (Number.MAX_SAFE_INTEGER).
      this.mobileEditSessionGeneration = (this.mobileEditSessionGeneration + 1) | 0;
      if (cellKey) {
        this.mobileLastFocusedEditableCellKey = cellKey;
      }
      this.armMobileEditKeyboardDismissGuards({ resetGeometry: true });
      this.mobileTableCellInputFocused = true;
      trackDemoEvent("tariffPrices", "price_edit_start", { mobile: true });
      this.attachMobileTableVisualViewport();
      this.scheduleMobileEditStickyOverlapCheck();
      this.scheduleMobileEditCellScrollIntoView?.();
    },
    /**
     * Switch A→B внутри активной edit-сессии: сохраняем VK/VV state, не cold-start guards.
     */
    continueMobileEditSessionForCell(cellKey = "") {
      if (!this.isMobileDevice) {
        return;
      }
      if (cellKey) {
        this.mobileLastFocusedEditableCellKey = cellKey;
      }
      this.mobileTableCellInputFocused = true;
      this.armMobileEditKeyboardDismissGuards({ resetGeometry: false });
      this.attachMobileTableVisualViewport();
      this.scheduleMobileEditStickyOverlapCheck();
      this.scheduleMobileEditCellScrollIntoView?.();
    },
    reconcileScrollContainerFitAfterCellSwitch() {
      if (!this.isMobileDevice) {
        return;
      }
      this.runMobileEditLayoutSettlePass();
      this.$nextTick(() => {
        this.runMobileEditLayoutSettlePass();
        if (typeof requestAnimationFrame !== "function") {
          this.scheduleMobileEditCellScrollIntoView?.({ retry: true });
          return;
        }
        requestAnimationFrame(() => {
          this.runMobileEditLayoutSettlePass();
          this.scheduleMobileEditCellScrollIntoView?.({ retry: true });
        });
      });
    },
    clearMobileEditPointerDownCellKey() {
      this.mobileEditPointerDownCellKey = "";
      this.mobileEditPendingSwitchCellKey = "";
      this.mobileEditPointerDownCoords = null;
    },
    clearMobileEditVkScrollRetryTimer() {
      if (this.mobileEditVkScrollRetryTimer != null) {
        clearTimeout(this.mobileEditVkScrollRetryTimer);
        this.mobileEditVkScrollRetryTimer = null;
      }
    },
    clearMobileEditVkScrollExtendedRetryTimer() {
      if (this.mobileEditVkScrollExtendedRetryTimer != null) {
        clearTimeout(this.mobileEditVkScrollExtendedRetryTimer);
        this.mobileEditVkScrollExtendedRetryTimer = null;
      }
    },
    scheduleMobileEditVkScrollExtendedRetry(cellKey = "") {
      if (!this.isMobileDevice || typeof setTimeout !== "function") {
        return;
      }
      const key = cellKey || this.mobileLastFocusedEditableCellKey || "";
      if (!key || this.mobileEditVkScrollExtendedRetryCellKey === key) {
        return;
      }
      this.clearMobileEditVkScrollExtendedRetryTimer();
      this.mobileEditVkScrollExtendedRetryCellKey = key;
      this.mobileEditVkScrollExtendedRetryTimer = setTimeout(() => {
        this.mobileEditVkScrollExtendedRetryTimer = null;
        if (this.mobileTableCellInputFocused) {
          this.scheduleMobileEditCellScrollIntoView({ retry: true });
        }
      }, 100);
    },
    scheduleMobileEditVkScrollRetry() {
      if (!this.isMobileDevice || typeof setTimeout !== "function") {
        return;
      }
      this.clearMobileEditVkScrollRetryTimer();
      this.mobileEditVkScrollRetryTimer = setTimeout(() => {
        this.mobileEditVkScrollRetryTimer = null;
        if (this.mobileTableCellInputFocused) {
          this.scheduleMobileEditCellScrollIntoView({ retry: true });
        }
      }, 32);
    },
    recordMobileEditPointerDownCellKey(event) {
      if (!this.isMobileDevice) {
        return;
      }
      const clientX = event?.clientX;
      const clientY = event?.clientY;
      if (Number.isFinite(clientX) && Number.isFinite(clientY)) {
        this.mobileEditPointerDownCoords = { clientX, clientY };
      }
      if (!this.mobileTableCellInputFocused) {
        return;
      }
      const cellRoot = event?.target?.closest?.("[data-cell-root]");
      if (!cellRoot || !this.$el?.contains?.(cellRoot)) {
        return;
      }
      const key = cellRoot.getAttribute?.("data-cell-key") || "";
      const fromKey = this.mobileLastFocusedEditableCellKey || "";
      if (key && fromKey && key !== fromKey) {
        this.mobileEditPointerDownCellKey = key;
        this.mobileEditPendingSwitchCellKey = key;
      }
    },
    focusEditableCellInput(cellRoot) {
      if (!cellRoot?.querySelector) {
        return null;
      }
      const input = cellRoot.querySelector("input[inputmode=\"decimal\"], input[inputmode=\"numeric\"], input");
      if (input?.nodeName !== "INPUT") {
        return null;
      }
      const ae = typeof document !== "undefined" ? document.activeElement : null;
      if (ae !== input) {
        try {
          input.focus();
        } catch (err) {
          // ignore
        }
      }
      return input;
    },
    async switchMobileEditToCell({
      fromCellRoot, toCellRoot, focusEvent = null,
    } = {}) {
      if (!this.isMobileDevice || !fromCellRoot || !toCellRoot || fromCellRoot === toCellRoot) {
        return;
      }
      const toCellKey = toCellRoot.getAttribute?.("data-cell-key") || "";
      this.mobileEditSwitchInProgressCellKey = toCellKey;
      try {
        if (typeof this.finalizeCellDraftFromCellRoot === "function") {
          await this.finalizeCellDraftFromCellRoot(fromCellRoot, focusEvent).catch((err) => {
            logMobileEditError("switchMobileEditToCell.finalize", err, { fromCellKey: fromCellRoot?.getAttribute?.("data-cell-key") || "" });
          });
        }
        this.focusEditableCellInput(toCellRoot);
        this.continueMobileEditSessionForCell(toCellKey);
        this.reconcileScrollContainerFitAfterCellSwitch();
      } finally {
        this.clearMobileEditPointerDownCellKey();
        this.mobileEditSwitchInProgressCellKey = "";
      }
    },
    async switchMobileEditToCellByKey({
      fromCellRoot, toCellKey, focusEvent = null,
    } = {}) {
      if (!this.isMobileDevice || !fromCellRoot || !toCellKey) {
        return false;
      }
      const toCellRoot = this.findCellRootByKey?.(toCellKey);
      if (!toCellRoot) {
        return false;
      }
      await this.switchMobileEditToCell({
        fromCellRoot, toCellRoot, focusEvent,
      });
      return true;
    },
    armMobileEditFocusRestoreGrace() {
      if (!this.isMobileDevice) {
        return;
      }
      this.mobileEditFocusRestoreAllowedUntilMs = Date.now() + MOBILE_EDIT_FOCUS_RESTORE_GRACE_MS;
    },
    disarmMobileEditFocusRestoreGrace() {
      disarmMobileEditFocusRestoreGrace(this);
    },
    armMobileEditFocusInSession() {
      if (!this.isMobileDevice) {
        return;
      }
      this.mobileEditFocusInSessionUntilMs = Date.now() + MOBILE_EDIT_FOCUS_IN_SESSION_MS;
      this.mobileEditKeyboardStableOpen = false;
      this.mobileEditKeyboardStableOpenTicks = 0;
      this.mobileEditVkOverlaySession = false;
    },
    /**
     * Клавиатура реально влияет на `--prices-table-bottom-occlusion` (не body class при одном focusin).
     */
    isMobileKeyboardAffectingScrollLayout() {
      if (!this.isMobileDevice || !this.mobileTableCellInputFocused) {
        return false;
      }
      if (this.mobileEditVkGeometryOpen) {
        return true;
      }
      if (typeof window === "undefined") {
        return false;
      }
      const vv = window.visualViewport;
      const innerH = window.innerHeight;
      if (!vv) {
        return false;
      }
      if (
        this.mobileEditVvSawKeyboardIntrusion
        && getKeyboardIntrusionPx(vv, innerH) > MOBILE_KEYBOARD_INTRUSION_OPEN_PX
      ) {
        return true;
      }
      return isVisualViewportLikelyKeyboardOpen(vv.height, innerH);
    },
    shouldBlockMobileKeyboardDismiss() {
      if (!this.isMobileDevice || !this.mobileTableCellInputFocused) {
        return false;
      }
      if (this.mobileEditPendingSwitchCellKey) {
        return true;
      }
      const inSessionWindow = Date.now() < (this.mobileEditFocusInSessionUntilMs || 0);
      if (!inSessionWindow) {
        return false;
      }
      return !this.mobileEditKeyboardStableOpen;
    },
    shouldDeferMobileEditableCellBlurSession() {
      if (!this.isMobileDevice) {
        return false;
      }
      if (this.mobileEditPendingSwitchCellKey) {
        return true;
      }
      if (this.shouldRestoreMobileEditableCellFocus?.()) {
        return true;
      }
      if (this.shouldBlockMobileKeyboardDismiss?.()) {
        return true;
      }
      return false;
    },
    updateMobileEditKeyboardStableOpenState({
      keyboardLikelyOpen = false, vkOpen = false, intrusionPx = 0,
    } = {}) {
      if (!this.isMobileDevice || !this.mobileTableCellInputFocused) {
        return;
      }
      if (vkOpen && intrusionPx <= MOBILE_KEYBOARD_INTRUSION_OPEN_PX) {
        this.mobileEditVkOverlaySession = true;
      }
      if (keyboardLikelyOpen || vkOpen) {
        this.mobileEditKeyboardStableOpenTicks = Math.min(
          8,
          (this.mobileEditKeyboardStableOpenTicks || 0) + 1,
        );
        if (this.mobileEditKeyboardStableOpenTicks >= MOBILE_KEYBOARD_STABLE_OPEN_TICKS) {
          this.mobileEditKeyboardStableOpen = true;
          this.mobileEditFocusInSessionUntilMs = 0;
        }
      } else {
        this.mobileEditKeyboardStableOpenTicks = 0;
      }
    },
    notifyMobileEditFooterSessionEnded() {
      if (typeof this.finishMobileEditFooterSession === "function") {
        this.finishMobileEditFooterSession();
      }
    },
    clearMobileEditLayoutSettleDelayedTimer() {
      if (this.mobileEditLayoutSettleDelayedTimer != null) {
        clearTimeout(this.mobileEditLayoutSettleDelayedTimer);
        this.mobileEditLayoutSettleDelayedTimer = null;
      }
    },
    runMobileEditLayoutSettlePass() {
      if (typeof this.recomputeScrollContainerFit === "function") {
        this.recomputeScrollContainerFit();
      }
      if (typeof requestAnimationFrame !== "function") {
        return;
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const headerEl = this.$refs.tableStickyHeaderMeasure;
          if (headerEl?.getBoundingClientRect) {
            headerEl.getBoundingClientRect();
          }
        });
      });
    },
    scheduleMobileEditLayoutSettle() {
      if (!this.isMobileDevice) {
        return;
      }
      this.clearMobileEditLayoutSettleDelayedTimer();
      // Snapshot поколения сессии: если до срабатывания delayed pass пользователь успел сделать
      // focusin в другую ячейку, отложенный пересчёт layout не выполняется (актуальные пересчёты
      // придут от новой сессии).
      const generationAtSchedule = this.mobileEditSessionGeneration;
      this.$nextTick(() => {
        this.runMobileEditLayoutSettlePass();
        if (this.deferVirtualizerRefreshUntilEditEnds) {
          this.runDeferredVirtualizerRefreshIfNeeded?.();
        } else {
          this.refreshVirtualizedTableLayout?.({ force: true });
        }
        const delayMs = getMobileEditLayoutSettleDelayedMs();
        if (typeof setTimeout !== "function") {
          return;
        }
        this.mobileEditLayoutSettleDelayedTimer = setTimeout(() => {
          this.mobileEditLayoutSettleDelayedTimer = null;
          if (shouldCancelDelayedLayoutSettle({
            editSessionActive: this.mobileTableCellInputFocused,
            sessionGenerationAtSchedule: generationAtSchedule,
            currentSessionGeneration: this.mobileEditSessionGeneration,
          })) {
            return;
          }
          this.runMobileEditLayoutSettlePass();
        }, delayMs);
      });
    },
    resetMobileEditKeyboardGeometrySession() {
      this.mobileEditVvSessionMinHeight = null;
      this.mobileEditVvSessionMaxIntrusion = 0;
      this.mobileEditVvSawKeyboardOpen = false;
      this.mobileEditVvSawKeyboardIntrusion = false;
      this.mobileKeyboardDismissPrevLikelyOpen = false;
      this.mobileKeyboardDismissPrevIntrusionPx = 0;
      this.mobileEditGrowthClosedTicks = 0;
      this.mobileEditVkGeometryDismissPending = false;
    },
    /** Сброс антидребезга dismiss клавиатуры при новом focus в ячейку. */
    armMobileEditKeyboardDismissGuards({ resetGeometry = true } = {}) {
      if (!this.isMobileDevice) {
        return;
      }
      this.mobileEditVvIgnoreUntilMs = Date.now() + MOBILE_KEYBOARD_VV_COOLDOWN_MS;
      this.armMobileEditFocusRestoreGrace();
      if (resetGeometry) {
        this.armMobileEditFocusInSession();
        this.resetMobileEditKeyboardGeometrySession();
        this.mobileEditVkGeometryOpen = false;
      }
    },
    attachMobileTableVisualViewport() {
      if (!this.isMobileDevice || typeof window === "undefined") {
        return;
      }
      const vv = window.visualViewport;
      if (!vv || this.mobileEditVisualViewportHandler) {
        return;
      }
      const onVvChange = () => {
        this.scheduleMobileEditStickyOverlapCheck?.();
        this.handleMobileKeyboardVisualViewportChange();
      };
      this.mobileEditVisualViewportHandler = onVvChange;
      vv.addEventListener("resize", onVvChange);
      vv.addEventListener("scroll", onVvChange);
      this.attachMobileVirtualKeyboardGeometry();
      this.attachMobileEditScrollContainerResizeObserver();
    },
    /**
     * Подписка на изменение размеров скролл-контейнера таблицы, пока активен редактируемый инпут.
     * Нужно, чтобы после `recompute()` контроллера высоты (`max-height` через CSS-переменные)
     * мы повторно проверили видимость ячейки и при необходимости довели её до safe-зоны.
     */
    attachMobileEditScrollContainerResizeObserver() {
      if (!this.isMobileDevice || typeof window === "undefined") {
        return;
      }
      if (typeof window.ResizeObserver !== "function") {
        return;
      }
      const getContainer = this.getPricesPageScrollContainer;
      const container = typeof getContainer === "function" ? getContainer() : null;
      if (!container) {
        return;
      }
      if (this.mobileEditObservedScrollContainerEl === container && this.mobileEditScrollContainerResizeObserver) {
        return;
      }
      this.detachMobileEditScrollContainerResizeObserver();
      const ro = new window.ResizeObserver(() => {
        if (!this.mobileTableCellInputFocused) {
          return;
        }
        const runScrollIntoView = () => {
          if (this.mobileEditScrollResizeRafId != null) {
            return;
          }
          this.mobileEditScrollResizeRafId = requestAnimationFrame(() => {
            this.mobileEditScrollResizeRafId = null;
            if (!this.mobileTableCellInputFocused) {
              return;
            }
            this.scheduleMobileEditCellScrollIntoView?.();
          });
        };
        if (this.mobileEditScrollRoThrottleTimer != null) {
          clearTimeout(this.mobileEditScrollRoThrottleTimer);
          this.mobileEditScrollRoThrottleTimer = null;
        }
        this.mobileEditScrollRoThrottleTimer = setTimeout(() => {
          this.mobileEditScrollRoThrottleTimer = null;
          runScrollIntoView();
        }, MOBILE_EDIT_SCROLL_RO_THROTTLE_MS);
      });
      try {
        ro.observe(container);
      } catch (err) {
        return;
      }
      this.mobileEditScrollContainerResizeObserver = ro;
      this.mobileEditObservedScrollContainerEl = container;
    },
    detachMobileEditScrollContainerResizeObserver() {
      if (this.mobileEditScrollRoThrottleTimer != null) {
        clearTimeout(this.mobileEditScrollRoThrottleTimer);
        this.mobileEditScrollRoThrottleTimer = null;
      }
      const ro = this.mobileEditScrollContainerResizeObserver;
      if (ro) {
        try {
          ro.disconnect();
        } catch (err) {
          // ignore
        }
      }
      this.mobileEditScrollContainerResizeObserver = null;
      this.mobileEditObservedScrollContainerEl = null;
      if (this.mobileEditScrollResizeRafId != null && typeof cancelAnimationFrame !== "undefined") {
        cancelAnimationFrame(this.mobileEditScrollResizeRafId);
        this.mobileEditScrollResizeRafId = null;
      }
    },
    detachMobileVirtualKeyboardGeometry() {
      const nav = typeof navigator !== "undefined" ? navigator : null;
      const vk = nav?.virtualKeyboard;
      const h = this.mobileEditVkGeometryHandler;
      if (vk && h && typeof vk.removeEventListener === "function") {
        try {
          vk.removeEventListener("geometrychange", h);
        } catch (err) {
          // ignore
        }
      }
      this.mobileEditVkGeometryHandler = null;
      this.mobileEditVkGeometryOpen = false;
    },
    attachMobileVirtualKeyboardGeometry() {
      const nav = typeof navigator !== "undefined" ? navigator : null;
      if (!isVirtualKeyboardApiAvailable(nav) || this.mobileEditVkGeometryHandler) {
        return;
      }
      const vk = nav.virtualKeyboard;
      const onGeom = () => {
        const innerH = typeof window !== "undefined" ? window.innerHeight : 0;
        const prevVkOpen = Boolean(this.mobileEditVkGeometryOpen);
        this.mobileEditVkGeometryOpen = Boolean(isVirtualKeyboardGeometryLikelyOpen(nav, innerH));
        if (this.mobileEditVkGeometryOpen) {
          this.mobileEditVvSawKeyboardOpen = true;
          this.mobileEditVvSawKeyboardIntrusion = true;
          this.mobileEditKeyboardStableOpen = true;
          this.mobileEditFocusInSessionUntilMs = 0;
          if (!prevVkOpen) {
            if (typeof this.recomputeScrollContainerFit === "function") {
              this.recomputeScrollContainerFit();
            }
            this.scheduleMobileEditCellScrollIntoView({ retry: true });
            this.scheduleMobileEditVkScrollRetry();
          }
        }
        if (prevVkOpen && !this.mobileEditVkGeometryOpen) {
          this.mobileEditVkGeometryDismissPending = true;
          this.scheduleMobileKeyboardDismissConfirm({ vkGeometryClosed: true });
          this.handleMobileKeyboardVisualViewportChange();
        }
        if (this.mobileTableCellInputFocused) {
          this.scheduleMobileEditCellScrollIntoView?.();
        }
      };
      this.mobileEditVkGeometryHandler = onGeom;
      vk.addEventListener("geometrychange", onGeom);
      onGeom();
    },
    detachMobileTableVisualViewport() {
      this.detachMobileEditScrollContainerResizeObserver();
      const vv = typeof window !== "undefined" ? window.visualViewport : null;
      const h = this.mobileEditVisualViewportHandler;
      if (h && vv) {
        vv.removeEventListener("resize", h);
        vv.removeEventListener("scroll", h);
      }
      this.mobileEditVisualViewportHandler = null;
      this.resetMobileEditKeyboardGeometrySession();
      this.detachMobileVirtualKeyboardGeometry();
    },
    blurFocusedCellInput() {
      const ae = typeof document !== "undefined" ? document.activeElement : null;
      if (
        ae?.nodeName === "INPUT"
        && ae.closest?.("[data-cell-root]")
        && this.$el?.contains?.(ae)
      ) {
        try {
          ae.blur();
        } catch (err) {
          // ignore
        }
      }
    },
    scheduleMobileEditStickyOverlapCheck() {
      if (!this.isMobileDevice || !this.mobileTableCellInputFocused) {
        return;
      }
      if (this.mobileEditStickyOverlapRafId != null) {
        return;
      }
      this.mobileEditStickyOverlapRafId = requestAnimationFrame(() => {
        this.mobileEditStickyOverlapRafId = null;
        this.updateMobileEditStickyOverlap();
      });
    },
    updateMobileEditStickyOverlap() {
      if (!this.isMobileDevice || !this.mobileTableCellInputFocused) {
        this.mobileEditStickyOverlapsHeader = false;
        return;
      }
      const headerEl = this.$refs.tableStickyHeaderMeasure;
      const cellEl = typeof document !== "undefined"
        ? document.activeElement?.closest?.("[data-cell-root]")
        : null;
      if (!cellEl || !this.$el?.contains?.(cellEl) || !cellEl?.getBoundingClientRect) {
        this.mobileEditStickyOverlapsHeader = false;
        return;
      }
      const c = cellEl.getBoundingClientRect();
      const innerW = typeof window !== "undefined" ? window.innerWidth : 0;
      const pageBottom = typeof this.getPricesPageStickyHeaderBottom === "function"
        ? this.getPricesPageStickyHeaderBottom()
        : null;
      const overlapsPage = innerW > 0 && cellOverlapsPageStickyZone(c, pageBottom, innerW);
      let overlapsTable = false;
      if (headerEl?.getBoundingClientRect) {
        const h = headerEl.getBoundingClientRect();
        overlapsTable = rectsOverlap2D(h, c);
      }
      const combined = overlapsTable || overlapsPage;
      this.mobileEditStickyOverlapsHeader = combined;
    },
    /**
     * Подскролл активной ячейки в зону между липкой шапкой страницы и клавиатурой (visualViewport).
     * Поколение scroll инкрементируется только при смене cellKey; retry (RO/VK) не отменяет rAF.
     */
    scheduleMobileEditCellScrollIntoView({ retry = false } = {}) {
      if (!this.isMobileDevice || typeof window === "undefined" || typeof document === "undefined") {
        return;
      }
      const cellKey = this.mobileLastFocusedEditableCellKey || "";
      if (shouldBumpMobileEditScrollGeneration({
        targetCellKey: cellKey,
        currentScrollTargetCellKey: this.mobileEditScrollTargetCellKey,
        retry,
      })) {
        this.mobileEditScrollTargetCellKey = cellKey;
        this.mobileEditScrollGeneration = (this.mobileEditScrollGeneration + 1) | 0;
      }
      const generation = this.mobileEditScrollGeneration;
      const runScroll = () => {
        if (generation !== this.mobileEditScrollGeneration) {
          return;
        }
        if (!this.mobileTableCellInputFocused) {
          return;
        }
        const getContainer = this.getPricesPageScrollContainer;
        const container = typeof getContainer === "function" ? getContainer() : null;
        const cellEl = document.activeElement?.closest?.("[data-cell-root]")
          || (cellKey ? this.findCellRootByKey?.(cellKey) : null);
        if (!container || !cellEl || !this.$el?.contains?.(cellEl)) {
          return;
        }
        const getBottom = this.getPricesPageStickyHeaderBottom;
        const pageSticky = typeof getBottom === "function" ? getBottom() : null;
        const nav = typeof navigator !== "undefined" ? navigator : null;
        let vkRect = null;
        try {
          vkRect = nav?.virtualKeyboard?.boundingRect ?? null;
        } catch (err) {
          vkRect = null;
        }
        const scrollResult = scrollCellIntoEditableViewport({
          cellRootEl: cellEl,
          scrollContainerEl: container,
          pageStickyBottomPx: pageSticky,
          visualViewport: window.visualViewport,
          windowInnerHeight: window.innerHeight,
          virtualKeyboardBoundingRect: vkRect,
        });
        const horizontalEl = typeof this.getPricesTableHorizontalScrollContainer === "function"
          ? this.getPricesTableHorizontalScrollContainer()
          : null;
        scrollCellIntoEditableViewportHorizontally({
          cellRootEl: cellEl,
          horizontalScrollEl: horizontalEl,
        });
        const plan = scrollResult.plan || {};
        const vkHeight = plan.vkHeight;
        if (
          !scrollResult.changed
          && this.mobileTableCellInputFocused
          && (!Number.isFinite(vkHeight) || vkHeight < 8)
        ) {
          this.scheduleMobileEditVkScrollRetry();
          this.scheduleMobileEditVkScrollExtendedRetry(cellKey);
        }
      };
      this.$nextTick(() => {
        if (generation !== this.mobileEditScrollGeneration) {
          return;
        }
        requestAnimationFrame(() => {
          if (generation !== this.mobileEditScrollGeneration) {
            return;
          }
          runScroll();
          requestAnimationFrame(runScroll);
        });
      });
    },
    maintainMobileEditSessionAfterDeferredBlur() {
      if (!this.isMobileDevice) {
        return;
      }
      this.armMobileEditFocusRestoreGrace();
      if (this.isMobileEditableInputFocused()) {
        this.mobileTableCellInputFocused = true;
        this.attachMobileTableVisualViewport();
        this.scheduleMobileEditStickyOverlapCheck?.();
      }
    },
    syncMobileTableCellFocusStateAfterFocusEvent() {
      if (!this.isMobileDevice) {
        return;
      }
      this.$nextTick(() => {
        if (this.mobileEditPendingSwitchCellKey) {
          return;
        }
        if (this.isMobileEditableInputFocused()) {
          this.mobileTableCellInputFocused = true;
          this.attachMobileTableVisualViewport();
          this.scheduleMobileEditStickyOverlapCheck?.();
          return;
        }
        this.endMobileEditSession({
          skipStoreFlush: true,
          blurInput: false,
          clearLastCellKey: false,
          layoutSettle: true,
        }).catch((err) => {
          logMobileEditError("endMobileEditSession.syncAfterFocusEvent", err);
        });
      });
    },
    async flushMobileEditCellInputToStore(cellKey) {
      const key = cellKey;
      if (!key || !this.isMobileDevice) {
        return;
      }
      const root = this.findCellRootByKey(key);
      if (!root) {
        return;
      }
      const input = root.querySelector("input[inputmode=\"decimal\"], input[inputmode=\"numeric\"], input");
      if (!input || input.nodeName !== "INPUT") {
        return;
      }
      const {
        cellType, id, date,
      } = parseCellKey(key);
      await this.syncEditableCellDraftFromInput(input, {
        cellType, id, date,
      }, { finalize: true });
    },
    async flushFocusedEditableCellInputToStore() {
      if (!this.isMobileDevice || typeof document === "undefined") {
        return;
      }
      const ae = document.activeElement;
      const root = ae?.closest?.("[data-cell-root]");
      if (ae?.nodeName !== "INPUT" || !root || !this.$el?.contains?.(root)) {
        return;
      }
      const key = root.getAttribute?.("data-cell-key");
      if (!key) {
        return;
      }
      await this.flushMobileEditCellInputToStore(key);
    },
    async flushPendingMobileEditableInputs() {
      if (!this.isMobileDevice) {
        return;
      }
      await this.flushFocusedEditableCellInputToStore();
      if (this.mobileLastFocusedEditableCellKey) {
        await this.flushMobileEditCellInputToStore(this.mobileLastFocusedEditableCellKey);
      }
    },
    async endMobileEditSession({
      skipStoreFlush = false,
      blurInput = false,
      clearLastCellKey = false,
      layoutSettle = true,
      suppressClick = true,
      notifyFooterSession = true,
    } = {}) {
      if (!this.isMobileDevice) {
        return;
      }
      const hadActiveMobileEdit = Boolean(this.mobileTableCellInputFocused);
      const hadPendingSwitch = Boolean(this.mobileEditPendingSwitchCellKey);
      resetPriceTextSelectGestureState(this);
      this.clearMobileEditLayoutSettleDelayedTimer();
      this.clearMobileKeyboardDismissConfirmTimer();
      this.clearMobileEditVkScrollRetryTimer();
      this.clearMobileEditVkScrollExtendedRetryTimer();
      this.mobileEditVkScrollExtendedRetryCellKey = "";
      this.clearMobileEditPointerDownCellKey();
      this.mobileEditSwitchInProgressCellKey = "";

      if (!skipStoreFlush) {
        await this.flushPendingMobileEditableInputs();
      }

      if (blurInput) {
        this.blurFocusedCellInput();
      }

      this.mobileEditVvIgnoreUntilMs = 0;
      this.resetMobileEditKeyboardGeometrySession();
      this.mobileTableCellInputFocused = false;
      this.disarmMobileEditFocusRestoreGrace();
      this.mobileEditFocusInSessionUntilMs = 0;
      this.mobileEditKeyboardStableOpen = false;
      this.mobileEditKeyboardStableOpenTicks = 0;
      this.mobileEditVkOverlaySession = false;
      this.mobileEditScrollTargetCellKey = "";
      this.mobileEditScrollGeneration = (this.mobileEditScrollGeneration + 1) | 0;
      this.detachMobileTableVisualViewport();
      this.mobileEditStickyOverlapsHeader = false;

      if (clearLastCellKey) {
        this.mobileLastFocusedEditableCellKey = "";
        this.cellRootDomCache.cellRootCacheKey = "";
        this.cellRootDomCache.cellRootCacheEl = null;
      }

      if (hadActiveMobileEdit) {
        if (suppressClick) {
          this.suppressTableClickUntilMs = Date.now() + MOBILE_EDIT_SUPPRESS_CLICK_MS;
        }
        if (layoutSettle && !hadPendingSwitch) {
          this.scheduleMobileEditLayoutSettle();
        }
      }
      if (notifyFooterSession && hadActiveMobileEdit) {
        this.$nextTick(() => {
          this.notifyMobileEditFooterSessionEnded();
        });
      }
    },
    async endMobileEditAfterKeyboardDismiss() {
      if (!this.isMobileDevice) {
        return;
      }
      const vkGeometryDismiss = Boolean(this.mobileEditVkGeometryDismissPending);
      const ae = typeof document !== "undefined" ? document.activeElement : null;
      const activeCellRoot = ae?.closest?.("[data-cell-root]");
      const shouldBlur = vkGeometryDismiss || shouldBlurActiveMobileInputOnKeyboardDismiss({
        activeElement: ae,
        activeCellRoot: this.$el?.contains?.(activeCellRoot) ? activeCellRoot : null,
        activeCellKey: this.mobileLastFocusedEditableCellKey,
        activeElementCellRoot: activeCellRoot,
      });
      this.mobileEditVkGeometryDismissPending = false;
      await this.endMobileEditSession({
        skipStoreFlush: false,
        blurInput: shouldBlur,
        clearLastCellKey: false,
        layoutSettle: true,
      });
    },
    clearMobileEdit({ skipStoreFlush = false } = {}) {
      this.endMobileEditSession({
        skipStoreFlush,
        blurInput: true,
        clearLastCellKey: true,
        layoutSettle: true,
      }).catch((err) => {
        logMobileEditError("clearMobileEdit", err);
      });
    },
    clearMobileKeyboardDismissConfirmTimer() {
      if (this.mobileKeyboardDismissConfirmTimer != null) {
        clearTimeout(this.mobileKeyboardDismissConfirmTimer);
        this.mobileKeyboardDismissConfirmTimer = null;
      }
    },
    scheduleMobileKeyboardDismissConfirm({ vkGeometryClosed = false } = {}) {
      if (this.shouldBlockMobileKeyboardDismiss()) {
        return;
      }
      if (vkGeometryClosed) {
        this.mobileEditVkGeometryDismissPending = true;
      }
      this.clearMobileKeyboardDismissConfirmTimer();
      const prevLikelyOpenAtSchedule = this.mobileKeyboardDismissPrevLikelyOpen;
      const prevIntrusionAtSchedule = this.mobileKeyboardDismissPrevIntrusionPx;
      const vkGeometryClosedAtSchedule = Boolean(
        vkGeometryClosed || this.mobileEditVkGeometryDismissPending,
      );
      this.mobileKeyboardDismissConfirmTimer = setTimeout(() => {
        this.mobileKeyboardDismissConfirmTimer = null;
        if (!this.isMobileDevice || typeof window === "undefined") {
          return;
        }
        const vv = window.visualViewport;
        const innerH = window.innerHeight;
        const nav = typeof navigator !== "undefined" ? navigator : null;
        const vkOpen = isVirtualKeyboardApiAvailable(nav) && this.mobileEditVkGeometryHandler
          ? Boolean(this.mobileEditVkGeometryOpen)
          : false;
        const next = isMobileKeyboardLikelyOpen({
          visualViewport: vv,
          windowInnerHeight: innerH,
          virtualKeyboardOpen: vkOpen,
        });
        const nextIntrusionPx = getKeyboardIntrusionPx(vv, innerH);
        const vkOpenNow = isVirtualKeyboardApiAvailable(nav) && this.mobileEditVkGeometryHandler
          ? Boolean(this.mobileEditVkGeometryOpen)
          : false;
        const shouldDismiss = shouldApplyKeyboardDismissOnConfirm({
          hasMobileEditCell: Boolean(this.mobileTableCellInputFocused),
          isMobileDevice: this.isMobileDevice,
          prevLikelyOpen: prevLikelyOpenAtSchedule,
          nextLikelyOpen: next,
          isSuppressed: false,
          isScrollSessionPending: false,
          vvHeight: vv?.height ?? NaN,
          windowInnerHeight: innerH,
          sessionVvMinHeight: this.mobileEditVvSessionMinHeight,
          activeCellInputFocused: this.isMobileEditableInputFocused(),
          prevIntrusionPx: prevIntrusionAtSchedule,
          nextIntrusionPx,
          intrusionThresholdPx: MOBILE_KEYBOARD_INTRUSION_OPEN_PX,
          sawKeyboardIntrusion: this.mobileEditVvSawKeyboardIntrusion,
          focusInSessionActive: this.shouldBlockMobileKeyboardDismiss(),
          vkOverlaySessionActive: Boolean(this.mobileEditVkOverlaySession),
          keyboardStableOpen: Boolean(this.mobileEditKeyboardStableOpen),
          vkGeometryClosed: vkGeometryClosedAtSchedule,
          prevVkGeometryOpen: vkGeometryClosedAtSchedule,
          nextVkGeometryOpen: vkOpenNow,
        });
        if (shouldDismiss) {
          this.endMobileEditAfterKeyboardDismiss().catch((err) => {
            logMobileEditError("endMobileEditAfterKeyboardDismiss", err);
          });
          return;
        }
        this.mobileEditVkGeometryDismissPending = false;
        this.mobileKeyboardDismissPrevLikelyOpen = next;
        this.mobileKeyboardDismissPrevIntrusionPx = nextIntrusionPx;
      }, MOBILE_KEYBOARD_DISMISS_CONFIRM_MS);
    },
    /**
     * Если blur приходит раньше событий VV, guard выше отключает этот обработчик — финализация тогда через
     * `syncMobileTableCellFocusStateAfterFocusEvent` (сброс vv-сессии, suppress click).
     */
    handleMobileKeyboardVisualViewportChange() {
      if (!this.isMobileDevice || !this.mobileTableCellInputFocused || typeof window === "undefined") {
        return;
      }
      const inCooldown = Date.now() < (this.mobileEditVvIgnoreUntilMs || 0);
      const vv = window.visualViewport;
      if (!vv) {
        return;
      }
      const innerH = window.innerHeight;
      const vvH = vv.height;
      const intrusionPx = getKeyboardIntrusionPx(vv, innerH);
      const nav = typeof navigator !== "undefined" ? navigator : null;
      const vkOpen = isVirtualKeyboardApiAvailable(nav) && this.mobileEditVkGeometryHandler
        ? Boolean(this.mobileEditVkGeometryOpen)
        : false;
      const next = isMobileKeyboardLikelyOpen({
        visualViewport: vv,
        windowInnerHeight: innerH,
        virtualKeyboardOpen: vkOpen,
      });
      this.updateMobileEditKeyboardStableOpenState({
        keyboardLikelyOpen: next,
        vkOpen,
        intrusionPx,
      });
      if (inCooldown) {
        this.mobileKeyboardDismissPrevLikelyOpen = next;
        this.mobileKeyboardDismissPrevIntrusionPx = intrusionPx;
        return;
      }
      if (this.mobileEditVvSessionMinHeight == null) {
        this.mobileEditVvSessionMinHeight = vvH;
      } else {
        this.mobileEditVvSessionMinHeight = Math.min(this.mobileEditVvSessionMinHeight, vvH);
      }
      this.mobileEditVvSessionMaxIntrusion = Math.max(
        this.mobileEditVvSessionMaxIntrusion ?? 0,
        intrusionPx,
      );
      if (intrusionPx > MOBILE_KEYBOARD_INTRUSION_OPEN_PX || next) {
        this.mobileEditVvSawKeyboardIntrusion = true;
        this.mobileEditVvSawKeyboardOpen = true;
      }

      const probe = probeMobileKeyboardDismissFromViewportChange({
        nextLikelyOpen: next,
        prevLikelyOpen: this.mobileKeyboardDismissPrevLikelyOpen,
        prevIntrusionPx: this.mobileKeyboardDismissPrevIntrusionPx ?? 0,
        intrusionPx,
        vvHeight: vvH,
        innerH,
        sessionVvMinHeight: this.mobileEditVvSessionMinHeight,
        mobileEditVvSawKeyboardOpen: this.mobileEditVvSawKeyboardOpen,
        mobileEditVvSawKeyboardIntrusion: this.mobileEditVvSawKeyboardIntrusion,
        mobileEditVvSessionMaxIntrusion: this.mobileEditVvSessionMaxIntrusion ?? 0,
        mobileEditGrowthClosedTicks: this.mobileEditGrowthClosedTicks,
        hasOpenSheets: Boolean(this.booleanRestrictionSheet || this.dependentRestrictionReadonlySheet),
        shouldBlockDismiss: this.shouldBlockMobileKeyboardDismiss(),
        vkGeometryJustClosed: Boolean(this.mobileEditVkGeometryDismissPending),
      });

      this.mobileEditGrowthClosedTicks = probe.growthClosedTicks;
      if (probe.clearDismissTimer) {
        this.clearMobileKeyboardDismissConfirmTimer();
      }
      if (probe.scheduleDismissConfirm) {
        this.scheduleMobileKeyboardDismissConfirm();
      } else if (!didKeyboardLikelyClose(this.mobileKeyboardDismissPrevLikelyOpen, next)) {
        this.mobileKeyboardDismissPrevLikelyOpen = probe.nextPrevLikelyOpen;
        this.mobileKeyboardDismissPrevIntrusionPx = probe.nextPrevIntrusionPx;
      }
    },
  },
};
