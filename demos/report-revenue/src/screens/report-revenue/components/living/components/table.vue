<template>
  <b-data-table
    v-if="items.length"
    item-key="id"
    :headers="headers"
    :items="items"
    :has-actions="false"
    hide-default-header
    fixed-header
    :height="heightTable"
    group-by="timePeriod"
    class="bnovo-report-revenue__table"
    :items-per-page="-1"
  >
    <template #header="{props}">
      <thead id="bnovo-report-revenue-table-header" class="v-data-table-header">
        <tr>
          <th
            v-for="(header, index) in props.headers"
            :key="header.value"
            :rowspan="header.value === 'date' ? 2 : 1"
            :colspan="header.value !== 'date' ? visibleSubHeaders.length : 1"
            :style="{width: header.width, minWidth: header.width, whiteSpace: header.whiteSpace, minHeight: header.height, verticalAlign: 'baseline' }"
            :class="['text-center',
                     {'bnovo-report-revenue__text--trunc': header.isNeedHideTitle},
                     header.customClasses
            ]"
          >
            <p
              :ref="`titleRefs_${index}`"
              :title="shouldShowTooltip[index] ? header.text : null"
              :class="{'text-truncate': header.isNeedHideTitle, 'bnovo-report-revenue__header--trunc': header.isNeedHideTitle}"
            >
              {{ header.text }}
            </p>
          </th>
        </tr>
        <tr>
          <template
            v-for="(header, index) in props.headers"
          >
            <template v-if="header.value !== 'date'">
              <th
                v-for="(subHeader, subIndex) in visibleSubHeaders"
                :key="`${header.value}-${subHeader.value}`"
                :class="['text-center', {'bnovo-report-revenue__table-header--no-border': isShowBorderInHeader(index, subIndex)}]"
                :style="{maxWidth: subHeader.width, verticalAlign: 'baseline'}"
              >
                {{ subHeader.text }}
                <span
                  v-if="subHeader.bracketText"
                  class="bnovo-report-revenue__text--dark"
                  :style="{whiteSpace: subHeader.bracketText ? 'pre' : null, fontWeight: '400' }"
                >
                  {{ `(${subHeader.bracketText})` }}
                </span>
              </th>
            </template>
          </template>
        </tr>
      </thead>
    </template>
    <template #item="{item}">
      <tr>
        <td class="text-start bnovo-report-revenue__table-cell--first bnovo-report-revenue__sticky--default">
          {{ formatDate(item.date) }}
        </td>
        <template
          v-for="value in itemValues"
        >
          <td
            v-for="subHeader in visibleSubHeaders"
            :key="`${value}-${subHeader.value}`"
            class="text-center"
          >
            {{ formatMetricCellValue(item[value], subHeader.value) }}
            <span v-if="subHeader.value === 'load'" class="bnovo-report-revenue__text--dark">
              {{ `(${item[value]?.rooms || 0})` }}
            </span>
          </td>
        </template>
      </tr>
    </template>
    <template #group.header="{group}">
      <td
        v-if="isSplittedByTwoSection"
        :colspan="colsCount"
        class="font-weight-bold bnovo-report-revenue__table-cell--first bnovo-report-revenue__sticky--default"
      >
        {{ group === $options.periodIndexes.future ? $t('Забронировано на будущий период') : $t('Прошедший период') }}
      </td>
    </template>
    <template #group.summary="{group}">
      <td
        style="background-color: white; max-width: 124px"
        class="text-start bnovo-report-revenue__sticky--default bnovo-report-revenue__table-cell-footer--first font-weight-bold pr-8"
      >
        {{ group === $options.periodIndexes.future ? $t('Итого на будущий период') : $t('Итого за прошедший период') }}
      </td>
      <template
        v-for="value in itemValues"
      >
        <td
          v-for="subHeader in visibleSubHeaders"
          :key="`${value}-${subHeader.value}`"
          style="background-color: white;"
          class="text-center font-weight-bold"
        >
          {{ getFormattedTableValue(group, value, subHeader.value) }}
          <span v-if="subHeader.value === 'load'" class="bnovo-report-revenue__text--dark">
            ({{ getFormattedTableValue(group, value, 'rooms') }})
          </span>
        </td>
      </template>
    </template>
    <template #body.append>
      <tfoot class="bnovo-report-revenue__table-footer">
        <tr class="font-weight-bold">
          <td class="text-start nowrap bnovo-report-revenue__sticky--default bnovo-report-revenue__table-cell-footer--first">
            {{ $t('Итого за весь период') }}
          </td>
          <template
            v-for="value in itemValues"
          >
            <td
              v-for="subHeader in visibleSubHeaders"
              :key="`${value}-${subHeader.value}`"
              class="text-center"
            >
              <span :data-test="getFooterDataTestAttribute(value, subHeader.value, 'value')">
                {{ formatMetricCellValue(tableData?.total?.[value], subHeader.value) }}
              </span>
              <span
                v-if="subHeader.value === 'load'"
                :data-test="getFooterDataTestAttribute(value, subHeader.value, 'secondaryValue')"
                class="bnovo-report-revenue__text--dark"
              >
                {{ `(${tableData?.total?.[value]?.rooms || 0})` }}
              </span>
            </td>
          </template>
        </tr>
      </tfoot>
    </template>
  </b-data-table>
  <div v-else class="d-flex justify-center align-center py-8">
    <v-icon class="icon-alert-circle" left color="primary"/>
    {{ $t("Данные за выбранный период отсутствуют") }}
  </div>
