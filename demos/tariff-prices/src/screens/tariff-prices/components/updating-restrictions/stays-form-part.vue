<template>
  <div class="set">
    <template v-for="(item, key) in innerValue">
      <div v-if="!universalRestrictions.includes(key)" :key="key">
        <v-row dense align-content="center">
          <b-col :cols="isMobileDevice ? '12' : 6" :class="['d-flex gap-semi-inner align-center py-0 pr-0', {'pb-2': isMobileDevice}]">
            <b>{{ item.label }}</b>
            <b-icon-tooltip small icon-color="secondary darken-3">
              <span v-html="item.tooltip"/>
            </b-icon-tooltip>
          </b-col>
          <b-col cols="6" class="py-0 pl-0">
            <b-counter
              :value="item.value"
              :min="0"
              :max="9999"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              enterkeyhint="done"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
              allow-empty-value
              :data-test="`tariff-mass-restrictions-stay-${key}`"
              @input="updateValue(key, $event)"
            />
          </b-col>
        </v-row>
        <template v-if="item.value && individualRestrictions?.[key]?.tariffs?.length">
          <v-row
            v-for="(tariff, index) in individualRestrictions[key].tariffs"
            :key="index"
            dense
            class="mt-ingroup"
          >
            <b-col>
              <restriction-warning-message
                :message="getHintText(tariff)"
                :style="{ width: '400px' }"
              />
            </b-col>
          </v-row>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import RestrictionWarningMessage from "./restriction-warning-message.vue";

export default {
  name: "BnovoTariffPricesAndRestrictionsUpdatingRestrictionsStaysFormPart",
  components: { RestrictionWarningMessage },
  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
    universalRestrictions: {
      type: Array,
      default: () => [],
    },
    individualRestrictions: {
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
      return this.$t("В тарифе \"<тариф>\" не будет применено указанное количество ночей, так как оно наследуется от тарифа \"<родительскийТариф>\".", {
        currentTariff: tariffInfo?.currentTariffName,
        parentTariff: tariffInfo?.parentTariffName,
      });
    },
  },
};
</script>
