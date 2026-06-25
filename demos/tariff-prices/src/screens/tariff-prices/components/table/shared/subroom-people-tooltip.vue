<template>
  <b-tooltip-arrowed
    v-if="showPeopleTooltipIcon"
    right
    max-width="312"
  >
    <template #activator="{ on, attrs }">
      <v-icon
        class="icon-help-circle"
        v-bind="attrs"
        size="medium"
        :color="$vuetify.theme.current.colors.secondary"
        v-on="on"
      />
    </template>
    <p v-if="categoryName">
      <strong>{{ categoryName }}</strong>
      <br>
    </p>
    <p class="ma-0">
      <strong>
        {{ $t('Взрослые:') }}
      </strong>

      <span>{{ subroom.adults }}</span>
    </p>
    <template v-if="showChildrenSectionInBody">
      <br>
      <p v-if="Number(subroom.children)" class="ma-0 mb-typo">
        <strong>
          {{ $t('Дети:') }}
        </strong>
        <span>{{ subroom.children }}</span>
      </p>
      <template v-if="visibleChildrenAgeEntries.length">
        <p
          v-for="([childrenAgeId, childrenCount]) in visibleChildrenAgeEntries"
          :key="childrenAgeId"
          class="ma-0 mb-typo"
        >
          <span>{{ getChildrenAgeName(childrenAgeId) }}</span>
          <span v-if="typeof childrenCount === 'number' && childrenCount > 1">
            ({{ childrenCount }}
            {{ rusWordCaser(childrenCount, $t("ребенок"), $t("ребенка"), $t("детей")) }})
          </span>
        </p>
      </template>
    </template>
    <template v-if="visibleWithoutBedsChildren.length">
      <br>
      <p class="ma-0 mb-typo">
        <strong>
          {{ $t('Дети без места:') }}
        </strong>
      </p>
      <p
        v-for="childrenAgeId in visibleWithoutBedsChildren"
        :key="childrenAgeId"
        class="ma-0 mb-typo"
      >
        <span>{{ getChildrenAgeName(childrenAgeId) }}</span>
      </p>
    </template>
  </b-tooltip-arrowed>
</template>

<script>
import { mapState } from "vuex";
import rusWordCaserMixin from "@/mixins/rus-word-caser-mixin";
import { formatChildrenAgeLabel, hasHotelChildrenAgeLabel } from "../../../lib/tariff/format-children-age-label.js";

export default {
  name: "TariffPricesTableSubroomPeopleTooltip",
  mixins: [rusWordCaserMixin],
  props: {
    subroom: {
      type: Object,
      required: true,
    },
    withoutBedsChildren: {
      type: Array,
      default: () => [],
    },
    categoryName: {
      type: String,
      default: "",
    },
    alwaysShowIcon: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState("tariffPricesAndRestrictions", ["pricesCalendarModel", "partsLoadState"]),
    hotelChildrenAges() {
      return this.pricesCalendarModel?.hotelChildrenAges || {};
    },
    isHotelChildrenAgesPending() {
      return Boolean(this.partsLoadState?.extraLoading) && !this.partsLoadState?.extraLoaded;
    },
    hasChildrenAgesInExtra() {
      const ages = this.subroom.extra?.children_ages;
      return Boolean(ages && typeof ages === "object" && Object.keys(ages).length > 0);
    },
    showChildrenAgesBreakdown() {
      return this.hasChildrenAgesInExtra && !this.isHotelChildrenAgesPending;
    },
    visibleChildrenAgeEntries() {
      if (!this.showChildrenAgesBreakdown) {
        return [];
      }
      return Object.entries(this.subroom.extra?.children_ages || {})
        .filter(([childrenAgeId]) => this.canShowChildrenAgeLabel(childrenAgeId));
    },
    visibleWithoutBedsChildren() {
      if (this.isHotelChildrenAgesPending) {
        return [];
      }
      return (this.withoutBedsChildren || []).filter((childrenAgeId) => this.canShowChildrenAgeLabel(childrenAgeId));
    },
    showPeopleTooltipIcon() {
      if (this.alwaysShowIcon) {
        return true;
      }
      if (this.withoutBedsChildren?.length) return true;
      if (Number(this.subroom.children)) return true;
      return this.hasChildrenAgesInExtra;
    },
    showChildrenSectionInBody() {
      if (Number(this.subroom.children)) return true;
      return this.hasChildrenAgesInExtra;
    },
  },
  methods: {
    canShowChildrenAgeLabel(childrenAgeId) {
      if (this.isHotelChildrenAgesPending) {
        return false;
      }
      return hasHotelChildrenAgeLabel(childrenAgeId, this.hotelChildrenAges);
    },
    getChildrenAgeName(childrenAgeId) {
      return formatChildrenAgeLabel(childrenAgeId, this.hotelChildrenAges, {
        t: this.$t.bind(this),
        rusWordCaser: this.rusWordCaser.bind(this),
      }) || "";
    },
  },
};
</script>
