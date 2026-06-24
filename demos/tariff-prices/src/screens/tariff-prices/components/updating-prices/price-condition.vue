<template>
  <v-responsive
    :width="isMobileDevice ? '100%' : 320"
  >
    <div
      :class="['d-flex', $style.wrapper, {
        'flex-column flex-grow-1': isMobileDevice,
        'align-center': !isMobileDevice,
      }]"
    >
      <b-input-group :whole-width="isMobileDevice ? '100%' : 238">
        <template #start>
          <v-responsive :width="isMobileDevice ? '100%' : 150" class="overflow-visible">
            <div :class="$style['price-ios-clip']">
              <div :class="$style['price-ios-scale']">
                <b-text-field
                  ref="priceField"
                  v-model="$v.internalPrice.$model"
                  data-test="tariff-mass-prices-price-input"
                  :error="priceError"
                  hide-details
                />
              </div>
            </div>
          </v-responsive>
        </template>
        <template #end>
          <v-responsive width="88" class="overflow-visible">
            <b-select
              v-model="internalCurrency"
              :items="currencyList"
            />
          </v-responsive>
        </template>
      </b-input-group>
      <span :class="{'ml-groups': !isMobileDevice}">{{ hintText }}</span>
    </div>
  </v-responsive>
</template>

<script>
import AutomationService from "@/services/automation";
import PriceAndRestrictionsService from "@/services/tariff/price-and-restrictions";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
import { currencyList as defaultCurrencyList, massiveUpdatingPricesModes } from "../../config/screen-config.js";

export default {
  name: "BnovoTariffPricesAndRestrictionsUpdatingPricesWeekDays",
  mixins: [validationMixin],
  props: {
    value: {
      type: Object,
      required: true,
    },
    updatingMode: {
      type: String,
      required: true,
    },
  },
  defaultCurrencyList,
  daysOfWeekList: AutomationService.daysOfWeekList,
  computed: {
    internalCurrency: {
      get() {
        return this.value.currency;
      },
      set(currency) {
        const validatedValue = PriceAndRestrictionsService.validateDiscountChange(this.internalPrice, this.updatingMode, currency);
        this.$emit("input", {
          ...this.value,
          price: typeof this.value.price === "number" && !Number.isNaN(validatedValue) ? `${validatedValue}` : Number(validatedValue) || "",
          currency,
        });
      },
    },
    internalPrice: {
      get() {
        return this.value.price;
      },
      set(v) {
        const validatedValue = PriceAndRestrictionsService.validateDiscountChange(
          v,
          this.updatingMode,
          this.internalCurrency,
        );
        this.$emit("input", {
          ...this.value,
          price: typeof this.value.price === "number" && !Number.isNaN(validatedValue) ? `${validatedValue}` : Number(validatedValue) || "",
        });
      },
    },
    currencyList() {
      return [
        { ...this.$options.defaultCurrencyList[0] },
        {
          ...this.$options.defaultCurrencyList[1],
          name: this.hotel.currency_sign,
        },
      ];
    },
    priceError() {
      return this.$v.internalPrice.$dirty && !this.$v.internalPrice.required;
    },
    hintText() {
      let hintText = "";
      switch (`${this.updatingMode}_${this.internalCurrency}`) {
        case `${massiveUpdatingPricesModes[1].id}_${defaultCurrencyList[0].id}`:
          hintText = this.$t("Укажите скидку 1-99%");
          break;
        case `${massiveUpdatingPricesModes[2].id}_${defaultCurrencyList[0].id}`:
          hintText = this.$t("Укажите наценку 1-100%");
          break;
        default:
          hintText = "";
          break;
      }
      return hintText;
    },
  },
  watch: {
    priceError(v) {
      this.$emit("update:error", v);
    },
    updatingMode() {
      let validatedValue = PriceAndRestrictionsService.validateDiscountChange(this.internalPrice, this.updatingMode, this.internalCurrency);
      if (validatedValue !== "") validatedValue = typeof this.value.price === "number" ? `${validatedValue}` : Number(validatedValue);
      this.$emit("input", {
        ...this.value,
        price: validatedValue,
      });
    },
  },
  validations: { internalPrice: { required } },
};
</script>

<style lang="scss" module>
@import '../../styles/variables.scss';
@import '../../styles/ios-input-zoom-guard.scss';

.price-ios-clip {
  overflow: hidden;
  width: 100%;
  height: 34px;
  display: flex;
  align-items: center;
}

.price-ios-scale {
  @include tariff-ios-input-zoom-inner;
  transform-origin: left center;

  :deep(input) {
    @include tariff-ios-input-zoom-field;
    text-align: left;
  }
}

.wrapper {
  :global(.slot-wrapper) {
    padding-top: 0 !important;

    &:first-of-type fieldset {
      border-right: 1px solid !important;
    }
  }

  >span {
    color: $price-cell-default-text-color;
    font-size: 12px !important;
  }

  >:global(.v-responsive__content) >label >:global(.row) :global(.slot-wrapper):first-of-type {
    width: 100%;
    grid-column: 1 / -1;
    grid-row: 2;
  }
}
.error {
  border-color: $error !important;
}
</style>
