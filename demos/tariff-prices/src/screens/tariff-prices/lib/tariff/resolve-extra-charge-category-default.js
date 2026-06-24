import { parsePriceId } from "../../components/table/lib/cell-identity.js";

/**
 * Базовая цена наценки из настроек категории (Категории → доп. места / дети).
 *
 * @param {object|null|undefined} roomtype
 * @param {string|number} childrenAgeId
 * @param {string|number} bedTypeId
 * @returns {number|null}
 */
export function resolveExtraChargeCategoryDefault(roomtype, childrenAgeId, bedTypeId) {
  const raw = roomtype?.extra?.children_ages?.[childrenAgeId]?.[bedTypeId]?.price;
  if (raw === null || raw === undefined || raw === "") {
    return null;
  }
  return Number(raw);
}

/**
 * @param {object[]} roomtypes
 * @param {string|number} roomtypeId
 * @param {string|number} childrenAgeId
 * @param {string|number} bedTypeId
 * @returns {number|null}
 */
export function resolveExtraChargeCategoryDefaultFromRoomtypes(
  roomtypes,
  roomtypeId,
  childrenAgeId,
  bedTypeId,
) {
  const roomtype = (roomtypes || []).find((item) => String(item?.id) === String(roomtypeId));
  return resolveExtraChargeCategoryDefault(roomtype, childrenAgeId, bedTypeId);
}

/**
 * @param {object[]} roomtypes
 * @param {string} dataId — id ячейки цены (`roomtypeId` или `roomtypeId_childrenAgeId_bedTypeId`)
 * @returns {number|null}
 */
export function resolveExtraChargeCategoryDefaultForPriceId(roomtypes, dataId) {
  const {
    roomtypeId, childrenAgeId, bedTypeId,
  } = parsePriceId(dataId);
  if (!childrenAgeId || !bedTypeId) {
    return null;
  }
  return resolveExtraChargeCategoryDefaultFromRoomtypes(roomtypes, roomtypeId, childrenAgeId, bedTypeId);
}
