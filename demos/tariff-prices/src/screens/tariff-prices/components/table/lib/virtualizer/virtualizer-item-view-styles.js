/**
 * Стили позиционирования одной строки виртуализатора (absolute + transform или top).
 */
// eslint-disable-next-line import/prefer-default-export
export function computeItemViewStyles({
  position,
  used,
  disableTransform,
}) {
  const positionStrategy = disableTransform
    ? "top"
    : "transform";

  const positionValue = disableTransform
    ? `${position}px`
    : `translateY(${position}px)`;

  return {
    [positionStrategy]: positionValue,
    visibility: used ? "visible" : "hidden",
  };
}
