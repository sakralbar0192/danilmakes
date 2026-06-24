<template>
  <div
    ref="wrapper"
    class="b-data-table"
    :style="`--firstColWidth:${firstColumnWidth}px`"
  >
    <div v-if="showToolbar" class="b-data-table-toolbar">
      <div v-if="!disablePagination" class="b-data-table-toolbar__left">
        <div v-if="selectedItems.length === 0" class="subtitle-1 mb-0">
          {{ $tc(selection, itemsTotal) }}
        </div>
        <div v-else class="d-flex align-center">
          <b-btn
            class="reset-btn"
            icon
            text
            x-small
            color="primary"
            @click="clearSelectedItems"
          >
            <v-icon :size="12" class="icon-cross"/>
          </b-btn>
          <div class="subtitle-1 mb-0 d-flex align-center">
            <template v-if="showSelectFrom">
              {{ selectedItems.length + " " + $t("из") + " " + itemsTotal + " " + $t("выбрано") }}
            </template>
            <template v-else>
              {{ selectedItems.length + " " + $t("выбрано") }}
            </template>
          </div>
        </div>
      </div>
      <div v-else class="b-data-table-toolbar__left pl-0">
        <slot name="toolbar-left"/>
      </div>
      <div class="b-data-table-toolbar__center">
        <slot name="toolbar-center"/>
      </div>
      <div class="b-data-table-toolbar__right">
        <slot name="toolbar-right"/>
      </div>
    </div>

    <v-data-table-custom
      v-bind="{ ...$attrs, ...$props}"
      :headers="modifiedHeaders"
      hide-default-footer
      :disable-pagination="disablePagination"
      :sort-by="sortBy"
      :value="selectedItems"
      :show-select="showSelectColumn && !simple"
      :single-select="hideMasterCheckbox"
      :page.sync="pageModel"
      :items-per-page="perPage"
      :server-items-length="serverSidePagination ? itemsTotal : -1"
      :mobile-breakpoint="mobileBreakpoint"
      :draggable="draggable"
      :class="{
        'v-data-table--simple': simple,
        'v-data-table--mobile-scrollable': mobileScrollable,
        'v-data-table--has-actions': hasActions,
        'v-data-table__mobile-cards-simple': mobileCardsSimple,
        'v-data-table--sticky-columns': isColumnsSticky,
        'v-data-table--selectable': showSelect,
        'v-data-table--group-mode': isGroupMode,
        'v-data-table--simple-grouped': simpleGrouped,
        'v-data-table--draggable-mode': draggable,
        'v-data-table--has-inputs': hasInputs,
      }"
      :item-class="getRowClass"
      :options.sync="options"
      v-on="$listeners"
    >
      <template v-if="!hideMasterCheckbox" #header.data-table-select>
        <b-checkbox
          v-model="selectAll"
          :indeterminate="isMasterCheckboxIndeterminate"
          :disabled="selectableItems.length === 0"
          @change="changeMasterCheckbox"
        />
      </template>
      <template #group.header="{group, items, isOpen, toggle}">
        <template v-if="isGroupMode && showSelectColumn">
          <td>
            <b-btn
              small
              icon
              text
              @click="toggle"
            >
              <v-icon>{{ isOpen ? "icon-chevron-down" : "icon-chevron-up" }}</v-icon>
            </b-btn>
          </td>
          <td :colspan="3" class="v-data-table-group-header__text subtitle-1 mb-0">
            <slot :group="group" :items="items" name="group-header-text">
              {{ group }}
            </slot>
          </td>
          <td :colspan="modifiedHeaders.length - 3"/>
        </template>
        <template v-if="isGroupMode && !showSelectColumn">
          <td class="v-data-table-group-header">
            <div class="v-data-table-group-header__content">
              <b-btn
                small
                icon
                text
                @click="toggle"
              >
                <v-icon>{{ isOpen ? "icon-chevron-down" : "icon-chevron-up" }}</v-icon>
              </b-btn>
              <div class="subtitle-1 mb-0">
                <slot :group="group" :items="items" name="group-header-text">
                  {{ group }}
                </slot>
              </div>
            </div>
          </td>
          <td :colspan="modifiedHeaders.length - 1"/>
        </template>
      </template>
      <template v-for="header in modifiedHeaders" #[`header.${header.value}`]="{ header }">
        <span class="v-data-table-header__column-text-container">
          <span
            v-line-clamp="2"
            class="v-data-table-header__column-text"
          >{{ header.text }}</span>
        </span>
      </template>
      <template #no-data>
        <div class="d-flex justify-center align-center py-8">
          <template v-if="showNoDataInfo">
            <v-icon class="icon-alert-circle" left color="primary"/>
            <slot name="no-data-info"/>
          </template>
          <template v-if="showNoDataError">
            <v-icon class="icon-cross-circle" left color="error"/>
            <slot name="no-data-error"/>
          </template>
        </div>
      </template>

      <template #item.data-table-select="{ item }">
        <b-tooltip-arrowed
          v-if="item.tooltip_text"
          right
          max-width="300"
          :open-on-hover="isDesktopDevice"
          :open-on-click="isMobileDevice"
        >
          <template #activator="{ on, attrs }">
            <div v-bind="attrs" class="d-flex justify-center align-center" v-on="on">
              <b-checkbox
                v-if="item.item_state !== itemState.pending"
                v-model="selectedItems"
                :value="item"
                :disabled="item.item_state === 1 || groupCrossSelect && isCheckboxDisabled(item)"
              />
              <v-progress-circular
                v-else
                :size="14"
                :width="2"
                indeterminate
                color="secondary"
              />
            </div>
          </template>
          <span>
            {{ item.tooltip_text }}
          </span>
        </b-tooltip-arrowed>
        <div v-else class="d-flex justify-center align-center">
          <b-checkbox
            v-if="item.item_state !== itemState.pending"
            v-model="selectedItems"
            :value="item"
            :disabled="item.item_state === 1 || groupCrossSelect && isCheckboxDisabled(item)"
          />
          <v-progress-circular
            v-else
            indeterminate
            :size="14"
            :width="2"
            color="secondary"
          />
        </div>
      </template>

      <template v-if="simpleGrouped" #item="{ item, index, headers: itemHeaders }">
        <tr>
          <th v-if="item.isSectionHeader">
            {{ $t(item[itemHeaders[0].value]) }}
          </th>
          <td v-else class="pl-8">
            {{ $t(item[itemHeaders[0].value]) }}
          </td>
          <template v-if="!item.empty">
            <td v-for="header in itemHeaders.slice(1)" :key="header.value">
              <slot
                v-if="$scopedSlots[`item.${header.value}`]"
                :name="`item.${header.value}`"
                :item="item"
                :index="index"
              />
              <template v-else>
                {{ item[header.value] }}
              </template>
            </td>
          </template>
          <template v-else>
            <td :colspan="itemHeaders.slice(1).length">
              <slot name="empty" :item="item"/>
            </td>
          </template>
        </tr>
      </template>

      <template v-for="(_, scopedSlotName) in $scopedSlots" #[scopedSlotName]="slotData">
        <slot :name="scopedSlotName" v-bind="slotData"/>
      </template>
    </v-data-table-custom>

    <div v-if="showFooterPagination" class="b-data-table-footer">
      <template v-if="showPerPage">
        <span v-if="isDesktopDevice">{{ $t("Строк на странице:") }}</span>
        <b-select
          v-model="perPage"
          :items="perPageValues"
          item-text="text"
          item-value="value"
          :menu-props="{zIndex: 100, offsetY: true, top: true}"
          required
          attach
          hide-details
          @change="perPageChangeHandler"
        />
      </template>
      <v-pagination
        v-model="pageModel"
        color="secondary"
        :length="pageCount"
        :total-visible="7"
        :disabled="disablePaginationWhileLoading"
        prev-icon="icon-chevron-left"
        next-icon="icon-chevron-right"
        @input="pageChangeHandler"
      />
    </div>
  </div>
