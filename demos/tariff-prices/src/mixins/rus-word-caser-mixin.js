import rusWordCaser from "@/utils/language.js";
import i18n from "@/plugins/i18n";

export default {
  methods: {
    rusWordCaser(a, b, c, d) {
      return rusWordCaser(a, b, c, d);
    },
    daysCaser(length) {
      let result = rusWordCaser(Number(length), "дня", "дней", "дней");
      if (i18n.locale === "en") {
        result = Number(length) > 1 ? "days" : "day";
      }

      return result;
    },
    hourCaser(length) {
      let result = rusWordCaser(Number(length), "час", "часа", "часов");
      if (i18n.locale === "en") {
        result = Number(length) > 1 ? "hours" : "hour";
      }

      return result;
    },
  },
};
