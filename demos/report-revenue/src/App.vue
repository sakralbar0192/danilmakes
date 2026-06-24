<template>
  <v-app class="report-revenue-demo">
    <div class="demo-banner text-caption pa-2 text-center">
      Портфолио-демо · Отчёт по доходу
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

.report-revenue-demo {
  min-height: 100%;
}

.demo-banner {
  background: #1e3a5f;
  color: #fff;
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
