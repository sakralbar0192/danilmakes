import moment from "moment";
import vuetify from "@/plugins/vuetify";
import i18n from "@/plugins/i18n";
import { haveDifferentContent, getRightOrderArray } from "@/utils/array-set-content";
import { Tooltip } from "chart.js";
import TooltipBase from "./tooltipBase";

Tooltip.positioners.maxY = (items) => {
  if (!items.length) return false;

  let maxItem = null;
  let maxYValue = +Infinity;

  for (let i = 0; i < items.length; i++) {
    const item = items[i]?.element || {};
    const yValue = item?.y || 0;

    if (yValue < maxYValue) {
      maxYValue = yValue;
      maxItem = item;
    }
  }

  return {
    x: maxItem.x,
    y: maxYValue,
    xAlign: "center",
    yAlign: "bottom",
  };
};

/**
 * Форматирует число с суффиксами для отображения на графике
 * @param {number} val - Число для форматирования
 * @param {boolean} isMillions - Флаг указывающий, что число нужно форматировать как миллионы
 * @returns {string} Отформатированное число с суффиксом K (тысячи) или M (миллионы)
 */
const formatNumberWithSuffix = (val, isMillions = false) => {
  const num = Number(val);

  // Обрабатываем нулевое значение
  if (num === 0) return "0";

  if (isMillions) {
    const millions = num / 1000000;
    return `${Math.round(millions).toLocaleString("ru-RU")}M`;
  }
  const thousands = num / 1000;
  return `${Math.round(thousands).toLocaleString("ru-RU")}K`;
};

const checkGreaterThenOneYearPeriod = (dateRange) => {
  if (dateRange.length < 2) {
    return true;
  }
  const momentDates = dateRange.map(date => moment(date, "YYYY-MM-DD"));
  const earliestDate = moment.min(momentDates);
  const latestDate = moment.max(momentDates);
  const yearDiff = latestDate.diff(earliestDate, "years", true);
  return yearDiff <= 1;
};

const weekDays = [i18n.t("Понедельник"), i18n.t("Вторник"), i18n.t("Среда"), i18n.t("Четверг"), i18n.t("Пятница"), i18n.t("Суббота"), i18n.t("Воскресенье")];

// нужен для выравнивания столбиков по левому краю, чтобы не растягивать график по ширине канваса
const barPosition = {
  id: "bar-position",
  beforeDatasetsDraw(chart, args, plugins) {
    const {
      ctx, data, scales: { x }, chartArea: { left, bottom },
    } = chart;
    const isSingleGraph = (chart.data.datasets.length === 1);
    if (isSingleGraph) {
      if (chart.getDatasetMeta(0).data.length < 8) {
        chart.getDatasetMeta(0).data.forEach((dataPoint, index) => {
          dataPoint.x = left + 48 + (96 * index);
          dataPoint.width = 48;
          ctx.font = "bold 12px Inter";
          ctx.fillStyle = vuetify.preset.theme.themes.light.info;
          ctx.fillText(data.labels[index], left + 44 + (96 * index), bottom + 20);
        });
      } else {
        chart.getDatasetMeta(0).data.forEach((dataPoint, index) => {
          ctx.font = "bold 12px Inter";
          ctx.fillStyle = vuetify.preset.theme.themes.light.info;
          ctx.fillText(data.labels[index], dataPoint.x - 5, bottom + 20);
        });
      }
    } else {
      let labelX = 0;
      if (chart.getDatasetMeta(0).data.length < 8) {
        for (let i = 0; i < chart.getDatasetMeta(0).data.length; i++) {
          for (let j = 0; j < chart.data.datasets.length; j++) {
            const xCoord = left / 2 + (30 * (3 * (i + 1) + j));
            chart.getDatasetMeta(j).data[i].x = xCoord;
            chart.getDatasetMeta(j).data[i].width = 24;
            labelX = xCoord - 15;
            ctx.font = "bold 12px Inter";
            ctx.fillStyle = vuetify.preset.theme.themes.light.info;
          }
          ctx.fillText(data.labels[i], labelX, bottom + 20);
        }
      } else {
        chart.getDatasetMeta(0).data.forEach((dataPoint, index) => {
          ctx.font = "bold 12px Inter";
          ctx.fillStyle = vuetify.preset.theme.themes.light.info;
          ctx.fillText(data.labels[index], dataPoint.x + 5, bottom + 20);
        });
      }
    }
  },
};

