/**
 * Стабильный ключ для watch смены маршрута экрана тарифа (params + query).
 * @param {{ id?: string, dfrom?: string, mode?: string }} parts
 * @returns {string}
 */
// eslint-disable-next-line import/prefer-default-export
export function buildRouteDataKey(parts) {
  const id = parts?.id ?? "";
  const dfrom = parts?.dfrom ?? "";
  const mode = parts?.mode ?? "";
  return [id, dfrom, mode].join("|");
}
