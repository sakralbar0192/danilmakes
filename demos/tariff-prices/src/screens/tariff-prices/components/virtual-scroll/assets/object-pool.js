import { sortVirtualViewsByRowIndex } from "../../table/lib/virtualizer/virtualizer-active-views.js";

/**
 * Object Pool - шаблон проектирования, набор инициализированных и готовых к использованию объектов.
 * Когда системе требуется объект, он не создаётся, а берётся из пула.
 * Когда объект больше не нужен, он не уничтожается, а возвращается в пул.
 *
 * ### Зачем это нужно?
 * Виртуализированные списки отображают только видимую часть набора данных.
 * При скроллинге одни элементы уходят из поля зрения, другие - появляются.
 * Без пула это привело бы к постоянному созданию и уничтожению DOM-элементов/Компонентов,
 * вызывая создание/уничтожение эффектов реактивности, вызов жизненных хуков и т.д.
 * Данный сценарий приводит к частому обращению к small GC движка, что может повлечь рост времени на исполнение.
 *
 * Пул разделяется по `type`, чтобы гарантировать, что представления разных типов не будут смешиваться
 */
export default class VirtualViewPool {
  /**
   * Карта пулов представлений, сгруппированных по типу.
   * Ключ - строковое значение `type`
   * Значение - стек готовых к переиспользованию представлений этого типа.
   * @type {Map<string | number, Array<VirtualView>>}
   * @private
   */
  _allPools = new Map();

  /**
   * Карта в данный момент отображаемых представлений.
   * Ключ - уникальный идентификатор элемента.
   * Значение - ссылка на экземпляр `VirtualView`.
   *
   * Нужна для:
   * - быстрого доступа к представлению по ключу.
   * - предотвращения дублирования одного и того же элемента.
   * @type {Map<string | number, VirtualView>}
   * @private
   */
  _activeViews = new Map();

  /**
   * Возвращает представление в пул для последующего переиспользования.
   * Представление деактивируется и удаляется из списка активных.
   * @param {VirtualView} value - Экземпляр `VirtualView`, который больше не отображается.
   * @param {number} hiddenPosition - позиция отключенного элемента.
   * @param {boolean} disableTransform - отключить режим позиционирования через transform.
   */
  recycle(value, hiddenPosition = -9999, disableTransform = false) {
    const pool = this._getPool(value.raw.type);
    pool.push(value);
    value.deactivate(hiddenPosition);
    value.updateStyle(disableTransform);
    this._activeViews.delete(value.raw.key);
  }

  /**
   * Полностью сбрасывает пул: очищает все неактивные и активные представления.
   */
  reset() {
    this._allPools.clear();
    this._activeViews.clear();
  }

  /**
   * Извлекает неактивное представление заданного типа из пула для повторного использования.
   * Если подходящий объект есть он активируется и возвращается.
   * @param {string | number} type - Тип представления, для которого запрашивается объект.
   * @returns {VirtualView | null} Готовое к использованию представление или `null`.
   */
  getRecycledView(type) {
    const pool = this._getPool(type);
    if (pool && pool.length) {
      const view = pool.pop();
      view.activate();
      return view;
    }

    return null;
  }

  /**
   * Регистрирует представление как активное.
   * @param {string | number} key - Уникальный ключ элемента данных.
   * @param {VirtualView} value - Экземпляр представления.
   */
  putActiveView(key, value) {
    this._activeViews.set(key, value);
  }

  /**
   * Возвращает активное представление по уникальному ключу, если оно существует.
   * @param {string | number} key - Уникальный ключ элемента.
   * @returns {VirtualView | undefined} Представление.
   */
  getActiveView(key) {
    return this._activeViews.get(key);
  }

  /**
   * Активные представления в порядке индекса строки (для рендера без «скрытых» узлов).
   * @returns {Array}
   */
  getActiveViewsSorted() {
    return sortVirtualViewsByRowIndex(this._activeViews.values());
  }

  _getPool(type) {
    let pool = this._allPools.get(type);
    if (!pool) {
      pool = [];
      this._allPools.set(type, pool);
    }

    return pool;
  }
}
