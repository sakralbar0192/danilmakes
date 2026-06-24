const arrayHelpers = {
  equalArrays(a, b) {
    if (a.length !== b.length) { return 0; }
    const aa = JSON.parse(JSON.stringify(a));
    const bb = JSON.parse(JSON.stringify(b));
    return aa.sort().toString() === bb.sort().toString();
  },
  validateArrayToMap(arr, map) {
    for (let i = 0; i < arr.length; i++) {
      const id = arr[i];
      if (typeof map[id] === "undefined") { arr.splice(i, 1); i--; continue; }
    }
    return arr;
  },
  isEmpty(obj){
    if (typeof obj === "undefined" || !obj) {
      return true;
    }
    if (Array.isArray(obj) && obj.length < 1) {
      return true;
    }
    return typeof obj === "object" && Object.keys(obj).length < 1;
  },
  arrayFromNumber(number) {
    return Array.from(Array(number).keys());
  },
  /**
   * Сортировка массива
   * @arg arr {Object[]} сортируемый массив
   * @arg value {String} свойство по которому происходит сортировка
   * @arg format {String} формат свойства для сортировки
   * @arg descend {Boolean} флаг для сортировки по убыванию
   * @returns {Array}
   */
  sort(arr, value = "name", format = "string", descend = false) {
    return arr.sort((a, b) => {
      let formattedA = a[value];
      let formattedB = b[value];

      if (format === "number") {
        formattedA = Number(a[value]);
        formattedB = Number(b[value]);
      } else if (format === "date") {
        formattedA = new Date(a[value]);
        formattedB = new Date(b[value]);
      }
      return descend ? (formattedB - formattedA) : (formattedA - formattedB);
    });
  },
  /**
   * Пример использования
   * const arr1 = [{id: 1, name: 'a'}, {id: 2, name: 'b'}];
   * const arr2 = [{id: 2, name: 'b'}, {id: 3, name: 'c'}];
   *
   * const merged = mergeArrays(arr1, arr2);
   * console.log(merged); // [{id:1, name:'a'}, {id:2, name:'b'}, {id:3, name:'c'}]
   *
   * @param arr1
   * @param arr2
   * @param key - ключ как уникальный идентификатор
   * @returns {*[]}
   */
  merge(arr1, arr2, key = "id") {
    const seen = new Set();
    return [...arr1, ...arr2].filter(obj => {
      const currentKey = obj[key];
      return seen.has(currentKey) ? false : seen.add(currentKey);
    });
  },

  /**
   * Преобразует объект в массив объектов с заданными полями.
   * @param {Object} obj - Исходный объект.
   * @param {string} keyName - Название поля для ключей.
   * @param {string} valueName - Название поля для значений.
   * @param {string} [objValue=""] - Опциональный путь к вложенному свойству.
   * @returns {Array<Object>} Массив объектов с полями `keyName` и `valueName`.
   */
  convertObjectToArray(obj, keyName, valueName, objValue = "") {
    return Object.entries(obj).map(([key, value]) => ({
      [keyName]: parseInt(key, 10),
      [valueName]: objValue ? obj[key][objValue] : value,
    }));
  },

  /**
   * Функция для преобразования списка данных в ассоциативную структуру.
   * @param {any[]} source Список данных для преобразования.
   * @param {string | Function} keyMapper Имя или геттер атрибута объекта, который будет выступать в качестве ключа.
   * @param {string | Function} valMapper Имя или геттер аттрибута объекта, который будет выступать в качестве значения.
   * По умолчанию отображает на сам объект
   * @returns {Map} Ассоциативная таблица вида `{keyMapper: valMapper}`
   */
  toMap(source, keyMapper, valMapper = (it) => it) {
    if (!Array.isArray(source)) {
      throw new Error("Param #1:source is not an array");
    }

    const toGetter = (key) => {
      return typeof key === "function" ? key : (it) => it[key];
    };

    keyMapper = toGetter(keyMapper);
    valMapper = toGetter(valMapper);

    const result = new Map();
    for (const it of source) {
      const key = keyMapper(it);
      if (result.has(key)) {
        console.log(`arrayHelpers.toMap: found duplicate by key ${key}`);
      }

      if (key != null) {
        result.set(key, valMapper(it));
      }
    }

    return result;
  },
};

/**
 * Проверяет, содержит ли массив elements хотя бы один элемент из массива requiredElements.
 * @param {Array} elements - Массив элементов, который нужно проверить.
 * @param {Array} requiredElements - Массив элементов, которые должны быть найдены.
 * @returns {boolean} - Возвращает true, если хотя бы один элемент из requiredElements есть в elements.
 */
export const containsAny = (elements, requiredElements) => {
  const requiredElementsSet = new Set(requiredElements); // Используем Set для оптимизации
  return elements.some(element => requiredElementsSet.has(element));
};

export default arrayHelpers;
