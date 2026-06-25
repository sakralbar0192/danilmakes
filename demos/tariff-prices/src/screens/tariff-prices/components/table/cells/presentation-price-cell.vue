<template>
  <v-card
    :height="$options.presentationCellHeight"
    :class="['d-flex flex-column align-center justify-center px-ingroup', cellClasses]"
  >
    <p
      :class="$style['price-text']"
      role="presentation"
      tabindex="-1"
    >
      <span :class="$style['price-value']">
        {{ displayedPriceValue }}
      </span>
      <span
        v-if="!withoutCaption"
        :class="$style['caption--presentation']"
      >
        {{ mockedPrice.caption }}
      </span>
    </p>
  </v-card>
</template>

<script>
import { mapGetters } from "vuex";
import { presentationCellHeight } from "../config/table-grid-metrics.js";
import { priceCellPresentationModes } from "../../../config/screen-config.js";
import getPresentationModeCaption from "../utils/get-presentation-mode-caption.js";

export default {
  name: "TariffPricesTablePresentationPriceCell",
  props: {
    withoutCaption: {
      type: Boolean,
      default: false,
    },
    presentationMode: {
      type: String,
      default: "",
    },
    legendSwatch: {
      type: Boolean,
      default: false,
    },
  },
  presentationCellHeight,
  priceCellDynamicPresentationMode: priceCellPresentationModes.dynamic,
  priceCellDefaultPresentationMode: priceCellPresentationModes.default,
  priceCellManualPresentationMode: priceCellPresentationModes.manual,
  priceCellClosedPresentationMode: priceCellPresentationModes.closed,
  computed: {
    ...mapGetters("tariffPricesAndRestrictions", [
      "isCurrentTariffDepend",
      "isDynamicPricesModeEnabled",
      "hasExtraChargesCategories",
    ]),
    cellClasses() {
      return [
        this.$style["price-cell"],
        {
          [this.$style["price-cell-main"]]: true,
          [this.$style["price-cell-closed"]]: this.mockedPrice.closed,
          [this.$style["price-cell-manual"]]: this.mockedPrice.manual,
          [this.$style["price-cell-dynamic"]]: this.mockedPrice.dynamic,
          [this.$style["price-cell-presentation"]]: this.presentationMode,
          [this.$style["price-cell-legend"]]: this.legendSwatch && !this.mockedPrice.closed,
          bordered: this.presentationMode,
        },
      ];
    },
    displayedPriceValue() {
      return Number(this.mockedPrice.value).toLocaleString("ru-RU");
    },
    mockedPrice() {
      const caption = getPresentationModeCaption(this.presentationMode, {
        isDynamicPricesModeEnabled: this.isDynamicPricesModeEnabled,
        isCurrentTariffDepend: this.isCurrentTariffDepend,
        hasExtraChargesCategories: this.hasExtraChargesCategories,
      });
      return Object.seal({
        unlocked: false,
        manual: this.presentationMode === priceCellPresentationModes.manual,
        dynamic: this.presentationMode === priceCellPresentationModes.dynamic,
        closed: this.presentationMode === priceCellPresentationModes.closed,
        originalValue: null,
        value: 3000,
        caption: this.$t(caption ?? "базовые"),
      });
    },
  },
};
</script>

<style lang="scss" module>
@import '../../../styles/variables.scss';

.caption--presentation {
  color: $caption !important;
  font-size: 10px;
  font-weight: normal;
  font-style: normal;
  text-align: center;
}

.price-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 12px !important;
  box-sizing: border-box;

  .price-text {
    white-space: nowrap;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: $cell-width;
    height: $cell-height;
    pointer-events: none;
    color: $price-cell-default-text-color;
    max-width: 100%;
    margin: 0;
  }

  .price-value {
    text-align: center;
  }

  &-main {
    background-color: $main-cell-bg-color !important;
  }

  &-legend {
    background-color: $sub-cell-bg-color !important;
  }

  &-dynamic {
    .price-value {
      font-style: italic;

      &::after {
        content: '*';
        position: relative;
        right: 3px;
        color: $tariff-dynamic-marker;
        text-decoration: none;
        background-color: transparent;
      }
    }
  }

  &-manual {
    .price-value {
      font-weight: 600;
      color: $main;
      font-style: normal;

      &::after {
        content: '';
        display: none;
      }
    }
  }

  &-closed {
    background-color: $closed-bg-color !important;
    border-left: 1px solid $closed-bg-color !important;

    .price-value {
      text-decoration: line-through;
    }
  }
}
</style>
