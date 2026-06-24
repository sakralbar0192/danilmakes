<template>
  <div class="bnovo-checkbox-group">
    <v-text-field
      v-if="showSearch && editable"
      v-model="internalSearchString"
      hide-details
      :placeholder="searchPlaceholder"
      prepend-inner-icon="mdi-magnify"
      class="px-2 py-3"
      clearable
      :data-test="searchInputDataTest || undefined"
    />

    <v-list v-if="internalVisibleItemsLength" density="compact">
      <v-list-item
        v-if="showMasterCheckbox && editable && anyItemCanBeSelected && !groupRadioMode"
        :data-test="masterCheckboxDataTest"
        :class="masterItemClass"
        @click="toggleMasterCheckbox"
      >
        <template #prepend>
          <v-checkbox
            :model-value="masterCheckboxChecked"
            :indeterminate="masterCheckboxIndeterminate"
            hide-details
            density="compact"
            @click.stop
            @update:model-value="setMasterCheckbox"
          />
        </template>
        <v-list-item-title class="font-weight-bold">
          <slot v-if="$slots.masterLabel" name="masterLabel" />
          <template v-else>{{ $t("Выбрать все") }}</template>
        </v-list-item-title>
      </v-list-item>

      <v-radio-group
        v-if="groupRadioMode"
        :model-value="radioValue"
        hide-details
        @update:model-value="onRadioChange"
      >
        <v-list-item
          v-for="group in visibleGroups"
          :key="group.id"
          @click="onRadioChange(group.id)"
        >
          <template #prepend>
            <v-radio :value="group.id" hide-details density="compact" />
          </template>
          <v-list-item-title class="d-flex align-center">
            <span :class="elementTextClass">{{ group.text }}</span>
            <slot name="groupTextAppend" :group="group.raw" />
          </v-list-item-title>
        </v-list-item>
      </v-radio-group>

      <template v-else>
        <v-list-item
          v-for="group in visibleGroups"
          :key="group.id"
          :disabled="group.readonly || !editable"
          @click="toggleGroup(group)"
        >
          <template #prepend>
            <v-checkbox
              :model-value="isGroupChecked(group)"
              :indeterminate="isGroupIndeterminate(group)"
              :disabled="group.readonly || !editable"
              hide-details
              density="compact"
              @click.stop
              @update:model-value="(checked) => setGroupChecked(group, checked)"
            />
          </template>
          <v-list-item-title class="d-flex align-center">
            <span :class="elementTextClass">{{ group.text }}</span>
            <slot name="groupTextAppend" :group="group.raw" />
          </v-list-item-title>
        </v-list-item>

        <template v-for="group in visibleGroups" :key="`${group.id}-elements`">
          <v-list-item
            v-for="element in visibleElements(group)"
            :key="element.id"
            class="pl-8"
            :disabled="element.readonly || !editable"
            @click="toggleElement(group, element)"
          >
            <template #prepend>
              <v-checkbox
                :model-value="isElementChecked(group.id, element.id)"
                :disabled="element.readonly || !editable"
                hide-details
                density="compact"
                @click.stop
                @update:model-value="(checked) => setElementChecked(group, element, checked)"
              />
            </template>
            <v-list-item-title>
              <span :class="elementTextClass">{{ element.text }}</span>
            </v-list-item-title>
          </v-list-item>
        </template>
      </template>
    </v-list>

    <slot v-else-if="$slots['no-data-error']" name="no-data-error" />
    <p v-else class="px-4 py-2 text-medium-emphasis">
      {{ $t("Нет данных для отображения") }}
    </p>
  </div>
</template>

<script>
import { getCompatModel, setCompatModel } from "@/utils/compat-model";

