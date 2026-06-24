<template>
  <div :class="[$style.scroller, { [$style.outer]: !selfScroll }]">
    <div
      v-if="$slots.before"
      ref="before"
      class="before"
      :style="{ width: contentWidth }"
    >
      <slot name="before"/>
    </div>

    <div
      ref="wrapper"
      :class="['item-wrapper', $style['item-wrapper']]"
      :style="{
        minHeight: totalSize + 'px',
        minWidth: contentWidth,
      }"
    >
      <div v-if="usePlaceholderLayer" :class="$style['placeholder-layer']">
        <div
          v-for="slot in placeholderSlots"
          :key="'ph-' + slot.index"
          :class="$style['placeholder-item']"
          :style="{
            top: slot.top + 'px',
            height: slot.height + 'px',
            width: contentWidth || '100%',
          }"
        >
          <slot
            name="placeholder"
            :index="slot.index"
            :top="slot.top"
            :height="slot.height"
          >
            <div :class="$style['placeholder-inner']"/>
          </slot>
        </div>
      </div>
      <div :class="$style['item-layer']">
        <item-view
          v-for="view of activeRenderedViews"
          :key="view.raw.id"
          :view="view"
          :disable-transform="disableTransform"
        >
          <template #default="props">
            <slot v-bind="props"/>
          </template>
        </item-view>
      </div>
    </div>

    <div v-if="$slots.after" ref="after" class="after">
      <slot name="after"/>
    </div>
  </div>
</template>

<script>
import { resolveScrollWindowNested,
  resolveScrollWindowPageScroll,
  resolveScrollWindowSelf } from "../table/lib/scroll/resolve-scroll-window.js";
import { computeClampedVisibleItemRange } from "../table/lib/virtualizer/virtualizer-compute-visible-range.js";
import { readNestedOuterViewportMetrics } from "../table/lib/virtualizer/virtualizer-scroll-snapshot.js";
import { shouldSkipVirtualizerScrollUpdate } from "../table/lib/virtualizer/virtualizer-should-skip-scroll.js";
import { syncVirtualizerVisibleViews } from "../table/lib/virtualizer/virtualizer-sync-visible-views.js";
import { rebuildActiveRenderedViews } from "../table/lib/virtualizer/virtualizer-active-views.js";
import { shouldResetVirtualizerObjectPool } from "../table/lib/virtualizer/should-reset-virtualizer-object-pool.js";
import MeasurementCache from "./assets/measurement-cache.js";
import VirtualViewPool from "./assets/object-pool.js";
import VirtualView from "./assets/virtual-view.js";
import ItemView from "./item-view.vue";
import resolveElement from "@/utils/resolve-element.js";

const UPDATE_DELAY = 100;
const COMPONENT_NAME = "BnovoTariffPricesAndRestrictionsTableVirtualizer";

function isWindowContainer(container) {
  return typeof window !== "undefined" && container === window;
}

function isDocumentContainer(container) {
  if (typeof document === "undefined") {
    return false;
  }

  return container === document
    || container === document.documentElement
    || container === document.body
    || container === document.scrollingElement;
}

const NESTED_SCROLL_BOTTOM_EPSILON_PX = 8;

function isScrollElementAtBottom(scrollElement, epsilonPx = 2) {
  if (!scrollElement || typeof scrollElement.scrollTop !== "number") {
    return false;
  }
  const maxScroll = Math.max(0, (scrollElement.scrollHeight || 0) - (scrollElement.clientHeight || 0));
  return scrollElement.scrollTop >= maxScroll - epsilonPx;
}

