/**
 * @param {unknown[]} arr1
 * @param {unknown[]} arr2
 * @returns {boolean}
 */
export function haveDifferentContent(arr1, arr2) {
  const first = arr1 || [];
  const second = arr2 || [];
  if (first.length !== second.length) {
    return true;
  }
  const firstSet = new Set(first);
  for (const item of second) {
    if (!firstSet.has(item)) {
      return true;
    }
  }
  return false;
}

/**
 * @param {unknown[]} toBeSortedArray
 * @param {unknown[]} templateArray
 * @returns {unknown[]}
 */
export function getRightOrderArray(toBeSortedArray, templateArray) {
  const set = new Set(toBeSortedArray);
  return templateArray.filter((item) => set.has(item));
}