export default {
  name: "BOptionsGroup",
  props: {
    value: { type: Object, default: () => ({}) },
    modelValue: { type: Object, default: undefined },
    readonlyItems: { type: Object, default: () => ({}) },
    items: { type: Array, default: () => [] },
    groupText: { type: String, default: "text" },
    elementText: { type: String, default: "text" },
    groupId: { type: String, default: "id" },
    elementId: { type: String, default: "id" },
    groupElements: { type: String, default: "elements" },
    editable: { type: Boolean, default: true },
    showMasterCheckbox: { type: Boolean, default: false },
    showSearch: { type: Boolean, default: true },
    groupRadioMode: { type: Boolean, default: false },
    searchPlaceholder: { type: String, default: "" },
    searchInputDataTest: { type: String, default: "" },
    masterCheckboxDataTest: { type: String, default: "" },
    masterItemClass: { type: String, default: "" },
    elementTextClass: { type: String, default: "" },
  },
  emits: ["update:modelValue", "input"],
  data() {
    return {
      internalSearchString: "",
    };
  },
  computed: {
    boundValue() {
      return getCompatModel(this) || {};
    },
    normalizedItems() {
      return (this.items || []).map((group) => {
        const id = group[this.groupId];
        const text = group[this.groupText] ?? group.name ?? String(id ?? "");
        const elements = (group[this.groupElements] || []).map((element) => ({
          id: element[this.elementId],
          text: element[this.elementText] ?? String(element[this.elementId] ?? ""),
          readonly: this.readonlyItems[id]?.includes?.(element[this.elementId]) || false,
        }));
        return {
          id,
          text,
          raw: group,
          elements,
          readonly: id in this.readonlyItems && !this.readonlyItems[id]?.length,
          isElement: !elements.length,
        };
      });
    },
    visibleGroups() {
      const q = (this.internalSearchString || "").trim().toLowerCase();
      return this.normalizedItems.filter((group) => {
        if (!q) {
          return true;
        }
        if (group.text.toLowerCase().includes(q)) {
          return true;
        }
        return group.elements.some((el) => el.text.toLowerCase().includes(q));
      });
    },
    internalVisibleItemsLength() {
      return this.visibleGroups.reduce((length, group) => {
        const elements = this.visibleElements(group);
        return length + (elements.length || 1);
      }, 0);
    },
    radioValue() {
      const keys = Object.keys(this.boundValue);
      return keys.length ? keys[0] : null;
    },
    masterCheckboxChecked() {
      return this.normalizedItems.every((group) => {
        if (group.hidden) {
          return true;
        }
        if (group.isElement) {
          return this.isGroupChecked(group) || group.readonly;
        }
        return group.elements.every((el) => this.isElementChecked(group.id, el.id) || el.readonly);
      });
    },
    masterCheckboxIndeterminate() {
      if (this.masterCheckboxChecked) {
        return false;
      }
      return Object.keys(this.boundValue).length > 0;
    },
    anyItemCanBeSelected() {
      return this.normalizedItems.some((group) => !group.readonly);
    },
  },
  methods: {
    emitNewValue(newValue) {
      setCompatModel(this, newValue);
    },
    copyValue() {
      const internalValue = {};
      Object.entries(this.boundValue || {}).forEach(([groupId, elements]) => {
        internalValue[groupId] = [...elements];
      });
      return internalValue;
    },
    onRadioChange(id) {
      if (!id) {
        this.emitNewValue({});
        return;
      }
      const group = this.normalizedItems.find((g) => g.id === id);
      const elementIds = group?.elements?.filter((el) => !el.readonly).map((el) => el.id) || [];
      this.emitNewValue({ [id]: elementIds });
    },
    isGroupChecked(group) {
      if (group.isElement) {
        return group.id in this.boundValue;
      }
      const chosen = this.boundValue[group.id] || [];
      const selectable = group.elements.filter((el) => !el.readonly);
      return selectable.length > 0 && selectable.every((el) => chosen.includes(el.id));
    },
    isGroupIndeterminate(group) {
      if (group.isElement || !group.elements.length) {
        return false;
      }
      const chosen = this.boundValue[group.id] || [];
      const some = group.elements.some((el) => chosen.includes(el.id));
      return some && !this.isGroupChecked(group);
    },
    isElementChecked(groupId, elementId) {
      return (this.boundValue[groupId] || []).includes(elementId);
    },
    visibleElements(group) {
      const q = (this.internalSearchString || "").trim().toLowerCase();
      if (!group.elements.length) {
        return [];
      }
      return group.elements.filter((element) => {
        if (!q) {
          return true;
        }
        return element.text.toLowerCase().includes(q) || group.text.toLowerCase().includes(q);
      });
    },
    setGroupChecked(group, checked) {
      const internalValue = this.copyValue();
      if (checked) {
        internalValue[group.id] = group.isElement
          ? []
          : group.elements.filter((el) => !el.readonly).map((el) => el.id);
      } else if (group.isElement) {
        delete internalValue[group.id];
      } else {
        internalValue[group.id] = (internalValue[group.id] || [])
          .filter((elId) => group.elements.find((el) => el.id === elId)?.readonly);
        if (!internalValue[group.id]?.length) {
          delete internalValue[group.id];
        }
      }
      this.emitNewValue(internalValue);
    },
    toggleGroup(group) {
      if (group.readonly || !this.editable) {
        return;
      }
      this.setGroupChecked(group, !this.isGroupChecked(group));
    },
    setElementChecked(group, element, checked) {
      const internalValue = this.copyValue();
      const current = [...(internalValue[group.id] || [])];
      if (checked) {
        if (!current.includes(element.id)) {
          current.push(element.id);
        }
        internalValue[group.id] = current;
      } else {
        internalValue[group.id] = current.filter((id) => id !== element.id);
        if (!internalValue[group.id].length) {
          delete internalValue[group.id];
        }
      }
      this.emitNewValue(internalValue);
    },
    toggleElement(group, element) {
      if (element.readonly || !this.editable) {
        return;
      }
      this.setElementChecked(group, element, !this.isElementChecked(group.id, element.id));
    },
    setMasterCheckbox(checked) {
      const internalValue = this.copyValue();
      this.normalizedItems.forEach((group) => {
        if (group.readonly) {
          return;
        }
        if (checked) {
          internalValue[group.id] = group.isElement
            ? []
            : group.elements.filter((el) => !el.readonly).map((el) => el.id);
        } else if (group.isElement) {
          delete internalValue[group.id];
        } else {
          internalValue[group.id] = (internalValue[group.id] || [])
            .filter((elId) => group.elements.find((el) => el.id === elId)?.readonly);
          if (!internalValue[group.id]?.length) {
            delete internalValue[group.id];
          }
        }
      });
      this.emitNewValue(internalValue);
    },
    toggleMasterCheckbox() {
      this.setMasterCheckbox(!this.masterCheckboxChecked);
    },
  },
};
</script>

<style lang="scss">
.bnovo-checkbox-group {
  background: #fff;
}
</style>
