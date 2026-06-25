<template>
  <Teleport to="body">
    <v-card
      v-if="show && shouldRenderTooltip"
      data-other-tariffs-prices-tooltip-root
      :class="$style.card"
      :style="tooltipStyle"
    >
      <v-card-text class="px-0 pb-0">
        <div v-if="isLoadingOtherTariffsPrices" class="px-inner py-inner">
          {{ $t("Загружаем цены других тарифов") }}
        </div>

        <div v-else-if="otherTariffsPricesError" class="px-inner py-inner">
          {{ otherTariffsPricesError }}
        </div>

        <p
          v-for="item in otherTariffsPrices"
          :key="item.id"
          :class="['ma-0', 'px-inner', 'py-typo', $style['other-tariff']]"
        >
          <span class="text-truncate">{{ item.name }}</span>
          <span>{{ formatPrice(item.price) }}</span>
        </p>
        <div class="pa-inner" :class="$style['show-other-prices-hint']">
          <b-switch
            small
            :value="interfaceSettings.showOtherPricesHint"
            :label="$t('Не показывать эту подсказку')"
            hide-details
            @change="changeShowOtherPriceHint"
          />
        </div>
      </v-card-text>
    </v-card>
  </Teleport>
</template>

<script>
import { mapState } from "vuex";
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { scheduleOtherTariffsTooltipOpen,
  clearOtherTariffsTooltipOpenTimer } from "../lib/editing/resolve-other-tariffs-tooltip-open-state.js";
import { resolveOtherTariffsTooltipShouldRender } from "../lib/editing/resolve-other-tariffs-tooltip-should-render.js";

