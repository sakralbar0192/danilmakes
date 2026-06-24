<template>
  <b-menu
    v-model="menuOpen"
    :close-on-content-click="false"
    :left="left"
    location="bottom"
    max-width="290"
    @update:model-value="onMenuToggle"
  >
    <template #activator="{ on, attrs }">
      <slot :on="on" :attrs="attrs">
        <v-text-field
          :key="inputKey"
          :model-value="displayValue"
          :label="label"
          :placeholder="placeholder"
          :disabled="disabled"
          :clearable="clearable"
          :error="error"
          :hide-details="hideDetailsResolved"
          :readonly="!manualInput"
          :inputmode="manualInput ? undefined : 'none'"
          density="compact"
          :variant="solo ? 'solo' : 'outlined'"
          flat
          class="b-dropdown-datepicker-field"
          prepend-inner-icon="mdi-calendar"
          v-bind="attrs"
          v-on="on"
          @click:prepend-inner="openMenu"
          @click:clear="clearDate"
          @update:model-value="onManualInput"
          @blur="onTextBlur"
          @focus="onActivatorFocus"
        />
      </slot>
    </template>
    <v-date-picker
      :model-value="pickerValue"
      color="primary"
      hide-header
      show-adjacent-months
      first-day-of-week="1"
      :min="pickerMin"
      :max="pickerMax"
      @update:model-value="onPick"
    />
  </b-menu>
</template>

<script>
import moment from "moment";
import BMenu from "./b-menu.vue";

export default {
  name: "BDropdownDatepicker",
  components: { BMenu },
  props: {
    modelValue: { type: [String, Array], default: "" },
    value: { type: [String, Array], default: "" },
    valueFormat: { type: String, default: "YYYY-MM-DD" },
    renderFormat: { type: String, default: "DD.MM.YYYY" },
    label: { type: String, default: "" },
    placeholder: { type: String, default: "" },
    min: { type: String, default: "" },
    max: { type: String, default: "" },
    clearable: { type: Boolean, default: true },
    solo: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    left: { type: Boolean, default: false },
    manualInput: { type: Boolean, default: true },
    hideDetails: { type: [Boolean, String], default: "auto" },
    error: Boolean,
  },
  emits: ["update:modelValue", "input", "change", "menu-input"],
  data() {
    return {
      menuOpen: false,
      inputKey: 0,
      draftValue: null,
    };
  },
  computed: {
    rawValue() {
      const v = this.modelValue !== undefined && this.modelValue !== "" ? this.modelValue : this.value;
      return v ?? "";
    },
    hideDetailsResolved() {
      if (this.hideDetails === true || this.hideDetails === "auto") {
        return this.hideDetails;
      }
      return Boolean(this.hideDetails);
    },
    displayValue() {
      if (this.draftValue !== null) {
        return this.draftValue;
      }
      if (!this.rawValue) {
        return "";
      }
      const m = moment(this.rawValue, this.valueFormat, true);
      return m.isValid() ? m.format(this.renderFormat) : String(this.rawValue);
    },
    pickerValue() {
      if (!this.rawValue) {
        return null;
      }
      const m = moment(this.rawValue, this.valueFormat, true);
      return m.isValid() ? m.format("YYYY-MM-DD") : null;
    },
    pickerMin() {
      return this.toPickerIso(this.min);
    },
    pickerMax() {
      return this.toPickerIso(this.max);
    },
  },
  watch: {
    rawValue() {
      this.draftValue = null;
    },
  },
  methods: {
    toPickerIso(value) {
      if (!value) {
        return undefined;
      }
      const m = moment(value, this.valueFormat, true);
      return m.isValid() ? m.format("YYYY-MM-DD") : undefined;
    },
    emitValue(next) {
      this.$emit("update:modelValue", next);
      this.$emit("input", next);
      this.$emit("change", next);
      this.draftValue = null;
      this.inputKey += 1;
    },
    onMenuToggle(isOpen) {
      this.$emit("menu-input", isOpen);
      if (!isOpen) {
        this.commitDraft();
      }
    },
    openMenu() {
      this.menuOpen = true;
    },
    onPick(iso) {
      if (!iso) {
        return;
      }
      const m = moment(iso, "YYYY-MM-DD", true);
      if (!m.isValid()) {
        return;
      }
      this.emitValue(m.format(this.valueFormat));
      this.menuOpen = false;
    },
    clearDate() {
      this.emitValue("");
    },
    onManualInput(value) {
      if (!this.manualInput) {
        return;
      }
      this.draftValue = value;
    },
    onActivatorFocus(event) {
      if (!this.manualInput && event?.target?.setAttribute) {
        event.target.setAttribute("inputmode", "none");
      }
    },
    onTextBlur() {
      this.commitDraft();
    },
    commitDraft() {
      if (this.draftValue === null) {
        return;
      }
      const trimmed = String(this.draftValue).trim();
      if (!trimmed) {
        this.clearDate();
        return;
      }
      const parsed = moment(trimmed, [this.renderFormat, this.valueFormat], true);
      if (!parsed.isValid()) {
        this.draftValue = null;
        this.inputKey += 1;
        return;
      }
      const formatted = parsed.format(this.valueFormat);
      if (this.min) {
        const minM = moment(this.min, this.valueFormat, true);
        if (minM.isValid() && parsed.isBefore(minM, "day")) {
          this.draftValue = null;
          this.inputKey += 1;
          return;
        }
      }
      if (this.max) {
        const maxM = moment(this.max, this.valueFormat, true);
        if (maxM.isValid() && parsed.isAfter(maxM, "day")) {
          this.draftValue = null;
          this.inputKey += 1;
          return;
        }
      }
      this.emitValue(formatted);
    },
  },
};
</script>

<style lang="scss" scoped>
.b-dropdown-datepicker-field {
  min-width: 132px;
}
</style>
