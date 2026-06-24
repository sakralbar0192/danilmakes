import { cellTypes } from "../config/cell-types.js";

/** Разбирает id ячейки цены (roomtypeId_childrenAgeId_bedTypeId) на части. */
export function parsePriceId(id = "") {
  const [roomtypeId = "", childrenAgeId = "", bedTypeId = ""] = `${id}`.split("_");
  return {
    roomtypeId, childrenAgeId, bedTypeId,
  };
}

/** Ячейка доп. мест / детей: id вида `roomtypeId_childrenAgeId_bedTypeId`. */
export function isExtraChargePriceId(id = "") {
  const { childrenAgeId, bedTypeId } = parsePriceId(id);
  return Boolean(childrenAgeId && bedTypeId);
}

/**
 * Стабильный ключ DOM/VM для ячейки цены или ограничения.
 */
export function buildCellKey({
  cellType,
  id = "",
  date = "",
}) {
  if (!id || !date) {
    return "";
  }

  if (cellType === cellTypes.restriction) {
    return `${cellTypes.restriction}:${id}:${date}`;
  }

  const { childrenAgeId, bedTypeId } = parsePriceId(id);
  const priceCellType = childrenAgeId && bedTypeId
    ? cellTypes.extraPrice
    : cellTypes.price;
  return `${priceCellType}:${id}:${date}`;
}

export function parseCellKey(cellKey = "") {
  const [cellType = "", id = "", date = ""] = `${cellKey}`.split(":");
  return {
    cellType,
    id,
    date,
  };
}

export function isPriceCellType(cellType = "") {
  return cellType === cellTypes.price
    || cellType === cellTypes.extraPrice;
}

export function isEditableCellType(cellType = "") {
  return isPriceCellType(cellType)
    || cellType === cellTypes.restriction
    || cellType === cellTypes.availability;
}
