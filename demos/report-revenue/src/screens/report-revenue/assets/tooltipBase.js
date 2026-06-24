import i18n from "@/plugins/i18n";
import wordCase from "@/utils/language";
import store from "@/store";
import moment from "moment";

// Template method
export default class Tooltip {
  constructor(tooltipDiv, containerDiv, outerDiv) {
    this.tooltipDiv = tooltipDiv;
    this.containerDiv = containerDiv;
    this.outerDiv = outerDiv;
  }

  static isMobile = store.state.device.isMobile;

  // как близко будет находиться тултип к бару
  static standartOffset = 20;

  renderTooltip(tooltipModel) {
    const opacity = this.createDiv(tooltipModel);
    // нужно скрыть тултип и прекратить рендер
    if (opacity === -1) {
      return;
    }
    this.addClassesToDiv(tooltipModel);
    this.parseTooltipContent(tooltipModel);
    this.setTooltipPosition(tooltipModel);
  }

  createDiv(tooltipModel) {
    let tooltipEl = document.querySelector(this.tooltipDiv);
    const container = document.querySelector(this.containerDiv);

    if (!tooltipEl && container) {
      tooltipEl = document.createElement("div");
      tooltipEl.classList.add(this.tooltipDiv.replace(".", ""));
      tooltipEl.classList.add("length-stay-tooltip");
      container.appendChild(tooltipEl);
    }

    if (tooltipModel.opacity === 0) {
      tooltipEl.style.opacity = 0;
      tooltipEl.style.zIndex = -1;
      return -1;
    }
    tooltipEl.style.zIndex = 99;
    this.tooltipEl = tooltipEl;
  }

  addClassesToDiv(tooltipModel) {
    const tooltipEl = this.tooltipEl;
    tooltipEl.classList.remove("above", "below", "no-transform");
    if (tooltipModel.yAlign) {
      tooltipEl.classList.add(tooltipModel.yAlign);
    } else {
      tooltipEl.classList.add("no-transform");
    }
  }

  parseTooltipContent(tooltipModel) {
    if (tooltipModel.body) {
      this.tooltipEl.innerHTML = "<p>Default Tooltip Content</p>";
    }
  }

  setTooltipPosition(tooltipModel) {
    const { chart } = tooltipModel;
    const { offsetTop: positionY, offsetLeft: positionX } = chart.canvas;
    const standartOffset = Tooltip.standartOffset;
    const tooltipEl = this.tooltipEl;
    const container = document.querySelector(this.containerDiv);
    const position = container.querySelector("canvas").getBoundingClientRect();

    tooltipEl.style.opacity = 1;
    tooltipEl.style.position = "absolute";
    tooltipEl.style.top = `${positionY + tooltipModel.caretY - tooltipEl.scrollHeight - standartOffset}px`;
    let leftPosition; let
      rightPosition;
    if (position.left + tooltipModel.caretX - tooltipEl.scrollWidth / 2 <= 0) {
      leftPosition = "20px";
      rightPosition = "auto";
    } else if (position.left + tooltipModel.caretX + tooltipEl.scrollWidth > window.innerWidth) {
      leftPosition = "auto";
      rightPosition = `${container.scrollWidth - container.scrollLeft - container.offsetWidth}px`;
    } else {
      leftPosition = `${positionX + tooltipModel.caretX - tooltipEl.scrollWidth / 2}px`;
      rightPosition = "auto";
    }

    if (Tooltip.isMobile) leftPosition = `${tooltipModel.caretX - tooltipEl.scrollWidth / 2}px`;

    tooltipEl.style.left = leftPosition;
    tooltipEl.style.right = rightPosition;
  }

  // shortDay - сокращение дня недели на ru (приходит с бека)
  getFullDayName(shortDay) {
    const days = {
      пн: i18n.t("Понедельник"),
      вт: i18n.t("Вторник"),
      ср: i18n.t("Среда"),
      чт: i18n.t("Четверг"),
      пт: i18n.t("Пятница"),
      сб: i18n.t("Суббота"),
      вс: i18n.t("Воскресенье"),
    };

    return days[shortDay.toLowerCase()] || i18n.t("Понедельник");
  }

  formatDate(dateStr) {
    const datePart = dateStr.split(" ")[0];
    const dayOfWeekPart = dateStr.split(" ")[1];
    const date = moment(datePart, "DD.MM.YYYY");
    const formattedDate = date.format("D MMMM");
    return `${formattedDate} ${dayOfWeekPart}`;
  }

  getDayDeclension(dayCount) {
    return wordCase(Number(dayCount), ` ${i18n.t("день")}`, ` ${i18n.t("дня")}`, ` ${i18n.t("дней")}`);
  };
}
