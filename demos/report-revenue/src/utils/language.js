/**
 * Получить правильное окончание для слова, следующего за числительным, в зависимости от количества
 * Пример: 1 яблоко, 22 яблока, 13 яблок, 48 яблок.
 * @arg number {Number} числительное
 * @arg a {String} склоняемое слово с окончанием для одного экземпляра
 * @arg b {String} склоняемое слово с окончанием для двух/трех/четырех экземпляров
 * @arg c {String} склоняемое слово с окончанием для множества экземпляров
 * @returns {String}
 */
function wordCase(number, a, b, c) {
  let result;
  if ((number - (number % 10)) % 100 !== 10) {
    if (number % 10 === 1) {
      result = a;
    } else if (number % 10 >= 2 && number % 10 <= 4) {
      result = b;
    } else {
      result = c;
    }
  } else {
    result = c;
  }
  return result;
}

export default wordCase;
