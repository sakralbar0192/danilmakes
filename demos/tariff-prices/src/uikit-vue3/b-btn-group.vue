<template>
  <v-btn-toggle
    v-model="inner"
    class="b-btn-group"
    :class="{ 'v-btn-toggle--borderless': borderless }"
    :mandatory="mandatory"
    :divided="!borderless"
    density="comfortable"
  >
    <slot />
  </v-btn-toggle>
</template>

<script>
export default {
  name: "BBtnGroup",
  props: {
    modelValue: {},
    value: {},
    mandatory: { type: Boolean, default: true },
    borderless: { type: Boolean, default: true },
  },
  emits: ["update:modelValue", "change", "input"],
  computed: {
    inner: {
      get() {
        return this.modelValue ?? this.value;
      },
      set(v) {
        this.$emit("update:modelValue", v);
        this.$emit("input", v);
        this.$emit("change", v);
      },
    },
  },
};
</script>