const primaryGradient = (context) => {
  if (!context.chart.chartArea) return;
  const {
    ctx, chartArea: { top, bottom },
  } = context.chart;
  const gradientBg = ctx.createLinearGradient(0, top, 0, bottom);
  gradientBg.addColorStop(0.48, "rgba(30, 139, 195, 0.22)");
  gradientBg.addColorStop(1, "rgba(255, 255, 255, 0)");
  return gradientBg;
};

const greenGradient = primaryGradient;

const blueGradient = (context) => {
  if (!context.chart.chartArea) return;
  const {
    ctx, data, chartArea: { top, bottom },
  } = context.chart;
  const gradientBg = ctx.createLinearGradient(0, top, 0, bottom);
  gradientBg.addColorStop(0.48, "rgba(30, 139, 195, 0.35)");
  gradientBg.addColorStop(1, "rgba(255, 255, 255, 0)");
  return gradientBg;
};

const customLabels = (chart) => {
  const visability = [];
  for (let i = 0; i < chart.data.datasets.length; i++) {
    if (chart.isDatasetVisible(i) === true) {
      visability.push(false);
    } else {
      visability.push(true);
    }
  };
  const pointStyle = [];
  chart.data.datasets.forEach((dataset) => {
    // линия тренда specType "trend"
    if (dataset?.specType === "trend") {
      pointStyle.push("dash");
    } else {
      pointStyle.push("rect");
    }
  });
  return chart.data.datasets.map(
    (dataset, index) => ({
      text: dataset.label,
      fillStyle: this.$vuetify.theme.themes.light.success,
      strokeStyle: dataset.borderColor,
      pointStyle: pointStyle[index],
      hidden: visability[index],
    }),
  );
};

const hideLegendItem = (click, legendItem, legend) => {
  const datasets = legend.legendItems.map((dataset, index) => {
    return dataset.text;
  });
  const index = datasets.indexOf(legendItem.text);
  if (legend.chart.isDatasetVisible(index) === true) {
    legend.chart.hide(index);
  } else {
    legend.chart.show(index);
  }
};

const legendMargin = {
  id: "legend-margin",
  beforeInit(chart, legend, options) {
    const fitValue = chart.legend.fit;
    chart.legend.fit = function fit() {
      fitValue.bind(chart.legend)();
      this.height += 16;
      return this.height;
    };
  },
};

// используется для показа dashed-линии выбранного бара при ховере на графике
const barBox = {
  id: "bar-box",
  afterDatasetsDraw(chart, args, pluginOptions) {
    const {
      ctx, chartArea: { top, bottom }, data, scales: { x, y },
    } = chart;
    let maxHeight = 0;
    let minX = Infinity;
    let maxX = -Infinity;
    const offset = 2;

    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      meta.data.forEach((metadata, index) => {
        if (metadata.active) {
          const xHalf = metadata.width / 2;
          const barTop = metadata.base - metadata.height;
          minX = Math.min(minX, metadata.x - xHalf);
          maxX = Math.max(maxX, metadata.x + xHalf);
          maxHeight = Math.max(maxHeight, metadata.base - barTop);
        }
      });
    });

    if (minX !== Infinity && maxX !== -Infinity && maxHeight !== 0) {
      ctx.beginPath();
      const dash = [5, 5];
      ctx.setLineDash(dash);
      ctx.strokeStyle = "#DDDDE3";
      ctx.lineWidth = 2;
      ctx.strokeRect(minX - offset, bottom - maxHeight - offset, maxX - minX + offset, maxHeight + offset * 2);
    }
  },
};

