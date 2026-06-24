<template>
  <v-row no-gutters>
    <b-col cols="2" class="d-flex align-center mr-ingroup">
      <b-input-label
        :label="$t('Год')"
      />
    </b-col>
    <b-col>
      <b-btn-group-separate
        v-model="internalPickedYear"
        :class="$style['year-group']"
        class="d-flex align-center justify-space-between gap-inner overflow-x-auto pb-typo"
      >
        <b-btn
          v-for="year in displayedYears"
          :key="year"
          :value="year"
          :color="internalPickedYear === year ? 'primary' : 'secondary'"
          small
          :style="{ height: '32px' }"
          class="ma-0"
        >
          {{ year }}
        </b-btn>
      </b-btn-group-separate>
    </b-col>
  </v-row>
</template>

<script>
export default {
  name: "BnovoReportRevenueGoalYearPicker",
  props: {
    value: {
      type: Number,
      required: true,
    },
    displayedYears: {
      type: Array,
      required: true,
    },
  },
  data() {
    return { yearsGoals: [] };
  },
  computed: {
    internalPickedYear: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
  },
  methods: {},
};
</script>

<style module lang="scss">
.year-group {
  @include scrollbar();
}
</style>
