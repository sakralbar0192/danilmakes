<template>
  <v-menu
    v-model="isOpen"
    :location="location"
    :open-on-hover="openOnHover"
    :close-on-content-click="closeOnContentClick"
    :offset="10"
    :z-index="3000"
    :content-class="menuContentClass"
    :max-width="resolvedMaxWidth"
  >
    <template #activator="{ props: activatorProps }">
      <slot name="activator" v-bind="splitActivatorProps(activatorProps)" />
    </template>

    <div class="b-menu-tooltip__inner" :style="innerStyle">
      <b-btn
        v-if="closable"
        class="b-menu-tooltip__close"
        text-inline
        color="tertiary"
        @click="isOpen = false"
      >
        <v-icon class="icon-cross" size="small" />
      </b-btn>
      <slot />
    </div>
  </v-menu>
</template>

<script>
import BBtn from "./b-btn.vue";

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
  name: "BMenuTooltip",
  components: { BBtn },
  props: {
    bottom: Boolean,
    top: Boolean,
    left: Boolean,
    right: Boolean,
    maxWidth: { type: [Number, String], default: 300 },
    closable: { type: Boolean, default: false },
    openOnHover: { type: Boolean, default: true },
    closeOnContentClick: { type: Boolean, default: false },
  },
  emits: ["closeTooltipWithCross"],
  data() {
    return { isOpen: false };
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
      const parsed = Number.parseInt(this.maxWidth, 10);
      return Number.isFinite(parsed) ? parsed : 300;
    },
    innerStyle() {
      return { maxWidth: `${this.resolvedMaxWidth}px` };
    },
    menuContentClass() {
      return [
        "b-menu-tooltip__content",
        this.closable ? "b-menu-tooltip__content--closable" : "",
      ].filter(Boolean).join(" ");
    },
  },
};
</script>

<style lang="scss">
.b-menu-tooltip__content {
  overflow: visible !important;
  contain: none !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15) !important;
  background: #fff !important;
  color: #34425a;
  border-radius: 4px;
}

.b-menu-tooltip__inner {
  position: relative;
  padding: 12px 16px;
  font-size: 13px;
  line-height: 16px;
}

.b-menu-tooltip__content--closable .b-menu-tooltip__inner {
  padding-right: 36px;
}

.b-menu-tooltip__close {
  position: absolute !important;
  top: 8px;
  right: 8px;
  min-width: auto !important;
  width: 24px !important;
  height: 24px !important;
  padding: 0 !important;
}
</style>
