import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { hasOwn } from "@/utils/object";
import { parsePriceId } from "../components/table/lib/cell-identity.js";

/**
 * Целая и дробная части из отформатированной строки поля цены (без разрядных пробелов).
 */
function splitAmountParts(formattedValue) {
  const raw = `${formattedValue ?? ""}`.replace(/\s/g, "").replace(/,/g, ".");
  const dot = raw.indexOf(".");
  if (dot === -1) {
    return { integerPart: raw.replace(/[^\d]/g, ""), fractionalPart: undefined };
  }
  return {
    integerPart: raw.slice(0, dot).replace(/[^\d]/g, ""),
    fractionalPart: raw.slice(dot + 1).replace(/[^\d]/g, ""),
  };
}

/**
 * Черновик при вводе: пустая строка, ведущие нули («000») или число.
 * @param {string} formattedValue
 * @returns {string|number}
 */
export function resolvePriceDraftFromInput(formattedValue) {
  const allowEmpty = PriceAndRestrictionsService.parseAmount(formattedValue, true);
  if (allowEmpty === "") {
    return "";
  }

  const { integerPart, fractionalPart } = splitAmountParts(formattedValue);
  if (integerPart.length > 1 && integerPart.startsWith("0")) {
    if (fractionalPart !== undefined) {
      return `${integerPart}.${fractionalPart}`;
    }
    return integerPart;
  }

  return allowEmpty === null ? "" : allowEmpty;
}

/**
 * Финальное значение при blur / flush: пустое и неполное → 0.
 * @param {string} formattedValue
 * @returns {number}
 */
export function finalizePriceDraftFromInput(formattedValue) {
  const allowEmpty = PriceAndRestrictionsService.parseAmount(formattedValue, true);
  if (allowEmpty === "" || allowEmpty === null) {
    return 0;
  }
  const parsed = PriceAndRestrictionsService.parseAmount(formattedValue);
  return parsed === null ? 0 : parsed;
}

/**
 * Сравнение черновика с сохранённой ценой (для unset при совпадении).
 * @param {string|number} draftValue
 * @param {number} savedPrice
 */
export function isPriceDraftEqualToSaved(draftValue, savedPrice) {
  if (draftValue === "") {
    return false;
  }
  const draftNum = typeof draftValue === "number"
    ? draftValue
    : PriceAndRestrictionsService.parseAmount(`${draftValue}`);
  const savedNum = Number(savedPrice);
  if (draftNum === null || Number.isNaN(draftNum) || Number.isNaN(savedNum)) {
    return false;
  }
  return draftNum === savedNum;
}

/**
 * Есть ли запись черновика в дереве updatingPrices (в т.ч. пустая строка).
 */
export function hasPriceDraftInTree(updatingPrices, dataId, dayDate) {
  const {
    roomtypeId, childrenAgeId, bedTypeId,
  } = parsePriceId(dataId);
  if (!roomtypeId || !dayDate) {
    return false;
  }
  const room = updatingPrices?.[roomtypeId];
  if (!room) {
    return false;
  }
  if (childrenAgeId && bedTypeId) {
    const extraKey = PriceAndRestrictionsService.updatingExtraChargesPricesFieldName;
    const branch = room[extraKey]?.[childrenAgeId]?.[bedTypeId];
    return branch != null && hasOwn(branch, dayDate);
  }
  return hasOwn(room, dayDate);
}

/**
 * Красная рамка: зафиксированный ноль после blur, не пустой черновик и не «000».
 */
export function isZeroPriceValidationError(updatingValue) {
  if (updatingValue === "" || updatingValue === null || updatingValue === undefined) {
    return false;
  }
  const str = `${updatingValue}`.replace(/\s/g, "");
  if (/^0+\d+$/.test(str.split(".")[0])) {
    return false;
  }
  const num = Number(updatingValue);
  return num === 0 && (str === "0" || str === "0.0" || str === "0.00");
}
