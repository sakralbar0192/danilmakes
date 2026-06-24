/**
 * @param {string|number} childrenAgeId
 * @param {Record<string, { maxAge?: string|number }>} [hotelChildrenAges]
 * @param {{ t?: (key: string) => string, rusWordCaser?: (count: number, ...forms: string[]) => string }} [options]
 * @returns {string|null}
 */
export function formatChildrenAgeLabel(childrenAgeId, hotelChildrenAges = {}, { t = (key) => key, rusWordCaser = () => "" } = {}) {
  const maxAge = hotelChildrenAges?.[childrenAgeId]?.maxAge;
  if (maxAge === undefined || maxAge === null || maxAge === "") {
    return null;
  }

  const maxAgeNumber = Number(maxAge);
  return `${t("до")} ${maxAge} ${rusWordCaser(maxAgeNumber, t("года"), t("лет"), t("лет"))}`;
}

/**
 * @param {string|number} childrenAgeId
 * @param {Record<string, { maxAge?: string|number }>} [hotelChildrenAges]
 * @returns {boolean}
 */
export function hasHotelChildrenAgeLabel(childrenAgeId, hotelChildrenAges = {}) {
  const maxAge = hotelChildrenAges?.[childrenAgeId]?.maxAge;
  return maxAge !== undefined && maxAge !== null && maxAge !== "";
}
