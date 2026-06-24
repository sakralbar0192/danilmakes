import { createI18n } from "vue-i18n";
import ru from "@/locales/ru.json";

const i18n = createI18n({
  legacy: true,
  globalInjection: true,
  locale: "ru",
  fallbackLocale: "ru",
  messages: { ru },
  missing: (_locale, key) => key,
});

i18n.t = (...args) => i18n.global.t(...args);

export default i18n;
