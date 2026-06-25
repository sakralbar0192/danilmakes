import { mapState } from "vuex";
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { formatAmount,
  applyThousandsSeparatorBackspace,
  amountCursorFormattedIndex,
  countPriceDigitsStateBeforeCursor } from "../../../config/format-amount.js";
import { restrictionTypes } from "../../../config/screen-config.js";
import { closedStatusDataAttrName,
  RESTRICTION_SHEET_OUTSIDE_DISMISS_SUPPRESS_MS } from "../config/table-grid-metrics.js";
import { resolveRestrictionSheetOutsideDismiss } from "../lib/editing/restriction-sheet-outside-dismiss.js";
import { validateRestrictionValue } from "../utils/validate-restriction-value.js";
import { cellTypes } from "../config/cell-types.js";
import { buildCellKey, isPriceCellType, isEditableCellType } from "../lib/cell-identity.js";
import { runHandleTableCellAction } from "../logic/handle-table-cell-action.js";
import { buildEventTargetPayload } from "../utils/cell-event-target.js";
import { resolvePriceDraftFromInput,
  finalizePriceDraftFromInput,
  isPriceDraftEqualToSaved } from "../../../config/resolve-price-draft-from-input.js";
import { resolveAvailabilityDraftFromInput,
  finalizeAvailabilityDraftFromInput,
  isAvailabilityDraftEqualToSaved } from "../../../config/resolve-availability-draft-from-input.js";
import { readInputSelectionRange,
  resolvePriceInputFromFocusOutTarget,
  shouldDeferPriceCellBlurOnFocusOut } from "../lib/editing/price-text-selection-gesture.js";
import { isMobileEditCellSwitch,
  resolveMobileEditFocusOutAfterDeferredCheck,
  resolveSameCellActionAnchor } from "../lib/editing/mobile-edit-session.js";
import { logMobileEditError } from "../lib/editing/log-mobile-edit-error.js";
import { shouldOpenDependentRestrictionReadonlyOnMobileFocus } from "../lib/editing/dependent-restriction-readonly-focus.js";
import { restoreDesktopPriceInputFocusAfterDraftSync } from "../lib/editing/restore-desktop-price-input-focus-after-draft-sync.js";
import { isPriceCellMarkedForDelete,
  shouldSkipPriceDraftSyncForDeleteMark } from "../../../lib/screen/resolve-price-draft-sync-for-delete-mark.js";
import { resolveExtraChargeCategoryDefaultForPriceId } from "../../../lib/tariff/resolve-extra-charge-category-default.js";
import { resolveOtherTariffsTooltipAnchorAfterPriceCellClick,
  captureOtherTariffsTooltipPointerDownState } from "../lib/editing/resolve-other-tariffs-tooltip-anchor-after-price-cell-click.js";
import { resolveOtherTariffsTooltipAnchorAfterFocusOut } from "../lib/editing/resolve-other-tariffs-tooltip-open-state.js";
import { resolveEffectiveBooleanRestrictionValue } from "../lib/editing/resolve-effective-boolean-restriction-value.js";

/** На мобилке Backspace часто не даёт стабильного `keydown`; удаление идёт через `beforeinput`. */
const MOBILE_BACKSPACE_USES_BEFORE_INPUT = typeof window !== "undefined"
  && typeof InputEvent !== "undefined"
  && typeof InputEvent.prototype === "object"
  && "inputType" in InputEvent.prototype;

/**
 * События ячеек: клик, input, focus/blur, синхронизация черновиков с Vuex, boolean sheets, tooltip по цене (десктоп).
 * Зависит от методов мобильного миксина (`clearMobileEdit`, …).
 */
