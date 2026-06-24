<template>
  <b-menu-tooltip
    :value="isTooltipOpen"
    bottom
    color="success"
    :open-on-hover="!isMobileDevice"
    :open-on-click="isMobileDevice"
    max-width="280"
    @input="handleTooltipInput"
  >
    <template #activator="{ on, attrs }">
      <b-btn
        id="screen-header-tour-button"
        data-test="tariff-header-tour-icon"
        color="tertiary"
        squared
        v-bind="attrs"
        v-on="on"
      >
        <v-icon>
          icon-flag
        </v-icon>
      </b-btn>
    </template>
    <v-card color="success">
      <v-card-title class="pt-0 px-0 d-flex align-center flex-nowrap subtitle-1 mb-0 pb-2">
        <b class="white--text font-weight-bold">
          {{ $t('Виртуальный тур') }}
        </b>
        <v-spacer/>
        <span
          class="cursor-pointer"
          @click="closeHint"
        >
          <v-icon
            small
            class="icon-cross"
            color="white"
          />
        </span>
      </v-card-title>
      <v-card-text class="px-0 pb-0">
        <span class="white--text d-block mb-groups" :style="{ fontSize: '12px' }">
          {{ $t('Запустите тур, чтобы узнать о функционале') }}
        </span>
        <b-btn
          data-test="tariff-header-tour-start"
          color="tertiary"
          small
          @click="startTour"
        >
          {{ $t('Пройти тур') }}
        </b-btn>
      </v-card-text>
    </v-card>
  </b-menu-tooltip>
</template>

<script>
import onceHandlerStorageMixin from "@/mixins/once-show";
import { pricesAndRestrictionsTourId } from "../../config/screen-config.js";

const TOUR_START_HINT_SEEN_KEY = "tariff_prices_tour_start_hint_seen";

export default {
  name: "TariffPricesTourStartHint",
  mixins: [onceHandlerStorageMixin],
  data() {
    return { isOpen: false };
  },
  computed: {
    isTooltipOpen() {
      return this.isShowAlert || this.isOpen;
    },
  },
  created() {
    this.initFirstVisit("localStorage", TOUR_START_HINT_SEEN_KEY);
  },
  mounted() {
    this.showElementOnce("localStorage", TOUR_START_HINT_SEEN_KEY);
  },
  methods: {
    handleTooltipInput(value) {
      if (this.isShowAlert) {
        this.isShowAlert = false;
      }
      this.isOpen = value;
    },
    closeHint() {
      this.isShowAlert = false;
      this.isOpen = false;
    },
    startTour() {
      this.closeHint();
      this.$scenario.reset(pricesAndRestrictionsTourId);
      this.$scenario.open(pricesAndRestrictionsTourId);
    },
  },
};
</script>
