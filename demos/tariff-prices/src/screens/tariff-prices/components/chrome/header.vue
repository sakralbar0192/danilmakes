<template>
  <b-screen-header
    :separated-breadcrumbs="separatedBreadcrumbs"
  >
    <template #header>
      <div>
        <v-row
          align="center"
          dense
          :class="isDesktopDevice ? 'flex-nowrap' : 'flex-wrap'"
        >
          <b-col cols="auto">
            <p
              data-test="tariff-header-name"
              style="max-width: 80vw;"
            >
              {{ currentTariff?.name || $t("Цены и ограничения тарифа") }}
            </p>
          </b-col>
          <b-col v-if="rplans?.length > 1" cols="auto">
            <select-tariff-popup @change-tariff="$emit('change-tariff', $event)"/>
          </b-col>
          <b-col v-if="isTariffMain && isDesktopDevice">
            <b-tooltip-arrowed right>
              <template #activator="{ on, attrs }">
                <b-status
                  v-bind="attrs"
                  data-test="tariff-header-main-badge"
                  type="success"
                  v-on="on"
                >
                  {{ $t('Основной тариф') }}
                </b-status>
              </template>
              <span>
                {{ $t('Тариф используется по умолчанию для бронирований из ОТА, если тариф в брони не сопоставлен с тарифом PMS в настройках канала') }}
              </span>
            </b-tooltip-arrowed>
          </b-col>
        </v-row>
        <v-row v-if="isTariffMain && !isDesktopDevice" dense class="mt-typo">
          <b-col cols="auto">
            <b-tooltip-arrowed right>
              <template #activator="{ on, attrs }">
                <b-status
                  v-bind="attrs"
                  data-test="tariff-header-main-badge"
                  type="success"
                  v-on="on"
                >
                  {{ $t('Основной тариф') }}
                </b-status>
              </template>
              <span>
                {{ $t('Тариф используется по умолчанию для бронирований из ОТА, если тариф в брони не сопоставлен с тарифом PMS в настройках канала') }}
              </span>
            </b-tooltip-arrowed>
          </b-col>
        </v-row>
      </div>
    </template>
    <template #screen-header-actions>
      <div class="d-flex align-center flex-wrap gap-y-ingroup">
        <b-tooltip-arrowed v-if="!isTariffMain" left>
          <template #activator="{ on, attrs }">
            <b-btn
              v-bind="attrs"
              data-test="tariff-header-set-main"
              color="secondary"
              :loading="setMainInProgress"
              :disabled="setMainInProgress"
              v-on="on"
              @click="setTariffMain"
            >
              <v-icon
                left
                class="icon-crown"
              />
              {{ $t('Сделать основным') }}
            </b-btn>
          </template>
          <span>
            {{ $t('Тариф будет использоваться по умолчанию для бронирований из ОТА, если тариф в брони не сопоставлен с тарифом PMS в настройках канала') }}
          </span>
        </b-tooltip-arrowed>
      </div>
    </template>
    <template #subtitle>
      <h4 v-if="parentTariffId" class="text-h4 b-screen-header__subtitle">
        <span class="skeletonable-text">
          {{ getPlanModification() }}
          <a
            data-test="tariff-header-parent-tariff-link"
            :href="`/tariff/index/${parentTariffId}${queryString}`"
            target="_blank"
          >
            <v-icon color="primary" class="icon-external-link"/>
          </a>
        </span>
      </h4>
    </template>
  </b-screen-header>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { getPlanModification } from "../../config/screen-config.js";
import SelectTariffPopup from "../popups/select-tariff-popup.vue";

export default {
  name: "BnovoTariffPricesAndRestrictionsHeader",
  components: {
    SelectTariffPopup,
  },
  props: {
    separatedBreadcrumbs: {
      type: Array,
      default: null,
    },
  },
  data() {
    return { setMainInProgress: false };
  },
  computed: {
    ...mapState("tariffPricesAndRestrictions", ["currentTariff"]),
    ...mapState("hotel", ["rplans", "rplansByIds"]),
    ...mapGetters("tariffPricesAndRestrictions", ["isTariffMain"]),
    ...mapState("additionalServices", ["additionalServices"]),
    parentTariffId() {
      return this.rplansByIds?.[this.currentTariff?.parent_id]?.id;
    },
    queryString() {
      const query = this.$route.query;
      const params = new URLSearchParams(query).toString();
      return params ? `?${params}` : "";
    },
  },
  methods: {
    async setTariffMain() {
      if (this.setMainInProgress) {
        return;
      }
      this.setMainInProgress = true;
      try {
        const result = await PriceAndRestrictionsService.setTariffMain(this.currentTariff.id);
        if (result) {
          await this.$store.dispatch("hotel/updatePlans");
          const tariffId = this.currentTariff.id;
          const refreshedTariff = this.rplansByIds?.[tariffId];
          this.$store.dispatch("tariffPricesAndRestrictions/setCurrentTariff", {
            ...(refreshedTariff || this.currentTariff),
            is_main: "1",
          });

          this.$dialog.toast({
            content: this.$t("Тариф успешно назначен как основной"),
            type: "success",
          });
        }
      } finally {
        this.setMainInProgress = false;
      }
    },
    getPlanModification() {
      return `${getPlanModification(
        this.currentTariff,
        this.rplansByIds[this.currentTariff?.parent_id],
        this.hotel.currency_sign,
        this.additionalServices,
      )}`;
    },
  },
};
</script>
