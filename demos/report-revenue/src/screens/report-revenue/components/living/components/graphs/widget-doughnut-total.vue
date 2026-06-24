<template>
  <b-widget-wrapper
    :loading="false"
    :title="$t('Доход за все категории и доп. услуги')"
    :class="$style['doughnut-total']"
    :has-data="true"
  >
    <div class="d-flex flex-column align-center">
      <GraphPieTotal
        :chart-data="chartData"
      />
      <section class="mt-10 d-flex align-stretch flex-column">
        <article v-for="item in legendItems" :key="item.id" class="d-flex align-center justify-space-between gap-x-ingroup">
          <div class="d-flex align-center gap-x-ingroup">
            <div class="bnovo-report-revenue__square mr-0" :style="{backgroundColor: item.color}"/>
            <small>
              {{ item.label }}
            </small>
          </div>
          <div class="d-flex align-center gap-x-ingroup">
            <small class="font-weight-bold">
              {{ `${getValueFormatted(item.value)} ${hotel.currency_sign}` }}
            </small>
            <small :style="{width: '42px'}">
              ({{ item.percent }}%)
            </small>
          </div>
        </article>
      </section>
    </div>
  </b-widget-wrapper>
</template>

<script>
import { mapState } from "vuex";
import colors from "@/utils/colors";
import RevenueReportModel from "@/models/reports/revenue/revenue-report";
import GraphPieTotal from "./graph-doughnut-total.vue";

export default {
  name: "BnovoReportRevenueGraphDoughnutTotal",
  components: { GraphPieTotal },
  computed: {
    ...mapState("revenueReport", ["isReportDataFetching", "tableData", "servicesData"]),
    chartData() {
      return [this.tableData.total.selected.amount, this.servicesData.all];
    },
    total() {
      return this.chartData.reduce((acc, item) => acc + item, 0);
    },
    percentIncome() {
      if (this.total === 0) return 0;
      const ratio = (this.tableData.total.selected.amount / this.total) * 100;
      return Math.round(ratio);
    },
    percentServices() {
      return 100 - this.percentIncome;
    },
    legendItems() {
      return [
        {
          id: 1,
          label: this.$t("проживание"),
          color: colors.success.light,
          value: this.tableData.total.selected.amount,
          percent: this.percentIncome,
        },
        {
          id: 2,
          label: this.$t("доп. услуги"),
          color: this.$vuetify?.theme?.currentTheme?.sand ?? "#F39509",
          value: this.servicesData.all,
          percent: this.percentServices,
        },
      ];
    },
  },
  methods: {
    getValueFormatted(v) {
      return RevenueReportModel.formattedValue(v, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
  },
};
</script>

<style module lang="scss">
.doughnut-total {
  :global(.b-widget-wrapper__title-bar__text) {
    font-size: 16px !important;
  }
}
</style>
