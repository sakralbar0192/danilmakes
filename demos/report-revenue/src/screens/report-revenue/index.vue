<template>
  <div class="px-typo report-revenue-screen">
    <v-row dense class="mb-3">
      <v-col cols="auto">
        <b-alert type="info">
          {{ $t("В новой версии отчета отсутствует выбор периода для сравнения. Он появится в будущих обновлениях") }}
        </b-alert>
      </v-col>
    </v-row>
    <v-row dense :class="isMobileDevice ? 'mb-ingroup' : 'my-0'">
      <v-col
        cols="12"
        md="8"
        lg="12"
        xl="12"
      >
        {{ $t("В данном отчете представлены основные показатели, характеризующие эффективность гостиничного бизнеса") }}
        <about-report-hint v-if="isComparedPeriodOn"/>
      </v-col>
    </v-row>
    <v-row dense class="mb-outer mt-0">
      <b-col cols="auto">
        <numbered-list
          :title="$t('Как увеличить доход:')"
          :items="$options.tips"
          @link-click="sendRefMetrics"
        />
      </b-col>
    </v-row>
    <v-row dense :class="isMobileDevice ? 'mb-ingroup' : 'mb-groups'">
      <v-col>
        <filters
          v-model:configuration="configuration"
          v-model:is-leap-year="isLeapYear"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col>
        <v-tabs v-model="tab" class="tabs">
          <v-tab
            v-for="(item, index) in items"
            :key="item"
            :data-test="index === 0 ? 'bnovo-report-revenue-tab-accommodation' : 'bnovo-report-revenue-tab-services'"
          >
            {{ item }}
          </v-tab>
        </v-tabs>
        <v-window v-model="tab" class="mt-4">
          <v-window-item>
            <v-card flat>
              <bnovo-report-revenue-living-page :class="isMobileDevice ? 'mt-groups' : 'mt-outer'" :configuration="configuration"/>
            </v-card>
          </v-window-item>
          <v-window-item>
            <v-card flat>
              <bnovo-report-revenue-additional-service-page :class="isMobileDevice ? 'mt-groups' : 'mt-outer'" :filters="filters"/>
            </v-card>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters, mapMutations } from "vuex";
import { getActualAccount } from "@/router/helpers/account";
import i18n from "@/plugins/i18n";
import ymHelpers from "@/utils/ym-helpers";
import moment from "moment";
import Filters from "./components/filters.vue";
import RevenueReportService from "../../services/reports/revenue-report";
import AboutReportHint from "./components/hints/about-report-hint-body.vue";
import BnovoReportRevenueLivingPage from "./components/living/index.vue";
import BnovoReportRevenueAdditionalServicePage from "./components/additional_services/index.vue";
import NumberedList from "./components/shared/numbered-list.vue";
import linksDictionary from "./components/living/components/graphs/dictionaries/linksDictionary";
import modules from "./assets/modules";

const TIPS = Object.freeze(
  [
    {
      id: linksDictionary.tariffs,
      parts: [
        { text: i18n.t("Оцените текущие темпы продаж и при необходимости скорректируйте ценовую политику в разделе") },
        {
          text: i18n.t("Тарифы"),
          link: {
            href: "/tariff/tariffs",
            target: "_blank",
          },
        },
      ],
    },
    {
      id: linksDictionary.lengthstayreport,
      parts: [
        { text: i18n.t("Чтобы получить дополнительный доход проанализируйте") },
        {
          text: i18n.t("Длительность проживания"),
          link: {
            href: "/reports/lengthStay",
            target: "_blank",
          },
        },
      ],
    },
  ],
);

const REF_LINKS_YM = Object.freeze({
  [linksDictionary.lengthstayreport]: {
    cb: () => {
      ymHelpers.sendHit("main", "ref_to_lengthstay_report_from_revenue_report", "Перешли на отчет Длительность проживания из отчета Доход", {}, "revenue_report");
    },
  },
});

