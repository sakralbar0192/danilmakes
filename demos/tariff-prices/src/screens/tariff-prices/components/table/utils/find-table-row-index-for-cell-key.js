import { cellTypes } from "../config/cell-types.js";

/**
 * Находит индекс строки виртуализатора по ключу ячейки (`buildCellKey` в table/index.vue).
 * @param {string} cellKey
 * @param {Array<{ type: string, id?: string|number, roomtype?: object, subroom?: object, restrictionType?: string, childrenAgeId?: string, bedTypeId?: string }>} tableRows
 * @param {{ tableRowTypes: { roomtype: string, subroom: string, extraCharge: string, restriction: string } }} opts
 * @returns {number} индекс или -1
 */
export default function findTableRowIndexForCellKey(cellKey, tableRows, { tableRowTypes }) {
  if (!cellKey || !tableRows?.length) {
    return -1;
  }

  const firstColon = cellKey.indexOf(":");
  const secondColon = cellKey.indexOf(":", firstColon + 1);
  if (firstColon === -1 || secondColon === -1) {
    return -1;
  }

  const typeTag = cellKey.slice(0, firstColon);
  const id = cellKey.slice(firstColon + 1, secondColon);

  if (typeTag === cellTypes.restriction) {
    const underscore = id.indexOf("_");
    if (underscore === -1) {
      return -1;
    }
    const roomtypeId = id.slice(0, underscore);
    const restrictionType = id.slice(underscore + 1);
    for (let i = 0; i < tableRows.length; i++) {
      const row = tableRows[i];
      if (row.type !== tableRowTypes.restriction) {
        continue;
      }
      if (
        String(row.roomtype?.id) === roomtypeId
        && row.restrictionType === restrictionType
      ) {
        return i;
      }
    }
    return -1;
  }

  if (typeTag === cellTypes.extraPrice) {
    for (let i = 0; i < tableRows.length; i++) {
      const row = tableRows[i];
      if (row.type !== tableRowTypes.extraCharge) {
        continue;
      }
      if (String(row.id) === id) {
        return i;
      }
    }
    return -1;
  }

  if (typeTag === cellTypes.price) {
    for (let i = 0; i < tableRows.length; i++) {
      const row = tableRows[i];
      if (row.type === tableRowTypes.roomtype && String(row.roomtype?.id) === id) {
        return i;
      }
      if (row.type === tableRowTypes.subroom && String(row.subroom?.id) === id) {
        return i;
      }
    }
    return -1;
  }

  return -1;
}
