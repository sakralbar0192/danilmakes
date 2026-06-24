<template>
  <b-input-label :label="label">
    <v-menu
      v-if="grouped"
      v-model="menuOpen"
      :close-on-content-click="false"
      location="bottom"
      :max-height="400"
      :z-index="3000"
      :content-class="'b-select-menu b-select-menu--grouped'"
      @update:model-value="onMenuToggle"
    >
      <template #activator="{ props: menuActivatorProps }">
        <div
          class="b-select b-select--grouped"
          :class="[sizeableClass, error ? 'b-select--error' : '']"
          v-bind="menuActivatorProps"
        >
          <div
            class="v-field v-field--variant-outlined v-field--density-compact"
            :class="{ 'v-field--error': error }"
            :style="fieldBgStyle"
          >
            <div class="v-field__field">
              <div class="v-field__input d-flex align-center">
                <slot name="selection" :index="0" :item="firstGroupedItem">
                  <div class="v-autocomplete__output-count">
                    {{ groupedSelectionLabel }}
                  </div>
                </slot>
              </div>
            </div>
            <div class="v-field__append-inner">
              <i class="v-icon icon-chevron-down" aria-hidden="true" />
            </div>
            <div class="v-field__outline">
              <div class="v-field__outline__start" />
              <div class="v-field__outline__notch" />
              <div class="v-field__outline__end" />
            </div>
          </div>
        </div>
      </template>

      <v-card class="b-select-menu__card" min-width="320" max-height="400">
        <b-options-group
          :model-value="groupedValue"
          :items="items"
          :group-text="groupText"
          :element-text="elementText"
          :show-search="searchEnabled"
          :show-master-checkbox="showMasterCheckbox"
          :search-placeholder="searchPlaceholderResolved"
          :master-item-class="masterItemClass"
          :element-text-class="elementTextClass"
          :master-checkbox-data-test="masterCheckboxDataTest"
          @update:model-value="onGroupedUpdate"
        />
      </v-card>
    </v-menu>

    <v-select
      v-else
      :model-value="innerValue"
      class="b-select"
      :class="[
        multiple ? 'b-select-all' : '',
        sizeableClass,
        error ? 'b-select--error' : '',
      ]"
      :items="filteredItems"
      :item-title="itemTextProp"
      :item-value="itemValueProp"
      :placeholder="placeholder"
      :multiple="multiple"
      :disabled="disabled"
      :clearable="clearable"
      :hide-details="hideDetailsResolved"
      :bg-color="backgroundColor"
      variant="outlined"
      density="compact"
      :menu-props="{ contentClass: 'b-select-menu', maxHeight: 400 }"
      @update:model-value="onUpdate"
      @update:menu="onFlatMenuToggle"
    >
      <template #prepend-item>
        <template v-if="searchEnabled">
          <v-list-item class="px-3 py-1" :ripple="false" @click.stop>
            <v-text-field
              v-model="searchTerm"
              prepend-inner-icon="icon-search"
              clearable
              density="compact"
              hide-details
              variant="solo"
              flat
              :placeholder="searchPlaceholderResolved"
              @click.stop
              @keydown.stop
            />
          </v-list-item>
          <v-divider class="mx-2" />
        </template>

        <template v-if="multiple && showMasterCheckbox">
          <v-list-item
            :title="$t('Выбрать все')"
            @click.prevent="toggleSelectAll"
          >
            <template #prepend>
              <v-checkbox-btn
                :model-value="isEverySelected"
                :indeterminate="isSomeSelected"
                density="compact"
                hide-details
              />
            </template>
          </v-list-item>
          <v-divider class="mx-2" />
        </template>
      </template>

      <template v-if="multiple && !$slots.selection" #selection>
        <span class="v-select__selection-text">{{ multipleSelectionLabel }}</span>
      </template>

      <template v-if="$slots.selection" #selection="slotProps">
        <slot name="selection" v-bind="slotProps" />
      </template>
    </v-select>
  </b-input-label>
</template>

<script>
import BInputLabel from "./b-input-label.vue";
import BOptionsGroup from "./b-options-group.vue";

