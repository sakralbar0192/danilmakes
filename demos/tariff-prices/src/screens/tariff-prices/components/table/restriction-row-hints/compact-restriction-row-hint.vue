<template>
  <b-menu-tooltip right max-width="540" closable>
    <template #activator="{ props: activatorProps }">
      <v-icon
        class="icon-help-circle"
        v-bind="activatorProps"
        size="medium"
        :color="iconColor"
      />
    </template>
    <template #default>
      <v-card :width="540">
        <v-card-title class="pa-0">
          {{ $t("Ограничения") }}
        </v-card-title>
        <v-card-text class="flex-grow-1 d-flex flex-column gap-groups pt-groups pb-0 px-0">
          <img
            :class="$style.image"
            :src="$localImage('restrictions/compact_restrictions.png')"
            :alt="$t('Редактирование ограничений с помощью выделения ячеек')"
          >
        </v-card-text>
      </v-card>
    </template>
  </b-menu-tooltip>
</template>

<script>
export default {
  name: "TariffPricesCompactRestrictionRowHint",
  computed: {
    iconColor() {
      return this.$vuetify?.theme?.themes?.light?.secondary?.darken3 ?? "secondary";
    },
  },
};
</script>

<style lang="scss" module>
.image {
  width: 500px;
  height: 120px;
  object-fit: contain;
}
</style>
