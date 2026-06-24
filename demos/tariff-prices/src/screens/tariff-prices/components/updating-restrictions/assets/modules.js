import i18n from "@/plugins/i18n";
import uid from "@/utils/uid";

const puzzleValues = () => [
  {
    title: i18n.t("Не менять"),
    sendingValue: "",
  },
  {
    title: i18n.t("Закрыть"),
    sendingValue: "1",
  },
  {
    title: i18n.t("Открыть"),
    sendingValue: "0",
  },
];

const resetFormData = () => {
  return {
    constraintsValidState: false,
    roomTypesOutputHeight: 0,
    tariffsOutputHeight: 0,
    roomTypesShowFullSelected: false,
    tariffsShowFullSelected: false,
    daysOfTheWeekListChecked: ["1", "2", "3", "4", "5", "6", "7"],
    daysOfTheWeekList: [
      {
        title: i18n.t("Пн"),
        value: "1",
      },
      {
        title: i18n.t("Вт"),
        value: "2",
      },
      {
        title: i18n.t("Ср"),
        value: "3",
      },
      {
        title: i18n.t("Чт"),
        value: "4",
      },
      {
        title: i18n.t("Пт"),
        value: "5",
      },
      {
        title: i18n.t("Сб"),
        value: "6",
      },
      {
        title: i18n.t("Вс"),
        value: "7",
      },
    ],
    currentRoomTypes: [],
    currentTariff: [],
    puzzle: {
      closed: {
        valuesList: puzzleValues(),
        value: "",
        label: i18n.t("Продажи"),
        tooltip: i18n.t("<b>Категория номера будет недоступна</b> для бронирования в дату, в которую установлено ограничение.<br><br><i>"
          + "Например, если 29.10 у вас установлено закрытие, то гость не сможет забронировать номер, если хотя бы один день его пребывания выпадает "
          + "на 29.10.</i>"),
      },
      closed_arrival: {
        valuesList: puzzleValues(),
        value: "",
        label: i18n.t("Заезд ограничения"),
        tooltip: i18n.t("<b>Категория номера будет недоступна</b> для бронирования, если <b>дата заезда</b> выпадает на дату, в которую установлено "
          + "ограничение.<br><br><i>Например, если 29.10 у вас установлено закрытие на заезд, то гость не сможет забронировать номер, если дата заезда "
          + "выпадает на 29.10.</i><br><br>Функция удобна для тех объектов, кто хочет продлить проживание гостей, продавать пакетные предложения на "
          + "определенные (к примеру, праздничные) даты. А также для тех, у кого нет постоянной стойки администратора и сотрудников нет на объекте в "
          + "определенный день, чтобы оформить заезд гостя."),
      },
      closed_departure: {
        valuesList: puzzleValues(),
        value: "",
        label: i18n.t("Выезд ограничения"),
        tooltip: i18n.t("<b>Категория номера будет недоступна</b> для бронирования, если <b>дата выезда</b> выпадает на дату, в которую установлено "
          + "ограничение.<br><br><i>Например, если 29.10 у вас установлено закрытие на выезд, то гость не сможет забронировать номер, если дата выезда "
          + "выпадает на 29.10.</i><br><br>Функция удобна для тех объектов, кто хочет продлить проживание гостей, продавать пакетные предложения на "
          + "определенные (к примеру, праздничные) даты. А также для тех, у кого нет постоянной стойки администратора и сотрудников нет на объекте в "
          + "определенный день, чтобы оформить выезд гостя."),
      },
    },
    stays: {
      minstay: {
        label: i18n.t("Минимальное кол-во ночей"),
        placeholder: i18n.t("Мин. кол-во"),
        error: i18n.t("Не задано минимальное количество ночей"),
        value: "",
        tooltip: i18n.t("<b>Минимальное количество ночей,</b> на которое можно забронировать номер.<br><br><i>Например, если 29.10 у вас "
          + "установлено минимальное пребывание 4, то гость сможет забронировать номер минимум на 4 дня, если хотя бы один день его пребывания выпадает "
          + "на 29.10.</i>"),
      },
      minstay_a: {
        label: i18n.t("Мин. кол-во ночей на дату заезда"),
        placeholder: i18n.t("Введите кол-во"),
        error: i18n.t("Не задано мин. количество ночей на дату заезда"),
        value: "",
        tooltip: i18n.t("<b>Минимальное количество ночей,</b> на которое можно забронировать номер, если на <b>дату заезда</b> установлено "
          + "данное ограничение.<br><br><i>Например, если 29.10 у вас установлено минимальное пребывание на заезд 4, то гость сможет забронировать номер "
          + "минимум на 4 дня, если дата заезда выпадает на 29.10. При этом гость сможет забронировать номер, например, с 28.10 по 30.10 (2 ночи), т.к. "
          + "на дату заезда в этом случае не стоит ограничение.</i><br><br>Функция удобна для тех объектов, кто хочет продлить проживание гостей, "
          + "продавать пакетные предложения на определенные (к примеру, праздничные) даты."),
      },
      maxstay: {
        label: i18n.t("Максимальное кол-во ночей"),
        placeholder: i18n.t("Макс. кол-во"),
        error: i18n.t("Не задано максимальное количество ночей"),
        value: "",
        tooltip: i18n.t("<b>Максимальное количество ночей,</b> на которое можно забронировать номер.<br><br><i>Например, если 29.10 у вас "
          + "установлено максимальное пребывание 4, то гость сможет забронировать номер не более чем на 4 дня, если хотя бы один день его пребывания "
          + "выпадает на 29.10.</i>"),
      },
    },
    serverError: "",
    /** Если true, `serverError` — готовая строка для показа без `$t`. */
    serverErrorIsPlain: false,
  };
};

const createDatePeriodEntry = () => ({
  values: [],
  uid: uid(),
});

const createEmptyRestrictions = () => ({
  closed: "",
  closed_arrival: "",
  closed_departure: "",
  maxstay: "",
  minstay: "",
  minstay_a: "",
});

const checkConstraintValid = (values, predicate) => Object.values(values).some((it) => predicate(it.value));

const checkRestrictionStaysValid = () => {
  return (value) => checkConstraintValid(value, (v) => Number(v) >= 0);
};

const checkRestrictionPuzzelsValid = () => {
  const allowedKeys = new Set(puzzleValues().map(it => it.sendingValue));
  return (value) => checkConstraintValid(value, (v) => allowedKeys.has(v));
};

export default {
  resetFormData,
  createDatePeriodEntry,
  createEmptyRestrictions,
  checkConstraintValid,
  checkRestrictionStaysValid,
  checkRestrictionPuzzelsValid,
};
