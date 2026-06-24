import uid from "@/utils/uid";
import AutomationService from "@/services/automation";

export function createMassiveAvailabilityInitialPeriod() {
  return {
    period: [],
    uid: uid(),
  };
}

export function createMassiveAvailabilityFormData() {
  return {
    datesPeriods: [createMassiveAvailabilityInitialPeriod()],
    selectedRoomtypes: [],
    localSelectedRoomtypes: [],
    selectedWeekdays: AutomationService.daysOfWeekList.map((day) => day.value),
    grid: {},
    allCategoriesWeekdays: {},
    serverError: "",
  };
}
