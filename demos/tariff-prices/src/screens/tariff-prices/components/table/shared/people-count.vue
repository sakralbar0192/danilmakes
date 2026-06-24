<template>
  <span class="d-flex align-center">
    <v-responsive :width="compactMode ? ' auto' : 70" class="overflow-visible">
      <span class="d-flex align-center mr-typo">
        <v-icon
          :style="{fontSize: '14px'}"
          :class="['icon-user', {
            'mr-typo': !compactMode
          }]"
        />x{{ compactMode ? adults : ` ${adults}` }}
      </span>
    </v-responsive>
    <v-responsive v-if="(Number(children) || withoutBedsChildren?.length) && !compactMode" :width="compactMode ? ' auto' : 70" class="overflow-visible">
      <span class="d-flex align-center">
        <v-icon
          :style="{fontSize: '14px'}"
          :class="['icon-child', {
            'mr-typo': !compactMode
          }]"
        />
        <template v-if="Number(children)">
          x{{ compactMode ? children : ` ${children}` }}
        </template>
      </span>
    </v-responsive>
    <span v-else-if="Number(children) && compactMode">...</span>
  </span>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "BnovoTariffPricesAndRestrictionsTablePeopleCount",
  props: {
    adults: {
      type: [Number, String],
      required: true,
    },
    children: {
      type: [Number, String],
      default: 0,
    },
    withoutBedsChildren: {
      type: Array,
      default: () => [],
    },
  },
  computed: { ...mapState("tariffPricesAndRestrictions", ["compactMode"]) },
};
</script>
