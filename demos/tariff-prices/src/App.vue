<template>
  <v-app class="tariff-prices-demo">
    <div
      v-if="showMobileOnlyGate"
      class="mobile-only-gate"
      role="status"
    >
      <p class="eyebrow">Mobile / WebView демо</p>
      <h1>Откройте с телефона</h1>
      <p>
        Этот сценарий про фокус ввода, клавиатуру и sticky-шапки в узком viewport.
        На desktop календарь доступен без <code>?focus=mobile</code>.
      </p>
      <a class="gate-link" :href="desktopDemoHref">Открыть полную версию</a>
    </div>
    <template v-else>
      <div class="demo-banner text-caption pa-2 text-center">
        {{ bannerText }}
      </div>
      <v-main class="fill-height d-flex flex-column">
        <router-view class="flex-grow-1 d-flex flex-column" style="min-height: 0" />
      </v-main>
      <DialogHost />
    </template>
  </v-app>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import DialogHost from "@/components/DialogHost.vue";
import { resolveDeviceBreakpoint, readViewportSize } from "@/store/modules/resolve-device-breakpoint";

const route = useRoute();
const width = ref(readViewportSize().innerWidth);

function onResize() {
  width.value = readViewportSize().innerWidth;
}

onMounted(() => {
  window.addEventListener("resize", onResize, { passive: true });
});
onUnmounted(() => {
  window.removeEventListener("resize", onResize);
});

const focusMobile = computed(() => String(route.query.focus || "") === "mobile");
const isNarrow = computed(() => resolveDeviceBreakpoint(width.value).mobile);
const showMobileOnlyGate = computed(() => focusMobile.value && !isNarrow.value);
const desktopDemoHref = computed(() => {
  const url = new URL(window.location.href);
  url.searchParams.delete("focus");
  return url.pathname + url.search + url.hash;
});
const bannerText = computed(() =>
  focusMobile.value
    ? "Портфолио-демо · mobile/WebView сценарий · синтетические данные"
    : "Портфолио-демо · Цены и ограничения · режимы · availability · RMS · синтетика",
);
</script>

<style lang="scss">
html, body, #app {
  height: 100%;
  margin: 0;
}

:root {
  --text-xsmall: 10px;
  --text-small: 12px;
  --text-caption: 13px;
  --text-body: 14px;
  --text-hero: 20px;
  --text-h1: 24px;
  --text-h2: 20px;
  --text-h3: 16px;
  --text-h4: 14px;
}

.tariff-prices-demo {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.tariff-prices-demo > .v-main {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  background: #eef4f8;
}

.demo-banner {
  background: linear-gradient(135deg, #1e8bc3 0%, #16739f 100%);
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
}

.mobile-only-gate {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 12px;
  padding: 48px 28px;
  background:
    radial-gradient(700px 360px at 10% 0%, rgba(30, 139, 195, 0.18), transparent 55%),
    #eef4f8;
  color: #16324a;
}

.mobile-only-gate .eyebrow {
  margin: 0;
  font-weight: 700;
  color: #1e8bc3;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 12px;
}

.mobile-only-gate h1 {
  margin: 0;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  letter-spacing: -0.03em;
}

.mobile-only-gate p {
  margin: 0;
  max-width: 36rem;
  line-height: 1.6;
  color: #40556a;
}

.mobile-only-gate code {
  background: rgba(255, 255, 255, 0.8);
  padding: 1px 6px;
  border-radius: 4px;
}

.gate-link {
  margin-top: 8px;
  display: inline-flex;
  padding: 10px 16px;
  border-radius: 6px;
  background: #1e8bc3;
  color: #fff;
  font-weight: 600;
  text-decoration: none;
}

/*
 * Демо без app-shell PMS: flex-цепочка + резерв под fixed-футер в layout.
 * max-height по 100dvh отключаем — иначе scrollport не совпадает с flex-областью,
 * и горизонтальная полоса «висит» над таблицей / залезает на футер.
 */
.tariff-prices-demo .tariff-demo-and-restrictions__scroll-container {
  flex: 1 1 auto;
  min-height: 0;
  max-height: none !important;
  box-sizing: border-box;
}

/* Кастомная полоса — fixed у низа viewport (над reserved-футером), не sticky поверх строк */
.tariff-prices-demo .tariff-prices-table-hscroll-track {
  position: fixed !important;
  left: 0;
  right: 0;
  bottom: var(--tariff-demo-hscroll-bottom, 0px);
  z-index: 6;
  height: 8px;
  pointer-events: none;
  background-color: #fff;
  border-top: 1px solid #dddde3;
}

.tariff-prices-demo .tariff-prices-table-hscroll-track .table-horizontal-scrollbar-track {
  pointer-events: auto;
}

/* Шапка и тело — без собственных горизонтальных scrollbar */
.tariff-prices-demo .table-header-scroll-area {
  overflow-x: hidden !important;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none !important;
    height: 0 !important;
    width: 0 !important;
  }
}

.tariff-prices-demo .table-scroll-area {
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none !important;
    height: 0 !important;
    width: 0 !important;
  }
}
#app-teleport-root {
  position: relative;
  z-index: 200;
  pointer-events: none;
}
#app-teleport-root > * {
  pointer-events: auto;
}
@import "@/screens/tariff-prices/styles/index.scss";
@import "@/screens/tariff-prices/styles/table-theme.scss";
</style>
