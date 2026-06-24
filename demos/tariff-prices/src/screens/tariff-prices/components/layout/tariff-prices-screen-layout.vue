<template>
  <div :class="$style.pageRoot" :style="pageRootStyle">
    <div
      ref="scrollContainerRef"
      :class="[
        'bnovo-tariff-prices-and-restrictions__scroll-container',
        $style.scrollArea,
        { [safariStickyFixClass]: safariStickyFixActive },
      ]"
      :style="scrollBodyStyle"
    >
      <div
        v-show="!fullscreenMode"
        ref="pageStickyHeaderMeasure"
        class="bnovo-tariff-prices-page-sticky-header"
      >
        <page-header @change-tariff="$emit('change-tariff', $event)"/>
        <v-row dense class="mb-ingroup">
          <b-col :cols="isDesktopDevice ? 6 : 'auto'">
            <div class="mb-outer">
              <div :class="$style['tabs-touch-strip']">
                <b-layout-tabs :tabs="tabs"/>
              </div>
            </div>
            <v-row v-if="!isCombinedModeEnabled" dense class="mb-ingroup">
              <b-col>
                <page-modes @change-mode="$emit('change-mode', $event)"/>
              </b-col>
            </v-row>
            <tariff-info show-all-info/>
            <v-row v-if="$options.infoDrawerEnabled" dense>
              <b-col>
                <info-drawer ref="infoDrawer"/>
              </b-col>
            </v-row>
          </b-col>
          <v-spacer/>
          <b-col
            v-if="isDesktopDevice"
            cols="auto"
            class="d-flex justify-end align-top"
          >
            <page-legend/>
          </b-col>
        </v-row>
      </div>

      <v-row dense>
        <b-col>
          <slot name="table"/>
        </b-col>
      </v-row>
    </div>
    <div
      :class="[
        $style.footerSlot,
        { [$style['footerSlot--noPointer']]: needHideFooter },
        { [$style['footerSlot--reserved']]: needShowFooter },
      ]"
    >
      <page-footer
        v-show="needShowFooter"
        ref="pageFooterRef"
        @click-save="$emit('click-save')"
        @click-discard="$emit('click-discard')"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { mapGetters } from "vuex";
import PageHeader from "../chrome/header.vue";
import PageFooter from "../chrome/footer.vue";
import PageModes from "../chrome/modes.vue";
import TariffInfo from "../chrome/tariff-info.vue";
import PageLegend from "../chrome/legend.vue";
import InfoDrawer from "../info-drawer/index.vue";
import { getPageTabs, infoDrawerEnabled } from "../../config/screen-config.js";
import { shouldShowPageFooter } from "../../lib/screen/pending-and-footer.js";
import { MOBILE_EDITING_BODY_CLASS } from "../../lib/screen/mobile-app-footer-controller.js";
import { createScrollContainerBottomFitController } from "../../lib/screen/scroll-container-bottom-fit-controller.js";
import resolveElement from "@/utils/resolve-element.js";
import { isDesktopPriceInputInScrollContainer,
  recomputeScrollFitPreservingDesktopPriceInput } from "../../lib/screen/recompute-scroll-fit-preserving-desktop-price-input.js";
import { SCROLL_CONTAINER_SAFARI_STICKY_FIX_CLASS,
  shouldApplyWebKitSafariStickyHeaderFix } from "../../lib/screen/webkit-safari-sticky-fix.js";

