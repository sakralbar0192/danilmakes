const capitalizeFirstLetter = (str) => {
  return str[0].toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Получить инициалы из имени пользователя.
 * Берём первую букву первого слова и первую букву второго слова (если есть).
 *
 * @param {unknown} username
 * @returns {string}
 */
export const getInitialsFromUsername = (username) => {
  const normalizedUsername = String(username || "").trim();
  if (!normalizedUsername) {
    return "";
  }
  const parts = normalizedUsername.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const second = parts[1]?.[0] || "";
  const initials = (first + second).toUpperCase();
  return initials || first.toUpperCase();
};

export default capitalizeFirstLetter;
