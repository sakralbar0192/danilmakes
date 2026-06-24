<template>
  <v-checkbox
    :class="rootClasses"
    :model-value="modelForCheckbox"
    :value="groupValue"
    :label="label"
    :disabled="disabled"
    :indeterminate="indeterminate"
    :hide-details="hideDetailsResolved"
    density="compact"
    color="primary"
    @update:model-value="handleUpdate"
    @click="onClick"
  />
</template>

<script>
import { getCompatModel, setCompatModel } from "@/utils/compat-model";

export default {
  name: "BCheckbox",
  props: {
    modelValue: {},
    value: {},
    inputValue: {},
    label: String,
    disabled: Boolean,
    indeterminate: Boolean,
    labelPrepend: Boolean,
    labelFirst: Boolean,
    hideDetails: { type: [Boolean, String], default: true },
    colored: Boolean,
  },
  emits: ["update:modelValue", "input", "change", "click"],
  computed: {
    modelForCheckbox() {
      if (this.inputValue !== undefined) {
        return this.inputValue;
      }
      return getCompatModel(this);
    },
    groupValue() {
      if (Array.isArray(this.modelForCheckbox) && this.value !== undefined) {
        return this.value;
      }
      return undefined;
    },
    hideDetailsResolved() {
      if (this.hideDetails === true || this.hideDetails === "auto") {
        return this.hideDetails;
      }
      return Boolean(this.hideDetails);
    },
    rootClasses() {
      return {
        "label-first": this.labelPrepend || this.labelFirst,
        "v-input--checkbox--colored": this.colored,
        "v-input--indeterminate": this.indeterminate,
      };
    },
  },
  methods: {
    handleUpdate(next) {
      if (this.inputValue !== undefined) {
        this.$emit("update:modelValue", next);
        this.$emit("input", next);
        this.$emit("change", next);
        return;
      }
      setCompatModel(this, next);
      this.$emit("change", next);
    },
    onClick(event) {
      this.$emit("click", event);
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.label-first .v-label) {
  order: -1;
  margin-inline-start: 0;
  margin-inline-end: 8px;
}

:deep(.v-input--indeterminate .v-selection-control__input .v-icon) {
  opacity: 1;
}
</style>
