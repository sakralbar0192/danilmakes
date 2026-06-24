// --- Размеры сетки основной таблицы (не massive-updating UI) ---
export const roomtypeNameCellWidth = 240;
export const roomtypeNameCellWidthCompact = 66;
export const roomtypeNameCellHeight = 92;
export const roomtypeCompactNameCellHeight = 60;
export const cellWidth = 88;
export const presentationCellWidth = 104;
export const presentationCellHeight = 47;
export const presentationCompactCellHeight = 62;
export const presentationCompactCellWidth = 183;
export const compactRestrictionCellHeight = 32;
export const cellHeight = 32;
export const compactCellHeight = 20;
/** Высота липкой дорожки горизонтального скролла (6px scrollbar + зазор). */
export const tableHorizontalScrollbarTrackHeightPx = 8;
/** Лимит row/window кэша в строках таблицы. */
export const rowWindowCacheLimit = 70;
/** Буфер виртуализатора строк (px). */
export const virtualizerBufferPx = 128;
/** Debounce обновления виртуализатора при скролле (ms). */
export const virtualizerUpdateDelayMs = 32;
/** Порог |Δscroll| для пропуска кадра виртуализатора (px). */
export const virtualizerScrollSkipThresholdPx = 20;

/** Не запускать dismiss по VisualViewport сразу после focus в ячейку (WebView / iOS ложные скачки). */
export const MOBILE_KEYBOARD_VV_COOLDOWN_MS = 650;
/** Подтверждение закрытия клавиатуры после vv true->false (фильтр transient скачков). */
export const MOBILE_KEYBOARD_DISMISS_CONFIRM_MS = 120;
/** Рост высоты visualViewport от минимума за сессию редактирования — fallback, если порог 0.9×innerHeight не отметил «клавиатуру открыта». */
export const MOBILE_KEYBOARD_VV_GROW_DISMISS_MIN_PX = 64;
/** Минимум сессии VV/innerHeight для growth dismiss: session min должен был сжиматься ниже этого порога (клавиатура «была» открыта). */
export const MOBILE_KEYBOARD_VV_GROW_SESSION_RATIO = 0.97;
/** Текущая высота VV должна вырасти до этого отношения от innerHeight, чтобы считать клавиатуру «закрытой» (growth fallback). */
export const MOBILE_KEYBOARD_VV_GROW_INNER_RATIO = 0.88;
/** Порог перекрытия снизу (px): выше — клавиатура «открыта» (согласовано с scroll-fit-controller). */
export const MOBILE_KEYBOARD_INTRUSION_OPEN_PX = 12;
/** Окно после focusin, в котором resize viewport может восстановить фокус в ячейке (тап → footer hide → scroll). */
export const MOBILE_EDIT_FOCUS_RESTORE_GRACE_MS = 600;
/** Сессия focus-in: блок dismiss, пока клавиатура не стабилизировалась или не истёк таймаут. */
export const MOBILE_EDIT_FOCUS_IN_SESSION_MS = 800;
/** Подряд кадров «клавиатура открыта» для mobileEditKeyboardStableOpen. */
export const MOBILE_KEYBOARD_STABLE_OPEN_TICKS = 2;
/** Подряд кадров growth-эвристики для probe-fallback dismiss (антидребезг). */
export const MOBILE_KEYBOARD_GROWTH_DISMISS_TICKS = 2;
/** Порог изменения clientHeight scroll-контейнера для refresh виртуализатора. */
export const TABLE_VIEWPORT_RESIZE_REFRESH_THRESHOLD_PX = 24;
/** Touch-hold occlusion и отложенный layout-settle после edit (согласовано с scroll-fit-controller). */
export const MOBILE_EDIT_TOUCH_HOLD_MS = 500;
/** Подавление click таблицы после blur/dismiss edit-сессии. */
export const MOBILE_EDIT_SUPPRESS_CLICK_MS = 500;
/** Не закрывать restriction bottom sheet по window click сразу после открытия (scrim/Vuetify). */
export const RESTRICTION_SHEET_OUTSIDE_DISMISS_SUPPRESS_MS = 500;
/** Игнорировать микро-дрожание CSS vars scroll-fit (px). */
export const SCROLL_FIT_CSS_VAR_JITTER_PX = 2;
/** Throttle ResizeObserver скролл-контейнера в mobile-edit (≈ 56ms, ~1 кадр + защитный зазор). */
export const MOBILE_EDIT_SCROLL_RO_THROTTLE_MS = 56;
/** Задержка scroll-fit пересчёта после успешного сохранения (дать layout/animation осесть). */
export const MOBILE_EDIT_POST_SAVE_SCROLL_FIT_DELAY_MS = 300;

// --- Data-атрибуты ячеек ---
export const priceCellResetDataAttrName = "reset";
export const priceCellRemoveDataAttrName = "remove";
export const priceCellEditDataAttrName = "edit";
export const restrictionCellResetDataAttrName = "restrictionReset";
export const closedStatusDataAttrName = "closedStatus";

// --- Z-index (липкие шапки; Safari-ветка в styles/index.scss) ---
export const pageStickyHeaderZIndex = 9;
export const tableStickyHeaderZIndex = 8;
export const tableStickyHeaderInnerZIndex = 3;
export const tableStickyHeaderDefaultZIndex = 4;
export const tableStickyHeaderInnerDefaultZIndex = 3;
export const monthsRowStickyCellDefaultZIndex = 2;

// --- Стили ---
export const nameCellStyles = {
  position: "sticky",
  left: "0px",
  zIndex: 4,
  backgroundColor: "#FFFFFF",
  fontSize: "12px !important",
};
