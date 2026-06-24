export default {
  data() {
    return { isFirstVisit: false, isShowAlert: false };
  },
  methods: {
    initFirstVisit(source, key) {
      if (source === "localStorage") {
        if (!localStorage.getItem(key)) {
          this.isFirstVisit = true;
        }
        // Временная заглушка для использования значения из API
      } else if (!localStorage.getItem(key)) {
        this.isFirstVisit = true;
      }
    },
    showElementOnce(source, key) {
      if (this.isFirstVisit) {
        setTimeout(() => {
          this.isShowAlert = true;
          if (source === "localStorage") {
            localStorage.setItem(key, true);
          } else {
            // Временная заглушка для использования значения из API
            localStorage.setItem(key, true);
          }
        }, 1000);
      }
    },
  },
};
