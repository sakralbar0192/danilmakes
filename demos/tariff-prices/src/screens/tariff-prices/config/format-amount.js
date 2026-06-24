/**
 * Форматирование суммы в поле ввода цены: разряды, курсор после форматирования.
 */

/** Пробелы и типичные неразрывные разделители групп в отображении суммы */
const AMOUNT_GROUP_SEP_RE = /[\s\u00a0\u202f]/;

/**
 * Считает целые и дробные цифры до позиции курсора в сыром значении поля (игнорируя пробелы-разряды).
 * `afterDecimalWithoutFraction` — курсор сразу после десятичной точки, дробных цифр ещё нет.
 */
export function countPriceDigitsStateBeforeCursor(raw, cursorPos) {
  let intDigits = 0;
  let fracDigits = 0;
  let pastDot = false;
  const end = Math.max(0, Math.min(cursorPos, `${raw}`.length));
  for (let i = 0; i < end; i++) {
    const ch = `${raw}`[i];
    if (ch === "." || ch === ",") {
      pastDot = true;
      continue;
    }
    if (/\d/.test(ch)) {
      if (pastDot) {
        fracDigits += 1;
      } else {
        intDigits += 1;
      }
    }
  }
  const afterDecimalWithoutFraction = pastDot && fracDigits === 0;
  return {
    intDigits, fracDigits, afterDecimalWithoutFraction,
  };
}

/**
 * Индекс курсора в отформатированной строке по числу цифр слева (учёт пробелов групп и точки).
 */
export function amountCursorFormattedIndex(formatted, {
  intDigits,
  fracDigits,
  afterDecimalWithoutFraction,
}) {
  if (!formatted) {
    return 0;
  }
  if (intDigits === 0 && fracDigits === 0 && !afterDecimalWithoutFraction) {
    return 0;
  }
  let intSeen = 0;
  let fracSeen = 0;
  let inFrac = false;

  const skipGroupSeparators = (from) => {
    let j = from;
    while (j < formatted.length && AMOUNT_GROUP_SEP_RE.test(formatted[j])) {
      j += 1;
    }
    return j;
  };

  for (let i = 0; i < formatted.length; i++) {
    const c = formatted[i];
    if (c === ".") {
      if (afterDecimalWithoutFraction && !inFrac && intSeen === intDigits) {
        return i + 1;
      }
      inFrac = true;
      continue;
    }
    if (AMOUNT_GROUP_SEP_RE.test(c)) {
      continue;
    }
    if (!/\d/.test(c)) {
      continue;
    }

    if (!inFrac) {
      intSeen += 1;
      if (intSeen === intDigits) {
        if (afterDecimalWithoutFraction) {
          const afterDigit = skipGroupSeparators(i + 1);
          if (formatted[afterDigit] === ".") {
            return afterDigit + 1;
          }
          return afterDigit;
        }
        if (fracDigits === 0) {
          return skipGroupSeparators(i + 1);
        }
      }
    } else {
      fracSeen += 1;
      if (fracSeen === fracDigits) {
        return i + 1;
      }
    }
  }
  return formatted.length;
}

/**
 * Backspace сразу после разрядного пробела: удалить последнюю цифру предыдущей группы (как «нормальный» backspace, а не пустое нажатие).
 * Курсор после удаления — на индексе, где была удалённая цифра в строке до форматирования, затем `formatAmount` пересчитывает позицию по числу цифр слева.
 * @param {{ value: string, selectionStart?: number, selectionEnd?: number, setSelectionRange?: Function }} input
 * @returns {boolean} true если обработали (нужен preventDefault на keydown)
 */
