<template>
  <v-row>
    <b-col>
      <p class="mb-ingroup">
        <span>
          {{ $t("В план") }}
        </span>
        <b>{{ $t("входят все категории проживания") }}</b>,
        <span>{{ $t("по желанию можно добавить категории исключения") }}</span>:
      </p>
      <v-responsive width="320" class="overflow-visible">
        <b-select
          v-model="innerSelectedCategories"
          :items="excludedRoomtypesWithRooms"
          :placeholder="$t('Выберите категории исключения')"
          multiple
          hide-details
          item-text="name"
          item-value="id"
          selection="категория исключение"
          :class="{
            'bnovo-report-revenue__datepicker-bg': innerSelectedCategories.length > 0,
          }"
        />
      </v-responsive>
    </b-col>
  </v-row>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "BnovoReportRevenueGoalCategoryRowSelect",
  props: {
    value: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    ...mapGetters("hotelRoom", ["excludedRoomtypesWithRooms"]),
    innerSelectedCategories: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
  },
};
</script>
