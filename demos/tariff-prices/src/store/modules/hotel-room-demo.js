import OSF from "@/utils/object-structure-formatter";
import RoomtypeModel from "@/models/roomtype";

export default {
  namespaced: true,
  state: {
    roomtypes: [],
    roomtypesByIds: {},
    roomtypesReady: false,
    roomtypesLoading: false,
  },
  mutations: {
    setHotelRoomData(state, data) {
      Object.assign(state, data || {});
    },
  },
  actions: {
    async getRoomTypes({ commit, state }) {
      if (state.roomtypesReady) return state.roomtypes;
      commit("setHotelRoomData", { roomtypesLoading: true });
      const http = (await import("@/utils/http")).default;
      const response = await http.get("/roomTypes/get", { params: { with_rooms: 1 } });
      const rawRoomtypes = response?.roomtypes || [];
      const clearRoom = RoomtypeModel.getClearRoomtype();
      const roomtypes = rawRoomtypes.map((item) => OSF.format(clearRoom, item, { deep: true }));
      const roomtypesByIds = {};
      roomtypes.forEach((rt) => { roomtypesByIds[rt.id] = rt; });
      commit("setHotelRoomData", {
        roomtypes,
        roomtypesByIds,
        roomtypesReady: true,
        roomtypesLoading: false,
      });
      return roomtypes;
    },
  },
};
