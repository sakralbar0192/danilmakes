<template>
  <v-menu
    v-if="shouldRender"
    v-model="show"
    :position-x="menuX"
    :position-y="menuY"
    absolute
    offset-y
    hide-overlay
    @input="handleMenuInput"
  >
    <v-list width="180px" class="bnovo-dropdown-list" data-compact-boolean-dropdown-root>
      <v-list-item
        v-for="option in options"
        :key="option.value"
        data-test="compact-restriction-dropdown-option-text"
        class="pr-ingroup"
        @click="applyValue(option.value)"
      >
        <v-list-item-content>
          <v-list-item-title>
            <div class="d-flex">
              <span>
                {{ option.label }}
              </span>
              <v-icon
                v-if="option.value === selectedValue"
                color="primary"
                small
                class="icon-check ml-auto"
              />
            </div>
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
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
    return { show: false };
  },
  computed: {
    shouldRender() {
      return !!this.anchorEl;
    },
    anchorRect() {
      return this.anchorEl?.getBoundingClientRect?.() || {};
    },
    menuX() {
      return this.anchorRect.left || 0;
    },
    menuY() {
      return this.anchorRect.bottom || 0;
    },
    restrictionOnLabel() {
      if (this.restrictionType === PriceAndRestrictionsService.closedDepartureRestrictionName) {
        return this.$t("Закрыть на выезд");
      }
      return this.$t("Закрыть на заезд");
    },
    options() {
      const currentSelectedValue = Number(this.selectedValue) ? 1 : 0;
      const options = [
        {
          value: 1,
          label: this.restrictionOnLabel,
          selected: currentSelectedValue === 1,
        },
        {
          value: 0,
          label: this.$t("Нет ограничения"),
          selected: currentSelectedValue === 0,
        },
      ];

      return options;
    },
  },
  watch: {
    anchorEl: {
      immediate: true,
      handler(v) {
        this.show = Boolean(v);
      },
    },
  },
  methods: {
    applyValue(value) {
      const nextValue = Number(value) ? 1 : 0;
      if (nextValue !== Number(this.selectedValue ? 1 : 0)) {
        this.$emit("apply", nextValue);
      }
      this.$emit("close");
    },
    handleMenuInput(value) {
      if (value === false) {
        this.$emit("close");
      }
    },
  },
};
</script>