</template>

<script>
import RevenueReportModel from "@/models/reports/revenue/revenue-report";
import { mapState, mapGetters } from "vuex";
import { nextTick } from "vue";
import RevenueReportPrimaryModel from "@/models/reports/revenue/revenue-report-primary";
import RevenueReportService from "@/services/reports/revenue-report";
import periodDictionary from "./graphs/dictionaries/periodDictionary";

export default {
  name: "BnovoReportRevenueLivingPageTable",
  periodIndexes: {
    [periodDictionary.past]: 1,
    [periodDictionary.future]: 2,
  },
  defaultHeightCell: 48,
  defaultHeightTable: 760,
  footerTestAttributes: {
    [RevenueReportService.metricsBlockTypes.amount.key]: {
      value: "bnovo-report-revenue-table-total-revenue",
      secondaryValue: null,
    },
    [RevenueReportService.metricsBlockTypes.revpar.key]: {
      value: "bnovo-report-revenue-table-total-revpar",
      secondaryValue: null,
    },
    [RevenueReportService.metricsBlockTypes.adr.key]: {
      value: "bnovo-report-revenue-table-total-adr",
      secondaryValue: null,
    },
    [RevenueReportService.metricsBlockTypes.load.key]: {
      value: "bnovo-report-revenue-table-total-load",
      secondaryValue: "bnovo-report-revenue-table-total-load-rooms",
    },
  },
  data() {
    return { shouldShowTooltip: [], pastCountCategories: 0 };
  },
  computed: {
    ...mapGetters("revenueReport", ["categorySelectedText", "currentGroupType"]),
    ...mapState("revenueReport", [
      "selectedCategories",
      "tableData",
      "availableCategories",
      "isReportDataFetching",
      "selectedMetrics",
    ]),
    ...mapState("hotelRoom", ["roomtypes"]),
    selectedRoomtypeIds() {
      return this.selectedCategories.length ? this.selectedCategories : this.availableCategories;
    },
    heightTable() {
      return this.items.length < (this.$options.defaultHeightTable / this.$options.defaultHeightCell) ? "auto" : "85vh";
    },
    subHeaders() {
      return [
        {
          text: `${this.$t("Доход")} ${this.hotel.currency_sign || "₽"}`,
          bracketText: null,
          align: "end",
          sortable: false,
          value: RevenueReportService.metricsBlockTypes.amount.key,
          width: "124px",
        },
        {
          text: `${this.$t("RevPAR")} ${this.hotel.currency_sign || "₽"}`,
          bracketText: null,
          align: "end",
          sortable: false,
          value: RevenueReportService.metricsBlockTypes.revpar.key,
          width: "124px",
        },
        {
          text: `${this.$t("ADR")} ${this.hotel.currency_sign || "₽"}`,
          bracketText: null,
          align: "end",
          sortable: false,
          value: RevenueReportService.metricsBlockTypes.adr.key,
          width: "124px",
        },
        {
          text: this.$t("Загрузка"),
          bracketText: this.$t("проданные номера"),
          align: "end",
          sortable: false,
          value: RevenueReportService.metricsBlockTypes.load.key,
          width: "172px",
        },
      ];
    },
    visibleSubHeaders() {
      const selectedMetricsSet = new Set(this.selectedMetrics);
      return this.subHeaders.filter(subHeader => selectedMetricsSet.has(subHeader.value));
    },
    headers() {
      const headers = [
        {
          text: this.$t("Дата"),
          align: "start",
          sortable: false,
          value: "date",
          width: "124px",
          height: `${this.$options.defaultHeightCell}px`,
          whiteSpace: "normal",
          isNeedHideTitle: false,
          customClasses: "bnovo-report-revenue__table-cell-footer--first bnovo-report-revenue__sticky--default",
        },
      ];

      headers.push({
        text: this.categorySelectedText,
        align: "center",
        sortable: false,
        value: "selected",
        width: `${136.5 * this.visibleSubHeaders.length}px`,
        height: `${this.$options.defaultHeightCell}px`,
        whiteSpace: "normal",
        isNeedHideTitle: false,
        customClasses: "bnovo-report-revenue__table-header--no-border",
      });

      this.selectedRoomtypeIds.forEach(roomtypeId => {
        const name = this.tableData?.total?.[roomtypeId]?.name;
        if (name) {
          headers.push({
            text: name,
            align: "center",
            sortable: false,
            value: roomtypeId,
            width: `${136.5 * this.visibleSubHeaders.length}px`,
            height: `${this.$options.defaultHeightCell}px`,
            whiteSpace: "normal",
            isNeedHideTitle: true,
            customClasses: null,
          });
        }
      });

      return headers;
    },
    itemValues() {
      return ["selected", ...this.selectedRoomtypeIds];
    },
    items() {
      return Object.entries(this.tableData?.data || {}).map(([date, info]) => {
        return {
          ...info,
          date,
          timePeriod: this.phaseDeterminant(date),
        };
      });
    },
    availableRoomtypes() {
      return this.roomtypes.filter(roomtype => this.selectedCategories.includes(roomtype.id));
    },
    disabledRoomtypes() {
      return (this.$store?.state?.hotelRoom?.roomtypes || []).reduce((disabledArr, roomtype) => {
        if (!(roomtype?.rooms || []).length) disabledArr[roomtype.id] = [];
        return disabledArr;
      }, {});
    },
    disabledRoomtypesArray() {
      return Object.keys(this.disabledRoomtypes);
    },
    selectedRoomtypesArray() {
      return Object.keys(this.selectedRoomtypes);
    },
    isSplittedByTwoSection() {
      const futureItemIndex = this.items.findIndex(item => item.timePeriod === this.$options.periodIndexes.future);
      let result = false;
      if (futureItemIndex !== -1) {
        result = futureItemIndex !== 0;
      }
      return result;
    },
    colsCount() {
      return this.itemValues.length * this.visibleSubHeaders.length + 1;
    },
  },
  watch: {
    headers: {
      handler() {
        this.updateOverflowingArray();
      },
    },
    isReportDataFetching: {
      handler(newVal) {
        if (!newVal) {
          this.updateStickyOffsetTr();
        }
      },
    },
  },
  mounted() {
    setTimeout(() => {
      this.updateOverflowingArray();
      this.updateStickyOffsetTr();
    }, 500);
  },
  methods: {
    /**
     * Получает числовое значение из табличных данных по группе, типу размещения и типу метрики
     *
     * @param {number} group - Идентификатор группы (periodIndexes)
     * @param {string} roomtypeId - Идентификатор типа комнаты или 'selected' для общих данных
     * @param {string} metricType - Тип метрики ('amount', 'revpar', 'adr', 'load', 'rooms')
     * @returns {number} Числовое значение метрики или 0, если данные отсутствуют
    */
    getTableDataValue(group, roomtypeId, metricType) {
      // Определяем ключ периода на основе group
      const periodKey = group === this.$options.periodIndexes.future ? "future" : "past";

      // Получаем значение с использованием optional chaining
      const value = this.tableData?.[periodKey]?.[roomtypeId]?.[metricType];

      // Возвращаем значение или 0 по умолчанию
      return Number(value || 0);
    },

    /**
     * Получает отформатированное значение для отображения в таблице
     *
     * @param {number} group - Идентификатор группы (periodIndexes)
     * @param {string} roomtypeId - Идентификатор типа комнаты или 'selected' для общих данных
     * @param {string} metricType - Тип метрики ('amount', 'revpar', 'adr', 'load', 'rooms')
     * @returns {string} Отформатированное строковое значение
   */
    getFormattedTableValue(group, roomtypeId, metricType) {
      const value = this.getTableDataValue(group, roomtypeId, metricType);

      // Форматируем в зависимости от типа метрики
      switch (metricType) {
        case "amount":
        case "revpar":
        case "adr":
          return this.formatCellValue(value);

        case "load":
          return this.formatCellValueWorkLoad(value);

        case "rooms":
          return value.toString();

        default:
          return this.formatCellValue(value);
      }
    },
    getFooterDataTestAttribute(itemValue, metricType, attributeType) {
      if (itemValue !== "selected") return null;
      return this.$options.footerTestAttributes?.[metricType]?.[attributeType] || null;
    },
    updateStickyOffsetTr() {
      this.$nextTick().then(() => {
        const element = document.getElementById("bnovo-report-revenue-table-header");
        if (element) {
          const height = element.getBoundingClientRect().height;
          document.querySelectorAll(".v-row-group__header").forEach(header => {
            header.style.top = `${height}px`;
          });
        }
      });
    },
    phaseDeterminant(date) {
      const phase = RevenueReportPrimaryModel.groupByMethods[this.currentGroupType].phaseDeterminant(date);
      return this.$options.periodIndexes?.[phase] || this.$options.periodIndexes.future;
    },
    formatCellValue(value, minimumFractionDigits = 2, maximumFractionDigits = 2) {
      const config = {
        maximumFractionDigits,
        minimumFractionDigits,
      };

      const number = Number(value || 0);

      return RevenueReportModel.formattedValue(number.toFixed(minimumFractionDigits), config);
    },
    formatCellValueWorkLoad(value, fractionDigit = 1) {
      return `${this.formatCellValue(value, fractionDigit)}%`;
    },
    formatMetricCellValue(item, metricType) {
      if (metricType === RevenueReportService.metricsBlockTypes.load.key) {
        return this.formatCellValueWorkLoad(item?.[metricType] || 0);
      }

      return this.formatCellValue(item?.[metricType] || 0);
    },
    formatDate(date) {
      return RevenueReportPrimaryModel.groupByMethods[this.currentGroupType].tableFormatter(date);
    },
    updateOverflowingArray() {
      this.$nextTick(async () => {
        await nextTick();
        const refs = this.$refs;
        const keys = Object.keys(refs);
        const arrayOverflowing = [];
        for (const key of keys) {
          const element = refs[key]?.[0];
          arrayOverflowing.push(this.isTextOverflowing(element));
        }
        this.shouldShowTooltip = arrayOverflowing;
      });
    },
    isTextOverflowing(element) {
      let result = false;
      if (element) {
        result = element.offsetHeight < element.scrollHeight;
      }
      return result;
    },
    isShowBorderInHeader(index, subIndex) {
      return subIndex === 0 && index === 1;
    },
  },
};
</script>

