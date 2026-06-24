<template>
  <v-app class="tariff-prices-demo">
    <div class="demo-banner text-caption pa-2 text-center">
      Портфолио-демо · Цены и ограничения
    </div>
    <v-main class="fill-height d-flex flex-column">
      <router-view class="flex-grow-1 d-flex flex-column" style="min-height: 0" />
    </v-main>
    <DialogHost />
  </v-app>
</template>

<script setup>
import DialogHost from "@/components/DialogHost.vue";
</script>

<style lang="scss">
html, body, #app {
  height: 100%;
  margin: 0;
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
}

.demo-banner {
  background: #1e3a5f;
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
}

/*
 * Демо без app-shell PMS: flex-цепочка + резерв под fixed-футер в layout.
 * max-height по 100dvh отключаем — иначе scrollport не совпадает с flex-областью,
 * и горизонтальная полоса «висит» над таблицей / залезает на футер.
 */
.tariff-prices-demo .bnovo-tariff-prices-and-restrictions__scroll-container {
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
</style>
