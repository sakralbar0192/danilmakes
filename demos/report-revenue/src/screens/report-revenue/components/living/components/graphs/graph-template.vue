<template>
  <v-card
    ref="graphWrapper"
    color="#F7F7F8"
    elevation="1"
    :class="[
      'pa-4 rounded-lg bnovo-report-revenue__sheet-graph bnovo-report-revenue__card-graph-wrapper',
      {'overflow-x-auto': isTabletDevice || isMobileDevice}
    ]"
  >
    <v-card-title v-if="!hideTitle" class="py-0" :style="isTabletDevice || isMobileDevice ? 'width: 1000px' : ''">
      <h3 class="bnovo-report-revenue__header">
        {{ title }}
      </h3>
      <div class="d-flex justify-space-between" style="flex-basis: 100%;">
        <b class="bnovo-report-revenue__header bnovo-report-revenue__bold">{{ caption }}</b>
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
  name: "BnovoReportRevenueGraphTemplate",
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
.bnovo-report-revenue__card-graph-wrapper.v-card {
    background-color: $secondary-hover;
}

.bnovo-report-revenue__sheet-graph {
    border: 1px solid $skeleton;
}
</style>
