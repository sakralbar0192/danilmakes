<template>
  <v-text-field
    ref="field"
    :model-value="innerValue"
    :label="label"
    :disabled="disabled"
    :type="type"
    :error="error"
    :hide-details="hideDetailsResolved"
    density="compact"
    variant="outlined"
    v-bind="$attrs"
    @update:model-value="onUpdate"
    @blur="$emit('blur', $event)"
    @focus="$emit('focus', $event)"
  />
</template>

<script>
export default {
  name: "BTextField",
  inheritAttrs: false,
  props: {
    modelValue: {},
    value: {},
    label: String,
    disabled: Boolean,
    type: { type: String, default: "text" },
    error: Boolean,
    hideDetails: { type: [Boolean, String], default: "auto" },
  },
  emits: ["update:modelValue", "input", "change", "blur", "focus"],
  computed: {
    innerValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value;
    },
    hideDetailsResolved() {
      if (this.hideDetails === true || this.hideDetails === "auto") {
        return this.hideDetails;
      }
      return Boolean(this.hideDetails);
    },
  },
  methods: {
    onUpdate(v) {
      this.$emit("update:modelValue", v);
      this.$emit("input", v);
      this.$emit("change", v);
    },
    focus() {
      this.$refs.field?.focus?.();
    },
    blur() {
      this.$refs.field?.blur?.();
    },
  },
};
</script>
