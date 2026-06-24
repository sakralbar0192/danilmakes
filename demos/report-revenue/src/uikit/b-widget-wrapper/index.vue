<template>
  <div :class="['b-widget-wrapper pa-6 set elevation-1', {'b-widget-wrapper--side-image': sideImage}]">
    <div class="b-widget-wrapper__title-bar d-flex justify-space-between align-baseline">
      <span class="b-widget-wrapper__title-bar__text">
        {{ title }}
      </span>
      <div v-if="$scopedSlots.extra" class="set-x">
        <slot name="extra"/>
      </div>
    </div>

    <div v-if="loading" class="b-widget-wrapper__loader d-flex">
      <v-progress-circular indeterminate class="ma-auto"/>
    </div>
    <b-widget-wrapper-response-error v-else-if="!hasData" @reload="$emit('getData')"/>
    <template v-else>
      <div class="b-widget-wrapper__content" :class="{'mx-auto': contentCentered}">
        <slot v-bind="{parentLoadsData: true}"/>
      </div>
      <img
        v-if="sideImage"
        :src="$localImage(sideImage)"
        alt="photo"
        class="b-widget-wrapper__side-image my-auto"
      >
    </template>
    <slot name="footer"/>
  </div>
</template>
<script>
import BWidgetWrapperResponseError from "./components/b-widget-wrapper-response-error";

export default {
  name: "BWidgetWrapper",
  components: { BWidgetWrapperResponseError },
  props: {
    hasData: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      default: "",
    },
    contentCentered: {
      type: Boolean,
      default: false,
    },
    sideImage: {
      type: String,
      default: "",
    },
  },
};
</script>

<style lang="scss" scoped>
@import './styles';
</style>
