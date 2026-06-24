<template>
  <b-tooltip-arrowed bottom max-width="200">
    <template #activator="{ on, attrs }">
      <span v-bind="attrs" class="d-inline-flex" v-on="on">
        <presentation-price-cell legend-swatch :presentation-mode="presentationMode"/>
      </span>
    </template>
    <slot/>
  </b-tooltip-arrowed>
</template>

<script>
import PresentationPriceCell from "../../table/cells/presentation-price-cell.vue";

/** Образец ячейки цены в легенде с подсказкой (RMS, зависимый тариф и т.д.). */
export default {
  name: "LegendPriceTooltipSwatch",
  components: { PresentationPriceCell },
  props: {
    presentationMode: {
      type: String,
      required: true,
    },
  },
};
</script>
