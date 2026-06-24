/**
 * Нормализует глобальный тип БП по ценам с отеля (`object` | `roomtype`).
 * @param {unknown} source
 * @returns {'object'|'roomtype'|null}
 */
// eslint-disable-next-line import/prefer-default-export
export function normalizeRmsPricesRuleSource(source) {
  if (source === "object" || source === "roomtype") {
    return source;
  }
  return null;
}
