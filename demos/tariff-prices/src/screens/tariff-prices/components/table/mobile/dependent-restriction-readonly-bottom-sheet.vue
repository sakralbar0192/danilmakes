<template>
  <v-bottom-sheet
    v-model="sheetOpen"
    max-width="100%"
    :retain-focus="false"
    @update:model-value="onSheetInput"
  >
    <v-card
      data-dependent-restriction-readonly-sheet-root
      :class="$style.sheetCard"
      @click.stop
    >
      <v-card-title class="d-flex align-center py-3 px-4">
        <span class="text-body-1 font-weight-bold">
          {{ $t("Редактирование невозможно") }}
        </span>
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
      <v-card-text class="pt-4 pb-4 px-4 text-body-2">
        <p class="mb-0">
          {{ $t("Редактирование ограничения невозможно, так как оно автоматически копируется из тарифа ", { restriction: restrictionLabel }) }}
          <a
            :href="parentTariffHref"
            target="_blank"
            rel="noopener noreferrer"
          >{{ parentTariffName }}</a>.
        </p>
      </v-card-text>
      <v-card-actions class="flex-column align-stretch pt-0 px-4 pb-groups">
        <b-btn
          color="primary"
          width="100%"
          data-test="tariff-dependent-restriction-readonly-ok"
          @click="close"
        >
          {{ $t("Понятно") }}
        </b-btn>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import { shouldIgnoreTariffRestrictionSheetVuetifyClose } from "./tariff-restriction-sheet-vuetify.js";

export default {
  name: "BnovoTariffDependentRestrictionReadonlyBottomSheet",
  props: {
    restrictionLabel: {
      type: String,
      required: true,
    },
    parentTariffName: {
      type: String,
      required: true,
    },
    parentTariffHref: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      sheetOpen: false,
      openedAtMs: Date.now(),
    };
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
  },
};
</script>

<style lang="scss" module>
.sheetCard {
  border-radius: 16px 16px 0 0;
}
</style>
