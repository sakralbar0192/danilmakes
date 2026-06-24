<template>
  <div data-tour="prices-and-restrictions-tour-select-tariff-step">
    <b-btn
      data-test="tariff-select-trigger"
      text-inline
      small
      style="margin-top: 6px;"
      color="tertiary"
      @click="show = true"
    >
      <v-icon
        style="font-size: 24px !important;"
        class="icon-chevron-down"
      />
    </b-btn>

    <b-teleport-wrapper
      selector="#bnovo-spa"
    >
      <component
        :is="popupComponent"
        v-model="show"
        simple
        size="medium"
        width="100%"
      >
        <v-card data-test="tariff-select-popup">
          <v-card-title>
            <h3 class="text-h3 mb-0">
              {{ $t("Выбор тарифа") }}
            </h3>
            <template v-if="isMobileDevice">
              <v-spacer/>
              <b-btn
                icon
                color="tertiary"
                text
                @click="show = false"
              >
                <v-icon class="icon-cross"/>
              </b-btn>
            </template>
          </v-card-title>
          <v-card-text class="pt-0 pt-groups px-ingroup">
            <b-options-group
              :model-value="internalSelectedTariffs"
              @update:model-value="internalSelectedTariffs = $event"
              editable
              group-text="name"
              :items="rplans"
              :search-placeholder="$t('Поиск тарифа')"
              search-input-data-test="tariff-select-popup-search"
              group-radio-mode
              :class="$style.list"
            >
              <template #no-data-error>
                <div class="ml-ingroup">
                  <v-icon class="icon-alert-circle" left color="primary"/>
                  {{ $t("Нет тарифов для показа") }}
                </div>
              </template>
              <template #groupTextAppend="{group}">
                <div class="d-flex align-center">
                &nbsp;
                  <span
                    v-if="!Number(rplansByIds[group.id]?.is_main) || !isMobileDevice"
                    :class="['mb-0 ml-ingroup, text-truncate', $style.modification] "
                  >
                    {{ getPlanModification(group.id) }}
                  </span>
                  <b-status
                    v-if="Number(rplansByIds[group.id]?.is_main)"
                    small
                    type="success"
                    class="ml-ingroup"
                    style="min-width: 120px;"
                  >
                    {{ $t('Основной тариф') }}
                  </b-status>
                </div>
              </template>
            </b-options-group>
          </v-card-text>
        </v-card>
      </component>
    </b-teleport-wrapper>
  </div>
</template>

<script>
import { mapState } from "vuex";
import BTeleportWrapper from "@/uikit/b-teleport-wrapper";
import { getPlanModification } from "../../config/screen-config.js";

export default {
  name: "BnovoTariffPricesAndRestrictionsSelectTariffPopup",
  components: { BTeleportWrapper },
  data() {
    return {
      show: false, internalSelectedTariffs: {}, popupComponent: "b-dialog",
    };
  },
  computed: {
    ...mapState("hotel", ["rplans", "rplansByIds"]),
    ...mapState("tariffPricesAndRestrictions", ["currentTariff"]),
    ...mapState("additionalServices", ["additionalServices"]),
  },
  watch: {
    internalSelectedTariffs: {
      handler(internalSelectedTariffsObject) {
        const tariffId = Object.keys(internalSelectedTariffsObject || {}).pop();
        if (tariffId && tariffId !== this.currentTariff?.id) {
          this.$emit("change-tariff", tariffId);
          this.show = false;
        }
      },
      deep: true,
    },
    show(v) {
      if (v && this.currentTariff?.id) {
        this.internalSelectedTariffs = { [this.currentTariff.id]: [] };
      }
    },
  },
  mounted() {
    if (this.isMobileDevice) {
      this.popupComponent = "b-drawer";
    }
  },
  methods: {
    getPlanModification(tariffId) {
      const currentTariff = this.rplansByIds[tariffId];
      const parentTariff = this.rplansByIds[currentTariff?.parent_id];

      return getPlanModification(
        currentTariff,
        parentTariff,
        this.hotel.currency_sign,
        this.additionalServices,
      );
    },
  },
};
</script>

<style lang="scss" module>
.modification {
  color: $input-content;
}
.list {
  :global(.v-list-item) {
    padding: 0 4px;
    margin: 0 8px;
  }

  :global(.v-list-item__action) {
    margin-right: map-get($gaps, typo) !important;
    min-width: 16px;
  }

  :global(.v-responsive__content label.set) {
    display: block !important;
    padding-top: 0 !important;
  }

  :global(.v-list-item__title .v-item-group) {
    max-width: 50%;
  }
}
</style>