export default {
  name: "TariffPricesOtherTariffsPrices",
  inject: { findTariffTableCellRootByKey: { default: null } },
  props: {
    cellKey: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      show: false,
      showOpenTimerId: null,
      otherTariffsPricesError: "",
      positionTick: 0,
    };
  },
  tooltipHeight: 210,
  tooltipWidth: 320,
  computed: {
    ...mapState("hotel", ["rplans", "rplansByIds"]),
    ...mapState("tariffPricesAndRestrictions", ["currentTariff", "pricesCalendarModel", "partsLoadState", "interfaceSettings"]),
    anchorEl() {
      if (!this.cellKey || typeof this.findTariffTableCellRootByKey !== "function") {
        return null;
      }
      return this.findTariffTableCellRootByKey(this.cellKey);
    },
    idParts() {
      const [roomtypeId, childrenAgeId, bedTypeId] = (this.anchorEl?.dataset?.id || "").split("_");
      return {
        roomtypeId: roomtypeId || null,
        childrenAgeId: childrenAgeId || null,
        bedTypeId: bedTypeId || null,
      };
    },
    isExtraCharge() {
      return !!this.idParts.childrenAgeId;
    },
    otherTariffs() {
      const currentTariffId = this.currentTariff?.id;
      return (this.rplans || [])
        .filter(tariff => tariff.id !== currentTariffId);
    },
    otherTariffsPrices() {
      if (this.isLoadedOtherTariffsPrices) {
        return this.otherTariffs.map(tariff => ({
          price: this.pricesCalendarModel?.getPrice?.({
            id: this.anchorEl?.dataset?.id || "",
            tariffId: tariff.id,
            day: { date: this.anchorEl?.dataset?.date || "", weekday: this.anchorEl?.dataset?.weekday || "" },
            isDynamicPricesModeEnabled: PriceAndRestrictionsService.planUsesRmsPricing(
              this.rplansByIds,
              tariff.id,
            ),
            parentInfo: {},
            getOtherTariffPrice: true,
          })?.value ?? "—",
          name: tariff.name,
          id: tariff.id,
        }));
      } return this.otherTariffs;
    },
    shouldRenderTooltip() {
      return resolveOtherTariffsTooltipShouldRender({
        anchorEl: this.anchorEl,
        isLoading: this.isLoadingOtherTariffsPrices,
        error: this.otherTariffsPricesError,
        itemsLength: this.otherTariffsPrices?.length || 0,
      });
    },
    isLoadingOtherTariffsPrices() {
      return this.isExtraCharge ? this.partsLoadState.otherTariffsExtraLoading : this.partsLoadState.otherTariffsPricesLoading;
    },
    isLoadedOtherTariffsPrices() {
      return this.isExtraCharge ? this.partsLoadState.otherTariffsExtraLoaded : this.partsLoadState.otherTariffsPricesLoaded;
    },
    elClientRect() {
      void this.positionTick;
      const rect = this.anchorEl?.getBoundingClientRect?.();
      if (!rect || (rect.width === 0 && rect.height === 0)) {
        return null;
      }
      return rect;
    },
    tooltipX() {
      if (!this.elClientRect) {
        return 0;
      }
      const rightSpace = window.innerWidth - this.elClientRect.right;
      if (rightSpace < this.$options.tooltipWidth) {
        return Math.max(8, this.elClientRect.right - this.$options.tooltipWidth);
      }
      return this.elClientRect.left;
    },
    tooltipY() {
      if (!this.elClientRect) {
        return 0;
      }
      const spaceBelow = window.innerHeight - this.elClientRect.bottom;
      if (spaceBelow < this.$options.tooltipHeight) {
        return Math.max(8, this.elClientRect.top - this.$options.tooltipHeight + 10);
      }
      return this.elClientRect.bottom;
    },
    tooltipStyle() {
      return {
        position: "fixed",
        left: `${this.tooltipX}px`,
        top: `${this.tooltipY}px`,
        width: `${this.$options.tooltipWidth}px`,
        maxHeight: `${this.$options.tooltipHeight}px`,
        zIndex: 2400,
      };
    },
  },
  watch: {
    cellKey: {
      immediate: true,
      handler(v, prev) {
        this.onCellKeyChange(v, prev);
      },
    },
    show(v) {
      this.syncPositionListeners(v);
    },
  },
  beforeUnmount() {
    this.clearShowOpenTimer();
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
      };
      window.addEventListener("scroll", this._positionListener, true);
      window.addEventListener("resize", this._positionListener);
    },
    onCellKeyChange(v, prev) {
      this.clearShowOpenTimer();

      if (v) {
        if (v !== prev) {
          this.otherTariffsPricesError = "";
        }
        this.ensureExtraChargePricesLoaded();
        const expectedCellKey = v;
        scheduleOtherTariffsTooltipOpen({
          cellKey: v,
          expectedCellKey,
          onShow: () => {
            this.show = true;
          },
          scheduleTimer: (fn) => {
            this.showOpenTimerId = window.setTimeout(fn, 0);
            return this.showOpenTimerId;
          },
          clearTimer: () => this.clearShowOpenTimer(),
        });
      } else {
        this.show = false;
      }
    },
    clearShowOpenTimer() {
      clearOtherTariffsTooltipOpenTimer(() => {
        if (this.showOpenTimerId != null) {
          window.clearTimeout(this.showOpenTimerId);
          this.showOpenTimerId = null;
        }
      });
    },
    formatPrice(value) {
      return typeof value === "number"
        ? Number(value).toLocaleString("ru-RU")
        : value;
    },
    async ensureExtraChargePricesLoaded() {
      try {
        if (this.isExtraCharge) {
          await this.$store.dispatch("tariffPricesAndRestrictions/ensureOtherTariffsExtraLoaded");
        } else {
          await this.$store.dispatch("tariffPricesAndRestrictions/ensureOtherTariffsPricesLoaded");
        }
      } catch (err) {
        this.otherTariffsPricesError = this.$t("Не удалось загрузить цены других тарифов");
      }
    },
    async changeShowOtherPriceHint() {
      const success = await this.$store.dispatch("tariffPricesAndRestrictions/changeInterfaceSettings", { showOtherPricesHint: false });
      if (!success) {
        return;
      }
      await this.$dialog.message({
        type: "success",
        title: this.$t("Подсказка отключена"),
        content: this.$t("Подсказка отключена глобально для всех тарифов.<br/>"
          + "Вы можете всегда включить подсказку на странице Все тарифы, кликнув по кнопке «Настройки интерфейса»"),
        closable: true,
        buttons: [
          {
            text: this.$t("Понятно"),
            closeOnHandler: true,
            color: "primary",
          },
        ],
      });

      this.show = false;
    },
  },
};
</script>

<style lang="scss" module>
.other-tariff {
  display: flex;
  align-content: center;
  justify-content: space-between !important;
  gap: map-get($gaps , inner);
}

.card {
  position: relative;
  overflow: auto;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.show-other-prices-hint {
  position: sticky;
  bottom: 0;
  z-index: 2;
  background: white;
}
</style>
