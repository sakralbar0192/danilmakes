/**
 * Реализует кэш префиксных сумм для хранения
 * информации о размерах и смещениях от начала элементов в списке.
 * Необходим для реализации в виртуализации чтобы быстро определять какие элементы попадают в видимую область.
 */
export default class MeasurementCache {
  /**
   * Массив префиксных сумм размеров элементов.
   * Элемент `offsets[i]` содержит смещение начала элемента с индексом `i` относительно начала списка.
   * @example
   * ```js
   * offsets[0] = 0 - Начало элемента с индексом 0
   * offsets[1] = sizes[0] - Начало элемента с индексом 1 и конец элемента с индексом 0
   * offsets[2] = sizes[0] + sizes[1] - Начало элемента с индексом 2 и конец элемента с индексом 1
   * offsets[N] = sizes[0] + sizes[1] + ... + sizes[N - 1]
   * ```
   * @type {number[]}
   */
  _offsets = [];

  /**
   * Массив реальных размеров элементов.
   * Под индексом i - размер элемента с индексом i
   * @type {number[]}
   */
  _sizes = [];

  /**
   * Минимальный размер среди всех элементов.
   * Используется в основном для оценки смещения относительно предыдущего момента.
   * @type {number}
   */
  minSize = 0;

  /**
   * Суммарный размер всех элементов.
   * @type {number}
   */
  totalSize = 0;

  constructor(count, minItemSize = 0, sizeGetter = (it) => it.size) {
    this._count = count;
    this._sizeGetter = sizeGetter;
    this._offsets = new Array(count + 1);
    this._sizes = new Array(count);
    this.fill(minItemSize);
  }

  /**
   * Заполняет внутренние массивы `_sizes` и `_offsets` на основе переданной функции `sizeGetter`.
   * Вычисляет префиксные суммы, минимальный и общий размеры.
   */
  fill(minItemSize) {
    let total = 0;
    let min = Infinity;

    this._offsets[0] = 0;

    for (let i = 0; i < this._count; i++) {
      let size = 0;

      if (!minItemSize) {
        size = this._sizeGetter(i);
        if (size == null || typeof size !== "number") {
          throw new Error("size property is not an number");
        }
      } else {
        size = this._sizeGetter(i) || minItemSize;
      }

      if (size < min) {
        min = size;
      }

      total += size;
      this._sizes[i] = size;
      this._offsets[i + 1] = total;
    }

    this.minSize = min;
    this.totalSize = total;
  }

  /**
   * Возвращает смещение (координату начала) элемента с заданным индексом.
   * @param {number} index - Индекс элемента.
   * @returns {number} Смещение начала элемента относительно начала списка.
   */
  getStartOffset(index) {
    if (index < 0) {
      return 0;
    }

    if (index >= this._count) {
      return this.totalSize;
    }

    return this._offsets[index];
  }

  /**
   * Возвращает координату конца элемента с заданным индексом,
   * @param {number} index - Индекс элемента.
   * @returns {number} Смещение конца элемента (начало следующего элемента).
   */
  getEndOffset(index) {
    if (index < 0) {
      return 0;
    }

    if (index >= this._count) {
      return this.totalSize;
    }

    return this._offsets[index + 1];
  }

  /**
   * Возвращает размер (например, высоту) элемента по его индексу.
   * @param {number} index - Индекс элемента.
   * @returns {number} Размер элемента.
   */
  getSize(index) {
    if (index < 0) {
      return 0;
    }

    if (index >= this._count) {
      return 0;
    }

    return this._sizes[index];
  }
}
