<template>
  <div v-once class="d-inline">
    <b-tooltip-arrowed
      right
      :max-width="maxWidtdh"
    >
      <template #activator="{ on, attrs }">
        <v-icon
          class="icon-help-circle"
          v-bind="attrs"
          size="medium"
          :color="$vuetify.theme.themes.light.secondary.darken3"
          v-on="on"
        />
      </template>
      <slot/>
    </b-tooltip-arrowed>
  </div>
</template>
<script>
export default {
  name: "ReportRevenueHintTemplate",
  props: {
    maxWidtdh: {
      type: String,
      default: () => "280",
    },
  },
};
</script>
