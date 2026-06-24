<template>
  <div :class="['b-widget-wrapper pa-6 set elevation-1', { 'b-widget-wrapper--side-image': sideImage }]">
    <div class="b-widget-wrapper__title-bar d-flex justify-space-between align-baseline">
      <span class="b-widget-wrapper__title-bar__text">{{ title }}</span>
      <div v-if="$slots.extra" class="set-x">
        <slot name="extra" />
      </div>
    </div>

    <div v-if="loading" class="b-widget-wrapper__loader d-flex">
      <v-progress-circular indeterminate class="ma-auto" />
    </div>
    <div v-else-if="!hasData" class="b-widget-wrapper-response-error d-flex justify-center align-center py-8">
      <v-icon class="icon-cross-circle mr-1" size="small" />
      {{ $t("Ошибка загрузки.") }}
      <b-btn color="secondary" size="small" class="ml-2" @click="$emit('getData')">
        <v-icon class="icon-cycle" start />
        {{ $t("Перезагрузить") }}
      </b-btn>
    </div>
    <template v-else>
      <div class="b-widget-wrapper__content" :class="{ 'mx-auto': contentCentered }">
        <slot :parent-loads-data="true" />
      </div>
      <img
        v-if="sideImage"
        :src="$localImage(sideImage)"
        alt="photo"
        class="b-widget-wrapper__side-image my-auto"
      >
    </template>
    <slot name="footer" />
  </div>
</template>

<script>
export default {
  name: "BWidgetWrapper",
  props: {
    hasData: { type: Boolean, default: false },
    loading: { type: Boolean, default: true },
    title: { type: String, default: "" },
    contentCentered: { type: Boolean, default: false },
    sideImage: { type: String, default: "" },
  },
  emits: ["getData"],
};
</script>

<style lang="scss" scoped>
.b-widget-wrapper {
  background: #fff;
  border-radius: 8px;
}

.b-widget-wrapper__title-bar__text {
  font-weight: 600;
  font-size: 16px;
}

.b-widget-wrapper__loader {
  min-height: 200px;
}
</style>
