import modules from "@/screens/report-revenue/assets/modules";
import uid from "@/utils/uid";
import RevenueReportService from "@/services/reports/revenue-report";
import moment from "moment";
import { mapGetters } from "vuex";
import orderDictionary from "../dictionaries/orderDictionary";
import orderStrategies from "../strategies/orderStrategies";
import chartMainDatasetStrategies from "../strategies/chartMainDatasetStrategies";
import strategiesDatasetDictionary from "../dictionaries/strategiesDatasetDictionary";
import periodDictionary from "../dictionaries/periodDictionary";

const SEGMENT_OBJECT = Object.seal({
  borderDash(ctx) {
    const phaseColor = {
      future: [6, 6], today: [6, 6], past: [],
    };
    return phaseColor[ctx.p0.raw.phase];
  },
  borderWidth(ctx) {
    const phaseWidth = {
      future: 2, today: 2, past: 3,
    };
    return phaseWidth[ctx.p0.raw.phase];
  },
  backgroundColor(ctx) {
    const phaseColor = {
      future: "rgba(0, 0, 0, 0)",
      today: "rgba(0, 0, 0, 0)",
      past: modules.primaryGradient(ctx),
    };
    return phaseColor[ctx.p0.raw.phase];
  },

});

const DEFAULT_VALUES_TICKS_LIMIT = Object.freeze({
  default: 5,
  extended: 9,
});

