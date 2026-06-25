export default {
  getClearRoomtype() {
    return {
      id: "0",
      hotel_id: 0,
      parent_id: 0,
      name: "",
      type: 0,
      adults: 0,
      children: 0,
      children_age: 0,
      price: "0.00",
      board: 0,
      code: "",
      description: "",
      sort_order: 0,
      deleted: 0,
      subrooms: [],
      rooms: [],
      extra: {
        excluded: false,
        exclude_for_report: false,
      },
    };
  },
};
