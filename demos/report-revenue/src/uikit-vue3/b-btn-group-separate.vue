<template>
  <v-btn-toggle
    v-bind="$attrs"
    :model-value="modelValue"
    class="v-btn-toggle v-btn-toggle--separated"
    :class="gapClass"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <slot />
  </v-btn-toggle>
</template>

<script>
export default {
  name: "BBtnGroupSeparate",
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Number, Array, Object], default: undefined },
    gap: { type: String, default: "sm" },
  },
  emits: ["update:modelValue"],
  computed: {
    gapClass() {
      const map = { xs: "v-gap--x-small", sm: "v-gap--small", def: "v-gap--default", lg: "v-gap--large", xl: "v-gap--x-large", between: "v-gap--between" };
      return map[this.gap] || "v-gap--small";
    },
  },
};
</script>

<style lang="scss" scoped>
.v-btn-toggle--separated :deep(.v-btn:not(:first-child)) {
  margin-left: 8px;
}
</style>
