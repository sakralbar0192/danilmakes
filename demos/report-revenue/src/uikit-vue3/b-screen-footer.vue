<template>
  <div class="b-screen-footer__outer">
    <v-footer
      class="b-screen-footer chm-module-only"
      :style="footerStyle"
    >
      <v-container class="b-screen-footer__container d-flex justify-space-between pa-0">
        <div
          v-if="$slots.leftSide"
          class="b-screen-footer__left-side d-flex align-center ga-2"
        >
          <slot name="leftSide" />
        </div>
        <div
          v-if="$slots.middle"
          class="b-screen-footer__middle d-flex align-center flex-grow-1"
        >
          <slot name="middle" />
        </div>
        <div
          v-if="$slots.rightSide"
          class="b-screen-footer__right-side d-flex align-center ga-2"
        >
          <slot name="rightSide" />
        </div>
      </v-container>
    </v-footer>
  </div>
</template>

<script>
export default {
  name: "BScreenFooter",
  computed: {
    footerStyle() {
      return {
        position: "fixed",
        bottom: "0",
        left: "0",
        right: "0",
        width: "100%",
        zIndex: 1000,
      };
    },
  },
};
</script>

<style lang="scss">
.b-screen-footer__outer {
  height: 0;
  overflow: visible;
}

.b-screen-footer {
  border-top: 1px solid #DDDDE3;
  background-color: #fff !important;
}

.b-screen-footer__container {
  max-width: 1912px;
  gap: 12px;
}

.b-screen-footer__left-side,
.b-screen-footer__right-side,
.b-screen-footer__middle {
  gap: 12px;
}
</style>
