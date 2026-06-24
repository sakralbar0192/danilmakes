<template>
  <div class="sale-availability-status-badge" :class="{ [status]: true }">
    <small>
      {{ $t(text) }}
    </small>
  </div>
</template>

<script>
export default {
  name: "BnovoTariffPricesAndRestrictionsSaleAvailabilityStatusBadge",
  props: {
    opened: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    text() {
      return this.opened ? "Открыто" : "Закрыто";
    },
    status() {
      return this.opened ? "positive" : "negative";
    },
  },
};
</script>

<style scoped lang="scss">
.sale-availability-status-badge {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  height: 20px;
  border-radius: $border-radius-root;
  line-height: 1;

  &.positive {
    color: $success;
    background: #E5F6E8;
    border: 1px solid $success;
  }

  &.negative {
    color: #FF4433;
    background: #FFF5F2;
    border: 1px solid #FF4433;
  }
}
</style>
