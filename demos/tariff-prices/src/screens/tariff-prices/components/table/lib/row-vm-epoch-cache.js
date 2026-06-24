/**
 * Кэш epoch для row-level VM (getPriceRowVmEpoch / getRestrictionRowVmEpoch).
 */

/**
 * @returns {{ globalEpoch: string, byKey: Map<string, string> }}
 */
export function createRowVmEpochCache() {
  return {
    globalEpoch: "",
    byKey: new Map(),
  };
}

/**
 * @param {{ globalEpoch: string, byKey: Map }} cache
 * @param {string} globalEpoch
 */
export function syncRowVmEpochCacheGlobalEpoch(cache, globalEpoch) {
  if (cache.globalEpoch === globalEpoch) {
    return;
  }
  cache.globalEpoch = globalEpoch;
  cache.byKey.clear();
}

/**
 * @param {{ globalEpoch: string, byKey: Map }} cache
 */
export function invalidateRowVmEpochCache(cache) {
  cache.globalEpoch = "";
  cache.byKey.clear();
}

/**
 * @param {{ globalEpoch: string, byKey: Map }} cache
 * @param {string} cacheKey
 * @param {() => string} computeEpoch
 * @returns {string}
 */
export function getRowVmEpochFromCache(cache, cacheKey, computeEpoch) {
  if (!cacheKey) {
    return computeEpoch();
  }
  const cached = cache.byKey.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }
  const epoch = computeEpoch();
  cache.byKey.set(cacheKey, epoch);
  return epoch;
}

/**
 * @param {string} globalEpoch
 * @param {string} roomId
 * @param {string} [suffix]
 */
export function buildPriceRowEpochCacheKey(globalEpoch, roomId, suffix = "") {
  return `p|${globalEpoch}|${roomId}|${suffix}`;
}

/**
 * @param {string} globalEpoch
 * @param {string} roomId
 * @param {string} restrictionType
 */
export function buildRestrictionRowEpochCacheKey(globalEpoch, roomId, restrictionType = "") {
  return `r|${globalEpoch}|${roomId}|${restrictionType}`;
}
