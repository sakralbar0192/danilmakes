<template>
  <v-bottom-sheet
    v-model="sheetOpen"
    max-width="100%"
    :retain-focus="false"
    @update:model-value="onSheetInput"
  >
    <v-card
      data-boolean-restriction-sheet-root
      :class="$style.sheetCard"
      @click.stop
    >
      <v-card-title class="d-flex align-center py-3 px-4">
        <span class="text-body-1 font-weight-bold">{{ $t("Изменить ограничение") }}</span>
        <v-spacer/>
        <b-btn
          icon
          text
          large
          color="tertiary"
          :aria-label="$t('Закрыть')"
          @click="close"
        >
          <v-icon class="icon-cross"/>
        </b-btn>
      </v-card-title>
      <v-divider/>
      <v-card-text class="pt-4 pb-6 px-4">
        <v-radio-group
          v-model="localValue"
          column
          hide-details
          class="mt-0"
          @change="onRadioChange"
        >
          <v-radio
            :value="0"
            :label="$t('Нет ограничения')"
            class="mb-2"
          />
          <v-radio
            :value="1"
            :label="restrictionOnLabel"
          />
        </v-radio-group>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { shouldIgnoreTariffRestrictionSheetVuetifyClose } from "./tariff-restriction-sheet-vuetify.js";

export default {
  name: "BnovoTariffPricesAndRestrictionsBooleanRestrictionBottomSheet",
  props: {
    restrictionType: {
      type: String,
      required: true,
    },
    /** 0 | 1 — значение при открытии */
    selectedValue: {
      type: Number,
      default: 0,
    },
  },
  data() {
    const v = Number(this.selectedValue) ? 1 : 0;
    return {
      sheetOpen: false,
      localValue: v,
      snapshotValue: v,
      openedAtMs: Date.now(),
    };
  },
  computed: {
    restrictionOnLabel() {
      if (this.restrictionType === PriceAndRestrictionsService.closedDepartureRestrictionName) {
        return this.$t("Закрыть на выезд");
      }
      return this.$t("Закрыть на заезд");
    },
  },
  watch: {
    selectedValue: {
      immediate: true,
      handler(v) {
        const n = Number(v) ? 1 : 0;
        this.localValue = n;
        this.snapshotValue = n;
      },
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.openedAtMs = Date.now();
      this.sheetOpen = true;
    });
  },
  methods: {
    close() {
      this.$emit("close");
    },
    onSheetInput(v) {
      if (v === false && shouldIgnoreTariffRestrictionSheetVuetifyClose(this.openedAtMs)) {
        this.$nextTick(() => {
          if (shouldIgnoreTariffRestrictionSheetVuetifyClose(this.openedAtMs)) {
            this.sheetOpen = true;
          }
        });
        return;
      }
      if (v === false) {
        this.sheetOpen = false;
        this.$emit("close");
      }
    },
    onRadioChange() {
      const next = Number(this.localValue) ? 1 : 0;
      if (next !== this.snapshotValue) {
        this.$emit("apply", next);
        this.$emit("close");
      }
    },
  },
};
</script>

<style lang="scss" module>
.sheetCard {
  border-radius: 16px 16px 0 0;
}
</style>
