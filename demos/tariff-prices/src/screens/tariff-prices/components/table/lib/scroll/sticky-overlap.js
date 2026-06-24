/**
 * Пересечение по вертикали в координатах viewport (DOMRect-подобные объекты).
 * @param {{ top: number, bottom: number }} a
 * @param {{ top: number, bottom: number }} b
 * @returns {boolean}
 */
// eslint-disable-next-line import/prefer-default-export
export function rectsVerticallyOverlap(a, b) {
  if (!a || !b) {
    return false;
  }
  const at = Number(a.top);
  const ab = Number(a.bottom);
  const bt = Number(b.top);
  const bb = Number(b.bottom);
  if (![at, ab, bt, bb].every((n) => Number.isFinite(n))) {
    return false;
  }
  return at < bb && ab > bt;
}
