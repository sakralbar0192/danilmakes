<template>
  <b-teleport-wrapper selector="#app-teleport-root">
    <component
      :is="popupComponent"
      v-model="show"
      simple
      size="medium"
      width="100%"
    >
      <v-card data-test="tariff-restrictions-popup">
        <v-card-title>
          <h3 class="text-h3 mb-0">
            {{ $t("Выбор ограничений") }}
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
        <v-card-text class="pt-0 pt-groups px-ingroup flex-grow-1">
          <b-options-group
            v-model="internalSelectedRestrictions"
            width="100%"
            group-text="name"
            :items="$options.restrictionTypeItems"
            editable
            :show-search="false"
            show-master-checkbox
            :class="$style.list"
            master-item-class="font-weight-bold"
          />
        </v-card-text>
        <v-card-actions class="py-groups">
          <template v-if="!isMobileDevice">
            <b-btn
              color="tertiary"
              class="ml-2"
              outlined
              @click="show = false"
            >
              {{ $t("Отменить") }}
            </b-btn>
            <v-spacer/>
          </template>
          <b-btn
            :width="isMobileDevice ? '100%' : 'auto'"
            color="primary"
            data-test="tariff-restrictions-popup-confirm"
            @click="finishSelection"
          >
            {{ $t("Выбрать") }}
          </b-btn>
        </v-card-actions>
      </v-card>
    </component>
  </b-teleport-wrapper>
</template>

<script>
import { mapState } from "vuex";
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import ymHelpers from "@/utils/ym-helpers";
import BTeleportWrapper from "@/uikit/b-teleport-wrapper";
import { restrictionTypes } from "../../config/screen-config.js";

export default {
  name: "TariffPricesSelectRestrictionsPopup",
  components: { BTeleportWrapper },
  restrictionTypeItems: Object.freeze(
    Object.entries(restrictionTypes)
      .filter(([type]) => type !== PriceAndRestrictionsService.closedRestrictionName)
      .map(([type, info]) => ({
        id: type,
        name: info.table,
      })),
  ),
  props: {
    value: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      internalSelectedRestrictions: {},
      popupComponent: "b-dialog",
    };
  },
  computed: {
    ...mapState("tariffPricesAndRestrictions", ["selectedRestrictions"]),
    show: {
      get() {
        return this.value;
      },
      set(v) {
        this.$emit("input", v);
      },
    },
  },
  watch: {
    show(v) {
      if (v) {
        const selectedSet = new Set(this.selectedRestrictions || []);
        this.internalSelectedRestrictions = this.$options.restrictionTypeItems.reduce((obj, item) => {
          if (selectedSet.has(item.id)) {
            obj[item.id] = [];
          }
          return obj;
        }, {});
      }
    },
  },
  mounted() {
    if (this.isMobileDevice) {
      this.popupComponent = "b-drawer";
    }
  },
  methods: {
    finishSelection() {
      const allowedIds = this.$options.restrictionTypeItems.map((item) => item.id);
      const previousValue = (this.selectedRestrictions || []).filter((type) => allowedIds.includes(type));
      const nextValue = Object.keys(this.internalSelectedRestrictions).filter((type) => allowedIds.includes(type));
      const addedRestrictions = nextValue.filter((type) => !previousValue.includes(type));
      const removedRestrictions = previousValue.filter((type) => !nextValue.includes(type));

      if (addedRestrictions.length || removedRestrictions.length) {
        ymHelpers.sendHit(
          "main",
          "restrictions_filter_change",
          "Изменили фильтр ограничений в таблице",
          {
            added: addedRestrictions,
            removed: removedRestrictions,
          },
          "pricesAndRestrictions",
        );
      }

      this.show = false;
      this.$store.dispatch("tariffPricesAndRestrictions/setSelectedRestrictions", nextValue);
    },
  },
};
</script>

<style lang="scss" module>
.list {
  :global(.v-list-item__action) {
    margin-right: map-get($gaps, typo) !important;
    min-width: 16px;
  }
}
</style>
