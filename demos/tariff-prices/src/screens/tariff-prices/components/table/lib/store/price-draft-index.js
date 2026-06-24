/**
 * Плоский индекс черновиков цен: ключ `priceId|day` → строковое значение.
 */

export function getPriceDraftKey(id = "", day = "") {
  return `${id}|${day}`;
}

export function updatePriceDraftIndex(index = {}, price = {
  id: "", day: "", value: "",
}) {
  const nextIndex = { ...(index || {}) };
  const key = getPriceDraftKey(price.id, price.day);
  nextIndex[key] = String(price.value);
  return nextIndex;
}

export function removePriceDraftIndex(index = {}, price = { id: "", day: "" }) {
  const nextIndex = { ...(index || {}) };
  delete nextIndex[getPriceDraftKey(price.id, price.day)];
  return nextIndex;
}
