import moment from "moment";

const STAY_MIN_MAX_PERIOD_SAME_TARIFF = "Минимальный срок проживания не может быть больше максимального в данном тарифе на период с {minDate} по {maxDate}.";
const STAY_MIN_MAX_PERIOD_WITH_DEPENDENTS = "Минимальный срок проживания не может быть больше максимального в данном тарифе или в зависимом от него по ограничениям на период с {minDate} по {maxDate}.";
const STAY_MIN_MAX_FALLBACK_SAME_TARIFF = "Минимальный срок проживания не может быть больше максимального в данном тарифе. Исправьте значения в подсвеченных ячейках.";
const STAY_MIN_MAX_FALLBACK_WITH_DEPENDENTS = "Минимальный срок проживания не может быть больше максимального в данном тарифе или в зависимом от него по ограничениям. Исправьте значения в подсвеченных ячейках.";

/**
 * Параметры для $t() текста диалога конфликта min/max stay на главной таблице (до сохранения и после API).
 * @param {Set<number>|undefined|null} updateDateTimestamps
 * @param {string} viewDateFormat — как в screen-config viewDateFormat
 * @param {{ involvesDependentTariffs?: boolean }} [options]
 * @returns {{ contentKey: string, interpolation?: Record<string, string> }}
 */
// eslint-disable-next-line import/prefer-default-export
export function buildStayRestrictionDialogTranslationParams(
  updateDateTimestamps,
  viewDateFormat,
  options = {},
) {
  const involvesDependentTariffs = Boolean(options.involvesDependentTariffs);
  const periodKey = involvesDependentTariffs
    ? STAY_MIN_MAX_PERIOD_WITH_DEPENDENTS
    : STAY_MIN_MAX_PERIOD_SAME_TARIFF;
  const fallbackKey = involvesDependentTariffs
    ? STAY_MIN_MAX_FALLBACK_WITH_DEPENDENTS
    : STAY_MIN_MAX_FALLBACK_SAME_TARIFF;

  const hasPeriod = updateDateTimestamps instanceof Set && updateDateTimestamps.size > 0;
  if (hasPeriod) {
    const arr = [...updateDateTimestamps];
    const minDate = moment(Math.min(...arr)).format(viewDateFormat);
    const maxDate = moment(Math.max(...arr)).format(viewDateFormat);
    return {
      contentKey: periodKey,
      interpolation: { minDate, maxDate },
    };
  }
  return { contentKey: fallbackKey };
}
