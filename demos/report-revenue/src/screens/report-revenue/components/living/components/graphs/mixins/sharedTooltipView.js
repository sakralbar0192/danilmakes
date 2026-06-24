import { dateToMoment } from "@/utils/date";
import capitalizeFirstLetter from "@/utils/string";
import RevenueReportModel from "@/models/reports/revenue/revenue-report";
import RevenueReportService from "@/services/reports/revenue-report";
import { mapGetters } from "vuex";
import moment from "moment";
import RevenueReportPrimaryModel from "@/models/reports/revenue/revenue-report-primary";
import colors from "@/utils/colors";
import strategiesDatasetDictionary from "../dictionaries/strategiesDatasetDictionary";

export default {
  data() {
    return {
      tooltipData: [],
      defaultValue: Object.freeze({
        dot: "dot",
        square: "square",
        percent: "percent",
        today: "today",
        past: "past",
        future: "future",
        color: colors.success.light,
      }),
    };
  },
  computed: {
    ...mapGetters("revenueReport", ["categorySelectedText", "categorySelectedAttributeText", "currentGroupTypeId", "currentGroupType"]),
    currentPhase() {
      return this.tooltipData?.[0]?.element?.raw?.phase || "past";
    },
    currentDateInTooltip() {
      return this.tooltipData?.[0]?.element?.raw?.rawDay || this.tooltipData?.[0]?.element?.$context?.raw?.rawDay;
    },
    currentDateInTooltipFormatted() {
      let result = "";
      if (this.currentGroupTypeId === strategiesDatasetDictionary.months) {
        result = RevenueReportPrimaryModel.groupByMethods[this.currentGroupType].tableFormatter(this.currentDateInTooltip);
      } else {
        const momentDateInTooltip = dateToMoment(this.currentDateInTooltip, RevenueReportService.sendingDataFormat);
        result = momentDateInTooltip.outputDate;
      }
      return result;
    },
    currentWeekDayInTooltipFormatted() {
      const momentDateInTooltip = dateToMoment(this.currentDateInTooltip, RevenueReportService.sendingDataFormat);
      return ` (${capitalizeFirstLetter(momentDateInTooltip.moment.format("dd"))})`;
    },
    currentValueSoloDatasetInTooltip() {
      let value = 0;
      if (this.tooltipData?.[0]?.element?.raw) {
        value = this.tooltipData?.[0]?.element?.raw?.value;
      }
      return `${RevenueReportModel.formattedValue((value.toFixed()))} ${this.hotel.currency_sign}`;
    },
    currentTooltipData() {
      return (this.tooltipData || []).map(data => data?.element?.$context?.raw || {});
    },
    currentDayInTooltip() {
      return this.chartData?.datasets?.["0"].data?.find(data => data.phase === "today")?.day || RevenueReportPrimaryModel.formatDateWithDay(moment().format(RevenueReportService.sendingDataFormat));
    },
    currentDay() {
      return moment().format(RevenueReportService.showDataFormat);
    },
    captionWithoutCount() {
      return this.categorySelectedText;
    },
    datasetExternalData() {
      return this.tooltipData?.[0]?.element?.raw?.externalData || this.tooltipData?.[0]?.element?.$context?.raw?.externalData;
    },
  },
  methods: {
    formatTooltipValue(value, isPercent, fractions = 0) {
      let config;
      if (fractions > 0) {
        config = {
          maximumFractionDigits: fractions,
          minimumFractionDigits: fractions,
        };
      }
      return `${RevenueReportModel.formattedValue(value, config)} ${isPercent ? "%" : this.hotel.currency_sign}`;
    },
  },
};
