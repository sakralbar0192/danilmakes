import { isEmptyObject } from "@/utils/object";

/** Категория с доп. местами / детьми (есть строки наценок в таблице). */
export function isExtraChargesCategoryRoomtype(roomtype) {
  if (!roomtype) {
    return false;
  }
  return roomtypeHasChildrenAgesMarkupRows(roomtype)
    || !isEmptyObject(roomtype?.extra?.people ?? {});
}

/** Строки наценок ExtraChargeRow по `children_ages` (не доп. места `people`). */
export function roomtypeHasChildrenAgesMarkupRows(roomtype) {
  if (!roomtype) {
    return false;
  }
  return !isEmptyObject(roomtype?.extra?.children_ages ?? {});
}

/** Есть ли среди категорий отеля хотя бы одна с доп. местами / детьми (extra charges). */
export function roomtypesHaveExtraChargesCategory(roomtypes) {
  return (roomtypes || []).some((rt) => isExtraChargesCategoryRoomtype(rt));
}
