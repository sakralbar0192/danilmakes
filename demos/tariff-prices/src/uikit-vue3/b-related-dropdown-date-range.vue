<template>
  <div :class="[$style.row, { [$style.rowStacked]: stacked }]">
    <b-dropdown-datepicker
      ref="startPicker"
      v-bind="startBindings"
      @input="onStartInput"
      @menu-input="onPickerMenuInput"
      @change="$emit('change-start', $event)"
    />
    <slot name="after-start" />
    <slot v-if="$slots.separator" name="separator" />
    <span v-else :class="[separatorClass, $style.separator]">{{ separatorLabel }}</span>
    <b-dropdown-datepicker
      :key="endPickerRemountKey"
      ref="endPicker"
      v-bind="endBindings"
      @input="onEndInput"
      @menu-input="onPickerMenuInput"
      @change="$emit('change-end', $event)"
    />
  </div>
</template>

<script>
import moment from "moment";
import BDropdownDatepicker from "./b-dropdown-datepicker.vue";

export default {
  name: "BRelatedDropdownDateRange",
  components: { BDropdownDatepicker },
  props: {
    modelValue: { type: Array, default: () => ["", ""] },
    value: { type: Array, default: () => ["", ""] },
    min: { type: String, default: "" },
    max: { type: String, default: "" },
    autoOpenEnd: { type: Boolean, default: true },
    startProps: { type: Object, default: () => ({}) },
    endProps: { type: Object, default: () => ({}) },
    separatorText: { type: String, default: null },
    separatorClass: { type: String, default: "" },
    stacked: { type: Boolean, default: false },
  },
  emits: ["update:modelValue", "input", "change", "change-start", "change-end"],
  data() {
    return {
      endPickerMenuWasOpen: false,
    };
  },
  computed: {
    pair() {
      const v = this.modelValue?.length ? this.modelValue : this.value;
      if (!Array.isArray(v)) {
        return ["", ""];
      }
      return [v[0] ?? "", v[1] ?? ""];
    },
    separatorLabel() {
      return this.separatorText != null ? this.separatorText : this.$t("по");
    },
    startBindings() {
      const [start, end] = this.pair;
      return {
        ...this.startProps,
        value: start,
        min: this.min,
        max: end || this.max,
      };
    },
    endBindings() {
      const [start, end] = this.pair;
      return {
        ...this.endProps,
        value: end,
        min: start || this.min,
        max: this.max,
      };
    },
    endPickerRemountKey() {
      const [start] = this.pair;
      return start || "end-range-end";
    },
  },
  methods: {
    emitPair(next) {
      this.$emit("update:modelValue", next);
      this.$emit("input", next);
      this.$emit("change", next);
    },
    scheduleNormalizeIncompletePair() {
      this.$nextTick(() => {
        this.$nextTick(() => {
          const startDd = this.$refs.startPicker;
          const endDd = this.$refs.endPicker;
          if (startDd?.menuOpen || endDd?.menuOpen) {
            return;
          }
          const [s, e] = this.pair;
          if (s && !e) {
            this.emitPair([s, s]);
          } else if (!s && e) {
            this.emitPair([e, e]);
          }
        });
      });
    },
    onPickerMenuInput(isOpen) {
      if (isOpen === false) {
        this.scheduleNormalizeIncompletePair();
      }
    },
    openPickerMenu(refKey) {
      this.$nextTick(() => {
        const ref = this.$refs[refKey];
        const picker = Array.isArray(ref) ? ref[0] : ref;
        picker?.openMenu?.();
      });
    },
    onStartInput(val) {
      const [, end] = this.pair;
      this.emitPair([val, end]);
      if (this.autoOpenEnd && val && !end) {
        this.openPickerMenu("endPicker");
      }
    },
    onEndInput(val) {
      const [start] = this.pair;
      this.emitPair([start, val]);
      if (this.autoOpenEnd && val && !start) {
        this.openPickerMenu("startPicker");
      }
    },
  },
};
</script>

<style lang="scss" module>
.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.separator {
  white-space: nowrap;
  color: rgba(0, 0, 0, 0.6);
}

.rowStacked {
  flex-direction: column;
  align-items: stretch;
}
</style>
