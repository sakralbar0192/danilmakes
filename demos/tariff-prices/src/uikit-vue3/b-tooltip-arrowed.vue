<template>
  <v-tooltip
    :location="location"
    :max-width="resolvedMaxWidth"
    open-on-hover
    content-class="v-tooltip__content v-tooltip__content_arrowed b-tooltip-arrowed"
  >
    <template #activator="{ props: activatorProps }">
      <slot name="activator" v-bind="splitActivatorProps(activatorProps)" />
    </template>
    <div class="b-tooltip-arrowed__body">
      <slot />
    </div>
  </v-tooltip>
</template>

<script>
function splitActivatorProps(props = {}) {
  const on = {};
  const attrs = {};
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.slice(2);
      on[eventName.charAt(0).toLowerCase() + eventName.slice(1)] = value;
    } else {
      attrs[key] = value;
    }
  });
  return { on, attrs, props };
}

export default {
  name: "BTooltipArrowed",
  props: {
    bottom: Boolean,
    top: Boolean,
    left: Boolean,
    right: Boolean,
    maxWidth: { type: [Number, String], default: 283 },
  },
  methods: {
    splitActivatorProps,
  },
  computed: {
    location() {
      if (this.bottom) return "bottom";
      if (this.top) return "top";
      if (this.left) return "left";
      if (this.right) return "right";
      return "bottom";
    },
    resolvedMaxWidth() {
      if (typeof this.maxWidth === "number") {
        return this.maxWidth;
      }
      return Number.parseInt(this.maxWidth, 10) || 283;
    },
  },
};
</script>

<style lang="scss">
.b-tooltip-arrowed__body {
  text-align: left;

  p {
    margin: 0 0 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
