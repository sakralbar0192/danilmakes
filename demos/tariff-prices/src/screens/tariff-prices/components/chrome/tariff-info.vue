<template>
  <v-row v-if="isCurrentTariffDepend || isCurrentTariffHasDependedRestrictions || isRmsPricingEnabled" dense>
    <b-col>
      <component :is="component" v-if="!resetDependentPricesActive && isCurrentTariffDepend && isOneOfPricesModesEnabled" type="warning">
        {{ $t('Если вы указываете цену вручную, то при изменении цены в родительском тарифе') }}
        <router-link :to="parentTariffRoute">{{ parentTariff.name }}</router-link>
        {{ $t('цена в текущем не изменится') }}.
      </component>
      <p v-if="isRestrictionModeEnabled && showAllInfo && isCurrentTariffHasDependedRestrictions">
        {{ tariffDependentRestrictionsNames.length === 1 ? $t('Ограничение') : $t('Ограничения') }}
        {{ tariffDependentRestrictionsNames.join(', ') }}
        {{ $t('в данном тарифе автоматически') }}
        {{ tariffDependentRestrictionsNames.length === 1 ? $t('копируется') : $t('копируются') }}
        {{ $t('из тарифа') }}
        <router-link :to="restrictionsParentTariffRoute">{{ restrictionsParentTariff.name }}</router-link>
      </p>
      <template v-if="isOneOfPricesModesEnabled && isRmsPricingEnabled">
        <template v-if="showAllInfo">
          <p class="mb-0">
            <b>
              {{
                $t('Цена продажи')
              }} -
            </b>
            {{
              $t('это цена, по которой продается номер. Рассчитывается согласно настроенному бизнес-правилу.')
            }}
          </p>
          <p>
            <b>
              {{
                $t('Базовая цена')
              }} -
            </b>
            {{
              $t('это цена, от которой рассчитывается цена продажи.')
            }}
          </p>
        </template>
        <template v-else>
          <component :is="component" v-if="isOneOfDynamicPricesModesEnabled" type="warning">
            {{
              $t('Динамические цены рассчитываются согласно настроенному правилу.')
            }}
            {{ $t('Если на определенные даты вы указываете цену вручную, тогда на данные даты цены из правила применяться не будут') }}
          </component>
          <component :is="component" v-else type="warning">
            {{
              $t('При изменении базовой цены динамические цены будут пересчитаны согласно настроенному правилу.')
            }}
          </component>
        </template>
      </template>
    </b-col>
  </v-row>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { getPlanModification, getTariffDependentRestrictions } from "../../config/screen-config.js";

export default {
  name: "TariffPricesTariffInfo",
  props: {
    showAllInfo: {
      type: Boolean,
      default: false,
    },
    resetDependentPricesActive: {
      type: Boolean,
      default: false,
    },
  },
  modeDefaultPrice: PriceAndRestrictionsService.modeDefaultPrice,
  modeDynamicPrice: PriceAndRestrictionsService.modeDynamicPrice,
  modeRestrictions: PriceAndRestrictionsService.modeRestrictions,
  modeRestrictionsWithDynamicPrice: PriceAndRestrictionsService.modeRestrictionsWithDynamicPrices,
  modeRestrictionsWithPrice: PriceAndRestrictionsService.modeRestrictionsWithPrices,
  computed: {
    ...mapState("hotel", ["rplansByIds"]),
    ...mapState("additionalServices", ["additionalServices"]),
    ...mapState("tariffPricesAndRestrictions", ["currentTariff", "mode"]),
    ...mapGetters("tariffPricesAndRestrictions", ["isOneOfPricesModesEnabled", "isRmsPricingEnabled", "isOneOfDynamicPricesModesEnabled", "isCurrentTariffDepend", "isCurrentTariffHasDependedRestrictions", "isRestrictionModeEnabled"]),
    restrictionsParentTariff() {
      return this.rplansByIds[this.currentTariff?.dependent_restrictions?.parent_plan_id];
    },
    parentTariff() {
      return this.rplansByIds[this.currentTariff?.parent_id];
    },
    restrictionsParentTariffRoute() {
      return this.buildTariffRoute(this.restrictionsParentTariff?.id);
    },
    parentTariffRoute() {
      return this.buildTariffRoute(this.parentTariff?.id);
    },
    component() {
      return this.showAllInfo ? "p" : "b-alert";
    },
    tariffDependentRestrictionsNames() {
      return getTariffDependentRestrictions(this.currentTariff);
    },
  },
  methods: {
    buildTariffRoute(tariffId) {
      if (!tariffId) {
        return { path: "/" };
      }
      return {
        path: `/tariff/index/${tariffId}`,
        query: { ...this.$route.query },
      };
    },
    getPlanModification() {
      return getPlanModification(
        this.currentTariff,
        this.parentTariff,
        this.hotel.currency_sign,
        this.additionalServices,
        false,
      );
    },
  },
};
</script>
