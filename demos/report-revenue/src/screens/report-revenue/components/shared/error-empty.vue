<template>
  <div class="set justify-items-center">
    <span>
      <slot/>
    </span>
    <b-btn :href="hrefProp" target="_blank">
      <slot name="button"/>
    </b-btn>
  </div>
</template>

<script>
export default {
  name: "BnovoReportRevenueErrorEmptyBox",
  props: {
    hrefProp: {
      type: String,
      default: "/roomTypes",
    },
  },
};
</script>
