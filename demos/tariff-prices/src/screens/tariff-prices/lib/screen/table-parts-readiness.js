/**
 * @param {string[]} requiredParts
 * @param {object} partsLoadState
 * @returns {boolean}
 */
export function isPartReady(part, partsLoadState = {}) {
  const loadedKey = `${part}Loaded`;
  const loadingKey = `${part}Loading`;
  return Boolean(partsLoadState[loadedKey]) && !partsLoadState[loadingKey];
}

/**
 * @param {string[]} requiredParts
 * @param {object} partsLoadState
 * @returns {boolean}
 */
export function isPartsPending(requiredParts = [], partsLoadState = {}) {
  return (requiredParts || []).some((part) => {
    const loadedKey = `${part}Loaded`;
    const loadingKey = `${part}Loading`;
    if (partsLoadState[loadingKey]) {
      return true;
    }
    return !partsLoadState[loadedKey];
  });
}

/**
 * Токен для инвалидации VM cache / row epoch.
 *
 * @param {string[]} requiredParts
 * @param {object} partsLoadState
 * @returns {string}
 */
export function buildPartsReadinessToken(requiredParts = [], partsLoadState = {}) {
  return (requiredParts || []).map((part) => {
    const loaded = partsLoadState[`${part}Loaded`] ? 1 : 0;
    const loading = partsLoadState[`${part}Loading`] ? 1 : 0;
    return `${part}:${loaded}${loading}`;
  }).join(",");
}
