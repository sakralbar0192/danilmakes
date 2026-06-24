<template>
  <div class="set">
    <template v-for="(puzzleValue, puzzleKey) in innerValue">
      <b-input-label
        v-if="!universalRestrictions.includes(puzzleKey)"
        :key="puzzleKey"
        :label="puzzleValue.label"
      >
        <v-input
          persistent-hint
          :hint="puzzleValue.value ? individualRestrictions[puzzleKey].tariffs.map(tariffInfo => getHintText(tariffInfo)).join('\n') : ''"
          hide-details="auto"
        >
          <b-btn-group
            :value="puzzleValue.value"
            active-class="font-weight-bold v-btn-toggle--active"
            :borderless="false"
            :data-test="`tariff-mass-restrictions-puzzle-${puzzleKey}`"
            :style="{width: isMobileDevice ? 'calc(100vw - 48px)' : 'auto'}"
            @change="updateValue(puzzleKey, $event)"
          >
            <b-btn
              v-for="(item, index) in puzzleValue.valuesList"
              :key="index"
              :value="item.sendingValue"
              :data-test="`tariff-mass-restrictions-puzzle-${puzzleKey}-value-${item.sendingValue || 'empty'}`"
              color=""
              :style="{width: isMobileDevice ? 'calc((100vw - 48px) / 3)' : '134px'}"
            >
              {{ item.title }}
            </b-btn>
          </b-btn-group>
          <template #message="{ message }">
            <restriction-warning-message :message="message" :style="{ width: '400px' }"/>
          </template>
        </v-input>
        <template #label-hint>
          <span v-html="puzzleValue.tooltip"/>
        </template>
      </b-input-label>
    </template>
  </div>
</template>

<script>
import RestrictionWarningMessage from "./restriction-warning-message.vue";

export default {
  name: "BnovoTariffPricesAndRestrictionsUpdatingRestrictionsPuzzelsFormPart",
  components: { RestrictionWarningMessage },
  props: {
    universalRestrictions: {
      type: Array,
      default: () => [],
    },
    individualRestrictions: {
      type: Object,
      default: () => ({}),
    },
    value: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    innerValue: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
  },
  methods: {
    updateValue(key, value) {
      this.innerValue = {
        ...this.innerValue,
        [key]: {
          ...this.innerValue[key],
          value,
        },
      };
    },
    getHintText(tariffInfo) {
      return this.$t("В тарифе \"<тариф>\" не будет применено выбранное действие, так как оно наследуется от тарифа \"<родительскийТариф>\".", {
        currentTariff: tariffInfo.currentTariffName,
        parentTariff: tariffInfo.parentTariffName,
      });
    },
  },
};
</script>

<style scoped lang="scss">
.v-btn-toggle:not(.v-btn-toggle--group) > .v-btn {
  color: $main !important;
  background-color: transparent !important;

  &.v-btn-toggle--active.v-btn--active {
    color: $primary !important;
    background-color: $primary-lighten-4 !important;
    border-color: $secondary-blue-hover !important;
    padding-right: 11px;
  }
}
</style>
