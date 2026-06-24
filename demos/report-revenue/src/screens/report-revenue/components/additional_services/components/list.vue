<template>
  <v-row
    v-if="cards.length"
    dense
  >
    <b-col>
      <p class="text-h4 font-weight-bold mb-4">
        {{ $t('Услуги') }}
      </p>
      <div
        :class="[ 'set', {
          'overflow-x-auto': isMobileDevice,
          'd-flex flex-wrap': !isMobileDevice
        } ]"
        :style="{gridTemplateColumns: 'repeat(4, 1fr)'}"
      >
        <v-card
          v-for="card in cards"
          :key="card.id"
          width="236"
          outlined
          class="rounded-lg bordered-2"
          :style="{minWidth: '236px'}"
        >
          <v-card-title class="py-inner subtitle-1 font-weight-medium pb-0 mb-0">
            <p
              :ref="`titleRefs_${card.id}`"
              class="text-truncate"
              :title="shouldShowTooltip[card.id] ? card.name : null"
            >
              {{ card.name }}
            </p>
          </v-card-title>
          <v-card-text class="pb-inner pt-ingroup">
            <span class="font-weight-bold text-h1">
              {{ widgetValueFormatted(card.amount.toFixed()) }}
            </span>
            <span class="bnovo-report-revenue__card-sheet-sign">
              {{ hotel.currency_sign || "₽" }}
            </span>
          </v-card-text>
        </v-card>
      </div>
    </b-col>
  </v-row>
</template>

<script>
import RevenueReportModel from "@/models/reports/revenue/revenue-report";
import { mapState } from "vuex";

export default {
  name: "BnovoReportRevenueAdditionalServiceList",
  data() {
    return { shouldShowTooltip: {} };
  },
  computed: {
    ...mapState("revenueReport", ["servicesData", "selectedServices", "availableServices", "additionalServices"]),
    cards() {
      let cardsArray = [];
      if (this.selectedServices.length) {
        cardsArray = this.additionalServices.reduce((cards, service) => {
          let amount = Number(this.servicesData?.data?.[service.id]?.amount);
          if (!amount) {
            amount = 0;
          }
          if (this.selectedServices.includes(service.id)) {
            cards.push({
              id: service.id,
              name: service.name,
              amount,
            });
          }
          return cards;
        }, []);
      } else {
        const serviceDataKeys = Object.keys(this.servicesData.data);
        cardsArray = serviceDataKeys.reduce((cards, serviceId) => {
          const service = this.servicesData?.data?.[serviceId] || {};
          service.id = serviceId;
          cards.push(service);
          return cards;
        }, []);
      }
      return cardsArray.sort((a, b) => b.amount - a.amount);
    },
  },
  watch: {
    cards() {
      this.updateTooltipVisibility();
    },
  },
  mounted() {
    this.updateTooltipVisibility();
  },
  methods: {
    isTextOverflowing(element) {
      if (!element) return false;
      return element.scrollWidth > element.clientWidth;
    },
    updateTooltipVisibility() {
      setTimeout(() => {
        this.shouldShowTooltip = this.cards.reduce((obj, card) => {
          const ref = this.$refs[`titleRefs_${card.id}`]?.[0];
          if (ref) obj[card.id] = this.isTextOverflowing(ref);
          return obj;
        }, {});
      }, 500);
    },
    widgetValueFormatted(value) {
      return RevenueReportModel.formattedValue(value);
    },
  },
};
</script>
