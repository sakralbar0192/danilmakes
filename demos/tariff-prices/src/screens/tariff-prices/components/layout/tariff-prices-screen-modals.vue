<template>
  <template>
    <updating-prices
      v-if="massUpdateDrawersEnabled"
      :value="massiveUpdatingPricesDrawerValue"
      @input="$emit('update:massiveUpdatingPricesDrawerValue', $event)"
      @updated="$emit('updated-prices', $event)"
    />
    <updating-availability
      v-if="massUpdateDrawersEnabled && isAvailabilityEditable"
      :value="massiveUpdatingAvailabilityDrawerValue"
      @input="$emit('update:massiveUpdatingAvailabilityDrawerValue', $event)"
      @updated="$emit('updated-availability', $event)"
    />
    <updating-restrictions
      v-if="massUpdateDrawersEnabled"
      ref="updatingRestrictions"
      :value="updatingRestrictionsModalValue"
      :opened-from-drag-selection="restrictionsDrawerOpenedFromDragSelection"
      @input="$emit('update:updatingRestrictionsModalValue', $event)"
      @updated="$emit('updated-restrictions', $event)"
    />
    <select-categories-popup
      :value="categoriesPopupValue"
      @input="$emit('update:categoriesPopupValue', $event)"
    />
    <select-restrictions-popup
      :value="restrictionsPopupValue"
      @input="$emit('update:restrictionsPopupValue', $event)"
    />
  </template>
</template>

<script>
import UpdatingRestrictions from "../updating-restrictions/index.vue";
import UpdatingPrices from "../updating-prices/index.vue";
import UpdatingAvailability from "../updating-availability/index.vue";
import SelectCategoriesPopup from "../popups/select-categories-popup.vue";
import SelectRestrictionsPopup from "../popups/select-restrictions-popup.vue";
import { massUpdateDrawersEnabled } from "../../config/screen-config.js";

export default {
  name: "TariffPricesScreenModals",
  components: {
    UpdatingPrices,
    UpdatingAvailability,
    UpdatingRestrictions,
    SelectCategoriesPopup,
    SelectRestrictionsPopup,
  },
  computed: {
    massUpdateDrawersEnabled() {
      return massUpdateDrawersEnabled;
    },
  },
  props: {
    massiveUpdatingPricesDrawerValue: { type: Boolean, required: true },
    massiveUpdatingAvailabilityDrawerValue: { type: Boolean, required: true },
    isAvailabilityEditable: { type: Boolean, default: false },
    updatingRestrictionsModalValue: { type: Boolean, required: true },
    categoriesPopupValue: { type: Boolean, required: true },
    restrictionsPopupValue: { type: Boolean, required: true },
    restrictionsDrawerOpenedFromDragSelection: { type: Boolean, default: false },
  },
  methods: {
    /** После открытия drawer ограничений: сброс формы, init, опционально состояние из выделения таблицы. */
    prepareRestrictionsDrawer(selectionPayload) {
      this.$nextTick(() => {
        this.$refs.updatingRestrictions?.resetForm();
        this.$refs.updatingRestrictions?.init();
        if (selectionPayload) {
          this.$refs.updatingRestrictions?.updateFormStateFrom(selectionPayload);
        }
      });
    },
  },
};
</script>
