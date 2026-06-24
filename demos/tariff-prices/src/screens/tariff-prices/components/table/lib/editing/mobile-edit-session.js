/**
 * Состояние мобильной edit-сессии (pure helpers).
 */

/** @typedef {'keyboard'|'blur'|'outside'|'save'|'clear'} MobileEditEndReason */

/**
 * Переход edit-сессии с одной ячейки на другую (не teardown).
 * @param {{ fromCellRoot?: Element|null, toCellRoot?: Element|null, tableEl?: Element|null }} args
 */
export function isMobileEditCellSwitch({
  fromCellRoot = null,
  toCellRoot = null,
  tableEl = null,
} = {}) {
  return Boolean(
    fromCellRoot
    && toCellRoot
    && fromCellRoot !== toCellRoot
    && tableEl?.contains?.(toCellRoot),
  );
}

/**
 * Blur внутри одной ячейки на action-кнопку (reset/remove). На Android Chrome `relatedTarget`
 * часто null — fallback через координаты последнего pointerdown + elementFromPoint.
 *
 * @param {{
 *   fromCellRoot?: Element|null,
 *   relatedTarget?: Element|null,
 *   pointerDownClientX?: number|null,
 *   pointerDownClientY?: number|null,
 * }} args
 * @returns {Element|null}
 */
export function resolveSameCellActionAnchor({
  fromCellRoot = null,
  relatedTarget = null,
  pointerDownClientX = null,
  pointerDownClientY = null,
} = {}) {
  if (!fromCellRoot) {
    return null;
  }
  const relatedAction = relatedTarget?.closest?.("[data-action]");
  if (relatedAction && fromCellRoot.contains(relatedAction)) {
    return relatedAction;
  }
  if (
    typeof document !== "undefined"
    && typeof document.elementFromPoint === "function"
    && Number.isFinite(pointerDownClientX)
    && Number.isFinite(pointerDownClientY)
  ) {
    const elAtPoint = document.elementFromPoint(pointerDownClientX, pointerDownClientY);
    const actionAtPoint = elAtPoint?.closest?.("[data-action]");
    if (actionAtPoint && fromCellRoot.contains(actionAtPoint)) {
      return actionAtPoint;
    }
  }
  return null;
}

/**
 * Нужно ли инкрементировать поколение scroll при новом schedule (отмена устаревших rAF).
 * Повторный schedule для той же ячейки или VK-retry не отменяет уже запланированный подскролл.
 *
 * @param {{
 *   targetCellKey?: string,
 *   currentScrollTargetCellKey?: string,
 *   retry?: boolean,
 * }} args
 */
export function shouldBumpMobileEditScrollGeneration({
  targetCellKey = "",
  currentScrollTargetCellKey = "",
  retry = false,
} = {}) {
  if (retry) {
    return false;
  }
  if (!targetCellKey) {
    return true;
  }
  return targetCellKey !== currentScrollTargetCellKey;
}

/**
 * Пропустить повторный cold startMobileEditSession (focusin после switchMobileEditToCell).
 *
 * @param {{
 *   cellKey?: string,
 *   lastFocusedCellKey?: string,
 *   sessionActive?: boolean,
 *   skipIfActiveCell?: boolean,
 *   pendingSwitchCellKey?: string,
 *   switchInProgressCellKey?: string,
 * }} args
 * @returns {"pendingSwitch"|"switchInProgress"|"dedupActiveCell"|null}
 */
export function resolveMobileEditSessionStartSkipReason({
  cellKey = "",
  lastFocusedCellKey = "",
  sessionActive = false,
  skipIfActiveCell = false,
  pendingSwitchCellKey = "",
  switchInProgressCellKey = "",
} = {}) {
  if (!cellKey) {
    return null;
  }
  if (switchInProgressCellKey && cellKey === switchInProgressCellKey) {
    return "switchInProgress";
  }
  if (sessionActive && pendingSwitchCellKey && cellKey === pendingSwitchCellKey) {
    return "pendingSwitch";
  }
  if (skipIfActiveCell && sessionActive && lastFocusedCellKey && cellKey === lastFocusedCellKey) {
    return "dedupActiveCell";
  }
  return null;
}

/**
 * @param {Parameters<typeof resolveMobileEditSessionStartSkipReason>[0]} args
 * @returns {boolean}
 */
export function shouldSkipMobileEditSessionStart(args = {}) {
  return resolveMobileEditSessionStartSkipReason(args) != null;
}

