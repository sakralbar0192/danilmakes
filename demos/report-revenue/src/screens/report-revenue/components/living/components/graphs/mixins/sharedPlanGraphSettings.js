import modules from "@/screens/report-revenue/assets/modules";
import { mapGetters } from "vuex";
import strategiesDatasetDictionary from "../dictionaries/strategiesDatasetDictionary";
import chartMainDatasetStrategies from "../strategies/chartMainDatasetStrategies";

/**
 * Миксин для графиков, которые должны иметь дополнительный датаест в виде плановых показателей.
 * Датасест добавляется только для групиировки по месяцам.
 */
export default {
  computed: {
    ...mapGetters("revenueReport", ["canShowPlanData"]),
    /**
     * Геттер получения источника данных для датасета. Переопределять в подмешаном компоненте
     */
    getPlanDataSource() {
      return [];
    },
    canShowPlan() {
      if (this.currentGroupTypeId !== strategiesDatasetDictionary.months) {
        return false;
      }
      return this.getPlanDataSource.length > 0 && this.canShowPlanData;
    },
  },
  created() {
    // Добавляем плагин для наложения шкал плана и факта.
    this.plugins = this.plugins.concat(modules.overlapPlan);
  },
  methods: {
    getExtraDatasets() {
      return this.canShowPlan ? [this.getPlanDatasetConfig()] : [];
    },
    /**
     * Получаем конфигурацию датасета для плановых показателей.
     */
    getPlanDatasetConfig() {
      const configs = chartMainDatasetStrategies[strategiesDatasetDictionary.months][strategiesDatasetDictionary.default];
      return configs.getPlanDatasetConfig(this, { label: this.$t("План") });
    },
  },
};
