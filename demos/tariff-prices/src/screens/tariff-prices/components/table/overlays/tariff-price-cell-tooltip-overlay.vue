<template>
  <b-menu
    v-show="state.show"
    :value="menuValue"
    :position-x="state.menuX"
    :position-y="state.menuY"
    absolute
    :right="state.menuRight"
    :offset-x="!!state.menuRight"
    :offset-y="!!state.menuOffsetY"
    :max-width="String(state.maxWidth)"
    hide-overlay
    :close-on-content-click="false"
    content-class="tariff-price-cell-tooltip-menu"
    @input="onMenuInput"
  >
    <v-card
      data-price-cell-tooltip-root
      class="elevation-4"
      @mouseenter.native="onTooltipMouseEnter"
      @mouseleave.native="onTooltipMouseLeave"
    >
      <v-card-text
        v-if="state.mode === 'main' && state.mainSnapshot"
        class="py-inner px-inner text-typo"
      >
        <p class="ma-0">
          {{ $t("Продажа по динамической цене, рассчитанной на основании") }}
          <span class="nowrap">{{ $t("бизнес-правила") }}</span>.
        </p>
        <p class="ma-0 mt-inner">
          {{ $t("Базовая цена") }}
          <span>{{ state.mainSnapshot.basePriceOriginalValue }}</span>
        </p>
      </v-card-text>
      <v-card-text
        v-else-if="state.mode === 'reset' && state.resetSnapshot"
        class="py-inner px-inner text-typo"
      >
        <template v-if="state.resetSnapshot.kind === 'updating'">
          {{ resetUpdatingLabel }}
          {{ state.resetSnapshot.fetchedValue }}
          {{ state.resetSnapshot.currencySign }}
        </template>
        <template v-else-if="state.resetSnapshot.kind === 'unlocked'">
          <template v-if="state.resetSnapshot.currentTariffIsDependent">
            <template v-if="state.resetSnapshot.isExtraChargesRow">
              {{ $t("Вернуть цену по умолчанию") }}
            </template>
            <template v-else>
              {{ $t("Вернуть цену, рассчитанную от родительского тарифа") }}
            </template>
          </template>
          <template v-else>
            {{ $t("Вернуть цену по умолчанию") }}
          </template>
          {{ state.resetSnapshot.formattedOriginal }}
          {{ state.resetSnapshot.currencySign }}
        </template>
        <template v-else-if="state.resetSnapshot.kind === 'rule'">
          {{ $t("Вернуть цену рассчитанную правилом") }}
          {{ state.resetSnapshot.originalValue }}
          {{ state.resetSnapshot.currencySign }}
        </template>
        <template v-else-if="state.resetSnapshot.kind === 'default'">
          {{ $t("Вернуть цену по умолчанию") }}
          {{ state.resetSnapshot.formattedOriginal }}
          {{ state.resetSnapshot.currencySign }}
        </template>
      </v-card-text>
    </v-card>
  </b-menu>
</template>

<script>
export default {
  name: "TariffPriceCellTooltipOverlay",
  props: {
    controller: {
      type: Object,
      required: true,
    },
  },
  computed: {
    state() {
      return this.controller?.state || {};
    },
    menuValue() {
      return Boolean(this.controller?.state?.show);
    },
    resetUpdatingLabel() {
      return this.$t("Сбросить изменения до");
    },
  },
  mounted() {
    this._onWinScrollOrResize = () => {
      this.controller?.onExternalScrollOrResize?.();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", this._onWinScrollOrResize, { passive: true });
      window.addEventListener("resize", this._onWinScrollOrResize, { passive: true });
    }
  },
  beforeUnmount() {
    if (typeof window !== "undefined" && this._onWinScrollOrResize) {
      window.removeEventListener("scroll", this._onWinScrollOrResize);
      window.removeEventListener("resize", this._onWinScrollOrResize);
    }
  },
  methods: {
    onMenuInput(v) {
      this.controller?.onMenuInput?.(v);
    },
    onTooltipMouseEnter() {
      this.controller?.cancelHideSoon?.();
    },
    onTooltipMouseLeave(e) {
      this.controller?.resumeMainIfPointerReturnedToCell?.(e?.relatedTarget ?? null);
    },
  },
};
</script>
