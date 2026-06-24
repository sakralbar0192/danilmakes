import { priceCellPresentationModes } from "../../../config/screen-config.js";

const PresentationModeCaptionStrategyMap = Object.freeze({
  [priceCellPresentationModes.default]: ({
    isDynamicPricesModeEnabled,
    isCurrentTariffDepend,
    hasExtraChargesCategories,
  }) => {
    if (isDynamicPricesModeEnabled) {
      return "базовые / по умолчанию";
    }

    if (isCurrentTariffDepend) {
      return hasExtraChargesCategories ? "рассчитываемые / по умолчанию" : "рассчитываемые";
    }
    return "по умолчанию";
  },
  [priceCellPresentationModes.manual]: ({
    isDynamicPricesModeEnabled,
    isCurrentTariffDepend,
  }) => {
    if (isCurrentTariffDepend || isDynamicPricesModeEnabled) return "ручные";
    return !isCurrentTariffDepend && !isDynamicPricesModeEnabled ? "ручные" : "по умолчанию";
  },
  [priceCellPresentationModes.dynamic]: ({ isDynamicPricesModeEnabled }) => {
    if (isDynamicPricesModeEnabled) {
      return "по Бизнес-правилам";
    }
    return "динамические";
  },
  [priceCellPresentationModes.closed]: () => "продажа закрыта",
});

/**
 * @returns {string|null}
 */
const getPresentationModeCaption = (mode, context) => {
  const strategy = PresentationModeCaptionStrategyMap[mode];
  if (!strategy) {
    return null;
  }

  return strategy(context);
};

export default getPresentationModeCaption;
