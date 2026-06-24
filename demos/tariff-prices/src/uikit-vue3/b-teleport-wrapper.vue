<template>
  <Teleport :to="target">
    <slot />
  </Teleport>
</template>

<script>
export default {
  name: "BTeleportWrapper",
  props: {
    selector: { type: String, default: "#app-teleport-root" },
  },
  computed: {
    target() {
      return this.selector === "#bnovo-spa" ? "#app-teleport-root" : this.selector;
    },
  },
};
</script>
