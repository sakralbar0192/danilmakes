import { isEmptyObject } from "@/utils/object";
import { roomtypeHasChildrenAgesMarkupRows } from "../../../lib/tariff/price-save-layer.js";
import { compactCellHeight, compactRestrictionCellHeight } from "../config/table-grid-metrics.js";

/**
 * Токен структуры строк для одного roomtype (подномера, доп. места по возрастам/кроватям).
 * Используется в ключе мемоизации `tableRows`, без учёта цен/ограничений.
 */
export function roomtypeStructureToken(roomtype) {
  const sub = roomtype.subrooms?.length ?? 0;
  const ages = roomtype.extra?.children_ages ?? {};
  const ageParts = Object.keys(ages).sort().map((aid) => {
    const beds = ages[aid] || {};
    return `${aid}:${Object.keys(beds).length}`;
  });
  return `${roomtype.id}:s${sub}:${ageParts.join(";")}`;
}

/**
 * Ключ для мемоизации: меняется только при смене фильтров/режимов/структуры категорий.
 */
export function computeTableRowsStructureKey({
  displayedRoomtypes,
  selectedCategories,
  selectedRestrictions,
  isOneOfPricesModesEnabled,
  isRestrictionModeEnabled,
  isCombinedModeEnabled,
  useCompactRestrictionRow,
  omitExtraChargeRows,
  cellHeight,
  modelContextToken = "",
  rmsCategoryConfigToken = "",
}) {
  const cat = selectedCategories.length
    ? [...selectedCategories].sort((a, b) => String(a).localeCompare(String(b))).join(",")
    : "*";
  const restr = [...selectedRestrictions].sort((a, b) => String(a).localeCompare(String(b))).join(",");
  const parts = [
    modelContextToken,
    rmsCategoryConfigToken,
    isOneOfPricesModesEnabled ? 1 : 0,
    isRestrictionModeEnabled ? 1 : 0,
    isCombinedModeEnabled ? 1 : 0,
    useCompactRestrictionRow ? 1 : 0,
    omitExtraChargeRows ? 1 : 0,
    cellHeight,
    cat,
    restr,
  ];
  for (let i = 0; i < displayedRoomtypes.length; i++) {
    parts.push(roomtypeStructureToken(displayedRoomtypes[i]));
  }
  return parts.join("|");
}

/**
 * Построение плоского списка строк виртуализатора (roomtype / subroom / extraCharge / restriction).
 */
export function buildTableRows({
  displayedRoomtypes,
  restrictionTypeKeys,
  isOneOfPricesModesEnabled,
  isRestrictionModeEnabled,
  isCombinedModeEnabled,
  useCompactRestrictionRow,
  omitExtraChargeRows = false,
  selectedRestrictions,
  tableRowTypes,
  roomtypeNameCellHeight,
  cellHeight,
}) {
  const result = [];

  for (const roomtype of displayedRoomtypes) {
    result.push({
      type: tableRowTypes.roomtype,
      id: roomtype.id,
      height: roomtypeNameCellHeight,
      roomtype,
    });

    if (isOneOfPricesModesEnabled) {
      const isPeopleMarkupSubroom = !isEmptyObject(roomtype?.extra?.people ?? {});
      for (let i = 0; i < roomtype.subrooms.length; i++) {
        const subroom = roomtype.subrooms[i];
        result.push({
          type: tableRowTypes.subroom,
          id: roomtype.id + subroom.id,
          height: cellHeight,
          isExtraCharge: isPeopleMarkupSubroom,
          subroom,
          roomtype,
        });
      }
      // Наценки (ExtraChargeRow) — не в «Базовые цены для БП» (omitExtraChargeRows).
      if (!omitExtraChargeRows && roomtypeHasChildrenAgesMarkupRows(roomtype)) {
        for (const [childrenAgeId, bedTypeObj] of Object.entries(roomtype.extra.children_ages)) {
          for (const bedTypeId of Object.keys(bedTypeObj)) {
            result.push({
              type: tableRowTypes.extraCharge,
              id: `${roomtype.id}_${childrenAgeId}_${bedTypeId}`,
              childrenAgeId: String(childrenAgeId),
              bedTypeId: String(bedTypeId),
              roomtype,
              height: cellHeight,
            });
          }
        }
      }
    }
    if (isRestrictionModeEnabled) {
      if (useCompactRestrictionRow) {
        if (selectedRestrictions.length || !isCombinedModeEnabled) {
          const allSelected = selectedRestrictions.length === restrictionTypeKeys.length;
          result.push({
            type: tableRowTypes.compactRestriction,
            id: `${roomtype.id}_compact_restrictions`,
            height: allSelected ? compactRestrictionCellHeight : compactCellHeight,
            roomtype,
          });
        }
      } else {
        for (let i = 0; i < restrictionTypeKeys.length; i++) {
          const type = restrictionTypeKeys[i];
          if (selectedRestrictions.includes(type) || !isCombinedModeEnabled) {
            result.push({
              type: tableRowTypes.restriction,
              id: roomtype.id + type,
              height: cellHeight,
              roomtype,
              restrictionType: type,
              index: i,
            });
          }
        }
      }
    }
  }

  return result;
}
