import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { parsePriceId } from "../cell-identity.js";

/**
 * Иммутабельное обновление дерева черновиков цен (для тестов и массовых операций).
 */
export function setUpdatingPriceValue(tree = {}, price = {
  id: "", day: "", value: "",
}) {
  const {
    roomtypeId, childrenAgeId, bedTypeId,
  } = parsePriceId(price.id);
  if (!roomtypeId || !price?.day) {
    return tree;
  }

  const nextTree = { ...(tree || {}) };
  const roomBranch = { ...(nextTree[roomtypeId] || {}) };

  if (childrenAgeId && bedTypeId) {
    const extraChargeKey = PriceAndRestrictionsService.updatingExtraChargesPricesFieldName;
    const extraChargesBranch = { ...(roomBranch[extraChargeKey] || {}) };
    const childrenBranch = { ...(extraChargesBranch[childrenAgeId] || {}) };
    const bedTypeBranch = { ...(childrenBranch[bedTypeId] || {}) };

    bedTypeBranch[price.day] = String(price.value);
    childrenBranch[bedTypeId] = bedTypeBranch;
    extraChargesBranch[childrenAgeId] = childrenBranch;
    roomBranch[extraChargeKey] = extraChargesBranch;
  } else {
    roomBranch[price.day] = String(price.value);
  }

  nextTree[roomtypeId] = roomBranch;
  return nextTree;
}

export function removeUpdatingPriceValue(tree = {}, price = { id: "", day: "" }) {
  const {
    roomtypeId, childrenAgeId, bedTypeId,
  } = parsePriceId(price.id);
  if (!roomtypeId || !price?.day || !tree?.[roomtypeId]) {
    return tree;
  }

  const nextTree = { ...(tree || {}) };
  const roomBranch = { ...(nextTree[roomtypeId] || {}) };

  if (childrenAgeId && bedTypeId) {
    const extraChargeKey = PriceAndRestrictionsService.updatingExtraChargesPricesFieldName;
    const extraChargesBranch = { ...(roomBranch[extraChargeKey] || {}) };
    const childrenBranch = { ...(extraChargesBranch[childrenAgeId] || {}) };
    const bedTypeBranch = { ...(childrenBranch[bedTypeId] || {}) };

    delete bedTypeBranch[price.day];
    if (Object.keys(bedTypeBranch).length) {
      childrenBranch[bedTypeId] = bedTypeBranch;
    } else {
      delete childrenBranch[bedTypeId];
    }

    if (Object.keys(childrenBranch).length) {
      extraChargesBranch[childrenAgeId] = childrenBranch;
    } else {
      delete extraChargesBranch[childrenAgeId];
    }

    if (Object.keys(extraChargesBranch).length) {
      roomBranch[extraChargeKey] = extraChargesBranch;
    } else {
      delete roomBranch[extraChargeKey];
    }
  } else {
    delete roomBranch[price.day];
  }

  if (Object.keys(roomBranch).length) {
    nextTree[roomtypeId] = roomBranch;
  } else {
    delete nextTree[roomtypeId];
  }

  return nextTree;
}