const line = {
  id: "line",
  afterDatasetsDraw(chart, args, plugins) {
    const {
      ctx, tooltip, chartArea: {
        top, bottom, left, right, width, height,
      }, scales: { xAxisKey, y },
    } = chart;
    if (tooltip?._active?.length > 0) {
      const xCoor = xAxisKey.getPixelForValue(tooltip.dataPoints[0].dataIndex);
      const yCoor = tooltip.caretY - TooltipBase.standartOffset;
      ctx.save();
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#DDDDE3";
      ctx.setLineDash([3, 3]);
      ctx.moveTo(xCoor, yCoor);
      ctx.lineTo(xCoor, bottom);
      ctx.stroke();
      ctx.closePath();
      ctx.setLineDash([]);
    }
  },
};

const lineMarker = {
  id: "line-marker",
  afterDatasetsDraw: (chart, args, plugins) => {
    const {
      ctx, data, chartArea: { top, bottom }, scales: { xAxisKey },
    } = chart;
    const getIndex = (graphData) => {
      for (const dataset of (graphData?.datasets || [])) {
        if (dataset?.data?.length === 0) continue;
        return (dataset?.data || []).findIndex((item) => item.phase === "today");
      }
    };
    const indexFuture = getIndex(data);
    if (indexFuture === -1) return;
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = plugins.borderColor;
    ctx.lineWidth = plugins.borderWidth;
    ctx.setLineDash(plugins.dash || [6, 6]);
    ctx.moveTo(xAxisKey.getPixelForValue(indexFuture), top + 5);
    ctx.lineTo(xAxisKey.getPixelForValue(indexFuture), bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 1;
    ctx.closePath();
  },
};

/**
 * Плагин для создания перекрытия плановых и фактических показателей на графике.
 */
const overlapPlan = {
  id: "overlap-plan",
  beforeDatasetsDraw(chart, args, opts) {
    const overlap = Math.max(0, Math.min(1, opts.overlap ?? 0.3));
    const scale = chart.scales[opts.scale ?? "xAxisKey"];
    if (!scale) {
      return;
    }

    const datasets = chart.data.datasets ?? [];
    let planIndex = -1;
    let factIndex = -1;

    for (let i = 0; i < datasets.length; i++) {
      if (datasets[i].datasetKey === "plan") planIndex = i;
      if (datasets[i].datasetKey === "fact") factIndex = i;
    }

    if (planIndex < 0 || factIndex < 0) {
      return;
    }

    const planMeta = chart.getDatasetMeta(planIndex);
    const factMeta = chart.getDatasetMeta(factIndex);
    const labels = chart.data.labels ?? [];
    for (let li = 0; li < labels.length; li++) {
      const planEl = planMeta.data?.[li] ?? null;
      const factEl = factMeta.data?.[li] ?? null;

      const items = [];
      if (planEl) {
        items.push(planEl);
      }
      if (factEl) {
        items.push(factEl);
      }
      const count = items.length;
      if (count === 0) {
        continue;
      }

      const targetCenter = scale.getPixelForValue(labels[li]);

      if (count === 1) {
        items[0].x = targetCenter;
      } else if (count === 2) {
        const factWidth = factEl.width;
        const planWidth = planEl.width;
        const overlapAmount = overlap * Math.min(factWidth, planWidth);
        const distance = factWidth / 2 + planWidth / 2 - overlapAmount;
        factEl.x = targetCenter + (distance / 2);
        planEl.x = targetCenter - (distance / 2);
      }
    }
  },
};

/**
 * Вычисляет параметры шкалы для заданного значения с учетом делителя и порога
 *
 * @param {number} max - Максимальное значение
 * @param {number} divisor - Делитель для расчета (4 для 5 делений)
 * @param {number} threshold - Порог для преобразования (1000000 для миллионов, 1000 для тысяч)
 * @returns {Object} Объект с параметрами шкалы
 * @property {number} max - Максимальное значение шкалы
 * @property {number} stepSize - Размер шага между делениями
 */
function calculateScaleParams(max, divisor, threshold) {
  const maxInUnits = max / threshold;

  // Вычисляем базовое значение для определения множителя
  const baseValue = maxInUnits / divisor;
  let multiplier;

  if (baseValue === Math.floor(baseValue)) {
    // Если максимум в единицах делится на divisor без остатка,
    // то берем следующий уровень (добавляем 1 к множителю)
    multiplier = Math.floor(baseValue) + 1;
  } else {
    // Если есть остаток, округляем вверх до следующего целого числа
    multiplier = Math.ceil(baseValue);
  }

  // Максимум шкалы = множитель * количество интервалов между делениями
  let roundedMax = multiplier * divisor;

  // Дополнительная проверка: гарантируем, что верхняя линия выше максимума
  if (roundedMax * threshold <= max) {
    roundedMax = Math.ceil((max / threshold) / divisor) * divisor + divisor;
  }

  // Вычисляем размер шага между делениями
  const stepSize = roundedMax / divisor;

  return {
    max: roundedMax * threshold,
    stepSize: stepSize * threshold,
  };
}

/**
 * Рассчитывает параметры вертикальной шкалы для графика дохода
 *
 * Алгоритм расчета:
 * - Всегда ровно 5 горизонтальных делений включая 0
 * - Последнее деление больше максимума и кратно 4
 * - Автоматическое переключение между тысячами и миллионами
 * - Валидация гарантирует точное количество делений
 *
 * @param {Array} dataset - Массив датасетов графика
 * @returns {Object} Объект с параметрами шкалы
 * @property {number} max - Максимальное значение шкалы
 * @property {number} stepSize - Размер шага между делениями
 * @property {boolean} isMillions - Флаг указывающий формат отображения (миллионы/тысячи)
 */
function calculateRevenueScale(dataset) {
  const DIVISOR = 4; // Делитель для расчета (4 для 5 делений)
  const MILLION_THRESHOLD = 1000000;
  const THOUSANDS_THRESHOLD = 1000;

  // Находим максимальное значение в данных
  const values = dataset.flatMap(datasetInner => datasetInner?.data?.map(data => data.value) || []);
  const max = values.length > 0 ? Math.max(...values) : 0;
  const isMillions = max >= MILLION_THRESHOLD;

  const scaleParams = calculateScaleParams(
    max,
    DIVISOR,
    isMillions
      ? MILLION_THRESHOLD
      : THOUSANDS_THRESHOLD,
  );

  return {
    ...scaleParams,
    isMillions,
  };
}

function fixStepSize(dataset, tickNumber = 8) {
  // до скольки округляем
  const ROUND_UP_TO = 1000;

  const handler = (maximum) => {
    let max = Math.ceil(maximum / ROUND_UP_TO) * ROUND_UP_TO;
    // находим ближайшее число, большее текущего максимума и кратного (tickNumber - 1) * 1000
    const remainder = (max / ROUND_UP_TO) % (tickNumber - 1);
    if (remainder === 0) {
      // если максимум уже кратен, то добавляем еще один шаг
      max += (tickNumber - 1) * ROUND_UP_TO;
    } else {
      // округление до следующей тысячи, кратной tickNumber - 1
      max = Math.ceil((max / ROUND_UP_TO) / (tickNumber - 1)) * (tickNumber - 1) * ROUND_UP_TO;
    }

    let stepSize = max / (tickNumber - 1);

    // значение шкалы - целые числа
    if (stepSize !== Math.ceil(stepSize)) {
      stepSize = Math.ceil(stepSize);
      max = stepSize * (tickNumber - 1);
    }
    return { max, stepSize };
  };
  const max = Math.max(...dataset.flatMap(datasetInner => datasetInner?.data?.map(data => data.value) || []));
  return handler(max);
}

function getDefaultChartOpts() {
  const isGroupedByMonth = this.currentGroupTypeId === "months";
  return {
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    parsing: {
      xAxisKey: "day",
      yAxisKey: "value",
    },
    scales: {
      xAxisKey: {
        offset: true,
        border: { display: false },
        ticks: {
          maxRotation: 0,
          maxTicksLimit: isGroupedByMonth ? 24 : this.getMaxTicksLimit(),
          display: true,
          font: {
            size: 12,
            weight: isGroupedByMonth ? 600 : 400,
          },
          minRotation: 0,
          align: isGroupedByMonth ? "center" : "start",
        },
        grid: { display: false },
        title: {
          display: true,
          text: "x",
          color: this?.$vuetify?.theme?.themes?.light?.secondary?.darken3,
          font: {
            size: 12,
            weight: 400,
          },
          padding: {
            top: 16,
            bottom: 0,
            right: 0,
            left: 0,
          },
          align: "center",
        },
      },
      yAxisKey: {
        min: 0,
        border: { display: false },
        beginAtZero: true,
        ticks: {
          callback: val => `${val}`,
          padding: 5,
          font: {
            size: 12,
            weight: 400,
          },
          stepSize: 1000,
          color: this?.$vuetify?.theme?.themes?.light?.info,
        },
        title: {
          display: true,
          text: "y",
          color: this?.$vuetify?.theme?.themes?.light?.secondary?.darken3,
          font: {
            size: 12,
            weight: 400,
          },
          padding: 0,
          align: "center",
        },
        grid: {
          borderWidth: 0,
          drawTicks: false,
          drawOnChartArea: true,
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 4,
      },
      point: {
        pointStyle: "circle",
        borderWidth: 0,
      },
    },
    plugins: {
      legend: {
        onClick: () => {},
        display: true,
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          boxHeight: 10,
          font: {
            size: 12,
            weight: 700,
          },
          generateLabels: (chart) => {
            const pointStyle = [];
            chart.data.datasets.forEach((dataset) => {
              if (dataset?.specType === "future") {
                pointStyle.push("line");
              } else {
                pointStyle.push("rect");
              }
            });
            const labels = chart.data.datasets.map(
              (dataset, index) => ({
                text: dataset.label,
                fillStyle: dataset.borderColor,
                strokeStyle: dataset.borderColor,
                pointStyle: pointStyle[index],
                lineDash: pointStyle[index] === "line" ? [3, 1] : [],
                hidden: false,
              }),
            );
            return labels;
          },
        },
        position: "top",
        title: {},
      },
      tooltip: {
        enabled: false,
        external: (context) => {
          const isActive = context.tooltip._active.length !== 0;
          this.tooltipActive = isActive;
          const { chart } = context;
          const { offsetTop: positionY, offsetLeft: positionX } = chart.canvas;
          const positionData = {
            caretX: context.tooltip.caretX, caretY: context.tooltip.caretY, positionY, positionX,
          };
          this.tooltipPosition = positionData;
          this.tooltipData = isActive ? (context?.tooltip?._active || []) : this.tooltipData;
        },
        position: "nearest",
      },
    },
  };
};

export default {
  weekDays,
  barPosition,
  barBox,
  formatNumberWithSuffix,
  greenGradient,
  primaryGradient,
  blueGradient,
  customLabels,
  hideLegendItem,
  checkGreaterThenOneYearPeriod,
  legendMargin,
  lineMarker,
  line,
  getDefaultChartOpts,
  fixStepSize,
  calculateRevenueScale,
  haveDifferentContent,
  getRightOrderArray,
  overlapPlan,
};