export default {
  name: COMPONENT_NAME,
  components: { ItemView },
  props: {
    /**
     * Элементы списка для виртуализации
     */
    items: {
      type: Array,
      required: true,
    },
    /**
     * Поле, по которому можно однозначно идентифицировать элемент списка.
     * Обязательно должен быть уникальным среди остальных
     */
    keyField: {
      type: String,
      default: "id",
    },
    /**
     * Поле, по которому можно узнать высоту элемента списка.
     * Поле обязательное.
     */
    sizeField: {
      type: String,
      default: "size",
    },
    /**
     * Поле, по которому можно отнести элемент к какой-нибудь группе.
     * Группы используются для пула представлений, каждый тип объектов будет иметь свой пул для переиспользования.
     */
    typeField: {
      type: String,
      default: "type",
    },
    /**
     * Размер буфера в пикселях, добавляемый к видимой области прокрутки.
     * Нужен для минимизации мерцаний при скроллинге.
     */
    buffer: {
      type: Number,
      default: 200,
    },
    contentWidth: {
      type: String,
      default: "",
    },
    minItemSize: {
      type: Number,
      default: null,
    },
    updateDelay: {
      type: Number,
      default: UPDATE_DELAY,
    },
    getScrollContainer: {
      type: Function,
      default: null,
    },
    disableTransform: {
      type: Boolean,
      default: false,
    },
    /**
     * Слой плейсхолдеров под строками (актуально при динамических высотах).
     * При фиксированных height в items можно отключить, чтобы не дублировать DOM.
     */
    usePlaceholderLayer: {
      type: Boolean,
      default: true,
    },
    /**
     * Жёсткий потолок числа одновременно отрисовываемых строк (после буфера в пикселях).
     * null — без ограничения.
     */
    maxRenderedRows: {
      type: Number,
      default: null,
    },
    /**
     * Порог пропуска кадра по |Δscroll| (px). null — логика по minItemSize / cache.minSize.
     * Малое значение (1) сглаживает скролл при фиксированных высотах строк.
     */
    scrollPositionSkipThresholdPx: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      virtualElements: [],
      /** Активные VirtualView для v-for (без деактивированных «скрытых» узлов). */
      activeRenderedViews: [],
      selfScroll: false,
      ready: false,
      visibleRange: { startIndex: 0, endIndex: 0 },
      measurementCacheStore: null,
    };
  },
  computed: {
    itemCount() {
      return this.items.length;
    },
    measurementCache() {
      return this.getMeasurementCache();
    },
    totalSize() {
      return this.getMeasurementCache()?.totalSize ?? 0;
    },
    placeholderSlots() {
      if (!this.usePlaceholderLayer) {
        return [];
      }
      const cache = this.getMeasurementCache();
      if (!cache) {
        return [];
      }
      const { startIndex, endIndex } = this.visibleRange;
      const result = [];
      for (let i = startIndex; i < endIndex; i++) {
        result.push({
          index: i,
          top: cache.getStartOffset(i),
          height: cache.getSize(i),
        });
      }
      return result;
    },
  },
  watch: {
    /**
     * Любая новая ссылка на `items` сбрасывает кэш высот и пересчитывает диапазон.
     * Родитель (`table/index`) мемоизирует `tableRows`, чтобы не сбрасывать виртуализатор при каждом перерисовке store.
     */
    items() {
      this.measurementCacheStore = null;
      this.$_lastStartIndex = -1;
      this.$_lastEndIndex = -1;
      this.forceUpdateState();
    },
    disableTransform() {
      this.updateViewStyles();
    },
  },
  created() {
    this.$_lastScrollPosition = 0;
    this.$_scrollDirty = false;
    this.$_lastStartIndex = 0;
    this.$_lastEndIndex = 0;
    this.$_objectPool = new VirtualViewPool();
    this.$_virtualElementsSet = new Set();
    this.$_updateTimeout = null;
    this.$_refreshTimeout = null;
    this.$_resizeObserver = null;
    this.$_resizeRafId = null;
    this.$_rafIds = new Set();
    /** @type {boolean} кэш метрик outer для nested-скролла (invalidate на resize) */
    this.$_nestedOuterBoundsValid = false;
    this.$_nestedOuterTop = 0;
    this.$_nestedOuterClientHeight = 0;
  },
  mounted() {
    this.addListeners();
    this.$nextTick(() => {
      this.ready = true;
      this.forceUpdateState();
    });
  },
  beforeUnmount() {
    this.clear();
    this.removeListeners();
  },
  methods: {
    getMeasurementCache() {
      const count = this.itemCount;
      if (this.measurementCacheStore && this.measurementCacheStore._count === count) {
        return this.measurementCacheStore;
      }
      const sizeGetter = (index) => this.items[index]?.[this.sizeField] ?? this.minItemSize;
      this.measurementCacheStore = new MeasurementCache(count, this.minItemSize, sizeGetter);
      return this.measurementCacheStore;
    },
    createView(item, key, type, index) {
      const view = new VirtualView({
        item,
        key,
        type,
        index,
      });
      view.updateStyle(this.disableTransform);
      this.virtualElements.push(view);
      this.$_virtualElementsSet.add(view);
      return view;
    },
    requestFrame(cb) {
      let frameId = -1;
      frameId = requestAnimationFrame(() => {
        this.$_rafIds.delete(frameId);
        cb();
      });
      this.$_rafIds.add(frameId);
      return frameId;
    },
    cancelPendingFrames() {
      if (!this.$_rafIds) {
        return;
      }
      for (const frameId of this.$_rafIds) {
        cancelAnimationFrame(frameId);
      }
      this.$_rafIds.clear();
    },
    clearPendingTimeouts() {
      if (this.$_updateTimeout) {
        clearTimeout(this.$_updateTimeout);
        this.$_updateTimeout = null;
      }
      if (this.$_refreshTimeout) {
        clearTimeout(this.$_refreshTimeout);
        this.$_refreshTimeout = null;
      }
    },
    handleScroll(ev) {
      this.$emit("scroll", ev);

      if (this.$_scrollDirty) {
        return;
      }

      this.$_scrollDirty = true;

      const requestUpdate = () => {
        this.requestFrame(() => {
          this.$_scrollDirty = false;
          const smoothRangeChange = this.updateVisibleViews(false, true);

          if (!smoothRangeChange) {
            clearTimeout(this.$_refreshTimeout);
            this.$_refreshTimeout = setTimeout(() => {
              this.$_refreshTimeout = null;
              this.handleScroll();
            }, this.updateDelay + 50);
          }
        });
      };

      if (this.$_updateTimeout) {
        return;
      }

      requestUpdate();

      if (this.updateDelay > 0) {
        this.$_updateTimeout = setTimeout(() => {
          this.$_updateTimeout = null;
          if (this.$_scrollDirty) {
            requestUpdate();
          }
        }, this.updateDelay);
      }
    },
    updateVisibleViews(force = false, checkPositionDiff = false, scrollSnapshot = null, options = {}) {
      const fullPoolReset = options.fullPoolReset !== false;
      const scroll = scrollSnapshot != null ? scrollSnapshot : this.getScroll();
      if (this.itemCount > 0 && checkPositionDiff && this.shouldSkipUpdate(scroll)) {
        return true;
      }

      this.$_lastScrollPosition = scroll.start;

      const { startIndex, endIndex } = this.extractRange(scroll);

      if (
        !force
        && this.itemCount > 0
        && startIndex === this.$_lastStartIndex
        && endIndex === this.$_lastEndIndex
      ) {
        return true;
      }

      if (this.usePlaceholderLayer) {
        this.visibleRange = { startIndex, endIndex };
      }

      const overlapsPrevRenderedRange = startIndex <= this.$_lastEndIndex && endIndex >= this.$_lastStartIndex;

      if (shouldResetVirtualizerObjectPool({
        overlapsPrevRenderedRange,
        force,
        fullPoolReset,
      })) {
        this.resetObjectPool();
      } else {
        // Иначе возвращаем в пул только невидимые или неизмеренные элементы.
        this.handleHiddenOrUnmeasuredViews(startIndex, endIndex);
      }

      this.syncVisibleViews(startIndex, endIndex);
      this.syncActiveRenderedViews(startIndex, endIndex);

      this.$_lastStartIndex = startIndex;
      this.$_lastEndIndex = endIndex;

      return overlapsPrevRenderedRange;
    },
    syncActiveRenderedViews(startIndex, endIndex) {
      const next = rebuildActiveRenderedViews({
        items: this.items,
        startIndex,
        endIndex,
        keyField: this.keyField,
        getActiveView: (key) => this.$_objectPool.getActiveView(key),
        prevActiveRenderedViews: this.activeRenderedViews,
      });
      if (next !== this.activeRenderedViews) {
        this.activeRenderedViews = next;
      }
    },
    getScroll() {
      const self = this.$el;
      const outer = this.getResolvedScrollContainer();
      const scrollElement = this.getScrollElement();

      if (self === scrollElement) {
        return resolveScrollWindowSelf(self.scrollTop, self.clientHeight);
      }

      if (this.isPageScrollContainer(outer)) {
        const selfBounds = self.getBoundingClientRect();
        const viewportHeight = this.getViewportHeight(outer);
        return resolveScrollWindowPageScroll(
          selfBounds.top,
          selfBounds.height,
          viewportHeight,
        );
      }

      this.ensureNestedOuterViewportCache(scrollElement, outer);
      const selfBounds = self.getBoundingClientRect();
      const beforeHeight = this.$refs.before?.scrollHeight ?? 0;
      const afterHeight = this.$refs.after?.scrollHeight ?? 0;
      const selfHeight = Math.max(
        selfBounds.height,
        this.totalSize + beforeHeight + afterHeight,
      );
      const scroll = resolveScrollWindowNested(
        selfBounds.top,
        selfHeight,
        this.$_nestedOuterTop,
        this.$_nestedOuterClientHeight,
      );
      if (scroll.end >= selfHeight - NESTED_SCROLL_BOTTOM_EPSILON_PX) {
        return { start: scroll.start, end: selfHeight };
      }
      if (isScrollElementAtBottom(scrollElement)) {
        return { start: scroll.start, end: Math.max(scroll.end, selfHeight) };
      }
      return scroll;
    },
    isPageScrollContainer(container) {
      return isWindowContainer(container) || isDocumentContainer(container);
    },
    getResolvedScrollContainer() {
      if (this.getScrollContainer) {
        const value = this.getScrollContainer();
        if (value == null) {
          return this.$el;
        }
        return resolveElement(value) ?? value;
      }

      return this.$el;
    },
    getScrollElement() {
      const container = this.getResolvedScrollContainer();
      if (isDocumentContainer(container) && typeof document !== "undefined") {
        return document.scrollingElement || document.documentElement || document.body;
      }

      return container;
    },
    getScrollEventTarget() {
      const container = this.getResolvedScrollContainer();
      if (this.isPageScrollContainer(container) && typeof window !== "undefined") {
        return window;
      }

      return this.getScrollElement();
    },
    getViewportHeight(container) {
      if (this.isPageScrollContainer(container)) {
        if (typeof window !== "undefined" && typeof window.innerHeight === "number") {
          return window.innerHeight;
        }
        if (typeof document !== "undefined") {
          return document.documentElement?.clientHeight || 0;
        }
        return 0;
      }

      return container?.clientHeight || 0;
    },
    getScrollTop(container) {
      if (isWindowContainer(container)) {
        return window.pageYOffset || document.documentElement?.scrollTop || document.body?.scrollTop || 0;
      }
      if (isDocumentContainer(container)) {
        return document.scrollingElement?.scrollTop || document.documentElement?.scrollTop || document.body?.scrollTop || 0;
      }

      return container?.scrollTop || 0;
    },
    invalidateNestedOuterViewportCache() {
      this.$_nestedOuterBoundsValid = false;
    },
    ensureNestedOuterViewportCache(scrollElement, outer) {
      if (this.$_nestedOuterBoundsValid) {
        return;
      }
      if (!scrollElement || this.$el === scrollElement || this.isPageScrollContainer(outer)) {
        this.$_nestedOuterBoundsValid = true;
        return;
      }
      const m = readNestedOuterViewportMetrics(scrollElement);
      this.$_nestedOuterTop = m.outerTop;
      this.$_nestedOuterClientHeight = m.outerClientHeight;
      this.$_nestedOuterBoundsValid = true;
    },
    addListeners() {
      const container = this.getResolvedScrollContainer();
      const scrollElement = this.getScrollElement();
      const eventTarget = this.getScrollEventTarget();
      this.selfScroll = this.$el === scrollElement;
      this.invalidateNestedOuterViewportCache();
      eventTarget.addEventListener("scroll", this.handleScroll, { passive: true });
      if (this.isPageScrollContainer(container)) {
        eventTarget.addEventListener("resize", this.scheduleResizeUpdate);
      } else if (typeof ResizeObserver !== "undefined" && scrollElement) {
        const observedEl = resolveElement(scrollElement) ?? scrollElement;
        if (observedEl instanceof Element) {
          this.$_resizeObserver = new ResizeObserver(() => this.scheduleResizeUpdate());
          this.$_resizeObserver.observe(observedEl);
        }
      }
    },
    removeListeners() {
      this.invalidateNestedOuterViewportCache();
      if (this.$_resizeRafId != null) {
        cancelAnimationFrame(this.$_resizeRafId);
        this.$_rafIds?.delete(this.$_resizeRafId);
        this.$_resizeRafId = null;
      }
      const container = this.getResolvedScrollContainer();
      const target = this.getScrollEventTarget();
      target.removeEventListener("scroll", this.handleScroll);
      if (this.isPageScrollContainer(container)) {
        target.removeEventListener("resize", this.scheduleResizeUpdate);
      }
      if (this.$_resizeObserver) {
        this.$_resizeObserver.disconnect();
        this.$_resizeObserver = null;
      }
    },
    addScrollTop(offset) {
      const container = this.getResolvedScrollContainer();
      if (this.isPageScrollContainer(container) && typeof window !== "undefined") {
        window.scrollTo(0, this.getScrollTop(container) + offset);
        return;
      }

      const el = this.getScrollElement();
      el.scrollTop += offset;
    },
    /**
     * Определяет можно ли пропустить обновление при незначительном изменении позиции скролла относительно предыдущей.
     * @param scroll
     * @returns {boolean}
     */
    shouldSkipUpdate(scroll) {
      if (isScrollElementAtBottom(this.getScrollElement())) {
        return false;
      }
      const positionDiff = Math.abs(scroll.start - this.$_lastScrollPosition);
      return shouldSkipVirtualizerScrollUpdate({
        positionDiff,
        minItemSize: this.minItemSize,
        cacheMinSize: this.measurementCache.minSize,
        absoluteSkipThresholdPx: this.scrollPositionSkipThresholdPx,
      });
    },
    extractRange(scroll) {
      const beforeHeight = this.$refs.before?.scrollHeight ?? 0;
      const afterHeight = this.$refs.after?.scrollHeight ?? 0;
      return computeClampedVisibleItemRange({
        scrollStart: scroll.start,
        scrollEnd: scroll.end,
        beforeHeight,
        afterHeight,
        buffer: this.buffer,
        itemCount: this.itemCount,
        measurementCache: this.measurementCache,
        maxRenderedRows: this.maxRenderedRows,
      });
    },
    /**
     * Полный сброс пула представлений и возвращение всех представлений в пул для переиспользования
     */
    resetObjectPool() {
      this.$_objectPool.reset();
      for (const view of this.virtualElements) {
        this.$_objectPool.recycle(view, -9999, this.disableTransform);
      }
      this.virtualElements = [];
      this.$_virtualElementsSet.clear();
      this.activeRenderedViews = [];
    },
    /**
     * Освобождает из активных представлений те view, которые:
     * 1. Вышли за область видимого диапазона (границы скролла + буфферный размер)
     * 2. Не имеют размеров.
     * @param startIndex
     * @param endIndex
     */
    handleHiddenOrUnmeasuredViews(startIndex, endIndex) {
      for (let i = 0; i < this.virtualElements.length; i++) {
        const view = this.virtualElements[i];
        if (view.raw.used) {
          const viewVisible = view.inHalfRange(startIndex, endIndex);
          const viewSize = this.measurementCache.getSize(view.raw.index);
          if (!viewVisible || !viewSize) {
            this.$_objectPool.recycle(view, -9999, this.disableTransform);
          }
        }
      }
    },
    /**
     * Синхронизирует набор активных виртуальных представлений с текущим видимым диапазоном элементов.
     * Он гарантирует, что для каждого индекса в диапазоне `[startIndex, endIndex)` существует ровно одно
     * активное представление, привязанное к соответствующему элементу данных.
     *
     * Логика работы:
     * 1. Для каждого индекса `i` в диапазоне:
     *    - Извлекает элемент данных `items[i]` и его уникальный ключ.
     *    - Проверяет, существует ли уже активное представление с таким `key`.
     *    - Если нет - пытается переиспользовать неактивное представление подходящего типа из пула.
     *    - Если и в пуле нет - создаёт новое представление.
     * 2. Обновляет данные и позицию представления.
     * 3. Регистрирует представление как активное.
     *
     * @param {number} startIndex - Начальный индекс (включительно) видимого диапазона.
     * @param {number} endIndex - Конечный индекс (исключительно) видимого диапазона.
     */
    syncVisibleViews(startIndex, endIndex) {
      syncVirtualizerVisibleViews({
        startIndex,
        endIndex,
        items: this.items,
        keyField: this.keyField,
        typeField: this.typeField,
        measurementCache: this.measurementCache,
        pool: this.$_objectPool,
        virtualElementsSet: this.$_virtualElementsSet,
        virtualElements: this.virtualElements,
        createView: (item, key, type, index) => this.createView(item, key, type, index),
        disableTransform: this.disableTransform,
      });
    },
    updateViewStyles() {
      for (const view of this.virtualElements) {
        view.updateStyle(this.disableTransform);
      }
    },
    clear() {
      this.measurementCacheStore = null;
      if (this.$_objectPool) {
        this.$_objectPool.reset();
        this.$_objectPool = null;
      }
      if (this.$_virtualElementsSet) {
        this.$_virtualElementsSet.clear();
      }
      this.cancelPendingFrames();
      this.clearPendingTimeouts();
      this.$_resizeRafId = null;
    },
    forceUpdateState({ fullPoolReset = true } = {}) {
      this.invalidateNestedOuterViewportCache();
      this.updateVisibleViews(true, false, null, { fullPoolReset });
    },
    scheduleResizeUpdate() {
      if (this.$_resizeRafId != null) {
        return;
      }
      this.$_resizeRafId = this.requestFrame(() => {
        this.$_resizeRafId = null;
        this.invalidateNestedOuterViewportCache();
        this.$emit("resize");
        if (this.ready) {
          this.updateVisibleViews(false);
        }
      });
    },
  },
};
</script>

<style module lang="scss">
.scroller {
  position: relative;

  &:not(.outer) {
    overflow-y: auto;
  }
}

.item-wrapper {
  box-sizing: border-box;
  position: relative;
  width: 100%;
}

.placeholder-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  pointer-events: none;
  z-index: 0;
}

.placeholder-item {
  position: absolute;
  left: 0;
  box-sizing: border-box;
}

.placeholder-inner {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
}

.item-layer {
  position: relative;
  z-index: 1;
}
</style>
