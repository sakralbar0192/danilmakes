import { TariffInterfaceSettingsModel } from "@/models/tariff/tariff-interface-settings-model";
import { getSavedPageData } from "./bootstrap-page-filters.js";
import { getDefaultSelectedRestrictionKeys } from "../../config/screen-config.js";

function resolveInterfaceSettingsSavedState(savedSettings, hasTourKey) {
  if (savedSettings != null) {
    return {
      interfaceSettings: new TariffInterfaceSettingsModel(savedSettings),
      shouldPersistSettings: false,
    };
  }

  const shouldEnableAllSettings = hasTourKey === true;
  return {
    interfaceSettings: new TariffInterfaceSettingsModel(
      shouldEnableAllSettings
        ? { showResetPriceToDefault: true, showOtherPricesHint: true }
        : {},
    ),
    shouldPersistSettings: true,
  };
}

/**
 * Вычисляет стартовое состояние фильтров и режима ограничений для экрана.
 * Возвращает только бизнес-результат и флаг, нужно ли синхронизировать compact mode в persistent storage.
 */
function initializeSavedState({
  user,
  hotelId,
  isMobileDevice,
  isApartment,
  hasTourKey,
}) {
  const pageData = getSavedPageData(user, hotelId);
  const categories = pageData.categories;
  // eslint-disable-next-line no-nested-ternary
  const restrictions = pageData.restrictions
    ? pageData.restrictions
    : (!hasTourKey ? getDefaultSelectedRestrictionKeys() : []);
  let compactRestrictions = pageData.compactRestrictions;
  let shouldPersistCompactRestrictions = false;

  if (compactRestrictions == null) {
    compactRestrictions = isApartment && !hasTourKey;
    shouldPersistCompactRestrictions = !isMobileDevice || !compactRestrictions;
  }

  if (isMobileDevice && compactRestrictions) {
    compactRestrictions = false;
  }

  return {
    categories,
    restrictions,
    compactRestrictions,
    shouldPersistCompactRestrictions,
    ...resolveInterfaceSettingsSavedState(pageData.interfaceSettings, hasTourKey),
  };
}

export default initializeSavedState;
