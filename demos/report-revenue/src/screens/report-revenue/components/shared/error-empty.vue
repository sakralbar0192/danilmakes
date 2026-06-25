<template>
  <div class="set justify-items-center text-center">
    <v-icon class="icon-alert-circle mb-3" size="48" color="primary"/>
    <span>
      <slot/>
    </span>
  </div>
</template>

<script>
export default {
  name: "ReportRevenueErrorEmptyBox",
};
</script>
