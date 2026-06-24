import Vue from "@/shims/vue2-compat";

export function applySetUpdatingAvailabilityValueInPlace(state, {
  roomtypeId = "",
  day = "",
  value = "",
} = {}) {
  if (!state.updatingAvailability[roomtypeId]) {
    Vue.set(state.updatingAvailability, roomtypeId, {});
  }
  Vue.set(state.updatingAvailability[roomtypeId], day, value);
}

export function applyRemoveUpdatingAvailabilityValueInPlace(state, {
  roomtypeId = "",
  day = "",
} = {}) {
  const room = state.updatingAvailability[roomtypeId];
  if (!room || !Object.prototype.hasOwnProperty.call(room, day)) {
    return;
  }
  Vue.delete(room, day);
  if (!Object.keys(room).length) {
    Vue.delete(state.updatingAvailability, roomtypeId);
  }
}
