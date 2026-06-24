/**
 * Плоский список категорий: каждый roomtype и его subrooms подряд.
 */
export function flatMapRoomtypesWithSubrooms(roomtypes = []) {
  return roomtypes.flatMap((roomtype) => [
    roomtype,
    ...(roomtype.subrooms || []),
  ]);
}

/**
 * Находит категорию по id среди корневых roomtype и вложенных subrooms (мобильный редактор, ключ ячейки).
 */
export function findRoomtypeOrSubroomById(roomtypes = [], roomtypeId = "") {
  const idStr = String(roomtypeId);
  return flatMapRoomtypesWithSubrooms(roomtypes).find((rt) => String(rt.id) === idStr) || null;
}

/**
 * Корневая категория размещения для id из payload (roomtype или subroom).
 * @returns {object|null}
 */
export function findParentRoomtypeByEntityId(roomtypes = [], entityId = "") {
  const idStr = String(entityId ?? "");
  if (!idStr) {
    return null;
  }
  for (const parent of roomtypes) {
    if (String(parent.id) === idStr) {
      return parent;
    }
    if ((parent.subrooms || []).some((sub) => String(sub.id) === idStr)) {
      return parent;
    }
  }
  return null;
}

/**
 * Id категории для правил БП (исключение, dynamic rule): subroom → parent.id.
 * @returns {string|null}
 */
export function resolveBpRuleRoomtypeId(roomtypes = [], entityId = "") {
  const parent = findParentRoomtypeByEntityId(roomtypes, entityId);
  return parent ? String(parent.id) : null;
}
