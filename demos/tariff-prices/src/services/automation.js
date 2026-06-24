import moment from "moment";

export default class AutomationService {
  static daysOfWeekList = [
    { value: 1, title: "Пн", short: "Пн" },
    { value: 2, title: "Вт", short: "Вт" },
    { value: 3, title: "Ср", short: "Ср" },
    { value: 4, title: "Чт", short: "Чт" },
    { value: 5, title: "Пт", short: "Пт" },
    { value: 6, title: "Сб", short: "Сб" },
    { value: 7, title: "Вс", short: "Вс" },
  ];

  static getClearDate() {
    return {
      id: "",
      period: ["", ""],
      weekdays: [1, 2, 3, 4, 5, 6, 7],
    };
  }
}
