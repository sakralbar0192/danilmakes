<template>
  <div v-if="items.length" class="report-revenue__table-shell">
    <b-data-table
      item-key="id"
      :headers="headers"
      :items="items"
      :has-actions="false"
      hide-default-header
      fixed-header
      :height="heightTable"
      group-by="timePeriod"
      class="report-revenue__table"
      :items-per-page="-1"
    >
    <template #header="{props}">
      <thead id="report-revenue-table-header" class="v-data-table-header">
        <tr>
          <th
            v-for="(header, index) in props.headers"
            :key="header.value"
            :rowspan="header.value === 'date' ? 2 : 1"
            :colspan="header.value !== 'date' ? visibleSubHeaders.length : 1"
            :style="{width: header.width, minWidth: header.width, whiteSpace: header.whiteSpace, minHeight: header.height, verticalAlign: 'baseline' }"
            :class="['text-center',
                     {'report-revenue__text--trunc': header.isNeedHideTitle},
                     header.customClasses
            ]"
          >
            <p
              :ref="`titleRefs_${index}`"
              :title="shouldShowTooltip[index] ? header.text : null"
              :class="{'text-truncate': header.isNeedHideTitle, 'report-revenue__header--trunc': header.isNeedHideTitle}"
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
                :class="['text-center', {'report-revenue__table-header--no-border': isShowBorderInHeader(index, subIndex)}]"
                :style="{maxWidth: subHeader.width, verticalAlign: 'baseline'}"
              >
                {{ subHeader.text }}
                <span
                  v-if="subHeader.bracketText"
                  class="report-revenue__text--muted report-revenue__table-subheader-hint"
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
        <td class="text-start report-revenue__table-cell--first report-revenue__sticky--default report-revenue__table-date">
          {{ formatDate(item.date) }}
        </td>
        <template
          v-for="value in itemValues"
        >
          <td
            v-for="subHeader in visibleSubHeaders"
            :key="`${value}-${subHeader.value}`"
            class="text-center report-revenue__table-cell"
          >
            <span class="report-revenue__table-value">{{ formatMetricCellValue(item[value], subHeader.value) }}</span>
            <span v-if="subHeader.value === 'load'" class="report-revenue__text--muted report-revenue__table-secondary">
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
        class="report-revenue__table-group-label report-revenue__sticky--default"
      >
        {{ group === $options.periodIndexes.future ? $t('Забронировано на будущий период') : $t('Прошедший период') }}
      </td>
    </template>
    <template #group.summary="{group}">
      <td
        class="text-start report-revenue__sticky--default report-revenue__table-summary-label"
      >
        {{ group === $options.periodIndexes.future ? $t('Итого на будущий период') : $t('Итого за прошедший период') }}
      </td>
      <template
        v-for="value in itemValues"
      >
        <td
          v-for="subHeader in visibleSubHeaders"
          :key="`${value}-${subHeader.value}`"
          class="text-center report-revenue__table-summary-cell"
        >
          <span class="report-revenue__table-value">{{ getFormattedTableValue(group, value, subHeader.value) }}</span>
          <span v-if="subHeader.value === 'load'" class="report-revenue__text--muted report-revenue__table-secondary">
            ({{ getFormattedTableValue(group, value, 'rooms') }})
          </span>
        </td>
      </template>
    </template>
    <template #body.append>
      <tfoot class="report-revenue__table-footer">
        <tr class="report-revenue__table-footer-row">
          <td class="text-start nowrap report-revenue__sticky--default report-revenue__table-footer-label">
            {{ $t('Итого за весь период') }}
          </td>
          <template
            v-for="value in itemValues"
          >
            <td
              v-for="subHeader in visibleSubHeaders"
              :key="`${value}-${subHeader.value}`"
              class="text-center report-revenue__table-footer-cell"
            >
              <span
                class="report-revenue__table-value"
                :data-test="getFooterDataTestAttribute(value, subHeader.value, 'value')"
              >
                {{ formatMetricCellValue(tableData?.total?.[value], subHeader.value) }}
              </span>
              <span
                v-if="subHeader.value === 'load'"
                :data-test="getFooterDataTestAttribute(value, subHeader.value, 'secondaryValue')"
                class="report-revenue__text--muted report-revenue__table-secondary"
              >
                {{ `(${tableData?.total?.[value]?.rooms || 0})` }}
              </span>
            </td>
          </template>
        </tr>
      </tfoot>
    </template>
  </b-data-table>
  </div>
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
  name: "ReportRevenueLivingPageTable",
  periodIndexes: {
    [periodDictionary.past]: 1,
    [periodDictionary.future]: 2,
  },
  defaultHeightCell: 48,
  defaultHeightTable: 760,
  footerTestAttributes: {
    [RevenueReportService.metricsBlockTypes.amount.key]: {
      value: "report-revenue-table-total-revenue",
      secondaryValue: null,
    },
    [RevenueReportService.metricsBlockTypes.revpar.key]: {
      value: "report-revenue-table-total-revpar",
      secondaryValue: null,
    },
    [RevenueReportService.metricsBlockTypes.adr.key]: {
      value: "report-revenue-table-total-adr",
      secondaryValue: null,
    },
    [RevenueReportService.metricsBlockTypes.load.key]: {
      value: "report-revenue-table-total-load",
      secondaryValue: "report-revenue-table-total-load-rooms",
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
          customClasses: "report-revenue__table-cell-footer--first report-revenue__sticky--default",
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
        customClasses: "report-revenue__table-header--no-border",
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
        const element = document.getElementById("report-revenue-table-header");
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

.report-revenue__table-shell {
  border: 1px solid var(--demo-border, #d8e8f2);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--demo-shadow, 0 4px 24px rgba(30, 139, 195, 0.08));
  background: var(--demo-surface, #fff);
}

.report-revenue__table {
  width: 100%;
}

.report-revenue__table-shell .v-data-table__wrapper,
.report-revenue__table-shell .b-data-table__scroll-area {
  overflow: auto !important;
  max-height: calc(100vh - 140px);
}

.report-revenue__table thead {
  position: sticky !important;
  top: 0 !important;
  z-index: 6;
}

.report-revenue__table thead th {
  background: linear-gradient(180deg, #e8f4fb 0%, #dceef8 100%);
  color: var(--demo-primary-deep, #136688);
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.02em;
  padding: 10px 12px;
  border-bottom: 2px solid #b8dce8;
  vertical-align: middle;
}

.report-revenue__table thead th p {
  margin: 0;
}

.report-revenue__table-subheader-hint {
  display: block;
  white-space: pre;
  font-weight: 400;
  margin-top: 2px;
}

.report-revenue__sticky--default {
  position: sticky !important;
  left: 0;
  z-index: 2;
}

.report-revenue__table-header--no-border {
  border-left: 0 !important;
}

.report-revenue__table tbody tr:nth-child(even) td {
  background-color: var(--demo-surface-muted, #f4f8fb);
}

.report-revenue__table tbody tr:hover td {
  background-color: var(--demo-primary-light, #eef6fa);
}

.report-revenue__table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--demo-border-soft, #e8eef3);
  font-variant-numeric: tabular-nums;
  transition: background-color 0.15s ease;
}

.report-revenue__table-value {
  font-weight: 500;
  color: #2d3748;
}

.report-revenue__table-secondary {
  margin-left: 4px;
}

.report-revenue__text--muted {
  color: var(--demo-text-muted, #6b7c8a);
  font-size: 12px;
}

.report-revenue__table-date {
  font-weight: 500;
  color: #334155;
  min-width: 124px;
  background-color: var(--demo-surface, #fff);
  border-right: 1px solid var(--demo-border-soft, #e8eef3);
  box-shadow: 4px 0 8px rgba(19, 102, 136, 0.06);
}

.report-revenue__table tbody tr:nth-child(even) .report-revenue__table-date {
  background-color: var(--demo-surface-muted, #f4f8fb);
}

.report-revenue__table tbody tr:hover .report-revenue__table-date {
  background-color: var(--demo-primary-light, #eef6fa);
}

.report-revenue__table-group-label {
  font-weight: 600;
  font-size: 13px;
  color: var(--demo-primary-dark, #16739f);
  padding: 12px 16px;
  background: #f0f7fc !important;
  border-top: 2px solid var(--demo-primary, #1e8bc3);
  border-bottom: 1px solid var(--demo-border, #d8e8f2);
}

.report-revenue__table-summary-label,
.report-revenue__table-summary-cell {
  background: #f0f7fc !important;
  font-weight: 600;
  color: var(--demo-primary-dark, #16739f);
}

.report-revenue__table-summary-label {
  min-width: 124px;
  border-right: 1px solid var(--demo-border-soft, #e8eef3);
  box-shadow: 4px 0 8px rgba(19, 102, 136, 0.06);
}

.report-revenue__table-footer {
  position: sticky;
  bottom: 0;
  z-index: 6;
}

.report-revenue__table-footer-row td {
  background: linear-gradient(180deg, #dceef8 0%, #e8f4fb 100%) !important;
  border-top: 2px solid #b8dce8;
  font-weight: 600;
  color: var(--demo-primary-deep, #136688);
}

.report-revenue__table-footer-label {
  min-width: 124px;
  border-right: 1px solid #b8dce8;
  box-shadow: 4px 0 8px rgba(19, 102, 136, 0.08);
}

.report-revenue__text--trunc {
  max-width: 124px;
  text-overflow: ellipsis;
  overflow: hidden;
}

.report-revenue__table-cell--first {
  background-color: inherit;
}

.report-revenue__table-cell-footer--first {
  z-index: 5 !important;
}

table tr td:nth-child(2) {
  border-left: 0 !important;
}

.report-revenue__text--trunc p.report-revenue__header--trunc {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: normal !important;
}

</style>

<style scoped lang="scss">
section .b-data-table::v-deep tr.v-row-group__header {
  position: sticky;
  top: 96px;
  z-index: 4;
}

section .b-data-table::v-deep tr.v-row-group__summary td {
  border-bottom: 1px solid var(--demo-border, #d8e8f2);
}
</style>
