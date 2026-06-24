import { mapState } from "vuex";

export default {
  computed: {
    ...mapState(["hotel", "user", "device"]),
    breakpoint() {
      return this.device?.breakpoint || {};
    },
    isMobileDevice() {
      return Boolean(this.device?.breakpoint?.mobile);
    },
    isDesktopDevice() {
      return Boolean(this.device?.breakpoint?.desktop);
    },
    isTabletDevice() {
      return Boolean(this.device?.breakpoint?.tablet);
    },
    isDragging() {
      return Boolean(this.device?.isDragging);
    },
    isTouch() {
      return Boolean(this.device?.isTouch);
    },
    isReadonly() {
      return Boolean(this.user?.extra?.is_readonly);
    },
  },
};
