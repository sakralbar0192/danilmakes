import modules from "@/screens/report-revenue/assets/modules";
import strategiesDictionary from "../dictionaries/strategiesDatasetDictionary";
import orderDictionary from "../dictionaries/orderDictionary";
import orderStrategies from "./orderStrategies";

export default {
  [strategiesDictionary.dates]: {
    [strategiesDictionary.filled]: {
      getDatasetConfig(vm, data) {
        return Object.seal({
          type: "line",
          label: data.label,
          data: vm.getChartDataSource,
          borderColor: vm?.$vuetify?.theme?.currentTheme?.primary,
          borderSkipped: true,
          borderWidth: 2,
          fill: true,
          pointRadius: 0,
          spanGaps: true,
          backgroundColor: modules.primaryGradient,
          segment: vm.getSegmentObjectFunction(),
          specType: "",
          order: orderStrategies[orderDictionary.first],
        });
      },
      getFutureDatasetConfig(vm) {
        return Object.seal({
          type: "line",
          label: vm.getFutureDatasetLabel(),
          // specType для отображения в легенде
          specType: "future",
          data: [],
          borderColor: vm?.$vuetify?.theme?.currentTheme?.primary,
          order: orderStrategies[orderDictionary.third],
        });
      },
    },
    [strategiesDictionary.notFilled]: {
      getDatasetConfig(vm, data) {
        return Object.seal({
          type: "line",
          label: data.label,
          data: vm.getChartDataSource,
          borderColor: vm?.$vuetify?.theme?.currentTheme?.primary,
          borderSkipped: true,
          fill: false,
          borderWidth: 2,
          pointRadius: 0,
          spanGaps: true,
          backgroundColor: modules.primaryGradient,
          segment: vm.getSegmentObjectFunction(),
          specType: "",
          order: orderStrategies[orderDictionary.first],
        });
      },
      getFutureDatasetConfig(vm) {
        return Object.seal({
          type: "line",
          label: vm.getFutureDatasetLabel(),
          // specType для отображения в легенде
          specType: "future",
          data: [],
          borderColor: vm?.$vuetify?.theme?.currentTheme?.primary,
          order: orderStrategies[orderDictionary.third],
        });
      },
    },
  },
  [strategiesDictionary.months]: {
    [strategiesDictionary.default]: {
      getDatasetConfig(vm, data) {
        return Object.seal({
          type: "bar",
          label: data.label,
          data: vm.getChartDataSource,
          borderColor: vm?.$vuetify?.theme?.currentTheme?.primary,
          borderRadius: 5,
          borderSkipped: false,
          maxBarThickness: 23,
          datasetKey: "fact",
          backgroundColor: (element) => {
            if (["future", "today"].includes(element?.raw?.phase)) {
              return "#7ec8ea";
            }
            return vm.$vuetify.theme.currentTheme.primary;
          },
          specType: "",
          order: orderStrategies[orderDictionary.first],
        });
      },
      getFutureDatasetConfig(vm) {
        return Object.seal({
          type: "line",
          label: vm.getFutureDatasetLabel(),
          // specType для отображения в легенде
          specType: "box",
          data: [],
          borderColor: "#7ec8ea",
          order: orderStrategies[orderDictionary.third],
        });
      },
      getPlanDatasetConfig(vm, data) {
        return Object.seal({
          type: "bar",
          label: data.label,
          data: vm.getPlanDataSource,
          borderColor: "#DDDDE3",
          borderWidth: 2,
          borderRadius: 5,
          borderSkipped: false,
          maxBarThickness: 23,
          backgroundColor: vm.$vuetify?.theme?.currentTheme?.secondary?.base,
          specType: "",
          order: orderStrategies[orderDictionary.fourth],
          datasetKey: "plan",
        });
      },
    },
  },
};
