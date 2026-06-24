import { hasOwn } from "@/utils/object";

/**
 * Нормализует payload API: пустой массив / null → объект записей.
 * @param {unknown} value
 * @returns {Record<string, unknown>}
 */
export function normalizeRecordPayload(value) {
  if (value == null || Array.isArray(value)) {
    return {};
  }
  return typeof value === "object" ? value : {};
}

/**
 * Частичный снимок по planId: для id из replacePlanIds подставляет incoming или удаляет ключ.
 * Остальные ключи existing и incoming вне replacePlanIds не меняются.
 *
 * @param {Record<string, unknown>} existing
 * @param {Record<string, unknown>} incoming
 * @param {string[]} replacePlanIds
 * @returns {Record<string, unknown>}
 */
export function mergePlanKeyedSnapshot(existing = {}, incoming = {}, replacePlanIds = []) {
  const next = { ...(existing || {}) };
  const ids = (replacePlanIds || []).map((id) => String(id));

  for (const planId of ids) {
    if (hasOwn(incoming, planId)) {
      next[planId] = incoming[planId];
    } else {
      delete next[planId];
    }
  }

  const replaceSet = new Set(ids);
  Object.keys(incoming || {}).forEach((planId) => {
    if (!replaceSet.has(planId)) {
      next[planId] = incoming[planId];
    }
  });

  return next;
}
