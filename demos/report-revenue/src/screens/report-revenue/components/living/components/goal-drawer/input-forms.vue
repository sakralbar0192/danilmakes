<template>
  <div :class="{ 'd-flex flex-column gap-outer': isMobileDevice }">
    <v-row v-if="isDesktopDevice" class="font-weight-bold" no-gutters>
      <b-col :style="{ maxWidth: '120px' }"/>
      <b-col
        v-for="(header, key) in headers"
        :key="`header-${key}`"
        cols="3"
      >
        {{ header }}
      </b-col>
    </v-row>

    <template v-if="isMobileDevice">
      <div
        v-for="(monthData, monthKey) in (yearsData[selectedYear] || {})"
        :key="selectedYear + monthKey"
        class="d-flex flex-column gap-ingroup"
      >
        <v-row no-gutters>
          <b-col class="font-weight-bold text-h4">
            {{ $options.monthTitleMap.get(monthKey) }}
          </b-col>
          <b-col cols="4" class="d-flex justify-end">
            <b-btn
              text-inline
              color="error"
              @click="clearMonth(monthKey)"
            >
              <v-icon left class="icon-cross" color="error"/>
              {{ $t("Сбросить данные") }}
            </b-btn>
          </b-col>
        </v-row>
        <v-row no-gutters>
          <b-col cols="6" class="d-flex flex-column gap-ingroup">
            <div>{{ headers.revenue }}</div>
            <b-text-field
              v-mask="$options.constraints.revenue.mask"
              :min="$options.constraints.revenue.min"
              :max="$options.constraints.revenue.max"
              number
              :value="monthData.revenue"
              @input="updateMetric(monthKey, 'revenue', $event)"
            />
          </b-col>
        </v-row>
        <v-row no-gutters class="gap-ingroup">
          <b-col class="d-flex flex-column gap-ingroup">
            <div>{{ headers.adr }}</div>
            <b-text-field
              v-mask="$options.constraints.adr.mask"
              :min="$options.constraints.adr.min"
              :max="$options.constraints.adr.max"
              number
              :value="monthData.adr"
              @input="updateMetric(monthKey, 'adr', $event)"
            />
          </b-col>
          <b-col class="d-flex flex-column gap-ingroup">
            <div>{{ headers.load }}</div>
            <b-text-field
              v-mask="$options.constraints.load.mask"
              :min="$options.constraints.load.min"
              :max="$options.constraints.load.max"
              number
              :value="monthData.load"
              @input="updateMetric(monthKey, 'load', $event)"
            />
          </b-col>
        </v-row>
      </div>
    </template>
    <template v-else>
      <div v-for="(monthData, monthKey) in (yearsData[selectedYear] || {})" :key="selectedYear + monthKey">
        <v-row no-gutters>
          <b-col cols="2" class="pa-2 pl-0 text-left font-weight-bold">
            {{ $options.monthTitleMap.get(monthKey) }}
          </b-col>

          <b-col
            v-for="(metric, key) in monthData"
            :key="selectedYear + monthKey + key"
            cols="3"
            class="pa-2 d-flex align-center justify-center"
          >
            <b-text-field
              v-mask="$options.constraints[key].mask"
              :min="$options.constraints[key].min"
              :max="$options.constraints[key].max"
              :value="metric"
              number
              @input="updateMetric(monthKey, key, $event)"
            />
          </b-col>

          <b-col
            v-show="canShowClearAction(monthData)"
            cols="auto"
            :class="$style['month-row']"
          >
            <b-btn
              text-inline
              small
              @click="clearMonth(monthKey)"
            >
              <v-icon class="icon-cross" color="error"/>
            </b-btn>
          </b-col>
        </v-row>
      </div>
    </template>
  </div>
</template>

<script>
import { mask } from "vue-the-mask";
import AutomationService from "@/services/automation";
import arrayHelpers from "@/utils/array-helpers";

export default {
  name: "BnovoReportRevenueGoalInputForms",
  directives: { mask },
  props: {
    yearsData: {
      type: Object,
      required: true,
    },
    selectedYear: {
      type: Number,
      required: true,
    },
  },
  constraints: {
    revenue: {
      min: "1",
      max: "",
      mask: "###############",
    },
    adr: {
      min: "1",
      max: "",
      mask: "###############",
    },
    load: {
      min: "1",
      max: "100",
      mask: "###",
    },
  },
  monthTitleMap: arrayHelpers.toMap(AutomationService.monthsOfYearList, "value", "title"),
  computed: {
    headers() {
      return {
        revenue: `${this.$t("Доход")}, ${this.hotel.currency_sign}`,
        adr: `${this.$t("ADR")}, ${this.hotel.currency_sign}`,
        load: `${this.$t("Загрузка")}, %`,
      };
    },
  },
  methods: {
    canShowClearAction(monthData) {
      return (monthData.revenue != null && monthData.revenue !== "")
        || (monthData.adr != null && monthData.adr !== "")
        || (monthData.load != null && monthData.load !== "");
    },
    updateMetric(month, metric, value) {
      this.$emit("update:yearsData", {
        month,
        metric,
        value,
      });
    },
    clearMonth(month) {
      ["revenue", "adr", "load"].forEach((key) => {
        this.updateMetric(month, key, null);
      });
    },
  },
};
</script>

<style module lang="scss">
.month-row {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