export default {
  name: "BnovoReportRevenue",
  components: {
    Filters, AboutReportHint, BnovoReportRevenueLivingPage, BnovoReportRevenueAdditionalServicePage, NumberedList,
  },
  tips: TIPS,
  data() {
    return {
      tab: 0,
      configuration: "",
      isLeapYear: false,
      isComparedPeriodOn: RevenueReportService.isComparedPeriodOn,
      items: [this.$t("Проживание"), this.$t("Доп. услуги")],
      filters: {
        periodOfStay: [],
        compare: [],
      },
    };
  },
  computed: {
    ...mapState("revenueReport", ["selectedCategories", "selectedServices", "additionalServices"]),
    ...mapState("hotelRoom", ["roomtypes"]),
    ...mapGetters("user", ["isGuest"]),
    test() {
      return {
        "past-month": "Сентябрь (прошлый месяц)",
        future: "Неделя ноября",
        "curr-month": "Октябрь (текущий месяц)",
        "past-future-full": "6 мес в прошлом + 3 мес в будущем",
        empty: "пусто",
      }[this.configuration];
    },
  },
  async created() {
    this.setPageHeaderTestAttributes({ title: "bnovo-report-revenue-header-title" });
    const promiseArray = [
      getActualAccount(),
      this.$store.dispatch("hotelRoom/getRoomTypes"),
      this.$store.dispatch("revenueReport/getAdditionalServices"),
    ];
    await Promise.all(promiseArray);
    const availableCategories = this.roomtypes.reduce((arr, roomtype) => {
      if (roomtype?.rooms?.length && !roomtype?.extra?.excluded && (this.isGuest ? !roomtype?.extra?.exclude_for_report : true)) {
        arr.push(roomtype.id);
      }
      return arr;
    }, []);

    const availableServices = this.additionalServices
      .filter((service) => !service.deleted && service.active)
      .map((service) => service.id);

    let selectedCategories = [];
    let selectedServices = [];
    let selectedMetrics = [];

    const availableMetrics = Object.values(RevenueReportService.metricsSelectionOptions).map(item => item.key);

    const currentHotelId = this?.hotel?.id;
    if (currentHotelId) {
      const savedCategories = this.user?.extra?.revenue_report_data?.[currentHotelId]?.filters?.selectedCategories || [];
      const savedServices = this.user?.extra?.revenue_report_data?.[currentHotelId]?.filters?.selectedServices || [];
      const savedMetrics = this.user?.extra?.revenue_report_data?.[currentHotelId]?.filters?.selectedMetrics || [];

      const filteredCategories = savedCategories.filter(item => this.roomtypes.find(roomtype => roomtype.id === item));

      selectedCategories = modules.getRightOrderArray(
        filteredCategories,
        this.roomtypes.map(i => i.id),
      );
      selectedServices = savedServices.filter(item => this.additionalServices.find(service => service.id === item && service.active));
      selectedMetrics = savedMetrics.filter(item => availableMetrics.includes(item));
    }

    // выставление значений фильтров по умолчанию
    if (!selectedCategories.length) {
      selectedCategories = availableCategories;
    }
    if (!selectedServices.length) {
      selectedServices = availableServices;
    }
    if (!selectedMetrics.length) {
      selectedMetrics = availableMetrics;
    }

    this.setAvailableCategoriesAndServices({ availableCategories, availableServices });
    this.setAvailableMetrics({ availableMetrics });
    this.setExternalData({
      selectedCategories,
      selectedServices,
      selectedMetrics,
    });

    // Проверка и обработка дат из параметров URL
    this.processUrlDates();

    // Получаем данные для отчета и сохраняем их в this.$store
    const result = await this.getReportData();

    if (result !== "success") {
      if (result === "permission") {
      // обрабатывается в глобальном интерцепторе http.js
      } else {
        this.$dialog.toast({
          content: `${this.$t("Ошибка при получении отчета")}`,
          type: "error",
        });
      }
    }
  },
  beforeUnmount() {
    this.setPageHeaderTestAttributes({});
  },
  methods: {
    ...mapActions("revenueReport", [
      "getReportData",
      "setAvailableCategoriesAndServices",
      "setAvailableMetrics",
      "setExternalData",
      "setExternalFilters",
      "setInternalFilters",
    ]),
    ...mapMutations("page", ["setPageHeaderTestAttributes"]),
    /**
     * Обрабатывает даты из параметров URL
     * Проверяет формат дат и создает период в 1 месяц при необходимости
     */
    processUrlDates() {
      const dfromParam = this.$route.query.dfrom;
      const dtoParam = this.$route.query.dto;

      let periodOfStay = [];
      let hasUrlDates = false;

      // Проверяем и парсим дату начала периода
      if (dfromParam) {
        const startDate = moment(dfromParam, RevenueReportService.urlDatesFormat, true);
        if (startDate.isValid()) {
          periodOfStay[0] = startDate.format(RevenueReportService.sendingDataFormat);
          hasUrlDates = true;
        }
      }

      // Проверяем и парсим дату окончания периода
      if (dtoParam) {
        const endDate = moment(dtoParam, RevenueReportService.urlDatesFormat, true);
        if (endDate.isValid()) {
          periodOfStay[1] = endDate.format(RevenueReportService.sendingDataFormat);
          hasUrlDates = true;
        }
      }

      // Если указана только дата начала, создаем дату окончания (начало + 1 месяц)
      if (periodOfStay.length === 1 && periodOfStay[0]) {
        const startDate = moment(periodOfStay[0], RevenueReportService.sendingDataFormat);
        const endDate = startDate.clone().add(1, "month").subtract(1, "day");
        periodOfStay[1] = endDate.format(RevenueReportService.sendingDataFormat);
      }

      // Если указана только дата окончания, создаем дату начала (окончание - 1 месяц)
      if (!periodOfStay[0] && periodOfStay[1]) {
        const endDate = moment(periodOfStay[1], RevenueReportService.sendingDataFormat);
        const startDate = endDate.clone().subtract(1, "month").add(1, "day");
        periodOfStay[0] = startDate.format(RevenueReportService.sendingDataFormat);
      }

      // Если дат нет вообще, используем текущий месяц по умолчанию
      if (periodOfStay.length === 0) {
        periodOfStay = RevenueReportService.startDateInterval();
      }

      // Проверяем, что период не превышает разумные пределы (не больше года)
      if (periodOfStay.length === 2) {
        const startDate = moment(periodOfStay[0], RevenueReportService.sendingDataFormat);
        const endDate = moment(periodOfStay[1], RevenueReportService.sendingDataFormat);
        const diffInMonths = endDate.diff(startDate, "months", true);

        // Если период больше года, ограничиваем его одним годом
        if (diffInMonths > 12) {
          const endDateLimited = startDate.clone().add(1, "year").subtract(1, "day");
          periodOfStay[1] = endDateLimited.format(RevenueReportService.sendingDataFormat);
        }
      }

      // Если в URL были даты, сохраняем их в стор
      if (hasUrlDates && periodOfStay.length === 2) {
        this.setExternalFilters({
          periodOfStay,
          compare: [],
        });
        this.setInternalFilters({
          periodOfStay,
          compare: [],
        });
      }
    },

    sendRefMetrics(id) {
      REF_LINKS_YM?.[id]?.cb();
    },
  },
};
</script>

<style scoped lang="scss">
.b-alert {
  :deep(.v-alert) {
    padding: 12px 16px !important;
  }
}

.tabs {
  :deep(.v-slide-group__content) {
    flex: none !important;
  }
}
</style>
