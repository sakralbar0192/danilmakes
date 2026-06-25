<template>
  <v-bottom-sheet
    :model-value="true"
    max-width="100%"
    :max-height="$options.tooltipHeight"
    hide-overlay
    @update:model-value="onBottomSheetInput"
  >
    <v-card>
      <v-card-text>
        <template v-if="isRestrictionApproval">
          {{ $t("Сбросить изменения до") }}
          {{ restrictionSavedDisplay }}
        </template>
        <template v-else>
          <template v-if="priceDraftUpdating">
            {{ resetUpdatingIntroText }}
            {{ savedPriceFormatted }}
            {{ hotel.currency_sign || "₽" }}
          </template>
          <template v-else-if="fetchedPrice.unlocked">
            <template v-if="isCurrentTariffDepend">
              {{
                dependentResetUnlockedIntroKey
              }}
            </template>
            <template v-else>
              {{
                $t('Вернуть к базовой цене')
              }}
            </template>
            {{ Number(fetchedPrice.originalValue).toLocaleString("ru-RU") }}
            {{ hotel.currency_sign || "₽" }}
          </template>
          <template v-else-if="showResetRuleOriginalText">
            {{
              $t('Вернуть цену рассчитанную правилом')
            }}
            {{ fetchedPrice.originalValue }}
            {{ hotel.currency_sign || "₽" }}
          </template>
          <template v-else-if="hasFetchedRuleOriginalValue">
            {{
              $t('Вернуть цену по умолчанию')
            }}
            {{ Number(fetchedPrice.originalValue).toLocaleString("ru-RU") }}
            {{ hotel.currency_sign || "₽" }}
          </template>
        </template>
      </v-card-text>
      <v-card-actions>
        <b-btn width="100%" @click="$emit('approve')">
          {{ $t('Вернуть') }}
        </b-btn>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { isExtraChargePriceId, parsePriceId } from "../lib/cell-identity.js";
import { resolveBpRuleRoomtypeId } from "../../../lib/flat-roomtypes.js";
import { resolveExtraChargeCategoryDefaultForPriceId } from "../../../lib/tariff/resolve-extra-charge-category-default.js";

export default {
  name: "TariffPricesPriceResetApprovalTooltip",
  props: {
    resetApprovalInfo: {
      type: Object,
      required: true,
    },
  },
  tooltipHeight: 145,
  tooltipWidth: 216,
  computed: {
    ...mapState("hotel", ["rplans", "rplansByIds"]),
    ...mapState("hotelRoom", ["roomtypes"]),
    ...mapState("tariffPricesAndRestrictions", ["currentTariff", "pricesCalendarModel", "updatingPrices"]),
    ...mapGetters("tariffPricesAndRestrictions", ["isDynamicPricesModeEnabled", "parentPriceModification", "parentUsesRmsPricing", "isCurrentTariffDepend"]),
    hotel() {
      return this.$store.state.hotel || {};
    },
    isRestrictionApproval() {
      return this.resetApprovalInfo?.approvalKind === "restriction";
    },
    priceDraftUpdating() {
      const {
        roomtypeId, childrenAgeId, bedTypeId,
      } = parsePriceId(this.resetApprovalInfo?.id);
      if (!roomtypeId) {
        return false;
      }
      return !!(childrenAgeId && bedTypeId
        ? this.updatingPrices?.[roomtypeId]?.[PriceAndRestrictionsService.updatingExtraChargesPricesFieldName]?.[childrenAgeId]?.[bedTypeId]?.[this.resetApprovalInfo?.day?.date] || ""
        : this.updatingPrices?.[roomtypeId]?.[this.resetApprovalInfo?.day?.date] || "");
    },
    fetchedRestrictionSaved() {
      if (!this.isRestrictionApproval) {
        return null;
      }
      const id = this.resetApprovalInfo?.id || "";
      const underscore = id.indexOf("_");
      if (underscore < 0) {
        return null;
      }
      const roomtypeId = id.slice(0, underscore);
      const restrictionType = id.slice(underscore + 1);
      if (!roomtypeId || !restrictionType) {
        return null;
      }
      return this.pricesCalendarModel?.getRestriction?.({
        id: roomtypeId,
        date: this.resetApprovalInfo?.day?.date,
        name: restrictionType,
      });
    },
    restrictionSavedDisplay() {
      const v = this.fetchedRestrictionSaved?.value;
      if (v === null || v === undefined || v === "" || Number(v) === 0) {
        return "0";
      }
      return String(v);
    },
    dependentResetUnlockedIntroKey() {
      const id = this.resetApprovalInfo?.id || "";
      return this.isCurrentTariffDepend && isExtraChargePriceId(id)
        ? this.$t("Вернуть цену по умолчанию")
        : this.$t("Вернуть цену, рассчитанную от родительского тарифа");
    },
    resetUpdatingIntroText() {
      return this.$t("Сбросить изменения до");
    },
    fetchedPrice() {
      const extraChargeCategoryDefault = resolveExtraChargeCategoryDefaultForPriceId(
        this.roomtypes,
        this.resetApprovalInfo?.id || "",
      );
      return this.pricesCalendarModel?.getPrice({
        id: this.resetApprovalInfo?.id || "",
        tariffId: this.currentTariff.id,
        day: this.resetApprovalInfo?.day,
        isDynamicPricesModeEnabled: this.isDynamicPricesModeEnabled,
        parentInfo: {
          id: Number(this.currentTariff?.parent_id),
          modification: this.parentPriceModification,
          parentUsesRmsPricing: this.parentUsesRmsPricing,
        },
        extraChargeCategoryDefault,
      });
    },
    /** Не использовать truthy-условие: для зависимого тарифа «цена по правилу» может быть 0. */
    hasFetchedRuleOriginalValue() {
      const v = this.fetchedPrice?.originalValue;
      return v !== null && v !== undefined && v !== "";
    },
    categoryHasDynamicRule() {
      const planId = this.currentTariff?.id;
      const {
        roomtypeId, childrenAgeId, bedTypeId,
      } = parsePriceId(this.resetApprovalInfo?.id);
      if (childrenAgeId && bedTypeId) {
        return false;
      }
      const bpRuleRoomtypeId = resolveBpRuleRoomtypeId(this.roomtypes || [], roomtypeId);
      if (!planId || !bpRuleRoomtypeId) {
        return false;
      }
      return this.pricesCalendarModel?.isCategoryHasDynamicRule?.(planId, bpRuleRoomtypeId) === true;
    },
    showResetRuleOriginalText() {
      return this.hasFetchedRuleOriginalValue
        && (this.categoryHasDynamicRule || this.fetchedPrice?.dynamic === true);
    },
    savedPriceFormatted() {
      const v = this.fetchedPrice?.value;
      if (v === null || v === undefined || v === "") {
        return "";
      }
      return Number(v).toLocaleString("ru-RU");
    },
  },
  methods: {
    onBottomSheetInput(open) {
      if (!open) {
        this.$emit("dismiss");
      }
    },
  },
};
</script>

<style lang="scss" module>
</style>
