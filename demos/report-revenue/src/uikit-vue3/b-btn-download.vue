<template>
  <b-btn
    v-bind="$attrs"
    variant="outlined"
    color="tertiary"
    class="b-btn--download"
    :size="size"
    :loading="loading"
    @click="$emit('click', $event)"
  >
    <v-icon class="icon-download" />
  </b-btn>
</template>

<script>
export default {
  name: "BBtnDownload",
  inheritAttrs: false,
  props: {
    type: { type: String, default: "excel" },
    small: { type: Boolean, default: false },
    large: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
  },
  emits: ["click"],
  computed: {
    size() {
      if (this.small) return "small";
      if (this.large) return "large";
      return "default";
    },
  },
};
</script>