<style lang="scss">

.bnovo-report-revenue__table {
  width: 100%;
}

.v-data-table__wrapper {
  overflow: scroll !important;
  max-height: calc(100vh - 100px);
}

.bnovo-report-revenue__table thead {
  position: sticky !important;
  top: 0px !important;
  z-index: 6;
}

.bnovo-report-revenue__sticky--default {
  position: sticky !important;
  left: 0px;
}

.bnovo-report-revenue__table-header--no-border {
  border-left: 0px !important;
}

.bnovo-report-revenue__table-footer {
  position: sticky;
  bottom: 0px;
  background-color: $secondary-hover;
  z-index: 6;
}

.bnovo-report-revenue__text--trunc {
  max-width: 124px;
  text-overflow: ellipsis;
  overflow: hidden;
}

.bnovo-report-revenue__table-cell--first {
  background-color: $white;
  border-right: thin solid $border-color;
}

.bnovo-report-revenue__table-cell-footer--first {
  background-color: $secondary-hover;
  border-right: thin solid $border-color;
  z-index: 5 !important;
}

table tr td:nth-child(2) {
  border-left: 0px !important;
}

.bnovo-report-revenue__text--trunc p.bnovo-report-revenue__header--trunc {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: normal !important;
}

</style>

<style scoped lang="scss">
section .b-data-table::v-deep tr.v-row-group__header {
  position: sticky;
  top: 114px;
  z-index: 4;
  background-color: $white !important;
}
</style>
