const ymHelpers = {
  /**
   * Оболочка над методами sendHit из `/bnovo_pms/bnovopms.ui/public/js/helpers/ymetrika.js`
   * @param counter {String} - счетчик яндекс метрик
   * @param page {String} - URL или "имя" метрики
   * @param [title = ""] {String} - описание
   * @param [params = {}] {Object} - дополнительные атрибуты
   * @param [group = ""] {String} - группа из объекта `yMetrikaGroups`
   * @param [addParamsToURL = true] {Boolean} - добавить параметры в URL как GET параметры
   * @example
   * import ymHelpers from "@/utils/ym-helpers.js";
   * ...
   * ymHelpers.sendHit("main", `${this.currentStep.ymTitle}_${this.stepTime}`, this.currentStep.ymTitle, { time: this.stepTime });
   */
  sendHit(counter, page, title = "", params = {}, group = "", addParamsToURL = true) {
    if (window.ymMain) {
      window.ymMain.sendHit(page, title, group, params, addParamsToURL);
    }
  },
  /**
   * Оболочка над методами reachGoal из `/bnovo_pms/bnovopms.ui/public/js/helpers/ymetrika.js`
   * @param counter {String} - счетчик яндекс метрик
   * @param goal {String} - URL или "имя" метрики
   *
   * @example
   * import ymHelpers from "@/utils/ym-helpers.js";
   * ...
   * ymHelpers.reachGoal("main", `${item.goalName}`);
   */
  reachGoal(counter, goal) {
    if (window.ymMain) {
      window.ymMain.reachGoal(goal);
    }
  },
};

export default ymHelpers;
