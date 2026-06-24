import moment from "moment";

/**
 * Нормализация query `dfrom` как в index.vue:normalizeQueryDateFrom (границы ±10 лет от «сейчас»).
 * @param {string|undefined|null} rawDateFrom
 * @param {{ sendingDateFormat: string }} options
 * @returns {string}
 */
// eslint-disable-next-line import/prefer-default-export
export function normalizeDateFrom(rawDateFrom, { sendingDateFormat }) {
  let dfrom = rawDateFrom;
  let parsedDate = moment(dfrom, sendingDateFormat, true);

  if (!dfrom || !parsedDate.isValid()) {
    dfrom = moment().format(sendingDateFormat);
    parsedDate = moment(dfrom, sendingDateFormat, true);
  }

  if (parsedDate > moment().add(10, "y")) {
    dfrom = moment().add(10, "y").format(sendingDateFormat);
  }
  if (parsedDate < moment().subtract(10, "y")) {
    dfrom = moment().subtract(10, "y").format(sendingDateFormat);
  }

  return dfrom;
}