export default {
  name: "BSelect",
  components: { BInputLabel, BOptionsGroup },
  inheritAttrs: false,
  props: {
    modelValue: {},
    value: {},
    items: { type: Array, default: () => [] },
    label: { type: String, default: "" },
    multiple: Boolean,
    grouped: Boolean,
    disabled: Boolean,
    clearable: Boolean,
    search: Boolean,
    showSearch: { type: Boolean, default: undefined },
    searchString: { type: String, default: "" },
    searchPlaceholder: { type: String, default: "" },
    itemText: { type: String, default: undefined },
    itemValue: { type: [String, Number], default: "id" },
    groupText: { type: String, default: "name" },
    elementText: { type: String, default: "name" },
    placeholder: { type: String, default: "" },
    backgroundColor: { type: String, default: undefined },
    hideDetails: { type: [Boolean, String], default: true },
    showMasterCheckbox: { type: Boolean, default: false },
    masterCheckboxDataTest: { type: String, default: "" },
    masterItemClass: { type: String, default: "" },
    elementTextClass: { type: String, default: "" },
    error: Boolean,
    selection: { type: String, default: "" },
    small: Boolean,
    large: Boolean,
  },
  emits: ["update:modelValue", "input", "change", "close"],
  data() {
    return {
      menuOpen: false,
      searchTerm: "",
    };
  },
  computed: {
    innerValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value;
    },
    groupedValue() {
      return this.grouped && this.innerValue && typeof this.innerValue === "object"
        ? this.innerValue
        : {};
    },
    itemTextProp() {
      return this.itemText || "name";
    },
    itemValueProp() {
      return this.itemValue || "id";
    },
    searchEnabled() {
      if (this.showSearch === false) {
        return false;
      }
      return this.search || this.showSearch === true;
    },
    searchPlaceholderResolved() {
      return this.searchPlaceholder || this.$t?.("Поиск") || "Поиск";
    },
    hideDetailsResolved() {
      if (this.hideDetails === true || this.hideDetails === "auto") {
        return this.hideDetails;
      }
      return Boolean(this.hideDetails);
    },
    sizeableClass() {
      if (this.small) return "b-size--small";
      if (this.large) return "b-size--large";
      return "b-size--default";
    },
    selectedValues() {
      const v = this.innerValue;
      return Array.isArray(v) ? v : [];
    },
    itemValues() {
      return (this.filteredItems || []).map((item) => this.resolveItemValue(item));
    },
    isEverySelected() {
      if (!this.itemValues.length) return false;
      return this.itemValues.every((id) => this.selectedValues.includes(id));
    },
    isSomeSelected() {
      const n = this.selectedValues.length;
      return n > 0 && n < this.itemValues.length;
    },
    filteredItems() {
      if (!this.searchEnabled || !this.searchTerm.trim()) {
        return this.items || [];
      }
      const q = this.searchTerm.trim().toLowerCase();
      return (this.items || []).filter((item) => {
        const title = this.resolveItemTitle(item).toLowerCase();
        return title.includes(q);
      });
    },
    groupedItemsCount() {
      return (this.items || []).reduce((count, group) => {
        return group?.elements?.length ? count + group.elements.length : count + 1;
      }, 0);
    },
    groupedSelectedCount() {
      return Object.keys(this.groupedValue).reduce((length, groupId) => {
        const elements = this.groupedValue[groupId];
        return length + (elements?.length || 1);
      }, 0);
    },
    groupedSelectionLabel() {
      if (!this.groupedSelectedCount) {
        return this.placeholder || "";
      }
      if (this.groupedSelectedCount === 1) {
        const [groupId, elements] = Object.entries(this.groupedValue)[0] || [];
        if (elements?.length === 1) {
          const group = (this.items || []).find((g) => `${g.id}` === `${groupId}`);
          const element = group?.elements?.find((el) => `${el.id}` === `${elements[0]}`);
          return element?.[this.elementText] || element?.name || "";
        }
        const group = (this.items || []).find((g) => `${g.id}` === `${groupId}`);
        return group?.[this.groupText] || group?.name || "";
      }
      if (this.groupedSelectedCount === this.groupedItemsCount) {
        return this.$t?.("Выбраны все") || "Выбраны все";
      }
      return `${this.$t?.("Выбрано") || "Выбрано"} ${this.groupedSelectedCount} ${this.$t?.("из") || "из"} ${this.groupedItemsCount}`;
    },
    firstGroupedItem() {
      const [groupId, elements] = Object.entries(this.groupedValue)[0] || [];
      if (!groupId) {
        return null;
      }
      const group = (this.items || []).find((g) => `${g.id}` === `${groupId}`);
      if (elements?.length === 1) {
        return group?.elements?.find((el) => `${el.id}` === `${elements[0]}`) || group;
      }
      return group;
    },
    fieldBgStyle() {
      if (!this.backgroundColor) {
        return undefined;
      }
      return { backgroundColor: this.backgroundColor };
    },
    selectModelLength() {
      return this.selectedValues.length;
    },
    itemsCopyLength() {
      return (this.items || []).length;
    },
    multipleSelectionLabel() {
      return this.getSelectionText();
    },
  },
  watch: {
    searchString: {
      handler(value) {
        this.searchTerm = value || "";
      },
      immediate: true,
    },
  },
  methods: {
    resolveItemTitle(item) {
      if (item == null || typeof item !== "object") return String(item ?? "");
      return item[this.itemTextProp] ?? item.title ?? item.name ?? String(item);
    },
    resolveItemValue(item) {
      if (item == null || typeof item !== "object") return item;
      return item[this.itemValueProp] ?? item.value ?? item.id ?? item;
    },
    onUpdate(v) {
      this.$emit("update:modelValue", v);
      this.$emit("input", v);
      this.$emit("change", v);
    },
    onGroupedUpdate(v) {
      this.onUpdate(v);
    },
    onMenuToggle(open) {
      if (!open) {
        this.$emit("close");
      }
    },
    onFlatMenuToggle(open) {
      if (!open) {
        this.$emit("close");
      }
    },
    toggleSelectAll() {
      if (this.isEverySelected) {
        this.onUpdate([]);
        return;
      }
      this.onUpdate([...this.itemValues]);
    },
    pluralRu(count, one, few, many) {
      const mod10 = count % 10;
      const mod100 = count % 100;
      if (mod10 === 1 && mod100 !== 11) return one;
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
      return many;
    },
    getSelectionText() {
      const count = this.selectModelLength;
      const total = this.itemsCopyLength;
      if (count === total) {
        return this.$t?.("Выбраны все") || "Выбраны все";
      }
      let text = "";
      if (this.selection) {
        const word = this.pluralRu(count, this.selection, `${this.selection}а`, `${this.selection}ов`);
        text = `${count} ${word}`;
      } else {
        text = `${count} ${this.$t?.("из") || "из"} ${total}`;
      }
      return `${this.$t?.("Выбрано") || "Выбрано"} ${text}`;
    },
  },
};
</script>
