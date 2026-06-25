import RevenueReportPrimaryModel from "@/models/reports/revenue/revenue-report-primary";
import RevenueReportService from "@/services/reports/revenue-report";
import i18n from "@/plugins/i18n";
import moment from "moment";
import strategiesDatasetDictionary from "@/screens/report-revenue/components/living/components/graphs/dictionaries/strategiesDatasetDictionary";
import { nextTick } from "vue";
import RevenuePlanModel from "@/models/reports/revenue/revenue-plan";
import RevenuePlanService from "@/services/reports/revenue-plan";
import { isStartAndEndOfSameMonth } from "@/utils/date";

export default {
  namespaced: true,
  state: {
    externalFilters: {
      periodOfStay: [
        moment().startOf("month").format(RevenueReportService.sendingDataFormat),
        moment().endOf("month").format(RevenueReportService.sendingDataFormat),
      ],
      compare: [],
    },
    selectedCategories: [],
    selectedMetrics: [],
    availableCategories: [],
    availableMetrics: [],
    // Данные для отображения отчета
    metrics: {
      adr: 0,
      amount: 0,
      load: 0,
      revpar: 0,
    },
    tableData: {
      total: {},
      data: {},
    },
    yearsRevenuePlan: { categories: [] },
    // Отображаемые данные (возможно с группировкой по месяцам)
    revenueData: [],
    revenuePlan: [],
    adrData: [],
    adrPlan: [],
    revparData: [],
    revparPlan: [],
    loadData: [],
    loadPlan: [],
    // Статус загрузки данных для отчета
    isReportDataFetching: false,
    // Тип группировки данных
    groupType: 1,
    // Копия ответа с бека
    response: null,
    planResponse: null,
    isReportActual: false,
  },
  mutations: {
    setExternalData(state, externalData) {
      state.selectedCategories = [...(externalData?.selectedCategories || state.availableCategories)];
      state.selectedMetrics = [...(externalData?.selectedMetrics || state.availableMetrics)];
    },
    setGroupedType(state, value) {
      state.groupType = value;
    },
    setExternalFilters(state, value) {
      state.externalFilters = { ...value };
    },
    setSelectedCategories(state, value) {
      state.selectedCategories = [...value];
    },
    setSelectedMetrics(state, value) {
      state.selectedMetrics = [...value];
    },
    setPrimaryReportData(state, value) {
      state.metrics = value.metrics;
      state.tableData = value.tableData;
      state.revenueData = value.revenueData;
      state.revenuePlan = value.revenuePlan;
      state.adrData = value.adrData;
      state.adrPlan = value.adrPlan;
      state.revparData = value.revparData;
      state.revparPlan = value.revparPlan;
      state.loadData = value.loadData;
      state.loadPlan = value.loadPlan;
    },
    setAvailableCategories(state, value) {
      state.availableCategories = value.availableCategories || [];
    },
    setAvailableMetrics(state, value) {
      state.availableMetrics = value.availableMetrics || [];
    },
    updateReportDataFetchedStatus(state, value) {
      state.isReportDataFetching = value;
    },
    setResponse(state, value) {
      state.response = value;
    },
    setIsReportActual(state, value) {
      state.isReportActual = value;
    },
    setYearsRevenuePlan(state, value) {
      state.yearsRevenuePlan = value;
    },
    setPlanResponse(state, value) {
      state.planResponse = value;
    },
  },
  getters: {
    canShowReport(state) {
      const { revenue = 0, load = 0 } = state.tableData.total?.selected ?? {};
      return revenue !== 0 || load !== 0;
    },
    isAllAvailableCategorySelected(state, getters, rootState) {
      const allRoomTypes = rootState.hotelRoom.roomtypes;
      let countAvailableRoomtype = 0;
      for (const roomtype of allRoomTypes) {
        if (roomtype?.extra?.exclude_for_report) continue;
        if ((roomtype?.rooms || []).length) {
          countAvailableRoomtype++;
        }
      }
      return countAvailableRoomtype === state.selectedCategories.length;
    },
    isPeriodMoreThanTwoMonths(state) {
      const start = moment(state.externalFilters.periodOfStay[0], RevenueReportService.sendingDataFormat);
      const end = moment(state.externalFilters.periodOfStay[1], RevenueReportService.sendingDataFormat);
      const diff = Math.abs(end.diff(start, "months"));
      return diff >= 2;
    },
    isPastAndFutureFullMonth(state) {
      const start = moment(state.externalFilters.periodOfStay[0], RevenueReportService.sendingDataFormat);
      const end = moment(state.externalFilters.periodOfStay[1], RevenueReportService.sendingDataFormat);
      const isFirstDayOfMonth = start.date() === 1;
      const isLastDayOfMonth = end.date() === end.daysInMonth();
      const diffMonths = end.diff(start, "months") >= 1;
      return isFirstDayOfMonth && isLastDayOfMonth && diffMonths;
    },
    /**
     * Проверить, является ли начало выбранного периода текущим месяцем или будущем.
     */
    isCurrentOrFutureFullMonth(state) {
      const current = moment();
      const start = moment(state.externalFilters.periodOfStay[0], RevenueReportService.sendingDataFormat);
      const end = moment(state.externalFilters.periodOfStay[1], RevenueReportService.sendingDataFormat);

      const isFullMonth = isStartAndEndOfSameMonth([start, end], RevenueReportService.sendingDataFormat);
      return isFullMonth && start.isSameOrAfter(current, "month");
    },
    isFullCurrentMonthChosen(state) {
      const [start, end] = state.externalFilters.periodOfStay;
      const isFullMonth = isStartAndEndOfSameMonth([start, end], RevenueReportService.sendingDataFormat);
      return isFullMonth && moment(start, RevenueReportService.sendingDataFormat).isSame(moment(), "month");
    },
    categorySelectedText(state, getters, rootState) {
      const countOfSelectedCategories = state.selectedCategories.length;
      let countOfAllLiving = 0;
      let countOfAllExcluded = 0;
      const roomtypesByIds = rootState.hotelRoom.roomtypesByIds;
      const roomtypesByIdsKeys = Object.keys(roomtypesByIds);
      for (const idCategory of roomtypesByIdsKeys) {
        if (roomtypesByIds?.[idCategory]?.extra?.excluded) {
          countOfAllExcluded++;
        } else {
          countOfAllLiving++;
        }
      }
      const {
        isAllLiving,
        isAllExcluded,
        isSomeExcluded,
        isSomeLiving,
        livingCount,
        excludedCount,
      } = state.selectedCategories.reduce((acc, idCategory) => {
        const isExcluded = roomtypesByIds?.[idCategory]?.extra?.excluded;

        if (isExcluded) {
          acc.excludedCount++;
        } else {
          acc.livingCount++;
        }

        acc.isAllLiving = acc.isAllLiving && isExcluded === false;

        acc.isAllExcluded = acc.isAllExcluded && isExcluded;

        acc.isSomeExcluded = acc.isSomeExcluded || isExcluded;

        acc.isSomeLiving = acc.isSomeLiving || isExcluded === false;

        return acc;
      }, {
        isAllLiving: true,
        isAllExcluded: true,
        isSomeExcluded: false,
        isSomeLiving: false,
        livingCount: 0,
        excludedCount: 0,
      });

      const isAllLivingCategorySelectedFinal = isAllLiving && countOfAllLiving === livingCount;
      const isAllExcludedCategorySelectedFinal = isAllExcluded && countOfAllExcluded === excludedCount;

      const returnObj = {
        all: i18n.t("Все категории"),
        allLiving: i18n.t("Все категории проживания"),
        allExcluded: i18n.t("Все категории исключения"),
        countLiving: `${i18n.t("Выбранные категории проживания")} (${countOfSelectedCategories})`,
        countExcluded: `${i18n.t("Выбранные категории исключения")} (${countOfSelectedCategories})`,
        mix: `${i18n.t("Выбранные категории")} (${countOfSelectedCategories})`,
      };

      let result = "all";

      if (countOfSelectedCategories === roomtypesByIdsKeys.length || countOfSelectedCategories === 0) {
        result = "all";
      } else if (isAllLivingCategorySelectedFinal) {
        result = "allLiving";
      } else if (isAllExcludedCategorySelectedFinal) {
        result = "allExcluded";
      } else if (isSomeLiving && !isSomeExcluded) {
        result = "countLiving";
      } else if (isSomeExcluded && !isSomeLiving) {
        result = "countExcluded";
      } else if (isSomeExcluded && isSomeLiving) {
        result = "mix";
      } else if ((livingCount === excludedCount) && livingCount === 0) {
        result = "allLiving";
      }

      return returnObj?.[result] || returnObj.all;
    },
    currentGroupType(state, getters) {
      let result = RevenueReportPrimaryModel.groupByMethods.findIndex(method => method.id === strategiesDatasetDictionary.dates);
      if (getters.isPastAndFutureFullMonth) {
        result = state.groupType;
      }
      return result;
    },
    currentGroupTypeId(state, getters) {
      return RevenueReportPrimaryModel.groupByMethods?.[getters.currentGroupType]?.id || strategiesDatasetDictionary.dates;
    },
    categorySelectedAttributeText(state, getters) {
      return getters.categorySelectedText.replace(/\([^()]*\)/g, "");
    },
    availableExcludedCategories(state, getters, rootState, rootGetters) {
      const excluded = rootGetters["hotelRoom/excludedRoomtypesWithRooms"];
      return (excluded ?? []).map((it) => it.id);
    },
    availablePlanCategories(state, getters) {
      const categories = state.yearsRevenuePlan?.categories ?? [];
      return categories.filter((id) => getters.availableExcludedCategories.includes(id));
    },
    canShowPlanData(state, getters, rootState, rootGetters) {
      if (rootGetters["user/isGuest"]) {
        return false;
      }

      const selected = new Set(state.selectedCategories);
      const planCategories = getters.availablePlanCategories;
      const availableCategories = state.availableCategories;
      const exclusionCategories = getters.availableExcludedCategories;

      const exclusionSet = new Set(exclusionCategories);

      const planHasExcludedCategories = planCategories.some((it) => exclusionSet.has(it));
      if (planHasExcludedCategories) {
        const allNotExcludedSelected = availableCategories.every((it) => selected.has(it));
        const allPlanExcludedSelected = planCategories.every((it) => selected.has(it));
        if (!allNotExcludedSelected || !allPlanExcludedSelected) {
          return false;
        }

        const selectedExcludedCategories = exclusionCategories.filter(it => selected.has(it));
        return selectedExcludedCategories.every((it) => planCategories.includes(it));
      }

      return state.selectedCategories.every((it) => !exclusionSet.has(it)) && state.selectedCategories.length === state.availableCategories.length;
    },
  },
  actions: {
    updateGroupedType({
      commit, state, dispatch,
    }, type) {
      commit("setGroupedType", type);
      commit("updateReportDataFetchedStatus", true);
      // Без nextTick годичные графики неправильно рассчитывают лейблы на графиках
      nextTick().then(() => {
        dispatch("createReport", structuredClone({
          report: state.response?.data?.result?.primary ?? {},
          plan: state.planResponse,
        }));
        commit("updateReportDataFetchedStatus", false);
      });
    },
    async getReportData({
      commit, state, getters, dispatch, rootGetters, rootState,
    }) {
      if (!state.isReportDataFetching) commit("updateReportDataFetchedStatus", true);
      if (getters.isPastAndFutureFullMonth) commit("setGroupedType", 0);

      const groupByMethod = getters.currentGroupTypeId;

      const requestObject = {
        from: state.externalFilters?.periodOfStay?.[0],
        to: state.externalFilters?.periodOfStay?.[1],
        roomtypesIds: state.selectedCategories.length ? state.selectedCategories : state.availableCategories,
        servicesIds: [],
        groupBy: groupByMethod,
      };

      const [reportResp, planResp] = await Promise.all([
        RevenueReportService.getReportResponse(requestObject),
        RevenuePlanService.loadPlan(),
      ]);

      commit("updateReportDataFetchedStatus", false);
      dispatch("createReport", { report: reportResp?.data?.result?.primary ?? {}, plan: planResp });
      commit("setResponse", reportResp);
      commit("setPlanResponse", planResp);
      commit("setIsReportActual", true);

      return reportResp?.result;
    },
    async saveYearsRevenuePlan({ dispatch, state }, data) {
      const result = await RevenuePlanService.savePlan(data);
      dispatch("createReport", {
        report: state.response?.data?.result?.primary ?? {},
        plan: result ?? {},
      });
    },
    createReport({ commit, getters }, payload) {
      const planModel = new RevenuePlanModel(payload.plan);
      const reportModel = new RevenueReportPrimaryModel(
        payload.report,
        planModel,
        {
          groupType: getters.currentGroupType,
          canShowPlanData: () => getters.canShowPlanData,
        },
      );

      commit("setPrimaryReportData", reportModel);
      commit("setYearsRevenuePlan", planModel);
    },
    setExternalFilters({ commit }, externalFilters) {
      commit("setExternalFilters", externalFilters);
    },
    setExternalData({ commit }, value) {
      commit("setExternalData", value);
    },
    setPrimaryReportData({ commit }, value) {
      commit("setPrimaryReportData", value);
    },
    setSelectedCategories({ commit }, value) {
      commit("setSelectedCategories", value);
    },
    setSelectedMetrics({ commit }, value) {
      commit("setSelectedMetrics", value);
    },
    setAvailableCategories({ commit }, value) {
      commit("setAvailableCategories", value);
    },
    setAvailableMetrics({ commit }, value) {
      commit("setAvailableMetrics", value);
    },
  },
};
