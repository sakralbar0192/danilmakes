<template>
  <div>
    <v-tabs
      v-if="needShowTabs"
      v-model="currentTab"
      class="mb-outer"
      show-arrows
    >
      <v-tabs-slider/>
      <template v-for="tab in tabs">
        <v-tab
          v-if="!tab.hidden"
          :key="tab.id"
          :href="`#${tab.id}`"
        >
          {{ tab.title }}
        </v-tab>
      </template>
    </v-tabs>
    <v-tabs-items v-model="currentTab">
      <template v-for="tab in tabs">
        <v-tab-item
          v-if="!tab.hidden"
          :key="tab.id"
          :value="tab.id"
        >
          <component :is="tab.component"/>
        </v-tab-item>
      </template>
    </v-tabs-items>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import { infoDrawerModes } from "../../config/screen-config.js";
import DynamicPrices from "./dynamic-prices.vue";
import DefaultPrices from "./default-prices.vue";
import RestrictionsInfo from "./restrictions-info.vue";

export default {
  name: "BnovoTariffPricesAndRestrictionsInfoDrawerTabs",
  computed: {
    ...mapState("tariffPricesAndRestrictions", ["activeInfoTab"]),
    ...mapGetters("tariffPricesAndRestrictions", ["isRmsPricingEnabled", "isRestrictionModeEnabled", "isOneOfPricesModesEnabled"]),
    currentTab: {
      get() {
        return this.activeInfoTab;
      },
      set(v) {
        this.$store.dispatch("tariffPricesAndRestrictions/setActiveInfoTab", v);
      },
    },
    tabs() {
      return [
        {
          title: this.isRmsPricingEnabled ? this.$t("Цена продажи") : this.$t("Динамические цены"),
          id: infoDrawerModes.dynamic,
          component: DynamicPrices,
          hidden: !this.isRmsPricingEnabled || !this.isOneOfPricesModesEnabled,
        },
        {
          title: this.isRmsPricingEnabled ? this.$t("Базовые цены для бизнес-правил") : this.$t("Цены"),
          id: infoDrawerModes.default,
          component: DefaultPrices,
          hidden: !this.isOneOfPricesModesEnabled,
        },
        // {
        //   title: this.$t("Действия"),
        //   id: infoDrawerModes.actions,
        //   component: PricesActions,
        //   hidden: !this.isRmsPricingEnabled || !this.isOneOfPricesModesEnabled,
        // },
        {
          title: this.$t("Ограничения"),
          id: infoDrawerModes.restrictions,
          component: RestrictionsInfo,
          hidden: !this.isRestrictionModeEnabled,
        },
      ];
    },
    needShowTabs() {
      return Object.values(this.tabs).filter(tab => !tab.hidden).length > 1;
    },
  },
  methods: {
    updateTab(value) {
      if (infoDrawerModes[value] == null) {
        return;
      }

      const visibleTabs = this.tabs.filter((v) => !v.hidden).map((v) => v.id);
      if (visibleTabs.includes(value)) {
        this.currentTab = value;
      }
    },
  },
};
</script>
