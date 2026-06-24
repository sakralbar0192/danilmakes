import Vue from "@/shims/vue2-compat";

/**
 * Сравнение списков типов ограничений в конфликте (порядок не важен).
 * @param {unknown} a
 * @param {unknown} b
 * @returns {boolean}
 */
function restrictionConflictListsEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    return a === b;
  }
  if (a.length !== b.length) {
    return false;
  }
  const sa = [...a].map(String).sort();
  const sb = [...b].map(String).sort();
  for (let i = 0; i < sa.length; i++) {
    if (sa[i] !== sb[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Синхронизирует `state.unacceptableRestrictions` с результатом `defineUnacceptableRestrictions`
 * без замены корневой ссылки (Vue.set / Vue.delete), затем инкрементирует `unacceptableRestrictionsEpoch`.
 *
 * @param {object} state — state модуля `tariffPricesAndRestrictions`
 * @param {Record<string, Record<string, string[]>>} nextTree — `defined.unacceptableRestrictions`
 */
// eslint-disable-next-line import/prefer-default-export
export function applyUnacceptableRestrictionsInPlace(state, nextTree = {}) {
  const next = nextTree && typeof nextTree === "object" ? nextTree : {};
  if (!state.unacceptableRestrictions || typeof state.unacceptableRestrictions !== "object") {
    Vue.set(state, "unacceptableRestrictions", {});
  }
  const prev = state.unacceptableRestrictions;
  const roomIds = new Set([
    ...Object.keys(prev),
    ...Object.keys(next),
  ]);

  for (const roomId of roomIds) {
    const prevByDate = prev[roomId] || {};
    const nextByDate = next[roomId] || {};
    const dates = new Set([
      ...Object.keys(prevByDate),
      ...Object.keys(nextByDate),
    ]);

    for (const date of dates) {
      const prevVal = prevByDate[date];
      const nextVal = nextByDate[date];
      const nextHas = Array.isArray(nextVal) && nextVal.length > 0;
      const prevHas = Array.isArray(prevVal) && prevVal.length > 0;

      if (!nextHas) {
        if (prevHas && state.unacceptableRestrictions[roomId]) {
          Vue.delete(state.unacceptableRestrictions[roomId], date);
        }
        continue;
      }

      if (!restrictionConflictListsEqual(prevVal, nextVal)) {
        if (!state.unacceptableRestrictions[roomId]) {
          Vue.set(state.unacceptableRestrictions, roomId, {});
        }
        Vue.set(state.unacceptableRestrictions[roomId], date, [...nextVal]);
      }
    }

    if (state.unacceptableRestrictions[roomId] && Object.keys(state.unacceptableRestrictions[roomId]).length === 0) {
      Vue.delete(state.unacceptableRestrictions, roomId);
    }
  }

  state.unacceptableRestrictionsEpoch = (state.unacceptableRestrictionsEpoch || 0) + 1;
}
