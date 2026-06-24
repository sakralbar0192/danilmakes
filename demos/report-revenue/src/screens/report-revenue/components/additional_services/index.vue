<template>
  <section>
    <v-row dense class="mb-ingroup">
      <b-col>
        {{ $t("Доход за дополнительные услуги показывается, учитывая все категории проживания. Подробная информация в") }}
        <a :href="`/reports/other_services${urlQueryFilters}`" target="_blank">
          {{ $t("Отчете по доп. услугам") }}
        </a>
      </b-col>
    </v-row>
    <v-row dense class="mb-ingroup set set_ingroup d-flex">
      <b-col :cols="isMobileDevice ? '' : 'auto'" class="bnovo-report-revenue__service-select">
        <v-responsive :width="isMobileDevice ? 'auto' : '250'" class="overflow-visible">
          <b-select
            v-model="internalSelectedServices"
            grouped
            :items="additionalServicesItemsGroup"
            group-text="name"
            element-text="name"
            show-search
            :show-master-checkbox="isNeedToShowMasterBox"
            :search-placeholder="$t('Поиск')"
            :placeholder="selectedServices.length ? '' : $t('Выберите услугу')"
            data-test="bnovo-report-revenue-additional-services-select"
            selection="доп услуга"
            :label="$t('Доп. услуги')"
            :class="{
              'bnovo-report-revenue__datepicker-bg': isNeedToShowBackground
            }"
            @close="onClose"
          />
        </v-responsive>
      </b-col>
      <b-col cols="auto" class="d-flex align-end">
        <excel-download @excelDownload="excelDownloadHandler"/>
      </b-col>
    </v-row>
    <template v-if="additionalServices.length">
      <v-row dense class="mb-groups">
        <b-col cols="auto">
          <metric-block alternate-mode>
            <template #title>
              {{ $t('Доход от доп. услуг') }}
            </template>
            <template #text>
              <small class="mb-2" data-test="bnovo-report-revenue-widget-additional-services-period"> {{ period }} </small>
              <div>
                <span class="font-weight-bold hero-34" data-test="bnovo-report-revenue-widget-additional-services-sum">
                  {{ additionalServiceValue }}
                </span>
                <span class="bnovo-report-revenue__card-sheet-sign"> {{ hotel.currency_sign || "₽" }} </span>
              </div>
            </template>
          </metric-block>
        </b-col>
      </v-row>
      <v-row>
        <b-col cols="auto" class="pb-6">
          <bnovo-report-revenue-additional-service-list/>
        </b-col>
      </v-row>
    </template>
    <div v-else class="d-flex justify-center align-center py-8">
      <v-icon class="icon-alert-circle" left color="primary"/>
      {{ $t("Данные за выбранный период отсутствуют") }}
    </div>
  </section>
</template>

<script>
import RevenueReportService from "@/services/reports/revenue-report";
import { getPeriodString } from "@/utils/date";
import { mapActions, mapState } from "vuex";
import RevenueReportModel from "@/models/reports/revenue/revenue-report";
import moment from "moment";
import BnovoReportRevenueAdditionalServiceList from "./components/list.vue";
import MetricBlock from "../metric-block.vue";
import ExcelDownload from "../shared/excel-download.vue";
import modules from "../../assets/modules";