export default {
  name: "TariffPricesScreenLayout",
  infoDrawerEnabled,
  components: {
    PageHeader,
    PageFooter,
    PageModes,
    PageLegend,
    TariffInfo,
    InfoDrawer,
  },
  provide() {
    return {
      getPricesPageScrollContainer: () => resolveElement(this.$refs.scrollContainerRef),
      getPricesPageStickyHeaderBottom: () => {
        const el = resolveElement(this.$refs.pageStickyHeaderMeasure);
        if (!el?.getBoundingClientRect) {
          return null;
        }
        return el.getBoundingClientRect().bottom;
      },
      recomputeScrollContainerFit: () => {
        this.scrollFitController?.scheduleRecompute?.();
      },
      recomputeScrollContainerFitPreservingDesktopPriceInput: (inputEl) => {
        this.recomputeScrollFitAfterFooterVisibilityChange(inputEl);
      },
      finishMobileEditFooterSession: () => {
        if (typeof this.finishMobileEditFooterSession === "function") {
          this.finishMobileEditFooterSession();
        }
      },
      openInfoDrawer: (tab) => {
        if (!infoDrawerEnabled) {
          return;
        }
        const drawer = this.$refs.infoDrawer;
        if (!drawer) {
          return;
        }

        drawer.openDrawer(tab);
      },
    };
  },
  props: {
    needHideFooter: { type: Boolean, required: true },
    hasPendingTariffChanges: { type: Boolean, required: true },
    isMobileFooterHiddenByKeyboard: { type: Boolean, required: true },
    finishMobileEditFooterSession: { type: Function, default: null },
    keyboardAffectsScrollLayoutGetter: { type: Function, default: null },
  },
  data() {
    return {
      scrollFitController: null,
      safariStickyFixActive: false,
      /**
       * Кэшированная ссылка на `.bnovo-mobile-footer--outer`. `document.querySelector` дорогой на каждый
       * recompute scroll-fit (на мобилке десятки в секунду при vv/resize). Инвалидируется через
       * MutationObserver контроллера на body class — на этом экране смена видимости app footer
       * приходит вместе с body-class `bnovo-tariff-prices-mobile-editing`.
       */
      cachedAppMobileFooterEl: null,
    };
  },
  computed: {
    ...mapState("tariffPricesAndRestrictions", ["currentTariff", "fullscreenMode", "pricesCalendarModel"]),
    ...mapGetters("tariffPricesAndRestrictions", ["isCombinedModeEnabled"]),
    scrollBodyStyle() {
      if (!this.pricesCalendarModel?.calendar?.length) {
        return { overflow: "hidden" };
      }
      return {
        overflowX: "hidden",
        overflowY: "auto",
      };
    },
    needShowFooter() {
      return shouldShowPageFooter({
        needHideFooter: this.needHideFooter,
        isMobileFooterHiddenByKeyboard: this.isMobileFooterHiddenByKeyboard,
        hasPendingTariffChanges: this.hasPendingTariffChanges,
        isMobileDevice: this.isMobileDevice,
      });
    },
    tabs() {
      return getPageTabs(this.currentTariff?.id);
    },
    safariStickyFixClass() {
      return SCROLL_CONTAINER_SAFARI_STICKY_FIX_CLASS;
    },
    pageRootStyle() {
      return {
        "--tariff-demo-hscroll-bottom": this.needShowFooter ? "72px" : "0px",
      };
    },
  },
  watch: {
    needShowFooter(val) {
      this.$nextTick(() => {
        const scrollEl = resolveElement(this.$refs.scrollContainerRef);
        const active = typeof document !== "undefined" ? document.activeElement : null;
        if (
          val
          && this.isDesktopDevice
          && isDesktopPriceInputInScrollContainer(scrollEl, active)
        ) {
          this.recomputeScrollFitAfterFooterVisibilityChange(active);
          return;
        }
        this.recomputeScrollFitAfterFooterVisibilityChange();
      });
    },
    hasPendingTariffChanges() {
      this.$nextTick(() => {
        this.scrollFitController?.scheduleRecompute?.();
      });
    },
    fullscreenMode() {
      this.$nextTick(() => this.scrollFitController?.recompute());
    },
    isMobileFooterHiddenByKeyboard() {
      this.$nextTick(() => this.scrollFitController?.recompute());
    },
    scrollBodyStyle() {
      this.$nextTick(() => this.scrollFitController?.recompute());
    },
  },
  created() {
    if (typeof navigator !== "undefined") {
      this.safariStickyFixActive = shouldApplyWebKitSafariStickyHeaderFix(navigator);
    }
  },
  mounted() {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }
    this.scrollFitController = createScrollContainerBottomFitController({
      window,
      document,
      getScrollContainerEl: () => resolveElement(this.$refs.scrollContainerRef),
      getPageFooterEl: () => {
        if (!this.needShowFooter) {
          return null;
        }
        const wrapper = resolveElement(this.$refs.pageFooterRef);
        if (!wrapper) {
          return null;
        }
        // .b-screen-footer__outer — нефиксированная обёртка с height=0; реальный fixed-элемент внутри.
        return wrapper.querySelector?.(".b-screen-footer") ?? wrapper;
      },
      getAppMobileFooterEl: () => this.resolveAppMobileFooterEl(),
      isAppMobileFooterHidden: () => document.body.classList.contains(MOBILE_EDITING_BODY_CLASS),
      isMobileInlineEditActive: () => document.body.classList.contains(MOBILE_EDITING_BODY_CLASS),
      getMobileKeyboardAffectsScrollLayout: () => {
        if (typeof this.keyboardAffectsScrollLayoutGetter === "function") {
          return this.keyboardAffectsScrollLayoutGetter();
        }
        return false;
      },
      getPageStickyHeaderEl: () => resolveElement(this.$refs.pageStickyHeaderMeasure),
      isPageStickyHeightEnabled: () => false,
    });
    const baseScheduleRecompute = this.scrollFitController.scheduleRecompute.bind(this.scrollFitController);
    this.scrollFitController.scheduleRecompute = () => {
      const scrollEl = resolveElement(this.$refs.scrollContainerRef);
      const active = typeof document !== "undefined" ? document.activeElement : null;
      if (this.isDesktopDevice && isDesktopPriceInputInScrollContainer(scrollEl, active)) {
        this.recomputeScrollFitAfterFooterVisibilityChange(active);
        return;
      }
      baseScheduleRecompute();
    };
    this.scrollFitController.start();
    this.$nextTick(() => this.scrollFitController?.recompute());
  },
  beforeUnmount() {
    if (this.scrollFitController) {
      this.scrollFitController.destroy();
      this.scrollFitController = null;
    }
    this.cachedAppMobileFooterEl = null;
  },
  methods: {
    recomputeScrollFitAfterFooterVisibilityChange(inputToRestore = null) {
      const ctrl = this.scrollFitController;
      if (!ctrl) {
        return;
      }
      recomputeScrollFitPreservingDesktopPriceInput({
        scrollEl: this.$refs.scrollContainerRef,
        isDesktopDevice: this.isDesktopDevice,
        recompute: () => ctrl.recompute(),
        inputToRestore,
      });
    },
    /**
     * Возвращает закэшированный `.bnovo-mobile-footer--outer`. Если ссылка устарела
     * (элемент detached от DOM — app shell мог пере-рендериться), повторно ищем по селектору.
     */
    resolveAppMobileFooterEl() {
      if (typeof document === "undefined") {
        return null;
      }
      const cached = this.cachedAppMobileFooterEl;
      if (cached && cached.isConnected) {
        return cached;
      }
      const el = document.querySelector(".bnovo-mobile-footer--outer");
      this.cachedAppMobileFooterEl = el || null;
      return el;
    },
  },
};
</script>

<style lang="scss" module>
.pageRoot {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
}

.scrollArea {
  flex: 1 1 auto;
  min-height: 0;
}

.tabs-touch-strip {
  @include respondBelow(md) {
    touch-action: pan-x;
    overscroll-behavior-x: contain;
    -webkit-overflow-scrolling: touch;
  }
}

.footerSlot {
  position: relative;
  z-index: 4;
}

.footerSlot--reserved {
  flex-shrink: 0;
  height: 72px;
}

.footerSlot--noPointer {
  pointer-events: none;
  user-select: none;
}
</style>
