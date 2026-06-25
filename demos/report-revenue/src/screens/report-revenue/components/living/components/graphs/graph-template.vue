<template>
  <v-card
    ref="graphWrapper"
    color="var(--demo-surface, #fff)"
    elevation="1"
    :class="[
      'pa-4 rounded-lg report-revenue__sheet-graph report-revenue__card-graph-wrapper',
      {'overflow-x-auto': isTabletDevice || isMobileDevice}
    ]"
  >
    <v-card-title v-if="!hideTitle" class="py-0" :style="isTabletDevice || isMobileDevice ? 'width: 1000px' : ''">
      <h3 class="report-revenue__header">
        {{ title }}
      </h3>
      <div class="d-flex justify-space-between" style="flex-basis: 100%;">
        <b class="report-revenue__header report-revenue__bold">{{ caption }}</b>
        <b-btn
          color="tertiary"
          text
        >
          <v-icon size="small" @click="toggleFullScreen">
            {{ inModal ? "icon-exit-full-screen" : "icon-full-screen" }}
          </v-icon>
        </b-btn>
      </div>
    </v-card-title>
    <v-card-text class="px-0" :style="isTabletDevice || isMobileDevice ? 'width: 1000px; position: relative;' : ''">
      <slot name="legend" :class="`legend-box${id}`"/>
      <slot name="tooltip" :slot-props="graphWrapperRef"/>
      <div style="height: 280px;">
        <b-chart
          :id="id"
          chart-type="bar"
          :chart-options="chartOptionsProp"
          :chart-data="chartDataProp"
          :plugins="chartPluginsProp"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import uid from "@/utils/uid";
import i18n from "@/plugins/i18n";

export default {
  name: "ReportRevenueGraphTemplate",
  components: {},
  props: {
    hideTitle: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: i18n.t("Доход"),
    },
    caption: {
      type: String,
      default: i18n.t("Все категории проживания"),
    },
    inModal: {
      type: Boolean,
      default: false,
    },
    isCompared: {
      type: Boolean,
      default: false,
    },
    additionalClasses: {
      type: String,
      default: "",
    },
    chartDataProp: {
      type: Object,
      default: () => {},
    },
    chartOptionsProp: {
      type: Object,
      default: () => {},
    },
    chartPluginsProp: {
      type: Array,
      default: () => {},
    },
    yMax: {
      type: Number,
      default: 0,
    },
    id: {
      type: String,
      default: uid(),
    },
  },
  data() {
    return { graphWrapperRef: null };
  },
  mounted() {
    if (this.$refs.graphWrapper) {
      this.graphWrapperRef = this.$refs.graphWrapper?.$el || document.querySelector(`#${this.id}`) || document.body;
    }
  },
  methods: {
    toggleFullScreen(event) {
      event.target.blur();
      this.$emit("toggle-full-screen");
    },
  },
};
</script>

<style lang="scss">
.report-revenue__card-graph-wrapper.v-card {
    background-color: var(--demo-surface, #fff);
}

.report-revenue__sheet-graph {
    border: 1px solid var(--demo-border, #d8e8f2);
    box-shadow: 0 2px 12px rgba(30, 139, 195, 0.06);
}
</style>