export default {
  data() {
    return {
      chartId: uid(),
      title: this.$t("Доход"),
      chartOptions: {},
      plugins: [modules.line, modules.legendMargin, modules.lineMarker],
      isCanvasRendered: false,
    };
  },
  leftAlignConstant: 20,
  lineStrategy: strategiesDatasetDictionary.filled,
  barStrategy: strategiesDatasetDictionary.default,
  created() {
    this.$options.leftAlignConstant = this.device.breakpoint.smAndDown
      ? this.$options.leftAlignConstant - 5
      : this.$options.leftAlignConstant;
  },
  mounted() {
    this.isCanvasRendered = true;
  },
  computed: {
    ...mapGetters("revenueReport", ["isPeriodMoreThanTwoMonths", "isPastAndFutureFullMonth", "currentGroupTypeId"]),
    currentDay() {
      return moment().format(RevenueReportService.showDataFormat);
    },
    captionWithoutCount() {
      return this.categorySelectedText;
    },
    getChartDataSource() {
      return [];
    },
    chartData() {
      const labels = [];
      const datasets = [];
      const dataSource = this.getChartDataSource;
      let isSomeFuture = false;
      let isTodayInRange = false;
      let isSomePast = false;
      const maxDisplayMonths = this.isCanvasRendered && !this.isMobile ? this.getMaxDisplayMonthsForCanvas() : 12;

      for (const item of dataSource) {
        labels.push(item.day);
        if (item.phase === periodDictionary.future) isSomeFuture = true;
        if (item.phase === periodDictionary.today) isTodayInRange = true;
        if (item.phase === periodDictionary.past) isSomePast = true;
      }

      const mainDatasetLabel = this.getMainDatasetLabel({
        isSomePast,
        isSomeFuture,
        isTodayInRange,
      });

      const mainDataset = this.getMainDatasetConfig({ label: mainDatasetLabel });

      if (Array.isArray(mainDataset)) {
        datasets.concat(mainDataset);
      } else {
        datasets.push(mainDataset);
      }

      datasets.push(...this.getExtraDatasets({
        isSomePast,
        isSomeFuture,
        isTodayInRange,
      }));

      if (isTodayInRange) {
        datasets.push(this.getCurrentDateDataset());
        if (this.currentGroupTypeId === strategiesDatasetDictionary.months && !isSomeFuture) {
          datasets.push(this.getAdditionalFutureDataset());
        }
        if (!isSomeFuture && !isSomePast) {
          datasets[0].specType = periodDictionary.future;
          datasets[0].order = orderStrategies[orderDictionary.fourth];
        }
      }

      if (isSomeFuture && !isSomePast) {
        datasets[0].order = orderStrategies[orderDictionary.fourth];
        datasets[0].specType = periodDictionary.future;
        datasets[0].label = this.getAdditionalFutureDataset().label;
      }

      if (isSomeFuture && isSomePast) {
        datasets.push(this.getAdditionalFutureDataset());
      }

      datasets.sort((a, b) => a.order - b.order);

      // выравнивание по левому краю для месячных графиков с динамическим расчетом
      if (this.currentGroupTypeId === strategiesDatasetDictionary.months) {
        const currentMonths = labels.length;

        if (currentMonths > maxDisplayMonths) {
          // Если месяцев больше максимума - оставить только последние maxDisplayMonths
          labels.splice(0, currentMonths - maxDisplayMonths);
          datasets.forEach(dataset => {
            dataset.data = dataset.data?.slice(currentMonths - maxDisplayMonths, dataset.data.length);
          });
        } else if (currentMonths < maxDisplayMonths) {
          // Если месяцев меньше максимума - добавить пустые элементы для выравнивания
          const paddingNeeded = maxDisplayMonths - currentMonths;
          labels.push(...new Array(paddingNeeded).fill(""));
        }
      }

      return {
        labels,
        datasets,
      };
    },
  },
  methods: {
    getSegmentObjectFunction() {
      return SEGMENT_OBJECT;
    },
    getMainDatasetLabel({
      isSomePast, isSomeFuture, isTodayInRange,
    }) {
      let result = this.$t("Итог");
      if (isSomePast && !isSomeFuture && !isTodayInRange) {
        result = this.$t("Итог Доход");
      } else if (!isSomePast && isSomeFuture) {
        result = this.$t("Сумма броней на будущие даты");
      } else if (!isSomePast && !isSomeFuture) {
        result = this.$t("Сумма броней на будущие даты");
      }

      return result;
    },
    getFutureDatasetLabel() {
      return this.$t("Сумма броней на будущие даты");
    },
    getAdditionalFutureDataset() {
      const isLineChart = this.currentGroupTypeId === strategiesDatasetDictionary.dates;
      const choosedStrategy = (isLineChart ? this.$options?.lineStrategy : this.$options?.barStrategy) || this.$options.lineStrategy;
      return chartMainDatasetStrategies?.[this.currentGroupTypeId]?.[choosedStrategy]?.getFutureDatasetConfig(this);
    },
    getCurrentDateDataset() {
      return {
        type: "line",
        label: this.$t("Текущая дата"),
        specType: periodDictionary.future,
        borderColor: this?.$vuetify?.theme?.currentTheme?.error,
        order: orderStrategies[orderDictionary.second],
      };
    },
    getMainDatasetConfig(data) {
      const isLineChart = this.currentGroupTypeId === strategiesDatasetDictionary.dates;
      const choosedStrategy = (isLineChart ? this.$options?.lineStrategy : this.$options?.barStrategy) || this.$options?.lineStrategy;
      return chartMainDatasetStrategies?.[this.currentGroupTypeId]?.[choosedStrategy]?.getDatasetConfig(this, data);
    },
    getMaxTicksLimit() {
      if (this.inModal) {
        return DEFAULT_VALUES_TICKS_LIMIT.extended;
      }
      return DEFAULT_VALUES_TICKS_LIMIT.default;
    },
    toggleFullScreen() {
      if (this.inModal) {
        this.$dialog.hide();
      } else this.$emit("toggle-full-screen");
    },
    getMaxDisplayMonthsForCanvas() {
      // Получаем ширину канваса через DOM элемент
      const canvas = document.querySelector(`#${this.chartId}`);

      if (!canvas || this.inModal) return 12; // fallback на старое значение

      const canvasWidth = canvas.offsetWidth;
      const estimatedLabelWidth = 57; // пикселей на одну подпись
      // Учитываем отступы слева и справа
      const availableWidth = canvasWidth - (this.$options.leftAlignConstant * 2);
      // Рассчитываем максимальное количество подписей
      const maxMonths = Math.floor(availableWidth / estimatedLabelWidth);

      // Минимум 2 месяца, максимум 24 месяца
      return Math.max(2, Math.min(maxMonths, 24));
    },
    /**
     * Собрать дополнительные датасеты к главному
     * @param phases
     */
    getExtraDatasets(phases) {
      return [];
    },
  },
};
