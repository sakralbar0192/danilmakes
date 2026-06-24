import i18n from "@/plugins/i18n";
import http from "@/utils/http";
import OSF from "@/utils/object-structure-formatter";
import RoomtypeModel from "@/models/roomtype";
import Vue from "@/shims/vue2-compat";

const cleaningStatuses = {
  0: {
    color: "success darken-1",
    icon: "clean-2",
    title: i18n.t("Чистый номер"),
  },
  1: {
    color: "error darken-1",
    icon: "dirty-2",
    title: i18n.t("Грязный номер"),
  },
  2: {
    color: "success darken-1",
    icon: "inspected-2",
    title: i18n.t("Проверено, чисто"),
  },
  3: {
    color: "primary darken-1",
    icon: "inspecting-2",
    title: i18n.t("На проверке"),
  },
  4: {
    color: "accent darken-1",
    icon: "cleaning-2",
    title: i18n.t("Идет уборка"),
  },
};
const reservationStatuses = {
  1: {
    color: "booking-color-new",
    contrast_color: "booking-color-new-contrast",
    title: i18n.t("Новое"),
  },
  2: {
    color: "booking-color-cancel",
    contrast_color: "booking-color-cancel-contrast",
    title: i18n.t("Отменен"),
  },
  3: {
    color: "booking-color-living",
    contrast_color: "booking-color-living-contrast",
    title: i18n.t("Заселен"),
  },
  4: {
    color: "booking-color-left",
    contrast_color: "booking-color-left-contrast",
    title: i18n.t("Выехал"),
  },
  5: {
    color: "booking-color-checked",
    contrast_color: "booking-color-checked-contrast",
    title: i18n.t("Проверено"),
  },
  6: {
    color: "booking-color-consideration",
    contrast_color: "booking-color-consideration-contrast",
    title: i18n.t("На рассмотрении"),
  },
};
/*
1    Новое
2    Отменен
3    Заселен
4    Выехал
5    Проверено
6    На рассмотрении
 */
// #D2EFB6 new old


export default {
  namespaced: true,
  state: {
    cleaningStatuses,
    reservationStatuses,
    roomtypes: [],
    roomtypesByIds: {},
    roomtypesReady: false,
    roomtypesLoading: false,
    internalRoomtypes: [],
    tags: [],
  },
  mutations: {
    setHotelRoomData(state, data) {
      data = typeof data === "object" && data ? data : {};
      Object.assign(state, data);
    },
    updateRoomTypesTags(state, value) {
      state.tags = value;
    },
    updateRoomTypeAccreditation(state, excludedIds) {
      state.roomtypes.forEach(rt => {
        rt.accreditation_required = excludedIds.includes(rt.id) ? "0" : "1";
      });
      // Обновляем roomtypesByIds
      Object.values(state.roomtypesByIds).forEach(rt => {
        rt.accreditation_required = excludedIds.includes(rt.id) ? "0" : "1";
      });
    },
    updateRoomCleaningStatus(state, {
      roomtypeId,
      roomId,
      newStatusId,
    }) {
      if (state?.roomtypes?.length) {
        const roomtypeIndex = state.roomtypes.findIndex(roomtype => +roomtype.id === +roomtypeId);
        const updatedRoomtype = state.roomtypes[roomtypeIndex];
        const updatedRoom = updatedRoomtype.rooms.find(room => +room.id === +roomId);
        updatedRoom.clean_status = newStatusId;
        Vue.set(state.roomtypes, roomtypeIndex, updatedRoomtype);
      }
    },
  },
  actions: {
    async getRoomTypes({ commit, state }) {
      if (state.roomtypesLoading) {
        return state.roomtypes;
      }
      if (state.roomtypesReady) {
        return state.roomtypes;
      }
      let response = await http.get("/roomTypes/get?with_rooms=1");
      if (!response) { response = {}; }
      if (!Array.isArray(response.roomtypes)) { response.roomtypes = []; }
      const clearRoom = RoomtypeModel.getClearRoomtype();
      const internalRoomtypes = [];
      for (let i = 0; i < response.roomtypes.length; i++) {
        const item = OSF.format(clearRoom, response.roomtypes[i], { deep: true });
        response.roomtypes[i] = item;

        if (item.extra.excluded) {
          internalRoomtypes.push(item.name);
        }
      }
      const roomtypesByIds = OSF.buildMap({ array: response.roomtypes });
      commit("setHotelRoomData", {
        roomtypes: response.roomtypes,
        roomtypesByIds,
        roomtypesReady: true,
        roomtypesLoading: false,
        internalRoomtypes,
      });
      return response.roomtypes;
    },
    async getRoomTypeTags({ commit }) {
      commit("updateRoomTypesTags", OSF.formatObject({ tags: [] }, await http.get("/roomTypes/get_tags")).tags);
    },
    async updateRoomTypeAccreditation({ commit }, excludedIds) {
      commit("updateRoomTypeAccreditation", excludedIds);
    },
  },
  getters: {
    reservationStatuses(state, getters, rootState) {
      return !rootState.hotel.isChmOnly
        ? state.reservationStatuses
        : {
          1: state.reservationStatuses[1],
          2: state.reservationStatuses[2],
          6: state.reservationStatuses[6],
        };
    },
    excludedRoomtypes(state) {
      return state.roomtypes.filter(i => {
        return i.extra.excluded === true;
      });
    },
    // Категории, которые доступны пользователю в фильтрах отчетов
    includedForReportRoomtypes(state) {
      return state.roomtypes.filter(roomtype => {
        return roomtype.extra.exclude_for_report === false;
      });
    },
    /**
     * Категории-исключения с наличием номеров
     */
    excludedRoomtypesWithRooms(state, getters) {
      return getters.excludedRoomtypes.filter((roomtype) => {
        return (roomtype?.rooms ?? []).length;
      });
    },
  },
};
