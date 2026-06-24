/** @see RoomtypeModel.WITHOUT_PLACE_TYPE_INDEX */
const WITHOUT_PLACE_TYPE_INDEX = 2;

function hasNonEmptyChildrenAges(childrenAges) {
  return Boolean(childrenAges && typeof childrenAges === "object" && Object.keys(childrenAges).length > 0);
}

function guestUnitNeedsChildrenAgeLabels(unit) {
  if (!unit) {
    return false;
  }
  if (Number(unit.children)) {
    return true;
  }
  return hasNonEmptyChildrenAges(unit.extra?.children_ages);
}

/**
 * Нужен ли справочник hotel_children_ages для подписей возрастов в tooltip/table.
 *
 * @param {object[]} [roomtypes]
 * @returns {boolean}
 */
export function roomtypesNeedHotelChildrenAgesLabels(roomtypes = []) {
  return (roomtypes || []).some((roomtype) => {
    const withoutBedsChildren = roomtype?.extra?.beds?.[WITHOUT_PLACE_TYPE_INDEX];
    if (Array.isArray(withoutBedsChildren) && withoutBedsChildren.length > 0) {
      return true;
    }

    if (guestUnitNeedsChildrenAgeLabels(roomtype)) {
      return true;
    }

    return (roomtype?.subrooms || []).some((subroom) => guestUnitNeedsChildrenAgeLabels(subroom));
  });
}
