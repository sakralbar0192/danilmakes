<template>
  <div>
    <b-btn
      text-inline
      color="primary"
      data-test="tariff-info-drawer-open"
      data-tour="prices-and-restrictions-tour-info-drawer-step"
      @click="openDrawer"
    >
      {{ buttonLabel }}
    </b-btn>
    <b-teleport-wrapper
      v-if="teleportMounted"
      selector="#bnovo-spa"
    >
      <b-drawer
        v-model="show"
        data-test="tariff-info-drawer"
        :width="isMobileDevice ? '100%' : 555"
      >
        <v-card class="d-flex flex-column" style="min-height: 100%">
          <v-card-title class="text-h2" :class="$style.header">
            {{ buttonLabel }}
            <v-spacer/>
            <b-btn
              icon
              color="tertiary"
              text
              large
              @click="show = false"
            >
              <v-icon class="icon-cross"/>
            </b-btn>
          </v-card-title>
          <v-card-text class="px-6">
            <info-tabs ref="infoTabs"/>
          </v-card-text>
          <v-spacer/>
          <v-card-actions class="py-groups" :class="$style.footer">
            <b-btn :width="isMobileDevice ? '100%' : 'auto'" color="primary" @click="show = false">
              {{ $t("Понятно") }}
            </b-btn>
          </v-card-actions>
        </v-card>
      </b-drawer>
    </b-teleport-wrapper>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import BTeleportWrapper from "@/uikit/b-teleport-wrapper";
import ymHelpers from "@/utils/ym-helpers";
import InfoTabs from "./info-tabs.vue";

export default {
  name: "BnovoTariffPricesAndRestrictionsInfoDrawer",
  components: { InfoTabs, BTeleportWrapper },
  data() {
    return { show: false, teleportMounted: false };
  },
  computed: {
    ...mapGetters("tariffPricesAndRestrictions", ["isOneOfPricesModesEnabled", "isCombinedModeEnabled"]),
    buttonLabel() {
      if (this.isCombinedModeEnabled) {
        return this.$t("Инструкция о ценах и ограничениях");
      }
      return this.isOneOfPricesModesEnabled
        ? this.$t("Инструкция о ценах")
        : this.$t("Инструкция об ограничениях");
    },
  },
  methods: {
    openDrawer(tab = null) {
      ymHelpers.sendHit(
        "main",
        "prices_restrictions_info_open",
        "Открыли подробнее о ценах и ограничениях",
        {},
        "pricesAndRestrictions",
      );
      if (!this.teleportMounted) {
        this.teleportMounted = true;
      }
      this.$nextTick(() => {
        this.show = true;

        this.$nextTick(() => {
          if (this.$refs.infoTabs && tab != null) {
            this.$refs.infoTabs.updateTab(tab);
          }
        });
      });
    },
  },
};
</script>

<style lang="scss" module>
.header {
  position: sticky;
  top: 0;
  z-index: 1;
  background: $white;
}

.footer {
  position: sticky;
  bottom: 0;
  background: $white;
  border-top: 1px solid $border-color;
}
</style>
