<template>
  <v-chip :color="color" size="small" variant="flat">
    <slot>{{ text }}</slot>
  </v-chip>
</template>

<script>
export default {
  name: "BStatus",
  props: {
    text: String,
    color: { type: String, default: "primary" },
  },
};
</script>