export function applyThousandsSeparatorBackspace(input) {
  if (!input || typeof input.value !== "string") {
    return false;
  }
  const start = typeof input.selectionStart === "number" ? input.selectionStart : null;
  const end = typeof input.selectionEnd === "number" ? input.selectionEnd : null;
  if (start == null || end == null || start !== end) {
    return false;
  }
  const pos = start;
  if (pos <= 1) {
    return false;
  }
  const raw = input.value;
  if (!AMOUNT_GROUP_SEP_RE.test(raw[pos - 1])) {
    return false;
  }
  let k = pos - 2;
  while (k >= 0) {
    const ch = raw[k];
    if (ch === "." || ch === ",") {
      return false;
    }
    if (AMOUNT_GROUP_SEP_RE.test(ch)) {
      k -= 1;
      continue;
    }
    if (/\d/.test(ch)) {
      const newRaw = raw.slice(0, k) + raw.slice(k + 1);
      input.value = newRaw;
      const newPos = Math.min(k, newRaw.length);
      if (typeof input.setSelectionRange === "function") {
        try {
          input.setSelectionRange(newPos, newPos);
        } catch (err) {
          // ignore
        }
      } else {
        input.selectionStart = newPos;
        input.selectionEnd = newPos;
      }
      formatAmount(input, { cursorPos: k });
      return true;
    }
    k -= 1;
  }
  return false;
}

/**
 * Форматирует значение как число с ограничениями по длине и разделителями разрядов.
 * Может принимать input-элемент — тогда обновляет value и позицию курсора.
 * @param {string|number|{ value: string }} valueOrInput
 * @param {{ cursorPos?: number }} [options] — для DOM-input: явная позиция курсора в `value` до форматирования (если не задано — `selectionStart` или конец строки).
 */
export function formatAmount(valueOrInput, options = {}) {
  const MAX_INTEGER_LENGTH = 8;
  const MAX_FRACTION_LENGTH = 2;

  const formatString = (rawValue) => {
    const value = `${rawValue}`;
    let absValue = value.startsWith("-") ? value.substring(1) : value;
    absValue = absValue.replace(/,/g, ".").replace(/[^\d.]/g, "");
    const dotCount = (absValue.match(/\./g) || []).length;
    if (dotCount > 1) {
      const parts = absValue.split(".");
      absValue = `${parts[0]}.${parts.slice(1).join("")}`;
    }
    let [integerPart, fractionalPart] = absValue.split(".");
    if (fractionalPart !== undefined) {
      fractionalPart = fractionalPart.substring(0, MAX_FRACTION_LENGTH);
    }
    if (integerPart === undefined) integerPart = "";
    if (integerPart === "" && fractionalPart !== undefined) {
      integerPart = "0";
    }
    integerPart = integerPart.substring(0, MAX_INTEGER_LENGTH);
    let formattedInteger = integerPart;
    if (integerPart.length > 3) {
      formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
    if (fractionalPart !== undefined) {
      formattedInteger += `.${fractionalPart}`;
    }
    return formattedInteger;
  };

  if (valueOrInput && typeof valueOrInput === "object" && "value" in valueOrInput) {
    const input = valueOrInput;
    const originalValue = `${input.value ?? ""}`;
    const opts = options && typeof options === "object" ? options : {};
    const cursorPos = typeof opts.cursorPos === "number"
      ? Math.max(0, Math.min(opts.cursorPos, originalValue.length))
      : (typeof input.selectionStart === "number"
        ? input.selectionStart
        : originalValue.length);
    const formattedFull = formatString(originalValue);
    const digitState = countPriceDigitsStateBeforeCursor(originalValue, cursorPos);
    input.value = formattedFull;
    const newCursorPos = amountCursorFormattedIndex(formattedFull, digitState);
    if (typeof input.setSelectionRange === "function") {
      try {
        input.setSelectionRange(newCursorPos, newCursorPos);
      // eslint-disable-next-line no-empty
      } catch (e) {}
    } else {
      input.selectionStart = newCursorPos;
      input.selectionEnd = newCursorPos;
    }
    return formattedFull;
  }
  return formatString(valueOrInput);
}
