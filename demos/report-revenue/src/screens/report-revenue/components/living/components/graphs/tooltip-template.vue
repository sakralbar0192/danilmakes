<template>
  <article ref="tooltip" class="report-revenue__tooltip" :style="isVisibleStyle">
    <slot>
      <component :is="tooltipComponent" :tooltip-data-props="tooltipData">
        <template v-for="(_, slotName) in $slots" #[slotName]="props">
          <slot :name="slotName" v-bind="props"/>
        </template>
      </component>
    </slot>
  </article>
</template>

<script>
import { mapGetters } from "vuex";
import strategiesDatasetDictionary from "./dictionaries/strategiesDatasetDictionary";
import SoloDatasetTooltip from "./tooltips/solo-dataset-tooltip.vue";
import ManyDatasetTooltip from "./tooltips/many-dataset-tooltip.vue";

const STANDART_OFFSET = 20;

export default {
  name: "ReportRevenueTooltipTemplate",
  props: {
    graphId: {
      type: String,
      default: "",
    },
    position: {
      type: Object,
      default: () => { return { caretX: 0, caretY: 0 }; },
    },
    tooltipData: {
      type: Array,
      default: () => [],
    },
    isVisible: {
      type: Boolean,
      default: false,
    },
    wrapperRef: {
      type: HTMLDivElement,
      required: false,
      default: () => null,
    },
  },
  data() {
    return { animationFrameId: null };
  },
  computed: {
    ...mapGetters("revenueReport", ["currentGroupTypeId"]),
    isVisibleStyle() {
      return `
        z-index: ${this.isVisible ? 5 : -1};
        opacity: ${this.isVisible ? 1 : 0}
      `;
    },
    tooltipComponent() {
      if (this.currentGroupTypeId === strategiesDatasetDictionary.months) {
        return ManyDatasetTooltip;
      }
      return SoloDatasetTooltip;
    },
  },
  watch: {
    position(newVal) {
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
      }
      this.animationFrameId = requestAnimationFrame(() => {
        this.updateTooltipPosition(newVal);
      });
    },
    isVisible(newVal) {
      if (!newVal && this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    },
  },
  beforeUnmount() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  },
  methods: {
    updateTooltipPosition(position) {
      const tooltip = this.$refs.tooltip;
      if (tooltip) {
        // Получаем ссылки на элементы тултипа и контейнера
        const container = this.wrapperRef;
        const containerRect = container.getBoundingClientRect();
        const tooltipWidth = tooltip.scrollWidth;

        // ВЕРТИКАЛЬНОЕ ПОЗИЦИОНИРОВАНИЕ:
        // Размещаем тултип выше курсора мыши с учётом:
        // - position.positionY: глобальная Y координата курсора
        // - position.caretY: смещение курсора внутри элемента (caret - указатель)
        // - tooltip.scrollHeight: высота самого тултипа
        // - STANDART_OFFSET: стандартный отступ от курсора
        tooltip.style.top = `${position.positionY + position.caretY - tooltip.scrollHeight - STANDART_OFFSET}px`;

        // ГОРИЗОНТАЛЬНОЕ ПОЗИЦИОНИРОВАНИЕ:
        // Определяем позицию тултипа относительно контейнера

        // caretXInContainer - позиция курсора внутри контейнера (локальные координаты)
        const caretXInContainer = position.caretX;

        // centerPosition - позиция центра тултипа относительно курсора
        // Центрируем тултип по курсору, вычитая половину ширины тултипа
        const centerPosition = caretXInContainer - tooltipWidth / 2;

        // ПРОВЕРКА ГРАНИЦ И ПОЗИЦИОНИРОВАНИЕ:
        if (centerPosition <= 5) {
          // Если центр тултипа выходит за левую границу контейнера (с отступом 5px) - прижимаем тултип к левому краю контейнера с отступом 20px
          tooltip.style.left = "20px";
          tooltip.style.right = "auto";
        } else if (centerPosition + tooltipWidth >= containerRect.width - 5) {
          // Если правый край тултипа выходит за правую границу контейнера (с отступом 5px) -прижимаем тултип к правому краю контейнера с отступом 20px
          tooltip.style.left = "auto";
          tooltip.style.right = "20px";
        } else {
          // Если тултип помещается в пределах контейнера - размещаем тултип по центру относительно курсора
          tooltip.style.left = `${centerPosition}px`;
          tooltip.style.right = "auto";
        }
      }
    },

  },
};
</script>

<style lang="scss">

.report-revenue__tooltip {
  position: absolute;
  width: max-content;
  min-width: 240px;
  padding: 16px;
  font-size: 12px;
  background-color: $sky-active;
  border-radius: 16px;
  border: 1px solid;
  border-color: $secondary-blue-hover;
  transition: 0.5s cubic-bezier(0.33, 1, 0.68, 1) 0s;
  z-index: 99;
  top: 0px;
  box-shadow: $box-shadow;
}

.report-revenue__square {
  margin-right: 8px;
  width: 10px;
  height: 10px;
}

.report-revenue__dashed {
  min-width: 14px;
  border-top: 1px dashed;
  border-width: 2px;
  margin-right: 8px;
  background-color: transparent !important;
}

.report-revenue__text--dark {
  color: $disabled;
}

</style>
