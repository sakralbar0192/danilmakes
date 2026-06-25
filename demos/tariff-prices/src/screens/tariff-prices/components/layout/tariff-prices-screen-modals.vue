<template>
  <template>
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
import SelectCategoriesPopup from "../popups/select-categories-popup.vue";
import SelectRestrictionsPopup from "../popups/select-restrictions-popup.vue";

export default {
  name: "TariffPricesScreenModals",
  components: {
    SelectCategoriesPopup,
    SelectRestrictionsPopup,
  },
  props: {
    categoriesPopupValue: { type: Boolean, required: true },
    restrictionsPopupValue: { type: Boolean, required: true },
  },
};
</script>
