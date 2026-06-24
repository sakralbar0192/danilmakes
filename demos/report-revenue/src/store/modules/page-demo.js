export default {
  namespaced: true,
  state: {
    pageHeaderTestAttributes: {},
  },
  mutations: {
    setPageHeaderTestAttributes(state, attrs) {
      state.pageHeaderTestAttributes = attrs || {};
    },
  },
};
