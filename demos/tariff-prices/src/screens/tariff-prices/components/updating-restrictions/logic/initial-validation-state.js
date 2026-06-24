import { updatingRestrictionsInnerBlocks } from "../../../config/screen-config.js";

// eslint-disable-next-line import/prefer-default-export
export function createUpdatingRestrictionsValidationState() {
  const b = updatingRestrictionsInnerBlocks;
  return {
    [b.days]: false,
    [b.dates]: false,
    [b.categories]: false,
    [b.tariff]: false,
  };
}
