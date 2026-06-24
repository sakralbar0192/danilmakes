/**
 * Последовательности подряд идущих дней с одинаковым статусом «закрыта продажа»,
 * пересекающие горизонтальное окно [winStart, winEnd). Вне окна календарь не сканируется
 * (кроме расширения влево до начала «пробега», содержащего winStart).
 *
 * id стабилен при неизменных границах пробега — меньше лишних remount бейджей.
 *
 * @param {object} p
 * @param {Array<{ date: string }>} p.calendar
 * @param {(index: number) => boolean} p.getClosed — закрыта ли продажа в день calendar[index]
 * @param {number} p.winStart — индекс первого дня окна (включительно)
 * @param {number} p.winEnd — индекс после последнего дня окна (исключительно)
 * @param {boolean} [p.fullCalendar=false] — если true, то winStart/winEnd игнорируются, полный проход
 * @returns {Array<{ id: string, startIndex: number, endIndex: number, closed: boolean }>}
 */
// eslint-disable-next-line import/prefer-default-export
export function buildClosedSaleSequencesForViewport({
  calendar,
  getClosed,
  winStart,
  winEnd,
  fullCalendar = false,
}) {
  const n = calendar?.length ?? 0;
  if (!n) {
    return [];
  }

  let winLo = 0;
  let winHi = n;
  if (!fullCalendar) {
    winLo = Math.max(0, Math.min(winStart, n));
    winHi = Math.max(0, Math.min(winEnd, n));
    if (winHi <= winLo) {
      return [];
    }
  }

  let idx = fullCalendar ? 0 : Math.min(winLo, n - 1);
  if (!fullCalendar) {
    while (idx > 0 && getClosed(idx - 1) === getClosed(idx)) {
      idx -= 1;
    }
  }

  const sequences = [];
  let pos = idx;
  while (pos < n) {
    const closed = getClosed(pos);
    let end = pos;
    while (end < n - 1 && getClosed(end + 1) === closed) {
      end += 1;
    }

    if (end >= winLo && pos < winHi) {
      sequences.push({
        id: `sale-seq-${pos}-${end}-${closed ? 1 : 0}`,
        startIndex: pos,
        endIndex: end,
        closed,
      });
    }

    pos = end + 1;
    if (!fullCalendar && pos >= winHi) {
      break;
    }
  }

  return sequences;
}
