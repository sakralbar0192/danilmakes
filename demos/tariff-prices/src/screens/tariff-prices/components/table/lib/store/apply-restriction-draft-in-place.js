import Vue from "@/shims/vue2-compat";

function restrictionDraftIndexKey(roomtypeId, day, type) {
  return `${roomtypeId}|${day}|${type}`;
}

export function applySetRestrictionDraftInPlace(state, {
  type = "",
  roomtypeId = "",
  day = "",
  value = "",
} = {}) {
  if (!state.updatedRestrictions[roomtypeId]) {
    Vue.set(state.updatedRestrictions, roomtypeId, {});
  }
  const room = state.updatedRestrictions[roomtypeId];
  if (!room[day]) {
    Vue.set(room, day, {});
  }
  Vue.set(room[day], type, value);
  const idxKey = restrictionDraftIndexKey(roomtypeId, day, type);
  Vue.set(state.restrictionDraftIndex, idxKey, value);
}

export function applyRemoveRestrictionDraftInPlace(state, {
  type = "",
  roomtypeId = "",
  day = "",
} = {}) {
  if (!state.updatedRestrictions[roomtypeId]?.[day]) {
    return;
  }
  const room = state.updatedRestrictions[roomtypeId];
  const dayBranch = room[day];
  Vue.delete(dayBranch, type);
  if (!Object.keys(dayBranch).length) {
    Vue.delete(room, day);
  }
  if (!Object.keys(room).length) {
    Vue.delete(state.updatedRestrictions, roomtypeId);
  }
  Vue.delete(state.restrictionDraftIndex, restrictionDraftIndexKey(roomtypeId, day, type));
}
