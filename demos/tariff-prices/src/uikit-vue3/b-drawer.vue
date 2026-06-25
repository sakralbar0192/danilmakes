<template>
  <Teleport to="body">
    <template v-if="isOpen">
      <div
        class="b-drawer-scrim"
        :class="{ 'b-drawer-scrim--visible': panelVisible }"
        :style="{ zIndex: zIndex }"
        data-test="b-drawer-scrim"
        @click="close"
      />
      <aside
        ref="panel"
        class="b-drawer-panel"
        :class="[
          right ? 'b-drawer-panel--right' : 'b-drawer-panel--left',
          { 'b-drawer-panel--visible': panelVisible },
        ]"
        :style="panelStyle"
        data-test="b-drawer-panel"
        @click.stop
        @transitionend="onPanelTransitionEnd"
      >
        <slot />
      </aside>
    </template>
  </Teleport>
</template>

<script>
import { getCompatModel, setCompatModel } from "@/utils/compat-model";

const LOCK_CLASS = "demo-drawer--lock-overflow";

export default {
  name: "BDrawer",
  props: {
    modelValue: Boolean,
    value: Boolean,
    right: { type: Boolean, default: true },
    width: { type: [Number, String], default: 480 },
    lockOverflow: { type: Boolean, default: false },
    zIndex: { type: Number, default: 2400 },
  },
  emits: ["update:modelValue", "input"],
  data() {
    return {
      panelVisible: false,
    };
  },
  computed: {
    isOpen() {
      const v = getCompatModel(this);
      return Boolean(v);
    },
    panelStyle() {
      const w = typeof this.width === "number" ? `${this.width}px` : this.width;
      return {
        width: w,
        maxWidth: "100vw",
        zIndex: this.zIndex + 1,
      };
    },
  },
  watch: {
    isOpen: {
      handler(open) {
        if (this.lockOverflow) {
          document.documentElement?.classList.toggle(LOCK_CLASS, Boolean(open));
        }
        if (open) {
          this.panelVisible = false;
          this.$nextTick(() => {
            requestAnimationFrame(() => {
              this.panelVisible = true;
            });
          });
        } else {
          this.panelVisible = false;
        }
      },
      immediate: true,
    },
  },
  beforeUnmount() {
    if (this.lockOverflow) {
      document.documentElement?.classList.remove(LOCK_CLASS);
    }
  },
  methods: {
    getPanelEl() {
      return this.$refs.panel || null;
    },
    close() {
      setCompatModel(this, false);
    },
    onPanelTransitionEnd(event) {
      const name = event?.propertyName || "";
      if (name !== "transform" && name !== "-webkit-transform") {
        return;
      }
      this.$emit("panel-transition-end", event);
    },
  },
};
</script>

<style lang="scss">
html.demo-drawer--lock-overflow {
  overflow: hidden !important;
}

.b-drawer-scrim {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.b-drawer-scrim--visible {
  opacity: 1;
}

.b-drawer-panel {
  position: fixed;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  max-height: 100vh;
  max-height: 100dvh;
  background: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  overflow: hidden;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.b-drawer-panel--right {
  right: 0;
  transform: translateX(100%);
}

.b-drawer-panel--left {
  left: 0;
  transform: translateX(-100%);
}

.b-drawer-panel--visible.b-drawer-panel--right,
.b-drawer-panel--visible.b-drawer-panel--left {
  transform: translateX(0);
}
</style>
