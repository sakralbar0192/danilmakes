export const objectsEqual = (x, y) => {
  return (x && y && typeof x === "object" && typeof y === "object")
    ? (Object.keys(x).length === Object.keys(y).length)
    && Object.keys(x).reduce((isEqual, key) => {
      return isEqual && objectsEqual(x[key], y[key]);
    }, true) : (x === y);
};

const hasOwnProp = Object.prototype.hasOwnProperty;
export function hasOwn(target, key) {
  return hasOwnProp.call(target, key);
}

/**
   * Функция для получения json обьекта с непустыми полями модели
   * @returns {Object} - объект с данными модели в виде json
   */
export function removeEmptyFields(object) {
  const fields = { ...object };
  Object.entries(fields).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length === 0) {
      delete fields[key];
    } else if (typeof value === "object" && Object.keys(value).length === 0) {
      delete fields[key];
    } else if (!value) {
      delete fields[key];
    }
  });
  return fields;
}

/**
 * Функция преобразования нотации свойств объекта из camelCase в snake_case (полезно для работы с бэком)
 * @returns {Object} - объект с измененными именами свойств
 */
export function changePropertyNamesCase(object) {
  return Object.fromEntries(
    Object.entries(object).map(([key, value]) => [
      key.replace(/([A-Z])/g, "_$1").toLowerCase(),
      value,
    ]),
  );
}

/**
 * Рекурсивно преобразует все ключи в объекте (включая вложенные объекты и массивы) из camelCase в snake_case.
 *
 * @param {Object|Array|*} obj - Входной объект, массив или примитивное значение для обработки.
 *                               Если это объект, его ключи будут преобразованы в snake_case.
 *                               Если это массив, каждый элемент будет обработан рекурсивно.
 *                               Если это примитивное значение (например, строка или число), оно будет возвращено без изменений.
 * @returns {Object|Array|*} - Новый объект или массив с ключами, преобразованными в snake_case,
 *                             или исходное значение, если это примитив.
 */
export function convertKeysToSnakeCaseRecursive(obj) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToSnakeCaseRecursive(item));
  }

  const newObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = key.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
      newObj[newKey] = convertKeysToSnakeCaseRecursive(obj[key]);
    }
  }
  return newObj;
}

export function deepEqual(a, b) {
  // Ранний выход: одинаковые ссылки или оба null/undefined
  if (a === b) return true;

  // Если один из них null/undefined, а другой — нет
  if (a == null || b == null) return a === b;

  // Если типы разные — не равны
  if (typeof a !== typeof b) return false;

  // Сравнение массивов
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // Если один массив, другой — нет
  if (Array.isArray(a) || Array.isArray(b)) return false;

  // Сравнение объектов
  if (typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!b.hasOwnProperty(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }

    return true;
  }

  // Примитивы: строка, число, boolean, symbol
  return a === b;
}

export function isEmptyObject(value) {
  if (value == null) {
    return true;
  }

  if (typeof (value) !== "object") {
    throw new Error("Param #1 is not an object");
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  for (const k in value) {
    if (Object.prototype.hasOwnProperty.call(value, k)) {
      return false;
    }
  }

  return true;
}

export function pick(value, keys = []) {
  if (!Array.isArray(keys)) {
    throw new Error("Param #2 is not an array");
  }

  return keys.reduce((n, k) => {
    if (Object.prototype.hasOwnProperty.call(value, k)) {
      n[k] = value[k];
    }

    return n;
  }, {});
}
