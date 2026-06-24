export default {
  methods: {
    emitModel(value) {
      this.$emit("update:modelValue", value);
      this.$emit("input", value);
    },
  },
};
