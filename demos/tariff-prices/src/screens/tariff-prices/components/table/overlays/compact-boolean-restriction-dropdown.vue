<template>
  <Teleport to="body">
    <v-card
      v-if="shouldRender"
      data-compact-boolean-dropdown-root
      :class="$style.dropdown"
      :style="dropdownStyle"
    >
      <v-list density="compact" class="demo-dropdown-list" width="180">
        <v-list-item
          v-for="option in options"
          :key="option.value"
          data-test="compact-restriction-dropdown-option-text"
          class="pr-ingroup"
          @click="applyValue(option.value)"
        >
          <template #title>
            <div class="d-flex align-center">
              <span>{{ option.label }}</span>
              <v-icon
                v-if="option.value === normalizedSelectedValue"
                color="primary"
                size="small"
                class="icon-check ml-auto"
              />
            </div>
          </template>
        </v-list-item>
      </v-list>
    </v-card>
  </Teleport>
</template>

<script>
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";

export default {
  name: "CompactBooleanRestrictionDropdown",
  props: {
    anchorEl: {
      type: HTMLElement,
      default: null,
    },
    restrictionType: {
      type: String,
      required: true,
    },
    selectedValue: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return { positionTick: 0 };
  },
  dropdownWidth: 180,
  dropdownHeight: 88,
  computed: {
    shouldRender() {
      if (!this.anchorEl) {
        return false;
      }
      if (typeof this.anchorEl.isConnected === "boolean" && !this.anchorEl.isConnected) {
        return false;
      }
      return true;
    },
    normalizedSelectedValue() {
      return Number(this.selectedValue) ? 1 : 0;
    },
    anchorRect() {
      void this.positionTick;
      const rect = this.anchorEl?.getBoundingClientRect?.();
      if (!rect || (rect.width === 0 && rect.height === 0)) {
        return null;
      }
      return rect;
    },
    dropdownX() {
      if (!this.anchorRect) {
        return 0;
      }
      const rightSpace = window.innerWidth - this.anchorRect.right;
      if (rightSpace < this.$options.dropdownWidth) {
        return Math.max(8, this.anchorRect.right - this.$options.dropdownWidth);
      }
      return this.anchorRect.left;
    },
    dropdownY() {
      if (!this.anchorRect) {
        return 0;
      }
      const spaceBelow = window.innerHeight - this.anchorRect.bottom;
      if (spaceBelow < this.$options.dropdownHeight) {
        return Math.max(8, this.anchorRect.top - this.$options.dropdownHeight);
      }
      return this.anchorRect.bottom;
    },
    dropdownStyle() {
      return {
        position: "fixed",
        left: `${this.dropdownX}px`,
        top: `${this.dropdownY}px`,
        width: `${this.$options.dropdownWidth}px`,
        zIndex: 2400,
      };
    },
    restrictionOnLabel() {
      if (this.restrictionType === PriceAndRestrictionsService.closedDepartureRestrictionName) {
        return this.$t("Закрыть на выезд");
      }
      return this.$t("Закрыть на заезд");
    },
    options() {
      return [
        {
          value: 1,
          label: this.restrictionOnLabel,
        },
        {
          value: 0,
          label: this.$t("Нет ограничения"),
        },
      ];
    },
  },
  watch: {
    anchorEl: {
      immediate: true,
      handler(v) {
        this.syncPositionListeners(Boolean(v));
      },
    },
  },
  beforeUnmount() {
    this.syncPositionListeners(false);
  },
  methods: {
    syncPositionListeners(active) {
      if (typeof window === "undefined") {
        return;
      }
      if (this._positionListener) {
        window.removeEventListener("scroll", this._positionListener, true);
        window.removeEventListener("resize", this._positionListener);
        this._positionListener = null;
      }
      if (!active) {
        return;
      }
      this._positionListener = () => {
        this.positionTick += 1;
        if (this.anchorEl && !this.anchorEl.isConnected) {
          this.$emit("close");
        }
      };
      window.addEventListener("scroll", this._positionListener, true);
      window.addEventListener("resize", this._positionListener);
    },
    applyValue(value) {
      const nextValue = Number(value) ? 1 : 0;
      if (nextValue !== this.normalizedSelectedValue) {
        this.$emit("apply", nextValue);
      }
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" module>
.dropdown {
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
</style>
