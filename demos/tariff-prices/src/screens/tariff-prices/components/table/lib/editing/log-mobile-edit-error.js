/**
 * Лёгкий хелпер для логирования silent failures в мобильном редактировании.
 *
 * Цель: не глотать ошибки store dispatch / focus / blur полностью, но и не падать,
 * если глобальный Sentry/console недоступны (SSR, тесты).
 *
 * Уровень warn — пользователь видит «дерганый» каретку или промежуточное состояние,
 * но регресс не блокирует основной поток сохранения.
 *
 * @param {string} scope — короткий тег области, например `"priceDraftSync"`, `"endMobileEditSession"`.
 * @param {Error|unknown} err — ошибка из catch.
 * @param {Record<string, unknown>} [context] — дополнительные поля (cellKey, phase, ...).
 */
export function logMobileEditError(scope, err, context) {
  if (typeof console !== "undefined" && typeof console.warn === "function") {
    if (context) {
      console.warn(`[tariff-mobile-edit] ${scope}:`, err, context);
    } else {
      console.warn(`[tariff-mobile-edit] ${scope}:`, err);
    }
  }
  if (typeof window !== "undefined") {
    const sentry = window.Sentry;
    if (sentry && typeof sentry.captureException === "function" && err) {
      try {
        sentry.captureException(err, context ? { extra: { scope, ...context } } : { extra: { scope } });
      } catch (sentryErr) {
        // ignore: Sentry недоступен или версия SDK не совместима — не валим основной поток
      }
    }
  }
}