</template>

<script>
import VDataTableCustom from "./VDataTable";

export default {
  name: "BDataTable",
  components: { VDataTableCustom },
  inheritAttrs: false,
  props: {
    page: {
      type: Number,
      required: false,
      default: null,
    },
    disablePagination: {
      type: Boolean,
      default: false,
    },
    disableFooterPagination: {
      type: Boolean,
      default: false,
    },
    disableSort: {
      type: Boolean,
      default: true,
    },
    fixedHeader: {
      type: Boolean,
      default: false,
    },
    groupBy: {
      type: [String, Array],
      default: "",
    },
    sortBy: {
      type: [String, Array],
      default: "",
    },
    headers: {
      type: Array,
      default: () => [],
    },
    height: {
      type: [String, Number],
      default: undefined,
    },
    hideMasterCheckbox: {
      type: Boolean,
      default: false,
    },
    itemKey: {
      type: String,
      default: "id",
    },
    items: {
      type: Array,
      default: () => [],
    },
    mobileScrollable: {
      type: Boolean,
      default: false,
    },
    simpleGrouped: {
      type: Boolean,
      default: false,
    },
    mobileCardsSimple: {
      type: Boolean,
      default: false,
    },
    showSelect: {
      type: Boolean,
      default: false,
    },
    showSelectFrom: {
      type: Boolean,
      default: true,
    },
    // custom items
    itemsTotal: {
      type: Number,
      default: 0,
    },
    itemsPerPage: {
      type: Number,
      default: 50,
    },
    // ожидается массив объектов типа {text, value}
    perPageOptions: {
      type: Array,
      default: () => null,
    },
    showPerPage: {
      type: Boolean,
      default: true,
    },
    groupCrossSelect: {
      type: Boolean,
      default: false,
    },
    showToolbar: {
      type: Boolean,
      default: false,
    },
    stickyColumns: {
      type: Boolean,
      default: false,
    },
    selection: {
      type: String,
      default: "результат",
    },
    itemsSelected: {
      type: Array,
      default: () => [],
    },
    simple: {
      type: Boolean,
      default: false,
    },
    hasInputs: {
      type: Boolean,
      default: false,
    },
    serverSidePagination: {
      type: Boolean,
      default: false,
    },
    perPageStorageKey: {
      type: String,
      default: "",
    },
    resetPaginatorData: {
      type: Boolean,
      default: false,
    },
    hasActions: {
      type: Boolean,
      default: true,
    },
    draggable: {
      type: Boolean,
      default: false,
    },
    itemClass: {
      type: [String, Function],
      default: "",
    },
    leaveGroupCollapsed: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      wrapper: null,
      selectedItemsTmp: [],
      selectedItems: this.itemsSelected,
      internalPage: 1,
      pageCount: 0,
      selectAll: false,
      firstColumnWidth: 0,
      showNoData: false,
      showNoDataInfo: false,
      showNoDataError: false,
      perPage: +this.itemsPerPage,
      itemState: {
        disabled: 1,
        pending: 2,
        warning: 3,
      },
      isFirstThObserving: false,
      options: {},
      modifiedHeaders: JSON.parse(JSON.stringify(this.headers)),
    };
  },
  computed: {
    pageModel: {
      get() {
        return this.page ?? this.internalPage;
      },
      set(val) {
        if (this.page) {
          this.$emit("updatePage", val);
        } else {
          this.internalPage = val;
        }
      },
    },
    mobileBreakpoint() {
      return !this.mobileScrollable ? this.device.mobileBreakpoint : 0;
    },
    showSelectColumn() {
      return this.showSelect && this.items.length > 0;
    },
    showFooterPagination() {
      return !this.disableFooterPagination && !this.simple && this.itemsTotal > 10;
    },
    isColumnsSticky() {
      return this.mobileScrollable && this.items.length > 0 && this.stickyColumns;
    },
    isGroupMode() {
      return this.groupBy.length > 0;
    },
    selectedItemGroup() {
      if (this.isGroupMode && this.selectedItems.length) {
        return this.selectedItems[0][this.groupBy];
      }
      return "";
    },
    defaultPerPageValues() {
      return this.generatePerPageValues(this.itemsPerPage, 0);
    },
    perPageValues() {
      return this.generatePerPageValues(this.itemsPerPage, this.itemsTotal);
    },
    isMasterCheckboxIndeterminate() {
      const selectedOnPage = this.selectableItems.filter(item => this.selectedItems.includes(item));

      return selectedOnPage.length > 0 && selectedOnPage.length < this.selectableItems.length;
    },
    // Проверяет, выбраны ли все элементы на текущей странице
    isAllItemsOnPageSelected() {
      return this.selectableItems.every(item => this.selectedItems.includes(item));
    },
    // Строки, которые пользователь может выбрать на текущей странице
    selectableItems() {
      return this.paginatedItems.filter(item => item.item_state !== this.itemState.pending && item.item_state !== this.itemState.disabled);
    },
    // Строки, которые отображаются на странице
    paginatedItems() {
      if (this.serverSidePagination) {
        return this.items;
      }
      const startIndex = (this.pageModel - 1) * this.perPage;
      const endIndex = startIndex + this.perPage;

      return this.items.slice(startIndex, endIndex);
    },
    defaultPerPage() {
      const storedDefaultPerPage = this.perPageStorageKey ? Number(localStorage.getItem(this.perPageStorageKey)) : 0;

      // this.perPage !== undefined, чтобы гарантировать, что свойство пересчитается при изменении пользователем perPage
      if (storedDefaultPerPage && this.perPage !== undefined) {
        // Если значение по умолчанию было ранее установлено, то проверяем входит ли оно в текущий массив perPageValues
        const isValid = this.perPageValues.some(perPage => perPage.value === storedDefaultPerPage);

        // Если значение прошло валидацию, то берем его в качестве значения по умолчанию, если нет, то берем ближайшее к нему значение
        return isValid ? storedDefaultPerPage : this.perPageValues[this.perPageValues.length - 1].value;
      }

      return this.perPageValues[0].value;
    },
    disablePaginationWhileLoading() {
      // Не понял чего делает проп disablePagination, это свойство управляет дизейблом пагинатора, при серверной пагинации
      return this.serverSidePagination && this.$attrs.loading;
    },
  },
  watch: {
    items() {
      this.clearSelectedItems();

      if (this.selectedItemsTmp.length) {
        this.selectedItems = [...this.selectedItemsTmp];
        this.selectedItemsTmp = [];
      }
    },
    resetPaginatorData() {
      this.pageModel = 1;
      this.perPage = this.defaultPerPage;
    },
    itemsTotal() {
      this.pageModel = 1;
      this.perPage = this.defaultPerPage;
      this.setPageCount();
    },
    selectedItems(value) {
      if (this.isAllItemsOnPageSelected) {
        this.selectAll = true;
      } else if (!this.isMasterCheckboxIndeterminate) {
        setTimeout(() => {
          this.selectAll = false;
        }, 0);
      }

      this.$emit("updateSelectedItems", value);
    },
    showSelect(value) {
      if (!value) {
        this.clearSelectedItems();
      }
    },
    headers(value) {
      this.modifiedHeaders = JSON.parse(JSON.stringify(value));
      this.resizeHeightHeaderColumn();
    },
    options: {
      handler(value) {
        this.$emit("changeSort", value);
      },
      deep: true,
    },
  },
  updated() {
    this.setNoDataSlots();
    if (this.isColumnsSticky && !this.isFirstThObserving) {
      this.observeFirstColumnWidth();
    }
  },
  created() {
    this.setNoDataSlots();

    if (this.defaultPerPage) {
      this.perPage = this.defaultPerPage;
      this.$emit("setDefaultPerPage", this.defaultPerPage);
    }
  },
  mounted() {
    this.setPageCount();
    if (this.isColumnsSticky && !this.isFirstThObserving) {
      this.observeFirstColumnWidth();
    }
    this.resizeHeightHeaderColumn();
  },
  methods: {
    generatePerPageValues(itemsPerPage, itemsTotal) {
      if (this.perPageOptions && this.perPageOptions.length) {
        return this.perPageOptions;
      }
      const limit = 50;
      const itemsLimit = itemsTotal && itemsTotal <= limit ? itemsTotal : limit;
      const perPageValues = [];

      for (let i = 1; i < limit; i++) {
        const currentValue = itemsPerPage * i;

        if (currentValue < itemsLimit) {
          perPageValues.push({
            text: currentValue,
            value: currentValue,
          });
        } else {
          perPageValues.push({
            text: this.itemsTotal > limit ? itemsLimit : this.$t("Все"),
            value: itemsLimit,
          });
          break;
        }
      }

      return perPageValues;
    },
    saveSelectedItemsData() {
      this.selectedItemsTmp = [...this.selectedItems];
    },
    setNoDataSlots() {
      this.showNoData = this.$slots["no-data"] !== undefined;
      this.showNoDataInfo = this.$slots["no-data-info"] !== undefined;
      this.showNoDataError = this.$slots["no-data-error"] !== undefined;
    },
    clearSelectedItems() {
      this.selectedItems = [];
    },
    isCheckboxDisabled(item) {
      return this.selectedItemGroup ? this.selectedItemGroup !== item[this.groupBy] : false;
    },
    getRowClass(item) {
      switch (item.item_state) {
        case this.itemState.disabled:
          return "disabled";
        case this.itemState.pending:
          return "pending";
        case this.itemState.warning:
          return "v-data-table--tr-warning";
        default:
          if (typeof this.itemClass === "function") {
            return this.itemClass(item);
          }
          return this.itemClass;
      }
    },
    resizeHeightHeaderColumn() {
      const table = this.$refs.wrapper;
      const allHeader = Array.from(table.querySelectorAll(".v-data-table-header th"));
      const elements = table.querySelectorAll(".v-data-table-header__column-text");
      const hasTitle = Array.from(elements).some(el => el.hasAttribute("title"));
      allHeader.map((item) => {
        if (hasTitle) {
          item.style.alignContent = "start";
        } else {
          item.style.alignContent = "center";
        }
      });
      this.$emit("hasHeaderNameTitle", hasTitle);
    },
    observeFirstColumnWidth() {
      const $firstTh = document.querySelector(".v-data-table-header th");
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          this.firstColumnWidth = entry.target.offsetWidth;
        }
      });
      if ($firstTh) {
        resizeObserver.observe($firstTh);
        this.isFirstThObserving = true;
      }
    },
    perPageChangeHandler() {
      if (this.showSelect && this.serverSidePagination) {
        this.saveSelectedItemsData();
      }
      this.setPageCount();

      // Сохраняем в localStorage значение perPage по умолчанию
      if (this.perPageStorageKey) {
        // Мы сохраняем только валидные значения, так как, может быть кейс, когда пользователь выбрал значение "все", которое после обновления страницы может
        // не входить в новый массив perPageValues, в таком случае, значение не подставится в v-select с perPage
        const isValid = this.defaultPerPageValues.some(perPage => perPage.value === this.perPage);

        if (isValid) {
          localStorage.setItem(this.perPageStorageKey, this.perPage);
          this.$emit("setDefaultPerPage", this.defaultPerPage);
        }
      }
      this.$emit("updatePerPage", this.perPage);
      this.pageModel = 1;
    },
    pageChangeHandler(page) {
      if (this.showSelect && this.serverSidePagination) {
        this.saveSelectedItemsData();
      }

      // Скролим до вверха таблицы если она выходит за пределы экрана
      const wrapperRect = this.$refs.wrapper.getBoundingClientRect().top;
      if (wrapperRect < 0) {
        const bodyRect = document.body.getBoundingClientRect().top;
        window.scrollTo({
          top: (wrapperRect - bodyRect) - 16,
          behavior: "smooth",
        });
      }

      // При смене страницы актуализируем состояние чекбокса в заголовке
      this.selectAll = this.isAllItemsOnPageSelected;

      this.$emit("updatePage", page);
    },
    changeMasterCheckbox(value) {
      if (value && !this.isMasterCheckboxIndeterminate) {
        this.selectedItems = [...this.selectedItems, ...this.selectableItems];
      } else {
        // Исключаем из выбранных строк, те строки, которые отображаются на нашей странице
        this.selectableItems.forEach(item => {
          this.selectedItems = this.selectedItems.filter(i => i !== item);
        });
      }
    },
    setPageCount() {
      this.options.itemsPerPage = this.perPage;
      this.pageCount = Math.ceil(this.itemsTotal / this.perPage);
    },
  },
};
</script>

<style lang="scss" scoped>
@import 'styles';
</style>
