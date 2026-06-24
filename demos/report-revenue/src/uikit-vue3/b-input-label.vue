<template>
  <label :class="wrapperClasses">
    <template v-if="label">
      <div :class="labelClasses">
        {{ translatedLabel }}
        <b-tooltip-arrowed
          v-if="labelHint || $slots['label-hint']"
          :max-width="labelHintWidth"
        >
          <template #activator="{ on, attrs }">
            <v-icon
              class="icon-help-circle ml-1"
              color="secondary"
              size="15"
              v-bind="attrs"
              v-on="on"
            />
          </template>
          <slot name="label-hint">
            <span v-if="labelHint">{{ $t(labelHint) }}</span>
          </slot>
        </b-tooltip-arrowed>
      </div>
      <div v-if="subLabel" class="text-caption text-medium-emphasis mb-1">
        {{ $t(subLabel) }}
      </div>
      <slot />
    </template>
    <slot v-else />
  </label>
</template>

<script>
import BTooltipArrowed from "./b-tooltip-arrowed.vue";

export default {
  name: "BInputLabel",
  components: { BTooltipArrowed },
  props: {
    label: { type: String, default: "" },
    subLabel: { type: String, default: "" },
    required: Boolean,
    regularLabel: Boolean,
    labelHint: { type: String, default: "" },
    labelHintWidth: { type: [String, Number], default: 300 },
    inline: Boolean,
  },
  computed: {
    translatedLabel() {
      return this.$t?.(this.label) ?? this.label;
    },
    wrapperClasses() {
      return {
        "b-input-label": Boolean(this.label),
        "b-input-label--required": this.required,
        "d-flex flex-wrap": this.inline,
      };
    },
    labelClasses() {
      return [
        "b-input-label__label",
        "text-caption",
        "d-block",
        "mb-1",
        {
          "b-input-label__label--regular": this.regularLabel,
          "font-weight-bold": !this.regularLabel,
        },
      ];
    },
  },
};
</script>

<style lang="scss" scoped>
.b-input-label--required .b-input-label__label::before {
  content: "*";
  color: rgb(var(--v-theme-error));
  margin-right: 2px;
}
</style>
