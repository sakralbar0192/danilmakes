<template>
  <header class="b-screen-header pa-4">
    <h1 class="text-h5 font-weight-medium">
      <slot name="header">{{ title }}</slot>
    </h1>
    <div v-if="$slots.subtitle" class="text-body-2 text-medium-emphasis mt-1">
      <slot name="subtitle" />
    </div>
    <div v-if="$slots.default" class="mt-3">
      <slot />
    </div>
  </header>
</template>

<script>
export default {
  name: "BScreenHeader",
  props: {
    title: String,
    subtitle: String,
    pageHeading: String,
    titleCount: Number,
    testAttributes: { type: Object, default: () => ({}) },
    breadcrumbs: { type: Array, default: () => [] },
  },
};
</script>
