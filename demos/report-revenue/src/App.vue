<template>
  <v-app class="report-revenue-demo">
    <div class="demo-banner text-caption pa-2 text-center">
      Портфолио-демо · Отчёт по доходу · синтетические данные
    </div>
    <v-main>
      <router-view />
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

.report-revenue-demo {
  min-height: 100%;
}

.report-revenue-demo .v-main {
  background: #eef4f8;
}

.demo-banner {
  background: linear-gradient(135deg, #1e8bc3 0%, #16739f 100%);
  color: #fff;
  letter-spacing: 0.02em;
  position: sticky;
  top: 0;
  z-index: 100;
}

#app-teleport-root {
  position: relative;
  z-index: 200;
  pointer-events: none;
}
#app-teleport-root > * {
  pointer-events: auto;
}

@import "@/screens/report-revenue/styles/index.scss";

.report-revenue-screen {
  position: relative;
  min-height: 400px;
}
</style>