/**
 * Решение для deferred focusout (2× rAF) на мобилке.
 *
 * Если для switchByKey передан `lookupCellRoot` и ячейки нет в DOM (virtualizer успел её удалить
 * между pointerdown и focusout), возвращаем `defer`, чтобы оркестратор не пытался фокусироваться
 * в несуществующую ячейку.
 *
 * @param {{
 *   fromCellRoot?: Element|null,
 *   nextActiveElement?: Element|null,
 *   tableContains?: (el: Element) => boolean,
 *   pointerDownCellKey?: string,
 *   fromCellKey?: string,
 *   shouldDeferBlurSession?: boolean,
 *   lookupCellRoot?: (cellKey: string) => Element|null,
 * }} args
 * @returns {{ action: "switch"|"switchByKey"|"defer"|"teardown", toCellRoot?: Element|null, cellKey?: string }}
 */
export function resolveMobileEditFocusOutAfterDeferredCheck({
  fromCellRoot = null,
  nextActiveElement = null,
  tableContains = () => false,
  pointerDownCellKey = "",
  fromCellKey = "",
  shouldDeferBlurSession = false,
  lookupCellRoot = null,
} = {}) {
  const nextRoot = nextActiveElement?.closest?.("[data-cell-root]") ?? null;
  if (
    nextActiveElement?.nodeName === "INPUT"
    && nextRoot
    && fromCellRoot
    && nextRoot !== fromCellRoot
    && tableContains(nextRoot)
  ) {
    return { action: "switch", toCellRoot: nextRoot };
  }
  if (pointerDownCellKey && fromCellKey && pointerDownCellKey !== fromCellKey) {
    if (typeof lookupCellRoot === "function") {
      const targetRoot = lookupCellRoot(pointerDownCellKey);
      if (!targetRoot) {
        // Ячейка не существует в DOM — не делаем switchByKey, deferred maintain сохранит сессию.
        return shouldDeferBlurSession ? { action: "defer" } : { action: "teardown" };
      }
    }
    return { action: "switchByKey", cellKey: pointerDownCellKey };
  }
  if (shouldDeferBlurSession) {
    return { action: "defer" };
  }
  return { action: "teardown" };
}

/**
 * Активна ли inline edit-сессия (флаг или живой фокус в инпуте ячейки).
 * @param {{ mobileTableCellInputFocused?: boolean, isMobileEditableInputFocused?: boolean }} args
 */
export function isMobileEditSessionActive({
  mobileTableCellInputFocused = false,
  isMobileEditableInputFocused = false,
} = {}) {
  return Boolean(mobileTableCellInputFocused || isMobileEditableInputFocused);
}

/**
 * Мобильная edit-сессия или десктопный ввод в price-cell (defer virtualizer, scroll-fit preserve).
 * @param {{
 *   mobileTableCellInputFocused?: boolean,
 *   isMobileEditableInputFocused?: boolean,
 *   isDesktopDevice?: boolean,
 *   isDesktopPriceInputInScrollContainer?: (scrollEl: HTMLElement | null, active: Element | null) => boolean,
 *   scrollEl?: HTMLElement | null,
 *   activeElement?: Element | null,
 * }} args
 */
export function isTableInlineEditSessionActive({
  mobileTableCellInputFocused = false,
  isMobileEditableInputFocused = false,
  isDesktopDevice = false,
  isDesktopPriceInputInScrollContainer = () => false,
  scrollEl = null,
  activeElement = null,
} = {}) {
  if (isMobileEditSessionActive({
    mobileTableCellInputFocused,
    isMobileEditableInputFocused,
  })) {
    return true;
  }
  return Boolean(
    isDesktopDevice
    && isDesktopPriceInputInScrollContainer(scrollEl, activeElement),
  );
}

/**
 * Разрешён ли forceUpdate виртуализатора.
 * @param {{ mobileTableCellInputFocused?: boolean, isMobileEditableInputFocused?: boolean }} args
 */
export function shouldAllowVirtualizerRefresh({
  mobileTableCellInputFocused = false,
  isMobileEditableInputFocused = false,
  isDesktopDevice = false,
  isDesktopPriceInputInScrollContainer = () => false,
  scrollEl = null,
  activeElement = null,
} = {}) {
  return !isTableInlineEditSessionActive({
    mobileTableCellInputFocused,
    isMobileEditableInputFocused,
    isDesktopDevice,
    isDesktopPriceInputInScrollContainer,
    scrollEl,
    activeElement,
  });
}

/**
 * Нужно ли отложить refresh виртуализатора до завершения edit-сессии.
 * @param {{ mobileTableCellInputFocused?: boolean, isMobileEditableInputFocused?: boolean }} args
 */
export function shouldDeferVirtualizerRefreshWhileEditing({
  mobileTableCellInputFocused = false,
  isMobileEditableInputFocused = false,
} = {}) {
  return isMobileEditSessionActive({
    mobileTableCellInputFocused,
    isMobileEditableInputFocused,
  });
}
