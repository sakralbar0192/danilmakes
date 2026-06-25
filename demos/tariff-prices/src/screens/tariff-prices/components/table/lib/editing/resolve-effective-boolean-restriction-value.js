/**
 * Текущее отображаемое значение булева ограничения: черновик в store или сохранённое.
 *
 * @param {{
 *   pricesCalendarModel?: { getRestriction?: Function },
 *   updatedRestrictions?: Record<string, Record<string, Record<string, unknown>>>,
 *   roomtypeId: string,
 *   restrictionType: string,
 *   date: string,
 * }} args
 * @returns {0|1}
 */
export function resolveEffectiveBooleanRestrictionValue({
  pricesCalendarModel,
  updatedRestrictions,
  roomtypeId,
  restrictionType,
  date,
}) {
  const draft = updatedRestrictions?.[roomtypeId]?.[date]?.[restrictionType];
  if (draft !== undefined && draft !== null && draft !== "") {
    return Number(draft) ? 1 : 0;
  }
  const saved = pricesCalendarModel?.getRestriction?.({
    id: roomtypeId,
    date,
    name: restrictionType,
  })?.value ?? 0;
  return Number(saved) ? 1 : 0;
}
