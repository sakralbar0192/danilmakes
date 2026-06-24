import uid from "@/utils/uid";
import AutomationService from "@/services/automation";
import { massiveUpdatingPricesModes,
  currencyList as screenCurrencyList,
  updatingPricesInnerBlocks } from "../../../config/screen-config.js";

export function createMassiveUpdatingPricesFormData() {
  return {
    datesPeriods: [{
      period: [],
      uid: uid(),
    }],
    selectedRoomtypes: [],
    localSelectedRoomtypes: [],
    selectedWeekdays: AutomationService.daysOfWeekList.map(day => day.value),
    updatingMode: massiveUpdatingPricesModes[0]?.id,
    priceDiff: {
      price: "",
      currency: screenCurrencyList[0]?.id || "",
    },
  };
}

export function createMassiveUpdatingPricesValidationStatuses() {
  const b = updatingPricesInnerBlocks;
  return {
    [b.dates]: false,
    [b.categories]: false,
    [b.days]: false,
    [b.price]: false,
  };
}
