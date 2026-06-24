/**
 * Позиции подписей месяцев в шапке таблицы: центр видимой части каждого месяца в viewport.
 */

/** ~12px bold + px-groups; достаточно для clamp без DOM-замера. */
const MONTH_LABEL_CHAR_WIDTH_PX = 8;
const MONTH_LABEL_HORIZONTAL_PADDING_PX = 16;

/**
 * @param {string} monthName
 * @returns {number}
 */
export function estimateMonthLabelWidthPx(monthName) {
  const len = monthName?.length || 0;
  return len * MONTH_LABEL_CHAR_WIDTH_PX + MONTH_LABEL_HORIZONTAL_PADDING_PX;
}

/**
 * @param {number} centerPx
 * @param {number} spanStartPx
 * @param {number} spanEndPx
 * @param {number} labelHalfWidthPx
 * @returns {number}
 */
export function clampMonthLabelCenterInSpan(centerPx, spanStartPx, spanEndPx, labelHalfWidthPx) {
  if (labelHalfWidthPx <= 0) {
    return Math.min(spanEndPx, Math.max(spanStartPx, centerPx));
  }
  return Math.min(
    spanEndPx - labelHalfWidthPx,
    Math.max(spanStartPx + labelHalfWidthPx, centerPx),
  );
}

/**
 * @param {object} p
 * @param {number} p.idealCenterPx — центр в координатах clip (относительно clipLeft)
 * @param {number} p.visTrackLeftPx
 * @param {number} p.visTrackWidthPx
 * @param {number} p.clipWidthPx
 * @param {number} p.labelWidthPx
 * @returns {{ trackLeftPx: number, trackWidthPx: number }}
 */
export function resolveMonthLabelTrackInClip({
  idealCenterPx,
  visTrackLeftPx,
  visTrackWidthPx,
  clipWidthPx,
  labelWidthPx,
}) {
  let trackLeftPx = visTrackLeftPx;
  let trackWidthPx = visTrackWidthPx;

  if (labelWidthPx > trackWidthPx) {
    trackWidthPx = Math.min(labelWidthPx, clipWidthPx);
    trackLeftPx = Math.max(
      0,
      Math.min(idealCenterPx - labelWidthPx / 2, clipWidthPx - trackWidthPx),
    );
  }

  return { trackLeftPx, trackWidthPx };
}

/**
 * @param {Array<{ monthName?: string }>} calendar
 * @returns {Array<{ monthName: string, startIndex: number, endIndex: number }>}
 */
export function buildMonthRuns(calendar) {
  if (!calendar?.length) {
    return [];
  }

  const runs = [];
  for (let i = 0; i < calendar.length; i++) {
    const monthName = calendar[i]?.monthName;
    if (!monthName) {
      continue;
    }
    const last = runs[runs.length - 1];
    if (last && last.monthName === monthName && last.endIndex === i - 1) {
      last.endIndex = i;
    } else {
      runs.push({
        monthName, startIndex: i, endIndex: i,
      });
    }
  }
  return runs;
}

/**
 * @param {object} p
 * @param {Array<{ monthName?: string }>} p.calendar
 * @param {number} p.scrollLeft
 * @param {number} p.clientWidth
 * @param {number} p.nameColumnWidth — ширина sticky-колонки (240 / 66)
 * @param {number} p.cellWidth
 * @param {number} [p.minVisibleWidthPx] — по умолчанию 1: достаточно любого пересечения (в т.ч. одно число на краю месяца).
 * @returns {Array<{ key: string, monthName: string, clipLeftPx: number, clipWidthPx: number, trackLeftPx: number, trackWidthPx: number }>}
 */
export function computeVisibleMonthLabelPositions({
  calendar,
  scrollLeft,
  clientWidth,
  nameColumnWidth,
  cellWidth,
  minVisibleWidthPx = 1,
}) {
  if (!calendar?.length || cellWidth <= 0) {
    return [];
  }

  const minWidth = minVisibleWidthPx;
  /**
   * Контент, не перекрытый sticky-колонкой: в viewport точка X видна справа от sticky,
   * когда X - scrollLeft >= nameColumnWidth, т.е. X >= scrollLeft + nameColumnWidth.
   */
  const dayViewLeft = scrollLeft + nameColumnWidth;
  const dayViewRight = scrollLeft + Math.max(0, clientWidth);
  const runs = buildMonthRuns(calendar);
  const result = [];

  for (const run of runs) {
    const monthStartPx = run.startIndex * cellWidth;
    const monthEndPx = (run.endIndex + 1) * cellWidth;
    const monthLeft = nameColumnWidth + monthStartPx;
    const monthRight = nameColumnWidth + monthEndPx;
    const visLeft = Math.max(dayViewLeft, monthLeft);
    const visRight = Math.min(dayViewRight, monthRight);
    const visWidth = visRight - visLeft;

    if (visWidth < minWidth) {
      continue;
    }

    const clipLeftPx = monthStartPx;
    const clipWidthPx = monthEndPx - monthStartPx;
    const visLeftDays = visLeft - nameColumnWidth;
    const visRightDays = visRight - nameColumnWidth;
    const centerDays = (visLeftDays + visRightDays) / 2;
    const labelWidthPx = estimateMonthLabelWidthPx(run.monthName);
    const labelHalfWidthPx = labelWidthPx / 2;
    const clampedCenterDays = clampMonthLabelCenterInSpan(
      centerDays,
      monthStartPx,
      monthEndPx,
      labelHalfWidthPx,
    );
    const idealCenterInClip = clampedCenterDays - clipLeftPx;
    const visTrackLeftPx = Math.max(0, visLeftDays - clipLeftPx);
    const visTrackWidthPx = Math.max(0, visRightDays - clipLeftPx) - visTrackLeftPx;
    const { trackLeftPx, trackWidthPx } = resolveMonthLabelTrackInClip({
      idealCenterPx: idealCenterInClip,
      visTrackLeftPx,
      visTrackWidthPx,
      clipWidthPx,
      labelWidthPx,
    });

    result.push({
      key: `${run.monthName}:${run.startIndex}`,
      monthName: run.monthName,
      clipLeftPx,
      clipWidthPx,
      trackLeftPx,
      trackWidthPx,
    });
  }

  return result;
}
