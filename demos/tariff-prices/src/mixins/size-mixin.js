export default {
  props: {
    small: Boolean,
    large: Boolean,
  },
  computed: {
    sizeClass() {
      if (this.small) return "small";
      if (this.large) return "large";
      return "default";
    },
  },
};