export default {
  name: "BnovoReportRevenueAdditionalServicePage",
  components: {
    BnovoReportRevenueAdditionalServiceList, MetricBlock, ExcelDownload,
  },
  computed: {
    ...mapState("revenueReport", [
      "externalFilters",
      "localSelectedServices",
      "selectedServices",
      "externalFilters",
      "servicesData",
      "additionalServices",
      "servicesReady",
    ]),
    internalSelectedServices: {
      get() {
        const selectedServices = this.localSelectedServices || [];
        const active = [];
        const deleted = [];

        for (const serviceId of selectedServices) {
          const service = this.additionalServices.find((item) => item.id === serviceId);

          if (service) {
            if (!service.active) {
              continue;
            }

            if (service.deleted) {
              deleted.push(serviceId);
            } else {
              active.push(serviceId);
            }
          }
        }

        const result = {};
        if (active.length > 0) {
          result[1] = active;
        }
        if (deleted.length > 0) {
          result[2] = deleted;
        }

        return result;
      },
      set(v) {
        const keys = Object.keys(v);
        const selectedServices = [];
        for (const key of keys) {
          v[key].forEach(id => selectedServices.push(id));
        }
        this.setLocalSelectedServices(selectedServices);
      },
    },
    additionalServicesItemsGroup() {
      const allAdditionalServices = this.additionalServices || [];

      const groups = [];

      const activeGroup = {
        checked: false,
        elements: [],
        id: 1,
        name: this.$t("Активные"),
        readonly: true,
      };

      const deletedGroup = {
        checked: false,
        elements: [],
        id: 2,
        name: this.$t("Удаленные"),
        readonly: true,
      };

      for (const service of allAdditionalServices) {
        if (!service.active) {
          continue;
        }

        const element = {
          id: service.id,
          name: service.name,
          checked: false,
        };

        if (service.deleted) {
          deletedGroup.elements.push(element);
        } else {
          activeGroup.elements.push(element);
        }
      }

      if (activeGroup.elements.length > 0) {
        groups.push(activeGroup);
      }

      if (deletedGroup.elements.length > 0) {
        groups.push(deletedGroup);
      }

      return groups;
    },
    period() {
      return this.externalFilters.periodOfStay.length === 2
        ? getPeriodString(this.externalFilters.periodOfStay, RevenueReportService.sendingDataFormat, RevenueReportService.showDataFormat)
        : "";
    },
    amount() {
      return this.servicesData.total;
    },
    additionalServiceValue() {
      return RevenueReportModel.formattedValue(this.amount.toFixed());
    },
    urlQueryFilters() {
      return `?dfrom=${this.formatDateToSend(this.externalFilters.periodOfStay[0])}&dto=${this.formatDateToSend(this.externalFilters.periodOfStay[1])}`;
    },
    isNeedToShowBackground() {
      return this.localSelectedServices.length;
    },
    isNeedToShowMasterBox() {
      return this.additionalServicesItemsGroup.length > 1;
    },
  },
  beforeUnmount() {
    if (this.refWatcher) {
      this.refWatcher();
    }
  },
  methods: {
    ...mapActions("revenueReport", ["setSelectedServices", "setLocalSelectedServices"]),
    onClose() {
      if (modules.haveDifferentContent(this.selectedServices, this.localSelectedServices)) {
        this.setSelectedServices(this.localSelectedServices);
      }
    },
    formatDateToSend(dateStr) {
      return moment(dateStr, RevenueReportService.sendingDataFormat).format(RevenueReportService.urlDatesFormat);
    },
    async excelDownloadHandler(done) {
      const from = this.externalFilters.periodOfStay[0];
      const to = this.externalFilters.periodOfStay[1];
      const selectedServices = this.selectedServices;
      await RevenueReportService.getExcel({
        type: RevenueReportService.typesExcelReports.services,
        to,
        from,
        servicesIds: selectedServices,
      });
      if (done instanceof Function) done();
    },
    isDeletedService(id) {
      let result = false;
      const service = this.additionalServices.find(serviceLocal => serviceLocal.id === id);
      if (service) {
        result = service.deleted;
      }
      return result;
    },
  },
};
</script>

<style lang="scss">

.bnovo-report-revenue__service--deleted {
  color: $input-content;
}

@media (max-width: map-get($grid-breakpoints-custom, sm)) {
  .bnovo-report-revenue__service-select {
    flex-grow: 1;
    & .v-responsive.overflow-visible {
      width: auto !important;
    }
  }
}
</style>
