<template>
  <div :class="$style.content">
    <div :class="[$style['date-holder'], $style.from]">
      {{ formattedFrom }}
    </div>
    <div :class="$style.stick"/>
    <v-icon class="icon-edit" color="primary" size="small"/>
    <div :class="$style.stick"/>
    <div :class="[$style['date-holder'], $style.to]">
      {{ formattedTo }}
    </div>
  </div>
</template>

<script>
import moment from "moment";

const format = "DD/MM";

export default {
  name: "BnovoTariffPricesAndRestrictionsRestrictionRowSelectionRange",
  props: {
    fromDate: {
      type: Object,
      default: () => ({}),
    },
    toDate: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    formattedFrom() {
      return moment(this.fromDate?.date).format(format);
    },
    formattedTo() {
      return moment(this.toDate?.date).format(format);
    },
  },
};
</script>


<style module lang="scss">
.content {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;

  .stick {
    display: grid;
    grid-template-columns: 1px 1px;
    grid-template-rows: auto;
    gap: 1px;

    &:before, &:after {
      content: '';
      display: block;
      width: 1px;
      height: 14px;
      border-radius: 1px;
      background-color: $primary;
    }
  }

  .date-holder {
    position: absolute;
    z-index: 1;
    background: $primary;
    font-size: map-get($text-sizes, caption10);
    color: $white;
    border-radius: 2px;
    top: 100%;
    padding: 0 4px;
  }

  .to {
    right: 0;
  }

  .from {
    left: 0;
  }
}
</style>
