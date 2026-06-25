<template>
  <v-responsive
    :width="isMobileDevice ? 'calc(100vw - 56px)' : 320"
    class="overflow-visible"
  >
    <b-select
      v-model="internalValue"
      multiple
      :show-search="false"
      :items="items"
      item-text="name"
      item-value="id"
      :placeholder="$t('Выберите ограничения для показа')"
      :background-color="backgroundColor"
      hide-details
      show-master-checkbox
    >
      <template #selection="{item, index}">
        <div
          v-if="internalValueLength === 1 && index === 0"
          class="v-select__selection v-select__selection--comma"
        >
          {{ item.name }}
        </div>
        <div
          v-if="internalValueLength > 1 && index === 0"
          class="v-autocomplete__output-count"
        >
          {{ selectionText }}
        </div>
      </template>
    </b-select>
  </v-responsive>
</template>

<script>
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import ymHelpers from "@/utils/ym-helpers";
import { compactRestrictionGroupItems,
  restrictionTypes } from "../../../config/screen-config.js";

export default {
  name: "TariffPricesTableRestrictionSelect",
  restrictionTypes: Object.freeze(Object.entries(restrictionTypes)
    .filter(([type]) => type !== PriceAndRestrictionsService.closedRestrictionName)
    .map(([type, info]) => ({
      name: info.table,
      id: type,
    }))),
  compactRestrictionGroupItems,
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    compactRestrictions: {
      type: Boolean,
      default: false,
    },
    trackAnalytics: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    actualNormalizedValue() {
      const allowedIds = this.$options.restrictionTypes.map(item => item.id);

      return (this.value || []).filter(type => allowedIds.includes(type));
    },
    items() {
      return this.compactRestrictions
        ? this.$options.compactRestrictionGroupItems
        : this.$options.restrictionTypes;
    },
    normalizedValue() {
      if (!this.compactRestrictions) {
        return this.actualNormalizedValue;
      }

      const selectedSet = new Set(this.actualNormalizedValue);
      return this.$options.compactRestrictionGroupItems.reduce((result, item) => {
        if (item.restrictionTypes.some(type => selectedSet.has(type))) {
          result.push(item.id);
        }
        return result;
      }, []);
    },
    internalValue: {
      get() {
        return this.normalizedValue;
      },
      set(v) {
        if (!this.compactRestrictions) {
          const allowedIds = this.$options.restrictionTypes.map(item => item.id);
          this.$emit("input", (v || []).filter(type => allowedIds.includes(type)));
          return;
        }

        const selectedGroupIds = new Set(v || []);
        const nextRestrictions = this.$options.compactRestrictionGroupItems.reduce((result, item) => {
          if (selectedGroupIds.has(item.id)) {
            result.push(...item.restrictionTypes);
          }
          return result;
        }, []);
        this.$emit("input", nextRestrictions);
      },
    },
    anySelected() {
      return this.internalValueLength > 0;
    },
    backgroundColor() {
      if (this.anySelected) {
        return "#f5f9fe";
      }
      return null;
    },
    internalValueLength() {
      return this.internalValue.length;
    },
    itemsLength() {
      return this.items.length;
    },
    selectionText() {
      const text = `${this.$tc("ограничение", this.internalValueLength)}`;

      return this.internalValueLength === this.itemsLength ? this.$t("Все ограничения") : `${this.$t("Выбрано")} ${text}`;
    },
  },
  watch: {
    actualNormalizedValue(newValue, oldValue) {
      if (!this.trackAnalytics) {
        return;
      }
      const previousValue = oldValue || [];
      const addedRestrictions = newValue.filter(type => !previousValue.includes(type));
      const removedRestrictions = previousValue.filter(type => !newValue.includes(type));

      if (!addedRestrictions.length && !removedRestrictions.length) {
        return;
      }

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
    },
  },
};
</script>
