<template>
  <div class="sale-availability-status-badge" :class="{ [status]: true }">
    <small>
      {{ $t(text) }}
    </small>
  </div>
</template>

<script>
export default {
  name: "TariffPricesSaleAvailabilityStatusBadge",
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
@import "../../styles/variables.scss";

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
    color: $tariff-status-open;
    background: $tariff-status-open-bg;
    border: 1px solid $tariff-status-open-border;
  }

  &.negative {
    color: $tariff-status-closed;
    background: $tariff-status-closed-bg;
    border: 1px solid $tariff-status-closed-border;
  }
}
</style>
