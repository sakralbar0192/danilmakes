<template>
  <div data-test="tariff-mass-prices-alerts">
    <b-alert v-if="validationErrors.length" type="error" class="mt-groups">
      {{
        validationErrors.length > 1
          ? $t('Заполните обязательные поля')
          : validationErrors[0]
      }}
    </b-alert>
    <b-alert v-if="wasAttemptToSave && hasNoUpdatingPrices" type="error" class="mt-groups">
      {{ $t('Укажите цены для обновления ') }}
    </b-alert>
    <b-alert v-if="Object.keys(unacceptableMassivePricesRestricted).length" type="error" class="mt-groups">
      {{ $t("Стоимость проживания в") }}
      <b>{{ Object.keys(unacceptableMassivePricesRestricted).map(roomtypeId => {
        return `<${flatRoomtypes.find(roomtype => roomtype.id === roomtypeId)?.name}>`;
      }).join(", ") }}</b>
      {{ $t("нельзя изменить, так как по тарифу") }}
      <b>{{ `<${pricesCalendarModel?.maxDiscountChildTariff?.name || ""}>` }}</b>
      {{ $t("сумма проживания станет отрицательной") }}.
      {{ $t("Пожалуйста") }},
      <b>
        {{ $t("измените стоимость для") }}
        {{ Object.keys(unacceptableMassivePricesRestricted).length === 1 ? $t("данной категории") : $t("данных категорий") }}
      </b>
      {{ $t("или") }}
      <b>
        {{ $t("измените размер скидки") }}
      </b>
      {{ $t("в зависимом тарифе") }}
    </b-alert>
    <b-alert v-if="Object.keys(unacceptableMassivePricesSelf).length" type="error" class="mt-groups">
      {{ $t("Стоимость проживания в") }}
      <b>{{ Object.keys(unacceptableMassivePricesSelf).map(roomtypeId => {
        return `<${flatRoomtypes.find(roomtype => roomtype.id === roomtypeId)?.name}>`;
      }).join(", ") }}</b>
      {{ $t("нельзя изменить, так как сумма проживания станет отрицательной") }}.
      {{ $t("Пожалуйста") }},
      <b>{{ $t("укажите меньшее значение") }}</b>
      {{ $t("уменьшения цены") }}
    </b-alert>
    <b-alert v-if="hasNullishPrice" type="warning" class="mt-groups">
      {{
        $t(
          'Вы указали цену "0". Данные обновления не будут отправлены в Channel Manager, т.к. системы и модуль онлайн-бронирования не принимают указанную цену'
        )
      }}
    </b-alert>
    <b-alert v-if="hasMaxPeriodsLimit" type="warning" class="mt-groups">
      {{ maxPeriodsLimitWarning }}
    </b-alert>
  </div>
</template>

<script>
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { mapState } from "vuex";
import { updatingPricesInnerBlocks, getExtraChargeName, bedTypes, massiveUpdatingPricesModes } from "../../config/screen-config.js";

export default {
  name: "BnovoTariffPricesAndRestrictionsUpdatingPricesAlerts",
  props: {
    datesPeriods: {
      type: Array,
      required: true,
    },
    validationsStatuses: {
      type: Object,
      required: true,
    },
    wasAttemptToSave: {
      type: Boolean,
      required: true,
    },
    hasNoUpdatingPrices: {
      type: Boolean,
      required: true,
    },
    updatingMode: {
      type: String,
      required: true,
    },
  },
  innerBlocks: updatingPricesInnerBlocks,
  computed: {
    ...mapState("hotelRoom", ["roomtypes"]),
    ...mapState("tariffPricesAndRestrictions", ["massiveUpdatingPrices", "currentTariff", "unacceptableMassivePricesRestricted", "unacceptableMassivePricesSelf", "pricesCalendarModel"]),
    flatRoomtypes() {
      const result = [];

      this.roomtypes.forEach(roomtype => {
        // Добавляем саму категорию (roomtype)
        result.push(roomtype);

        // Добавляем подкатегории (subrooms), если есть
        if (roomtype.subrooms?.length) {
          result.push(...roomtype.subrooms);
        }

        // Добавляем наценки (extra charges)
        const childrenAges = roomtype?.extra?.children_ages;
        if (childrenAges && Object.keys(childrenAges).length) {
          Object.entries(childrenAges).forEach(([childrenAgeId, bedTypeObj]) => {
            Object.keys(bedTypeObj || {}).forEach(bedTypeId => {
              // Формируем объект наценки с необходимыми полями
              const extraItem = {
                id: `${roomtype.id}_${childrenAgeId}_${bedTypeId}`,
                name: `${roomtype.name} ${
                  getExtraChargeName(
                    childrenAgeId,
                    this.pricesCalendarModel?.hotelChildrenAges?.[childrenAgeId]?.minAge,
                    this.pricesCalendarModel?.hotelChildrenAges?.[childrenAgeId]?.maxAge,
                  )
                }, ${
                  bedTypes[bedTypeId] || ""
                }`,
                isExtraCharge: true,
              };
              result.push(extraItem);
            });
          });
        }
      });

      return result;
    },
    validationErrors() {
      const errors = [];
      Object.values(this.$options.innerBlocks).forEach(blockKey => {
        if (this.validationsStatuses?.[blockKey]) {
          let message = "";
          switch (blockKey) {
            case this.$options.innerBlocks.dates:
              message = this.$t("Укажите период обновления");
              break;
            case this.$options.innerBlocks.categories:
              message = this.$t("Укажите категории для обновления");
              break;
            case this.$options.innerBlocks.days:
              message = this.$t("Укажите дни недели для обновления");
              break;
            case this.$options.innerBlocks.price:
              message = this.updatingMode === massiveUpdatingPricesModes[1].id ? this.$t("Укажите сумму скидки") : this.$t("Укажите сумму наценки");
              break;
            default:
          }
          errors.push(message);
        }
      });
      return errors;
    },
    hasNullishPrice() {
      return PriceAndRestrictionsService.checkNullishPrice(this.massiveUpdatingPrices);
    },
    hasMaxPeriodsLimit() {
      return this.datesPeriods.length >= PriceAndRestrictionsService.maxUpdatingPricesDatesPeriods;
    },
    maxPeriodsLimitWarning() {
      return this.$t("Можно добавить не более {n} периодов", { n: PriceAndRestrictionsService.maxUpdatingPricesDatesPeriods });
    },
  },
  watch: {
    hasNullishPrice(v) {
      if (v) this.$emit("need-scroll-to-alerts");
    },
    hasMaxPeriodsLimit(v) {
      if (v) this.$emit("need-scroll-to-alerts");
    },
    validationErrors(v) {
      if (v.length) this.$emit("need-scroll-to-alerts");
    },
  },
};
</script>
