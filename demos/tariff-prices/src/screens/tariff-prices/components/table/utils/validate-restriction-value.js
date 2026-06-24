/**
 * Валидирует значение ограничения в input (1–365), мутирует target.value.
 * Пустая строка и ввод только нулей — сброс (0 в UI = отсутствие значения, placeholder).
 */
// eslint-disable-next-line import/prefer-default-export
export function validateRestrictionValue(target) {
  if (!target) return;
  const value = target.value.replace(/[^\d]/g, "");
  if (value === "") {
    target.value = "";
    return;
  }
  const num = parseInt(value, 10);
  if (!num || num < 1) {
    target.value = "";
    return;
  }
  if (num > 365) {
    target.value = "365";
    return;
  }
  target.value = String(num);
}
