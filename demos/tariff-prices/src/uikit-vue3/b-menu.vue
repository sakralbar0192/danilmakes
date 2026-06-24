<template>
  <v-menu v-model="menuOpen" v-bind="menuProps">
    <template #activator="{ props: activatorProps }">
      <slot name="activator" :on="activatorProps" :attrs="activatorProps" />
    </template>
    <slot />
  </v-menu>
</template>

<script>
export default {
  name: "BMenu",
  inheritAttrs: false,
  props: {
    modelValue: Boolean,
    value: Boolean,
    bottom: Boolean,
    top: Boolean,
    left: Boolean,
    right: Boolean,
    offsetY: Boolean,
    offsetX: Boolean,
    closeOnContentClick: { type: Boolean, default: true },
  },
  emits: ["update:modelValue", "input"],
  computed: {
    menuOpen: {
      get() {
        return this.modelValue ?? this.value ?? false;
      },
      set(v) {
        this.$emit("update:modelValue", v);
        this.$emit("input", v);
      },
    },
    menuProps() {
      const location = this.left
        ? "start"
        : this.right
          ? "end"
          : this.top
            ? "top"
            : this.bottom
              ? "bottom"
              : undefined;
      return {
        ...this.$attrs,
        location,
        closeOnContentClick: this.closeOnContentClick,
      };
    },
  },
};
</script>
