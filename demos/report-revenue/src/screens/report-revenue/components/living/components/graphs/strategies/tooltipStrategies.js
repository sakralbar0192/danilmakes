import i18n from "@/plugins/i18n";
import colors from "@/utils/colors";
import graphTypesDictionary from "../dictionaries/graphTypesDictionary";
import periodDictionary from "../dictionaries/periodDictionary";
import strategiesDatasetDictionary from "../dictionaries/strategiesDatasetDictionary";

export default Object.seal({
  [graphTypesDictionary.plan]: {
    graphema: "currency",
    phase: {
      [periodDictionary.past]: {
        [strategiesDatasetDictionary.months]: {
          color: colors.secondary.base,
          title: i18n.t("План"),
          type: "square",
        },
        [strategiesDatasetDictionary.dates]: {
          color: colors.secondary.base,
          title: i18n.t("План"),
          type: "square",
        },
      },
      [periodDictionary.today]: {
        [strategiesDatasetDictionary.months]: {
          color: colors.secondary.base,
          title: i18n.t("План"),
          type: "square",
        },
        [strategiesDatasetDictionary.dates]: {
          color: colors.secondary.base,
          title: i18n.t("План"),
          type: "square",
        },
      },
      [periodDictionary.future]: {
        [strategiesDatasetDictionary.months]: {
          color: colors.secondary.base,
          title: i18n.t("План"),
          type: "square",
        },
        [strategiesDatasetDictionary.dates]: {
          color: colors.secondary.base,
          title: i18n.t("План"),
          type: "square",
        },
      },
    },
  },
  [graphTypesDictionary.loadPlan]: {
    graphema: "percent",
    phase: {
      [periodDictionary.past]: {
        [strategiesDatasetDictionary.months]: {
          color: colors.secondary.base,
          title: i18n.t("План"),
          type: "square",
        },
        [strategiesDatasetDictionary.dates]: {
          color: colors.secondary.base,
          title: i18n.t("План"),
          type: "square",
        },
      },
      [periodDictionary.today]: {
        [strategiesDatasetDictionary.months]: {
          color: colors.secondary.base,
          title: i18n.t("План"),
          type: "square",
        },
        [strategiesDatasetDictionary.dates]: {
          color: colors.secondary.base,
          title: i18n.t("План"),
          type: "square",
        },
      },
      [periodDictionary.future]: {
        [strategiesDatasetDictionary.months]: {
          color: colors.secondary.base,
          title: i18n.t("План"),
          type: "square",
        },
        [strategiesDatasetDictionary.dates]: {
          color: colors.secondary.base,
          title: i18n.t("План"),
          type: "square",
        },
      },
    },
  },
  [graphTypesDictionary.revenue]: {
    phase: {
      [periodDictionary.past]: {
        [strategiesDatasetDictionary.dates]: {
          color: colors.primary.base,
          title: i18n.t("Итог Доход"),
          type: "square",
        },
        [strategiesDatasetDictionary.months]: {
          color: colors.primary.base,
          title: i18n.t("Итог Доход"),
          type: "square",
        },
      },
      [periodDictionary.today]: {
        [strategiesDatasetDictionary.dates]: {
          color: colors.primary.base,
          title: i18n.t("Сумма броней"),
          type: "dot",
        },
        [strategiesDatasetDictionary.months]: {
          color: "#7ec8ea",
          title: i18n.t("Сумма броней"),
          type: "square",
        },
      },
      [periodDictionary.future]: {
        [strategiesDatasetDictionary.dates]: {
          color: colors.primary.base,
          title: i18n.t("Сумма броней"),
          type: "dot",
        },
        [strategiesDatasetDictionary.months]: {
          color: "#7ec8ea",
          title: i18n.t("Сумма броней"),
          type: "square",
        },
      },
    },
    title: i18n.t("Доход"),
    graphema: "currency",
  },
  [graphTypesDictionary.adr]: {
    title: i18n.t("ADR"),
    phase: {
      [periodDictionary.past]: {
        [strategiesDatasetDictionary.dates]: {
          color: colors.primary.base,
          title: i18n.t("Итог ADR"),
          type: "square",
        },
        [strategiesDatasetDictionary.months]: {
          color: colors.primary.base,
          title: i18n.t("Итог ADR"),
          type: "square",
        },
      },
      [periodDictionary.today]: {
        [strategiesDatasetDictionary.dates]: {
          color: colors.primary.base,
          title: i18n.t("ADR"),
          type: "dot",
        },
        [strategiesDatasetDictionary.months]: {
          color: "#7ec8ea",
          title: i18n.t("ADR"),
          type: "square",
        },
      },
      [periodDictionary.future]: {
        [strategiesDatasetDictionary.dates]: {
          color: colors.primary.base,
          title: i18n.t("ADR"),
          type: "dot",
        },
        [strategiesDatasetDictionary.months]: {
          color: "#7ec8ea",
          title: i18n.t("ADR"),
          type: "square",
        },
      },
    },
    graphema: "currency",
  },
  [graphTypesDictionary.load]: {
    title: i18n.t("Загрузка"),
    phase: {
      [periodDictionary.past]: {
        [strategiesDatasetDictionary.dates]: {
          color: colors.primary.base,
          title: i18n.t("Итог Загрузка"),
          type: "square",
        },
        [strategiesDatasetDictionary.months]: {
          color: colors.primary.base,
          title: i18n.t("Итог Загрузка"),
          type: "square",
        },
      },
      [periodDictionary.today]: {
        [strategiesDatasetDictionary.dates]: {
          color: colors.primary.base,
          title: i18n.t("Загрузка"),
          type: "dot",
        },
        [strategiesDatasetDictionary.months]: {
          color: "#7ec8ea",
          title: i18n.t("Загрузка"),
          type: "square",
        },
      },
      [periodDictionary.future]: {
        [strategiesDatasetDictionary.dates]: {
          color: colors.primary.base,
          title: i18n.t("Загрузка"),
          type: "dot",
        },
        [strategiesDatasetDictionary.months]: {
          color: "#7ec8ea",
          title: i18n.t("Загрузка"),
          type: "square",
        },
      },
    },
    graphema: "percent",
  },
  [graphTypesDictionary.revpar]: {
    title: i18n.t("RevPAR"),
    phase: {
      [periodDictionary.past]: {
        [strategiesDatasetDictionary.dates]: {
          color: colors.primary.base,
          title: i18n.t("Итог RevPAR"),
          type: "square",
        },
        [strategiesDatasetDictionary.months]: {
          color: colors.primary.base,
          title: i18n.t("Итог RevPAR"),
          type: "square",
        },
      },
      [periodDictionary.today]: {
        [strategiesDatasetDictionary.dates]: {
          color: colors.primary.base,
          title: i18n.t("RevPAR"),
          type: "dot",
        },
        [strategiesDatasetDictionary.months]: {
          color: "#7ec8ea",
          title: i18n.t("RevPAR"),
          type: "square",
        },
      },
      [periodDictionary.future]: {
        [strategiesDatasetDictionary.dates]: {
          color: colors.primary.base,
          title: i18n.t("RevPAR"),
          type: "dot",
        },
        [strategiesDatasetDictionary.months]: {
          color: "#7ec8ea",
          title: i18n.t("RevPAR"),
          type: "square",
        },
      },
    },
    graphema: "currency",
  },
  [graphTypesDictionary.combined]: {
    [graphTypesDictionary.adr]: {
      title: i18n.t("ADR"),
      phase: {
        [periodDictionary.past]: {
          color: "#F39509",
          title: i18n.t("Итог ADR"),
          type: "square",
        },
        [periodDictionary.today]: {
          color: "#F39509",
          title: i18n.t("ADR"),
          type: "dot",
        },
        [periodDictionary.future]: {
          color: "#F39509",
          title: i18n.t("ADR"),
          type: "dot",
        },
      },
      graphema: "currency",
    },
    [graphTypesDictionary.revpar]: {
      title: i18n.t("RevPAR"),
      phase: {
        [periodDictionary.past]: {
          color: colors.primary.blue,
          title: i18n.t("Итог RevPAR"),
          type: "square",
        },
        [periodDictionary.today]: {
          color: colors.primary.blue,
          title: i18n.t("RevPAR"),
          type: "dot",
        },
        [periodDictionary.future]: {
          color: colors.primary.blue,
          title: i18n.t("RevPAR"),
          type: "dot",
        },
      },
      graphema: "currency",
    },
    [graphTypesDictionary.load]: {
      title: i18n.t("Загрузка"),
      graphema: "percent",
      phase: {
        [periodDictionary.past]: {
          color: colors.primary.base,
          title: i18n.t("Итог Загрузка"),
          type: "square",
        },
        [periodDictionary.today]: {
          color: "#7ec8ea",
          title: i18n.t("Загрузка"),
          type: "square",
        },
        [periodDictionary.future]: {
          color: "#7ec8ea",
          title: i18n.t("Загрузка"),
          type: "square",
        },
      },
    },
  },
});
