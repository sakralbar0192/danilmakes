<template>
  <v-switch
    :model-value="modelValue"
    :label="label"
    :disabled="disabled"
    hide-details
    color="primary"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script>
export default {
  name: "BSwitch",
  props: {
    modelValue: {},
    value: {},
    label: String,
    disabled: Boolean,
  },
  emits: ["update:modelValue", "input", "change"],
  computed: {
    modelValue() {
      return this.modelValue ?? this.value;
    },
  },
};
</script>
