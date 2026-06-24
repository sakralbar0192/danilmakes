<template>
  <v-alert :type="mappedType" variant="tonal" class="mb-2">
    <slot>{{ text }}</slot>
  </v-alert>
</template>

<script>
export default {
  name: "BAlert",
  props: {
    type: { type: String, default: "info" },
    text: String,
  },
  computed: {
    mappedType() {
      const map = { warning: "warning", error: "error", success: "success", info: "info" };
      return map[this.type] || "info";
    },
  },
};
</script>
