<template>
  <v-responsive :width="isMobileDevice ? '100%' : 320" class="overflow-visible">
    <b-select
      v-model="$v.internalValue.$model"
      data-test="tariff-mass-prices-categories-select"
      search
      grouped
      :search-string="searchString"
      :items="categories"
      group-text="name"
      element-text="name"
      :search-placeholder="$t('Поиск')"
      :label="$t('Категории')"
      :error="selectRoomtypesError"
      :background-color="backgroundColor"
      hide-details
      show-master-checkbox
      master-checkbox-data-test="tariff-mass-prices-categories-select-all"
      group-item-class="font-weight-bold"
      master-item-class="font-weight-bold"
      element-text-class="tariff-category-select--text-wrap"
      @close="$emit('close')"
    >
      <template #selection="{index}">
        <div
          v-if="index === 0"
          class="v-autocomplete__output-count"
        >
          {{ internalValueLength === itemsLength
            ? $t("Выбраны все")
            : `${$t("Выбрано")} ${`${internalValueLength} ${$t("из")}  ${itemsLength}`}` }}
        </div>
      </template>
    </b-select>
  </v-responsive>
</template>

<script>
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
import { mapState } from "vuex";
import rusWordCaserMixin from "@/mixins/rus-word-caser-mixin";
import { getCompatModel, setCompatModel } from "@/utils/compat-model";

export default {
  name: "BnovoTariffPricesAndRestrictionsUpdatingPricesCategoriesSelect",
  mixins: [validationMixin, rusWordCaserMixin],
  props: {
    value: {
      type: Array,
      default: undefined,
    },
    modelValue: {
      type: Array,
      default: undefined,
    },
    categories: {
      type: Array,
      default: () => [],
    },
    searchString: {
      type: String,
      default: "",
    },
  },
  parentMap: new Map(),
  computed: {
    ...mapState("tariffPricesAndRestrictions", ["pricesCalendarModel"]),
    ...mapState("hotelRoom", ["roomtypes"]),
    internalValue: {
      get() {
        const result = {};
        // Группируем выбранные ID по родителям
        (getCompatModel(this) || []).forEach(id => {
          const parentId = this.$options.parentMap.get(id);
          if (parentId) {
            if (!result[parentId]) {
              result[parentId] = [];
            }

            if (this.categories.find(it => it.id === parentId)?.elements?.length) result[parentId].push(id);
          }
        });
        return result;
      },
      set(v) {
        const newValue = Object.entries(v).reduce((arr, [group, elements]) => {
          if (elements.length) {
            arr = [...arr, ...elements];
          } else {
            arr.push(group);
          }
          return arr;
        }, []);
        setCompatModel(this, newValue);
      },
    },
    internalValueLength() {
      return Object.keys(this.internalValue).reduce((length, groupId) => {
        length += this.internalValue[groupId].length || 1;
        return length;
      }, 0);
    },
    itemsLength() {
      return this.categories.reduce((count, group) => {
        return group?.elements?.length ? count + group.elements.length : count + 1;
      }, 0);
    },
    selectRoomtypesError() {
      return this.$v?.internalValue?.$dirty && !this.$v?.internalValue?.required;
    },
    anySelected() {
      return (getCompatModel(this) || []).length > 0;
    },
    backgroundColor() {
      if (this.anySelected) {
        return "#f5f9fe";
      }

      return null;
    },
  },
  watch: {
    selectRoomtypesError(v) {
      this.$emit("update:error", v);
    },

    categories: {
      handler: "fillRoomtypesParentMap",
      immediate: true,
    },
  },
  methods: {
    fillRoomtypesParentMap() {
      this.$options.parentMap.clear();
      // Наполняем карту для быстрого поиска родителя по ID ребенка
      this.categories.forEach(group => {
        (group.elements || []).forEach(element => {
          this.$options.parentMap.set(element.id, group.id);
        });
        // Также добавляем самого родителя
        this.$options.parentMap.set(group.id, group.id);
      });
    },
  },
  validations: { internalValue: { required } },
};
</script>
