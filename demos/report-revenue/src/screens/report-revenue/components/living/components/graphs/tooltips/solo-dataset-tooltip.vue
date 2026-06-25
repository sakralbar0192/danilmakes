<template>
  <section>
    <header class="mb-1">
      <div class="d-flex align-center justify-start">
        <div class="d-flex align-center">
          <p class="font-weight-bold mb-0">
            {{ captionWithoutCount }}
          </p>
        </div>
      </div>
    </header>
    <div class="mb-1">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <div
            v-if="currentPhase === 'today'"
            :class="{
              'report-revenue__square': currentTooltipData[0].type === defaultValue.square,
              'report-revenue__dashed': currentTooltipData[0].type === defaultValue.dot
            }"
            :style="{backgroundColor: currentTooltipData[0].color, borderColor: currentTooltipData[0].color}"
          />
          <p class="font-weight-bold mb-0">
            {{ currentDateInTooltipFormatted }}
          </p>
          <span class="report-revenue__text--dark ml-1">
            {{ currentWeekDayInTooltipFormatted }}
          </span>
        </div>
      </div>
    </div>
    <footer v-for="(data, index) in currentTooltipData" :key="index" class="mb-1">
      <div class="d-flex align-start justify-space-between">
        <div class="d-flex flex-column">
          <div class="d-flex align-center">
            <div
              v-if="data.phase !== 'today'"
              :class="{
                'report-revenue__square': data.type === defaultValue.square,
                'report-revenue__dashed': data.type === defaultValue.dot
              }"
              :style="{backgroundColor: data.color, borderColor: data.color}"
            />
            {{ data.title }}
          </div>
          <small v-if="data.type === defaultValue.dot" class="report-revenue__text--dark mt-n1"> {{ $t("к") }} {{ currentDay }}</small>
        </div>
        <span class="font-weight-bold">{{ formatTooltipValue(data.value, data.graphema === defaultValue.percent) }}</span>
      </div>
    </footer>
  </section>
</template>

<script>
import SharedTooltipView from "../mixins/sharedTooltipView";

export default {
  name: "ReportRevenueSoloDatasetTooltip",
  mixins: [SharedTooltipView],
  props: {
    tooltipDataProps: {
      type: Array,
      default: () => [],
    },
  },
  watch: {
    tooltipDataProps(newVal) {
      this.tooltipData = newVal;
    },
  },
};
</script>
