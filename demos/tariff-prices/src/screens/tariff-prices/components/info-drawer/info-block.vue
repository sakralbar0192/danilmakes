<template>
  <v-card>
    <v-card-title class="pl-0 py-0 mb-ingroup text-h4">
      <slot name="title"/>
    </v-card-title>
    <v-card-text class="pl-0">
      <div class="mb-inner">
        <slot name="content"/>
      </div>
      <p v-if="$slots['footerTitle']" class="mb-inner">
        <slot name="footerTitle"/>
      </p>
      <v-card v-if="$slots['footerBlock']" outlined :class="['px-groups py-inner d-flex align-center justify-stretch', $style.card]">
        <slot name="footerBlock"/>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script>
export default { name: "BnovoTariffPricesAndRestrictionsInfoDrawerBlock" };
</script>

<style lang="scss" module>
.card {
  background-color: $secondary-hover !important;
  border-color: $skeleton;
  gap: 16px;

  :global(.v-btn) {
    pointer-events: none;
  }
}
</style>
