<template>
  <b-teleport-wrapper selector="#app-teleport-root">
    <component
      :is="popupComponent"
      v-model="show"
      simple
      size="medium"
      width="100%"
    >
      <v-card data-test="tariff-categories-popup">
        <v-card-title>
          <h3 class="text-h3 mb-0">
            {{ $t("Выбор категорий") }}
          </h3>
          <template v-if="isMobileDevice">
            <v-spacer/>
            <b-btn
              icon
              color="tertiary"
              text
              @click="show = false"
            >
              <v-icon class="icon-cross"/>
            </b-btn>
          </template>
        </v-card-title>
        <v-card-text class="pt-0 pt-groups px-ingroup flex-grow-1">
          <b-options-group
            v-model="internalSelectedRoomtypes"
            width="590"
            group-text="name"
            :items="roomtypes"
            editable
            :search-placeholder="$t('Поиск категории')"
            search-input-data-test="tariff-categories-popup-search"
            show-master-checkbox
            :class="$style.list"
            master-item-class="font-weight-bold"
          >
            <template #no-data-error>
              <div class="ml-ingroup">
                <v-icon class="icon-alert-circle" left color="primary"/>
                {{ $t("Нет категорий для показа") }}
              </div>
            </template>
          </b-options-group>
        </v-card-text>
        <v-card-actions class="py-groups">
          <template v-if="!isMobileDevice">
            <b-btn
              color="tertiary"
              class="ml-2"
              outlined
              @click="show = false"
            >
              {{ $t("Отменить") }}
            </b-btn>
            <v-spacer/>
          </template>
          <b-btn
            :width="isMobileDevice ? '100%' : 'auto'"
            color="primary"
            data-test="tariff-categories-popup-confirm"
            @click="finishSelection"
          >
            {{ $t("Выбрать") }}
          </b-btn>
        </v-card-actions>
      </v-card>
    </component>
  </b-teleport-wrapper>
</template>

<script>
import { mapState } from "vuex";
import ymHelpers from "@/utils/ym-helpers";
import BTeleportWrapper from "@/uikit/b-teleport-wrapper";

export default {
  name: "TariffPricesSelectCategoriesPopup",
  components: { BTeleportWrapper },
  props: {
    value: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return { internalSelectedRoomtypes: {}, popupComponent: "b-dialog" };
  },
  computed: {
    ...mapState("hotelRoom", ["roomtypes"]),
    ...mapState("tariffPricesAndRestrictions", ["selectedCategories"]),
    show: {
      get() {
        return this.value;
      },
      set(v) {
        this.$emit("input", v);
      },
    },
  },
  watch: {
    show: {
      handler(v) {
        if (v) {
          this.initSelectedRoomtypes();
        }
      },
      immediate: true,
    },
  },
  mounted() {
    if (this.isMobileDevice) {
      this.popupComponent = "b-drawer";
    }
  },
  methods: {
    initSelectedRoomtypes() {
      this.internalSelectedRoomtypes = this.selectedCategories.length
        ? this.selectedCategories.reduce((obj, roomtype) => {
          obj[roomtype] = [];
          return obj;
        }, {})
        : this.roomtypes.reduce((obj, roomtype) => {
          obj[roomtype.id] = [];
          return obj;
        }, {});
    },
    finishSelection() {
      const internalSelectedRoomtypesKeys = Object.keys(this.internalSelectedRoomtypes);
      const allRoomtypesChosen = this.roomtypes.every(roomtype => internalSelectedRoomtypesKeys.includes(roomtype.id));
      const selectedCategories = allRoomtypesChosen ? [] : internalSelectedRoomtypesKeys;

      ymHelpers.sendHit(
        "main",
        "categories_filter_save",
        "Сохранили фильтр категорий в таблице",
        { selected: allRoomtypesChosen ? "all" : internalSelectedRoomtypesKeys.length },
        "pricesAndRestrictions",
      );

      this.show = false;
      this.$store.dispatch("tariffPricesAndRestrictions/setSelectedCategories", selectedCategories);
    },
  },
};
</script>

<style lang="scss" module>
.list {
  :global(.v-list-item__action) {
    margin-right: map-get($gaps, typo) !important;
    min-width: 16px;
  }
}
</style>
