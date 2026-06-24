/**
 * Сохранённые пользователем фильтры страницы (категории / ограничения) из user.extra.
 * @param {object|null|undefined} user
 * @param {string|number|undefined|null} hotelId
 * @returns {{ categories: unknown[], restrictions: unknown[], compactRestrictions: boolean, interfaceSettings: object|null }}
 */
// eslint-disable-next-line import/prefer-default-export
export function getSavedPageData(user, hotelId) {
  const raw = user?.extra?.price_and_restrictions_page_data?.[hotelId];
  if (!raw) {
    return {
      categories: [],
      restrictions: null,
      compactRestrictions: null,
      interfaceSettings: null,
    };
  }
  return {
    categories: raw.categories ?? [],
    restrictions: raw.restrictions ?? [],
    compactRestrictions: raw.restrictionsViewMode,
    interfaceSettings: raw.interfaceSettings ?? null,
  };
}
