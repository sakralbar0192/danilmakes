/* eslint-disable import/prefer-default-export */
/**
 * Id категории номера, в ветке `updatedRestrictions` которого хранится черновик ограничения `closed`
 * для этой строки: родительская категория при наличии `parent_id`, иначе id текущего roomtype/subroom.
 *
 * @param {{ id?: string|number, parent_id?: string|number }|null|undefined} roomtype
 * @returns {string|number}
 */
export function getClosedSaleRestrictionRoomtypeId(roomtype) {
  if (!roomtype) {
    return "";
  }
  const parentId = roomtype.parent_id;
  const hasParent = parentId != null
    && parentId !== ""
    && parentId !== 0
    && parentId !== "0";
  const own = hasParent ? parentId : roomtype.id;
  return own == null ? "" : own;
}