export default {
  data() {
    return {
      tooltipAnchorCellKey: null,
      tooltipAnchorClearTimer: null,
      otherTariffsTooltipPointerDownCellKey: "",
      otherTariffsTooltipPriceInputWasFocusedBeforePointerDown: false,
      resetApprovalInfo: {
        callback: null,
        id: "",
        day: {
          date: "",
          weekday: "",
        },
        approvalKind: "",
      },
      booleanRestrictionSheet: null,
      compactBooleanRestrictionDropdown: null,
      dependentRestrictionReadonlySheet: null,
      /** Не закрывать restriction sheets по window click сразу после open (ложный scrim-click). */
      suppressRestrictionSheetOutsideDismissUntilMs: 0,
      /** Хвост Promise по `cellKey`: синк черновика цены в store не параллелим на одной ячейке. */
      priceDraftSyncTailByCellKey: Object.create(null),
    };
  },
  computed: { ...mapState("hotel", ["rplansByIds"]) },
  beforeDestroy() {
    if (this.tooltipAnchorClearTimer) {
      clearTimeout(this.tooltipAnchorClearTimer);
      this.tooltipAnchorClearTimer = null;
    }
  },
  methods: {
    rememberOtherTariffsTooltipPointerDownState(e) {
      if (this.isMobileDevice) {
        return;
      }
      const snapshot = captureOtherTariffsTooltipPointerDownState(e, this.$el);
      this.otherTariffsTooltipPointerDownCellKey = snapshot.cellKey;
      this.otherTariffsTooltipPriceInputWasFocusedBeforePointerDown = snapshot.priceInputWasFocused;
    },
    getEventTargetPayload(target, event = null) {
      return buildEventTargetPayload(target, event);
    },
    getEventPayload(event) {
      return {
        target: this.getEventTargetPayload(event?.target, event),
        relatedTarget: this.getEventTargetPayload(event?.relatedTarget),
      };
    },
    async handleTableClick(e) {
      if (this.tableInteractionDisabled) {
        return;
      }
      const isActionClick = Boolean(e?.target?.closest?.("[data-action]"));
      if (this.isMobileDevice && Date.now() < this.suppressTableClickUntilMs && !isActionClick) {
        return;
      }

      if (e?.target?.closest?.("[data-dependent-restriction-readonly-sheet-root]")) {
        return;
      }
      const { target: payload } = this.getEventPayload(e);
      const {
        data: {
          id: cellId,
          date: cellDate,
          action,
          cellType,
          closed,
        },
      } = payload;

      if (
        action === closedStatusDataAttrName
        && !Number(this.currentTariff?.dependent_restrictions?.[this.$options.closedRestrictionName])
      ) {
        await this.handleClosedStatusClick(cellId, cellDate, closed);
      } else if (action) {
        await this.handleCellAction(payload);
      } else if (cellType) {
        if (cellType === cellTypes.restriction) await this.handleRestrictionCellClick(e, payload);
        if (isPriceCellType(cellType)) await this.handlePriceCellClick(e, payload);
      }
    },
    async handleClosedStatusClick(roomtypeId, date, closedValue) {
      await this.$store.dispatch("tariffPricesAndRestrictions/setUpdatingRestrictions", {
        type: this.$options.closedRestrictionName,
        roomtypeId,
        day: date,
        value: Number(closedValue) ? 0 : 1,
      });
    },
    async handlePriceCellClick(event, payload) {
      const cellRoot = payload.cellRoot || payload.target;
      const raw = event?.target;
      const isInputClick = raw?.nodeName === "INPUT"
        && cellRoot?.nodeType === 1
        && typeof cellRoot.contains === "function"
        && cellRoot.contains(raw);

      if (this.isMobileDevice && cellRoot) {
        this.focusEditableCellInput?.(cellRoot);
      }

      const cellKey = cellRoot?.getAttribute?.("data-cell-key") || "";
      const nextTooltipAnchorCellKey = resolveOtherTariffsTooltipAnchorAfterPriceCellClick({
        tooltipAnchorCellKey: this.tooltipAnchorCellKey,
        cellKey,
        isInputClick,
        priceInputWasFocusedBeforePointerDown: this.otherTariffsTooltipPriceInputWasFocusedBeforePointerDown,
        pointerDownCellKey: this.otherTariffsTooltipPointerDownCellKey,
      });
      if (nextTooltipAnchorCellKey !== this.tooltipAnchorCellKey) {
        this.tooltipAnchorCellKey = nextTooltipAnchorCellKey;
      }
    },
    async handleCellAction(payload) {
      await runHandleTableCellAction({
        payload,
        dispatch: (type, p) => this.$store.dispatch(type, p),
        nextTick: () => this.$nextTick(),
        pricesCalendarModel: this.pricesCalendarModel,
        isMobileDevice: this.isMobileDevice,
        runOrDeferMobileApproval: async ({
          callback, id, date, weekday, approvalKind,
        }) => {
          if (this.isMobileDevice) {
            await this.flushFocusedEditableCellInputToStore();
            this.resetApprovalInfo = {};
            await this.$nextTick();
            this.resetApprovalInfo = {
              callback,
              id,
              day: { date, weekday },
              approvalKind,
            };
          } else {
            callback();
          }
        },
        openBooleanRestrictionSheet: (args) => this.openBooleanRestrictionSheet(args),
        toggleClosedArrivalDeparture: (...a) => this.toggleClosedArrivalDeparture(...a),
        getEffectiveBooleanRestrictionValue: (...a) => this.getEffectiveBooleanRestrictionValue(...a),
      });
    },
    /**
     * Один поток на ячейку: несколько `input` подряд не должны параллельно вызывать dispatch
     * (в паре с commit до await в store иначе возможны гонки восстановления каретки).
     */
    runPriceDraftSyncSerialized(cellKey, task) {
      const m = this.priceDraftSyncTailByCellKey;
      const prev = m[cellKey] || Promise.resolve();
      const next = prev.then(() => task()).catch((err) => {
        logMobileEditError("priceDraftSync", err, { cellKey });
      });
      m[cellKey] = next;
      return next;
    },
    /**
     * После commit в Vuex контролируемый `:value` инпута перезаписывается — каретка часто оказывается в конце.
     * Восстанавливаем позицию по числу целых/дробных цифр до курсора (как в formatAmount).
     */
    async restorePriceInputCaretAfterVuexSync(target, digitStateStart, digitStateEnd, collapsed) {
      await this.$nextTick();
      restoreDesktopPriceInputFocusAfterDraftSync(target, { isMobileDevice: this.isMobileDevice });
      const ae = typeof document !== "undefined" ? document.activeElement : null;
      if (ae !== target || typeof target.setSelectionRange !== "function") {
        return;
      }
      const nv = `${target.value ?? ""}`;
      const newStart = amountCursorFormattedIndex(nv, digitStateStart);
      const newEnd = collapsed
        ? newStart
        : amountCursorFormattedIndex(nv, digitStateEnd);
      try {
        target.setSelectionRange(newStart, newEnd);
      } catch (e) {
        if (typeof document !== "undefined" && target?.isConnected) {
          logMobileEditError("restorePriceInputCaret", e, {
            newStart,
            newEnd,
            valueLength: nv.length,
          });
        }
      }
    },
    async syncEditableCellDraftFromInput(target, data = {}, { finalize = false } = {}) {
      if (this.tableInteractionDisabled) {
        return;
      }
      const cellType = data.cellType;
      const id = data.id;
      const date = data.date;
      if (!target || target.nodeName !== "INPUT" || !isEditableCellType(cellType)) {
        return;
      }

      if (isPriceCellType(cellType)) {
        formatAmount(target);
        if (!id) {
          return;
        }
        const cellKey = buildCellKey({
          cellType, id, date,
        });
        await this.runPriceDraftSyncSerialized(cellKey, async () => {
          formatAmount(target);
          const v = `${target.value ?? ""}`;
          const posStart = typeof target.selectionStart === "number" ? target.selectionStart : v.length;
          const posEnd = typeof target.selectionEnd === "number" ? target.selectionEnd : posStart;
          const digitStateStart = countPriceDigitsStateBeforeCursor(v, posStart);
          const digitStateEnd = posStart === posEnd
            ? digitStateStart
            : countPriceDigitsStateBeforeCursor(v, posEnd);

          const draftValue = finalize
            ? finalizePriceDraftFromInput(target.value)
            : resolvePriceDraftFromInput(target.value);

          const extraChargeCategoryDefault = resolveExtraChargeCategoryDefaultForPriceId(
            this.$store.state.hotelRoom?.roomtypes ?? [],
            id,
          );

          const fetchedPrice = this.pricesCalendarModel.getPrice({
            id,
            tariffId: this.currentTariff.id,
            day: this.findCalendarDay(date),
            isDynamicPricesModeEnabled: this.isDynamicPricesModeEnabled,
            parentInfo: {
              id: Number(this.currentTariff?.parent_id),
              modification: this.parentPriceModification,
              parentUsesRmsPricing: this.parentUsesRmsPricing,
            },
            extraChargeCategoryDefault,
          });
          const savedPrice = fetchedPrice?.value;
          const isMarkedForDelete = isPriceCellMarkedForDelete(
            this.$store.state.tariffPricesAndRestrictions?.pricesToDelete,
            id,
            date,
          );

          if (shouldSkipPriceDraftSyncForDeleteMark({
            isMarkedForDelete,
            draftValue,
            resetBaseline: fetchedPrice?.originalValue,
          })) {
            return;
          }

          if (isPriceDraftEqualToSaved(draftValue, savedPrice)) {
            await this.$store.dispatch("tariffPricesAndRestrictions/unsetUpdatingPrice", {
              id,
              day: date,
            });
          } else {
            await this.$store.dispatch("tariffPricesAndRestrictions/setUpdatingPrices", {
              value: draftValue,
              id,
              day: date,
            });
          }
          if (!finalize) {
            restoreDesktopPriceInputFocusAfterDraftSync(target, { isMobileDevice: this.isMobileDevice });
            await this.restorePriceInputCaretAfterVuexSync(
              target,
              digitStateStart,
              digitStateEnd,
              posStart === posEnd,
            );
            if (!this.isMobileDevice && typeof this.recomputeScrollContainerFitPreservingDesktopPriceInput === "function") {
              this.recomputeScrollContainerFitPreservingDesktopPriceInput(target);
            }
          } else if (!this.isMobileDevice && typeof this.recomputeScrollContainerFit === "function") {
            this.$nextTick(() => this.recomputeScrollContainerFit());
          }
        });
        return;
      }

      if (cellType === cellTypes.restriction) {
        const formattedTarget = { value: `${target.value ?? ""}` };
        validateRestrictionValue(formattedTarget);
        target.value = formattedTarget.value;

        const [roomtypeId = "", type = ""] = (id || "").split("_");
        if (!roomtypeId || !type) {
          return;
        }

        await this.$store.dispatch("tariffPricesAndRestrictions/setUpdatingRestrictions", {
          type,
          roomtypeId,
          day: date,
          value: target.value || "",
        });
        return;
      }

      if (cellType === cellTypes.availability) {
        const roomtypeId = id;
        if (!roomtypeId || !date) {
          return;
        }
        const cellKey = data.cellKey || `avail:${roomtypeId}|${date}`;
        await this.runPriceDraftSyncSerialized(cellKey, async () => {
          const draftRaw = finalize
            ? finalizeAvailabilityDraftFromInput(target.value)
            : resolveAvailabilityDraftFromInput(target.value);
          target.value = draftRaw;

          const savedAvailability = this.pricesCalendarModel.getAvailability(roomtypeId, date);

          if (isAvailabilityDraftEqualToSaved(draftRaw, savedAvailability)) {
            await this.$store.dispatch("tariffPricesAndRestrictions/unsetUpdatingAvailability", {
              roomtypeId,
              day: date,
            });
          } else {
            await this.$store.dispatch("tariffPricesAndRestrictions/setUpdatingAvailability", {
              roomtypeId,
              day: date,
              value: draftRaw,
            });
          }
        });
      }
    },
    async approveResetPrice() {
      if (this.resetApprovalInfo.callback instanceof Function) {
        this.resetApprovalInfo.callback();
      }
      this.resetApprovalInfo = {
        callback: null,
        id: "",
        day: {
          date: "",
          weekday: "",
        },
        approvalKind: "",
      };
      await this.$nextTick();
    },
    dismissResetApproval() {
      this.resetApprovalInfo = {
        callback: null,
        id: "",
        day: {
          date: "",
          weekday: "",
        },
        approvalKind: "",
      };
    },
    async finalizeCellDraftFromCellRoot(fromCellRoot, focusEvent) {
      const fromInput = fromCellRoot?.querySelector?.("input[inputmode=\"decimal\"]")
        || fromCellRoot?.querySelector?.("input[inputmode=\"numeric\"]")
        || fromCellRoot?.querySelector?.("input");
      if (fromInput?.nodeName !== "INPUT") {
        return;
      }
      const fromPayload = this.getEventTargetPayload(fromInput, focusEvent);
      await this.syncEditableCellDraftFromInput(fromInput, fromPayload.data, { finalize: true });
    },
    /**
     * Blur input → action-кнопка в той же ячейке (reset): сохранить черновик, открыть approval,
     * не завершать edit-сессию (иначе suppressClick блокирует click на Android Chrome).
     */
    async handleMobileBlurToSameCellAction(fromCellRoot, focusEvent, actionAnchor) {
      await this.finalizeCellDraftFromCellRoot(fromCellRoot, focusEvent);
      if (!actionAnchor?.dataset?.action) {
        return;
      }
      const payload = this.getEventTargetPayload(actionAnchor);
      await this.handleCellAction(payload);
    },
    resolveMobileSameCellActionAnchor(fromCellRoot, relatedTarget) {
      const coords = this.mobileEditPointerDownCoords;
      return resolveSameCellActionAnchor({
        fromCellRoot,
        relatedTarget,
        pointerDownClientX: coords?.clientX,
        pointerDownClientY: coords?.clientY,
      });
    },
    /** Blur ячейки: finalize в store, затем снятие mobile-edit (порядок важен для футера). */
    async completeEditableCellBlurSession(e) {
      await this.handleCellBlur(e);
      this.syncMobileTableCellFocusStateAfterFocusEvent();
      if (!this.isMobileDevice) {
        this.runDeferredVirtualizerRefreshIfNeeded?.();
      }
    },
    handleRootFocusOut(e) {
      if (!this.isMobileDevice) {
        this.handleTableFocusOut(e);
      }
      const relatedTarget = e.relatedTarget;
      const fromCellRoot = e.target?.closest?.("[data-cell-root]");
      const toCellRoot = relatedTarget?.closest?.("[data-cell-root]");
      const toCellPopover = relatedTarget?.closest?.(
        "[data-price-cell-tooltip-root]",
      );
      if (fromCellRoot && toCellRoot && !toCellPopover) {
        if (
          this.isMobileDevice
          && isMobileEditCellSwitch({
            fromCellRoot, toCellRoot, tableEl: this.$el,
          })
        ) {
          this.switchMobileEditToCell({
            fromCellRoot, toCellRoot, focusEvent: e,
          }).catch((err) => {
            logMobileEditError("switchMobileEditToCell", err, {
              fromCellKey: fromCellRoot?.getAttribute?.("data-cell-key") || "",
              toCellKey: toCellRoot?.getAttribute?.("data-cell-key") || "",
            });
          });
          return;
        }
        if (this.isMobileDevice && fromCellRoot === toCellRoot) {
          const actionAnchor = this.resolveMobileSameCellActionAnchor(fromCellRoot, relatedTarget);
          if (actionAnchor) {
            this.handleMobileBlurToSameCellAction(fromCellRoot, e, actionAnchor).catch((err) => {
              logMobileEditError("handleMobileBlurToSameCellAction", err, {
                fromCellKey: fromCellRoot?.getAttribute?.("data-cell-key") || "",
                action: actionAnchor?.dataset?.action || "",
              });
            });
            return;
          }
        }
        this.finalizeCellDraftFromCellRoot(fromCellRoot, e)
          .then(() => this.syncMobileTableCellFocusStateAfterFocusEvent())
          .catch((err) => {
            logMobileEditError("finalizeCellDraftFromCellRoot", err, { fromCellKey: fromCellRoot?.getAttribute?.("data-cell-key") || "" });
            this.syncMobileTableCellFocusStateAfterFocusEvent();
          });
        return;
      }
      if (shouldDeferPriceCellBlurOnFocusOut({
        gestureInput: this.priceTextSelectGestureInput,
        fromCellRoot,
        eventTarget: e.target,
      })) {
        const blurInput = resolvePriceInputFromFocusOutTarget(e.target, fromCellRoot);
        this.rememberPriceTextSelectSelection(blurInput);
        this.deferredPriceCellBlurEvent = e;
        this.deferredPriceCellBlurSelection = this.priceTextSelectLastNonCollapsedSelection
          || readInputSelectionRange(blurInput);
        return;
      }
      // Safari / встроенные WebView часто дают relatedTarget === null при переходе между инпутами.
      if (
        this.isMobileDevice
        && fromCellRoot
        && !toCellPopover
        && (!relatedTarget || !toCellRoot)
        && typeof requestAnimationFrame === "function"
      ) {
        // Snapshot полей события до 2× rAF: к моменту срабатывания event object и связанные с ним
        // элементы могут быть отсоединены virtualizer-ом / следующим focusin. Передаём минимально
        // необходимое (target, fromCellKey) явно вместо ссылки на `e`.
        const focusOutTargetSnapshot = e.target;
        const fromCellKeySnapshot = fromCellRoot.getAttribute?.("data-cell-key") || "";
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const ae = typeof document !== "undefined" ? document.activeElement : null;
            const decision = resolveMobileEditFocusOutAfterDeferredCheck({
              fromCellRoot,
              nextActiveElement: ae,
              tableContains: (el) => Boolean(this.$el?.contains?.(el)),
              pointerDownCellKey: this.mobileEditPointerDownCellKey || "",
              fromCellKey: fromCellKeySnapshot,
              shouldDeferBlurSession: Boolean(this.shouldDeferMobileEditableCellBlurSession?.()),
              lookupCellRoot: (key) => this.findCellRootByKey?.(key) || null,
            });
            // focusEvent передаём только если оригинальный target ещё подключён к DOM,
            // чтобы downstream-логика не работала со «зомби»-нодами.
            const focusEvent = focusOutTargetSnapshot?.isConnected ? e : null;
            if (decision.action === "switch") {
              this.switchMobileEditToCell({
                fromCellRoot,
                toCellRoot: decision.toCellRoot,
                focusEvent,
              }).catch((err) => {
                logMobileEditError("switchMobileEditToCell.deferred", err, {
                  fromCellKey: fromCellKeySnapshot,
                  toCellKey: decision.toCellRoot?.getAttribute?.("data-cell-key") || "",
                });
              });
              return;
            }
            if (decision.action === "switchByKey") {
              const switchArgs = {
                fromCellRoot,
                toCellKey: decision.cellKey,
                focusEvent,
              };
              const attemptSwitch = () => this.switchMobileEditToCellByKey(switchArgs);
              attemptSwitch().then(async (switched) => {
                if (switched) {
                  return;
                }
                await this.$nextTick();
                const retrySwitched = await attemptSwitch();
                if (!retrySwitched) {
                  this.maintainMobileEditSessionAfterDeferredBlur?.();
                }
              }).catch((err) => {
                logMobileEditError("switchMobileEditToCellByKey", err, {
                  fromCellKey: fromCellKeySnapshot,
                  toCellKey: decision.cellKey || "",
                });
              });
              return;
            }
            if (decision.action === "defer") {
              this.maintainMobileEditSessionAfterDeferredBlur?.();
              return;
            }
            if (this.mobileEditPendingSwitchCellKey) {
              this.maintainMobileEditSessionAfterDeferredBlur?.();
              return;
            }
            const deferredActionAnchor = this.resolveMobileSameCellActionAnchor(
              fromCellRoot,
              ae,
            );
            if (deferredActionAnchor) {
              this.handleMobileBlurToSameCellAction(
                fromCellRoot,
                focusEvent,
                deferredActionAnchor,
              ).catch((err) => {
                logMobileEditError("handleMobileBlurToSameCellAction.deferred", err, { fromCellKey: fromCellKeySnapshot });
              });
              return;
            }
            this.completeEditableCellBlurSession(focusEvent || e).catch((err) => {
              logMobileEditError("completeEditableCellBlurSession.deferred", err, { fromCellKey: fromCellKeySnapshot });
            });
          });
        });
        return;
      }
      this.completeEditableCellBlurSession(e).catch((err) => {
        logMobileEditError("completeEditableCellBlurSession", err);
      });
    },
    handleTableFocusIn(e) {
      if (this.isMobileDevice) {
        const t = e.target;
        if (
          t?.nodeName === "INPUT"
          && t.closest?.("[data-cell-root]")
          && this.$el?.contains?.(t)
        ) {
          const cellRoot = t.closest?.("[data-cell-root]");
          const restrictionType = shouldOpenDependentRestrictionReadonlyOnMobileFocus({
            cellType: cellRoot?.dataset?.cellType || "",
            dataId: cellRoot?.dataset?.id || "",
            dependentRestrictions: this.currentTariff?.dependent_restrictions,
          });
          if (restrictionType) {
            this.openDependentRestrictionReadonlySheet({ restrictionType });
            return;
          }
          const focusedCellKey = cellRoot?.getAttribute?.("data-cell-key") || "";
          this.startMobileEditSession(focusedCellKey, { skipIfActiveCell: true });
        }
        return;
      }
      if (this.tooltipAnchorClearTimer) {
        clearTimeout(this.tooltipAnchorClearTimer);
        this.tooltipAnchorClearTimer = null;
      }
      const root = e.target?.closest?.("[data-cell-root]");
      if (!root) return;
      const ct = root.dataset?.cellType;
      if (ct === cellTypes.restriction || ct === cellTypes.availability) {
        this.priceCellTooltipController?.hide?.();
        this.tooltipAnchorCellKey = null;
        return;
      }
      if (ct !== cellTypes.price && ct !== cellTypes.extraPrice) return;
      if (e.target?.closest?.("[data-price-reset-anchor]")) {
        const rootCellKey = root.getAttribute("data-cell-key") || "";
        if (this.tooltipAnchorCellKey === rootCellKey) {
          this.tooltipAnchorCellKey = null;
        }
        return;
      }
      if (e.target?.nodeName !== "INPUT" || !root.contains(e.target)) {
        return;
      }
      this.tooltipAnchorCellKey = root.getAttribute("data-cell-key") || null;
    },
    handleTableFocusOut(e) {
      const root = e.target?.closest?.("[data-cell-root]");
      if (!root) return;
      const ct = root.dataset?.cellType;
      if (ct !== cellTypes.price && ct !== cellTypes.extraPrice) return;
      const rootCellKey = root.getAttribute("data-cell-key") || "";
      this.tooltipAnchorClearTimer = setTimeout(() => {
        this.tooltipAnchorClearTimer = null;
        const ae = document.activeElement;
        if (ae && root.contains(ae)) return;
        this.tooltipAnchorCellKey = resolveOtherTariffsTooltipAnchorAfterFocusOut({
          activeElement: ae,
          rootCellKey,
          tooltipAnchorCellKey: this.tooltipAnchorCellKey,
        });
      }, 0);
    },
    async handleRestrictionCellClick(event, payload) {
      this.tooltipAnchorCellKey = null;
      if (this.suppressRestrictionCellClickOnce) {
        this.suppressRestrictionCellClickOnce = false;
        return;
      }
      const target = payload.cellRoot || payload.target;
      const {
        data: {
          id,
          date,
        },
      } = payload;
      const [roomtypeId, restrictionType] = (id || "").split("_");
      const key = PriceAndRestrictionsService.getServerRestrictionTypeName(restrictionType);

      const cellKey = buildCellKey({
        cellType: cellTypes.restriction,
        id,
        date,
      });

      const isRestrictionDisabled = Number(this.currentTariff?.dependent_restrictions?.[key]);

      const isBooleanRestriction = restrictionType === PriceAndRestrictionsService.closedArrivalRestrictionName
        || restrictionType === PriceAndRestrictionsService.closedDepartureRestrictionName;

      if (this.isMobileDevice && isRestrictionDisabled && restrictionType) {
        this.openDependentRestrictionReadonlySheet({ restrictionType });
        return;
      }

      if (!isRestrictionDisabled && restrictionType && !isBooleanRestriction) {
        await this.$nextTick();
        target?.querySelector?.("input[inputmode=\"numeric\"]")?.focus?.();
      } else if (!isRestrictionDisabled && roomtypeId && isBooleanRestriction) {
        const effectiveValue = this.getEffectiveBooleanRestrictionValue(roomtypeId, restrictionType, date);
        if (this.isMobileDevice) {
          this.openBooleanRestrictionSheet({
            cellKey,
            roomtypeId,
            restrictionType,
            date,
            restrictionValue: effectiveValue,
          });
        } else if (Object.prototype.hasOwnProperty.call(payload.data || {}, "compactBooleanDropdown")) {
          const openDropdownFromMouseClick = Boolean(
            event && event.type === "click" && event.detail >= 1,
          );
          if (openDropdownFromMouseClick) {
            this.armRestrictionSheetOutsideDismissSuppress();
            this.openCompactBooleanRestrictionDropdown({
              anchorEl: payload.cellRoot || payload.target,
              cellKey,
              roomtypeId,
              restrictionType,
              date,
              restrictionValue: effectiveValue,
            });
          } else {
            await this.toggleClosedArrivalDeparture(roomtypeId, restrictionType, date);
          }
        } else {
          await this.toggleClosedArrivalDeparture(roomtypeId, restrictionType, date);
        }
      }
    },
    getEffectiveBooleanRestrictionValue(roomtypeId, restrictionType, date) {
      return resolveEffectiveBooleanRestrictionValue({
        pricesCalendarModel: this.pricesCalendarModel,
        updatedRestrictions: this.$store.state.tariffPricesAndRestrictions?.updatedRestrictions,
        roomtypeId,
        restrictionType,
        date,
      });
    },
    applyRestrictionBooleanValue(roomtypeId, restrictionType, date, value) {
      return this.$store.dispatch("tariffPricesAndRestrictions/setUpdatingRestrictions", {
        type: restrictionType,
        roomtypeId,
        day: date,
        value,
      });
    },
    armRestrictionSheetOutsideDismissSuppress() {
      this.suppressRestrictionSheetOutsideDismissUntilMs = Date.now()
        + RESTRICTION_SHEET_OUTSIDE_DISMISS_SUPPRESS_MS;
    },
    openBooleanRestrictionSheet({
      cellKey,
      roomtypeId,
      restrictionType,
      date,
      restrictionValue,
    }) {
      if (this.mobileTableCellInputFocused || this.mobileEditPendingSwitchCellKey) {
        this.clearMobileEdit();
      }
      this.dependentRestrictionReadonlySheet = null;
      const sheet = {
        cellKey,
        roomtypeId,
        restrictionType,
        date,
        selectedValue: Number(restrictionValue) ? 1 : 0,
      };
      this.armRestrictionSheetOutsideDismissSuppress();
      this.booleanRestrictionSheet = sheet;
    },
    closeBooleanRestrictionSheet() {
      this.booleanRestrictionSheet = null;
    },
    openCompactBooleanRestrictionDropdown({
      anchorEl,
      cellKey,
      roomtypeId,
      restrictionType,
      date,
      restrictionValue,
    }) {
      this.compactBooleanRestrictionDropdown = {
        anchorEl,
        cellKey,
        roomtypeId,
        restrictionType,
        date,
        selectedValue: Number(restrictionValue) ? 1 : 0,
      };
    },
    closeCompactBooleanRestrictionDropdown() {
      this.compactBooleanRestrictionDropdown = null;
    },
    applyCompactBooleanRestrictionDropdown(value) {
      const dropdownState = this.compactBooleanRestrictionDropdown;
      if (!dropdownState) {
        return;
      }
      this.applyRestrictionBooleanValue(
        dropdownState.roomtypeId,
        dropdownState.restrictionType,
        dropdownState.date,
        value,
      );
      this.compactBooleanRestrictionDropdown = null;
    },
    openDependentRestrictionReadonlySheet({ restrictionType }) {
      if (this.mobileTableCellInputFocused || this.mobileEditPendingSwitchCellKey) {
        this.clearMobileEdit();
      }
      this.booleanRestrictionSheet = null;
      const parentPlanId = this.currentTariff?.dependent_restrictions?.parent_plan_id;
      if (!Number(parentPlanId)) {
        return;
      }
      const parentTariff = this.rplansByIds[parentPlanId];
      const restrictionLabel = restrictionTypes[restrictionType]?.alert || restrictionType;
      const parentTariffName = parentTariff?.name
        || this.$t("родительский тариф");
      const parentTariffHref = `/tariff/index/${parentPlanId}${this.tariffPricesQuerySuffix}`;
      this.armRestrictionSheetOutsideDismissSuppress();
      this.dependentRestrictionReadonlySheet = {
        restrictionType,
        restrictionLabel,
        parentTariffName,
        parentTariffHref,
      };
    },
    closeDependentRestrictionReadonlySheet() {
      this.dependentRestrictionReadonlySheet = null;
    },
    applyBooleanRestrictionFromSheet(value) {
      const s = this.booleanRestrictionSheet;
      if (!s) {
        return;
      }
      this.applyRestrictionBooleanValue(s.roomtypeId, s.restrictionType, s.date, value);
      this.booleanRestrictionSheet = null;
    },
    toggleClosedArrivalDeparture(roomtypeId, restrictionType, date) {
      const currentValue = this.getEffectiveBooleanRestrictionValue(roomtypeId, restrictionType, date);
      this.applyRestrictionBooleanValue(
        roomtypeId,
        restrictionType,
        date,
        currentValue ? 0 : 1,
      );
    },
    async handleCellBlur(e) {
      const { target: payload, relatedTarget: relatedPayload } = this.getEventPayload(e);
      const target = payload.rawTarget || payload.target;
      const data = payload.data;
      const cellType = data.cellType;
      if (
        target?.nodeName === "INPUT"
          && relatedPayload?.data?.action
          && data?.id === relatedPayload?.data?.id
          && data?.date === relatedPayload?.data?.date
      ) {
        target.focus();
      } else if (isEditableCellType(cellType)) {
        await this.syncEditableCellDraftOnFocusOut(e, payload);
      }
    },
    async handleInput(e, payload = this.getEventPayload(e).target) {
      const target = payload.rawTarget || payload.target;
      const data = payload.data;
      const cellType = data.cellType;
      if (!target || !cellType || !data.id || !data.date) return;

      await this.syncEditableCellDraftFromInput(target, data);
    },
    /**
     * Backspace сразу после разрядного пробела в поле цены: удалить последнюю цифру слева от пробела и синхронизировать черновик.
     * @returns {boolean} true если событие нужно отменить (preventDefault)
     */
    tryApplyThousandsSeparatorBackspaceFromTableEvent(e) {
      const t = e?.target;
      if (!t || t.nodeName !== "INPUT") {
        return false;
      }
      const cellRoot = t.closest?.("[data-cell-root]");
      if (!cellRoot || !this.$el?.contains?.(cellRoot)) {
        return false;
      }
      const ct = cellRoot.dataset?.cellType;
      if (ct !== cellTypes.price && ct !== cellTypes.extraPrice) {
        return false;
      }
      if (!applyThousandsSeparatorBackspace(t)) {
        return false;
      }
      const { data } = this.getEventTargetPayload(t, e);
      this.syncEditableCellDraftFromInput(t, {
        cellType: data.cellType,
        id: data.id,
        date: data.date,
      }).catch((err) => {
        logMobileEditError("thousandsSeparatorBackspaceSync", err, {
          cellType: data?.cellType || "",
          id: data?.id || "",
          date: data?.date || "",
        });
      });
      return true;
    },
    async handleTableKeydownCapture(e) {
      if (e.key === "Escape") {
        const payload = this.getEventPayload(e);
        const target = payload.rawTarget || payload.target;
        const data = payload.data || {};
        if (data.cellType === cellTypes.availability && target?.nodeName === "INPUT") {
          e.preventDefault();
          const roomtypeId = data.id;
          const date = data.date;
          if (!roomtypeId || !date) {
            return;
          }
          const cellRoot = target.closest?.("[data-cell-root]");
          const savedFromDom = cellRoot?.dataset?.savedAvailability;
          const savedAvailability = savedFromDom !== undefined && savedFromDom !== ""
            ? savedFromDom
            : this.pricesCalendarModel.getAvailability(roomtypeId, date);
          await this.$store.dispatch("tariffPricesAndRestrictions/unsetUpdatingAvailability", {
            roomtypeId,
            day: date,
          });
          target.value = `${savedAvailability}`;
          target.blur();
        }
        return;
      }
      if (e.key !== "Backspace") {
        return;
      }
      if (this.isMobileDevice && MOBILE_BACKSPACE_USES_BEFORE_INPUT) {
        return;
      }
      if (!this.tryApplyThousandsSeparatorBackspaceFromTableEvent(e)) {
        return;
      }
      e.preventDefault();
    },
    handleTableBeforeInputCapture(e) {
      if (!this.isMobileDevice || !MOBILE_BACKSPACE_USES_BEFORE_INPUT) {
        return;
      }
      if (e.inputType !== "deleteContentBackward") {
        return;
      }
      if (!this.tryApplyThousandsSeparatorBackspaceFromTableEvent(e)) {
        return;
      }
      e.preventDefault();
    },
    async syncEditableCellDraftOnFocusOut(e, payload = this.getEventPayload(e).target) {
      const target = payload.rawTarget || payload.target;
      const data = payload.data;
      const cellType = data.cellType;
      if (!target || !isEditableCellType(cellType)) return;

      if (cellType === cellTypes.restriction && target?.nodeName === "BUTTON") {
        return;
      }

      if (cellType === cellTypes.restriction || cellType === cellTypes.availability) {
        this.tooltipAnchorCellKey = null;
      }

      if (target?.nodeName === "INPUT") {
        await this.syncEditableCellDraftFromInput(target, data, { finalize: true });
      }
    },
    resetMobileEditWhenClickOutside(event) {
      const clickedCell = event.target.closest("[data-cell-root]");
      const clickedBooleanSheet = event.target.closest("[data-boolean-restriction-sheet-root]");
      const clickedCompactBooleanDropdown = event.target.closest("[data-compact-boolean-dropdown-root]");
      const clickedDependentReadonlySheet = event.target.closest("[data-dependent-restriction-readonly-sheet-root]");
      if (clickedCell || clickedBooleanSheet || clickedCompactBooleanDropdown || clickedDependentReadonlySheet) {
        return;
      }

      if (Date.now() < this.suppressRestrictionSheetOutsideDismissUntilMs) {
        return;
      }

      const dismiss = resolveRestrictionSheetOutsideDismiss({
        now: Date.now(),
        suppressUntilMs: this.suppressRestrictionSheetOutsideDismissUntilMs,
        booleanRestrictionSheet: this.booleanRestrictionSheet,
        dependentRestrictionReadonlySheet: this.dependentRestrictionReadonlySheet,
        compactBooleanRestrictionDropdown: this.compactBooleanRestrictionDropdown,
        clickedCell: null,
        clickedBooleanSheet: null,
        clickedCompactBooleanDropdown: null,
        clickedDependentReadonlySheet: null,
      });

      if (dismiss.closeBooleanSheet) {
        this.closeBooleanRestrictionSheet();
      }
      if (dismiss.closeCompactBooleanDropdown) {
        this.closeCompactBooleanRestrictionDropdown();
      }
      if (dismiss.closeDependentReadonlySheet) {
        this.closeDependentRestrictionReadonlySheet();
      }
      this.clearMobileEdit();
      this.tooltipAnchorCellKey = null;
    },
  },
};
