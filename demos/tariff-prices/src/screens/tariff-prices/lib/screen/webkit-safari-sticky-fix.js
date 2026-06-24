/** Модификатор на `.bnovo-tariff-prices-and-restrictions__scroll-container` (WebKit Safari workaround). */
export const SCROLL_CONTAINER_SAFARI_STICKY_FIX_CLASS = "bnovo-tariff-prices-and-restrictions__scroll-container--safari-sticky-fix";

/**
 * Нужен ли модификатор z-index/compositing/sticky-top для липкой шапки таблицы (баг WebKit).
 * iOS: Safari, Chrome (CriOS), Firefox — true. Android / desktop Chrome — false.
 *
 * @param {{ userAgent?: string }} [navigatorLike]
 * @returns {boolean}
 */
export function shouldApplyWebKitSafariStickyHeaderFix(navigatorLike = typeof navigator !== "undefined" ? navigator : {}) {
  const ua = String(navigatorLike.userAgent || "").toLowerCase();
  if (!ua) {
    return false;
  }
  if (/iphone|ipad|ipod/.test(ua)) {
    return true;
  }
  if (/android/.test(ua)) {
    return false;
  }
  if (/chrome|chromium|crios|edg\//.test(ua)) {
    return false;
  }
  return /safari/.test(ua) || (navigatorLike.vendor && String(navigatorLike.vendor).includes("Apple"));
}
