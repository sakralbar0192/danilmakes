import moment from "moment/moment";
import capitalizeFirstLetter from "@/utils/string";
import i18n from "@/plugins/i18n";

/**
 * Функция возвращает сокращенное наименование дня недели
 * @param dayIndex - индекс дня, где Вс - 0, а Сб - 6
 * @returns {string}
 */
function getDayShortName(dayIndex) {
  const days = [
    "Вc",
    "Пн",
    "Вт",
    "Ср",
    "Чт",
    "Пт",
    "Сб",
  ];

  return days[dayIndex];
}

const monthsNames = [
  i18n.t("Январь"),
  i18n.t("Февраль"),
  i18n.t("Март"),
  i18n.t("Апрель"),
  i18n.t("Май"),
  i18n.t("Июнь"),
  i18n.t("Июль"),
  i18n.t("Август"),
  i18n.t("Сентябрь"),
  i18n.t("Октябрь"),
  i18n.t("Ноябрь"),
  i18n.t("Декабрь"),
];

/**
 * Преобразует дату в объект с различными форматами.
 *
 * @param {string} data - Дата в строковом формате.
 * @param {string} [fromFormat="YYYY-MM-DD HH:mm:ss"] - Формат входной даты.
 * @returns {Object} Объект с преобразованными датами и временем.
 */
const dateToMoment = (data, fromFormat) => {
  const date = moment(data, fromFormat || "YYYY-MM-DD HH:mm:ss");
  const nextOur = moment(data, fromFormat || "YYYY-MM-DD HH:mm:ss").add(1, "hour");
  const day = date.day();
  return {
    moment: date,
    hours: date.format("HH:00"),
    sendingDate: date.format("YYYY-MM-DD"),
    sendingDateLegacy: date.format("DD-MM-YYYY"),
    outputTiming: date.format("HH:mm"),
    outputDate: date.format("DD.MM.YYYY"),
    outputDay: getDayShortName(day),
    dailyFormat: date.format("YYYY-MM-DD HH:mm"),
    fakeTooltip: date.format("DD/MM"),
    fakeTooltipDailyDfrom: date.format("HH:mm"),
    fakeTooltipDaily: nextOur.format("HH:mm"),
  };
};

/**
 * Проверяет, что переданная дата находится не раньше текущего дня
 * @param {string} dateString - Дата в формате dateFormat
 * @param {string} dateFormat - Формат даты
 * @returns {boolean} true, если дата в будущем (завтра или позже)
 */
function isFutureOrSameDate(dateString, dateFormat) {
  // Создаём момент-объекты и обнуляем время (чтобы сравнивать только даты)
  const inputDate = moment(dateString, dateFormat).startOf("day");
  const today = moment().startOf("day");

  // Проверяем валидность даты
  if (!inputDate.isValid()) {
    console.warn("Передана некорректная дата:", dateString);
    return false;
  }

  return inputDate.isSameOrAfter(today);
}

/**
 * Проверяет, что переданная дата находится строго после текущего дня
 * @param {string} dateString - Дата в формате dateFormat
 * @param {string} dateFormat - Формат даты
 * @returns {boolean} true, если дата в будущем (завтра или позже)
 */
function isFutureDate(dateString, dateFormat) {
  // Создаём момент-объекты и обнуляем время (чтобы сравнивать только даты)
  const inputDate = moment(dateString, dateFormat).startOf("day");
  const today = moment().startOf("day");

  // Проверяем валидность даты
  if (!inputDate.isValid()) {
    console.warn("Передана некорректная дата:", dateString);
    return false;
  }

  // Сравниваем даты (isAfter = строго после)
  return inputDate.isAfter(today);
}

/**
 * Проверяет, являются ли две даты началом и концом одного и того же месяца.
 * @param {Array<string>} dates - Массив из двух строк с датами
 * @param {string} format - Формат дат в соответствии с Moment.js
 * @returns {boolean} Возвращает true, если:
 *                   - Первая дата является первым днём месяца
 *                   - Вторая дата является последним днём месяца
 *                   - Обе даты принадлежат одному месяцу и году
 * @throws {Error} Выбрасывает исключение, если:
 *                 - На вход передан не массив или массив не из двух элементов
 *                 - Любая из дат не соответствует указанному формату
 *                 - Даты являются невалидными
 */
function isStartAndEndOfSameMonth(dates, format) {
  // Проверяем, что массив содержит ровно две даты
  if (!Array.isArray(dates) || dates.length !== 2) {
    throw new Error("Input must be an array of two dates");
  }

  const [firstDateStr, secondDateStr] = dates;

  // Парсим даты с учетом указанного формата
  const firstDate = moment(firstDateStr, format);
  const secondDate = moment(secondDateStr, format);

  // Проверяем, что даты валидны
  if (!firstDate.isValid() || !secondDate.isValid()) {
    throw new Error("Invalid date(s) provided");
  }

  // Проверяем, что первая дата - это начало месяца (1-е число)
  const isFirstDateStartOfMonth = firstDate.date() === 1;

  // Проверяем, что вторая дата - это конец месяца
  const isSecondDateEndOfMonth = secondDate.isSame(moment(secondDate).endOf("month"), "day");

  // Проверяем, что даты принадлежат одному и тому же месяцу и году
  const areSameMonthAndYear = firstDate.isSame(secondDate, "month") && firstDate.isSame(secondDate, "year");

  return isFirstDateStartOfMonth && isSecondDateEndOfMonth && areSameMonthAndYear;
}

/**
 * Форматирует период дат в строковое представление.
 * Если период охватывает полный месяц - возвращает название месяца и год.
 * Если период частичный - возвращает даты начала и конца периода.
 *
 * @param {Array<string>} period - Массив из двух дат [начало, конец]
 * @param {string} format - Формат ввода/вывода дат (например, 'DD.MM.YYYY')
 * @param {string} [separator='—'] - Разделитель для частичного периода
 * @returns {string} Отформатированная строка периода
 * @throws {Error} Если период не массив из двух элементов или даты невалидны
 */
function getPeriodString(period, format, displayFormat, separator = "—") {
  if (!Array.isArray(period)) {
    throw new Error("Период должен быть массивом");
  }

  if (period.length !== 2) {
    throw new Error("Массив периода должен содержать ровно 2 даты");
  }

  const [startDateStr, endDateStr] = period;
  const startDate = moment(startDateStr, format);
  const endDate = moment(endDateStr, format);

  if (!startDate.isValid() || !endDate.isValid()) {
    throw new Error("Невалидные даты в периоде");
  }

  if (isStartAndEndOfSameMonth(period, format)) {
    const month = startDate.format("MMMM");
    const year = startDate.format("YYYY");
    return `${capitalizeFirstLetter(month)} ${year}`;
  }

  return `${startDate.format(displayFormat)}${separator}${endDate.format(displayFormat)}`;
}

export {
  dateToMoment, getDayShortName, isFutureDate, isStartAndEndOfSameMonth, getPeriodString, isFutureOrSameDate, monthsNames,
};
