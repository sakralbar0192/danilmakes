<template>
  <div v-if="block" class="b-screen-overlay d-flex align-center justify-center">
    <v-progress-circular indeterminate :size="size" color="primary" />
  </div>
</template>

<script>
export default {
  name: "BScreenOverlay",
  props: {
    block: Boolean,
    size: { type: [Number, String], default: 64 },
    dark: Boolean,
  },
};
</script>

<style scoped>
.b-screen-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.6);
  z-index: 5;
}
</style>
