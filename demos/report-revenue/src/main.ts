import "./normalize-base-url";
import { createApp, h } from "vue";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "@mdi/font/css/materialdesignicons.css";
import "@/styles/icomoon.scss";
import "vuetify/styles";
import "@/styles/spacing-utilities.scss";
import "@/styles/uikit-buttons.scss";
import "@/styles/uikit-forms.scss";
import "@/styles/uikit-toolbar.scss";
import "@/styles/uikit-tooltips.scss";

import App from "./App.vue";
import router from "./router";
import store from "./store";
import i18n from "./plugins/i18n";
import { createDialogPlugin } from "./plugins/dialog";
import { installVuetifyCompat } from "./plugins/vuetify-compat";
import { registerUIKit } from "./uikit-vue3/register";
import appStateMixin from "./mixins/appstate-mixin";
import vue2ListenersCompat from "./mixins/vue2-listeners-compat";
import { localImage, externalImage } from "./utils/imgfn";
import http from "./utils/http";
import HotelService from "./services/hotel";
import RevenueReportService from "./services/reports/revenue-report";
import RevenuePlanService from "./services/reports/revenue-plan";

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: "custom",
    aliases: {
      dropdown: "icon-chevron-down",
      expand: "icon-chevron-right",
      clear: "icon-cross",
      checkboxOn: "icon-check",
      checkboxIndeterminate: "icon-checkbox-minus",
    },
    sets: {
      custom: {
        component: (props) => h(props.tag, {
          class: [props.icon, props.class],
          style: props.style,
          "aria-hidden": props["aria-hidden"],
        }),
      },
    },
  },
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          primary: "#1e8bc3",
          secondary: "#eef6fa",
          tertiary: "#F5F9FE",
          error: "#DC2626",
          success: "#16A34A",
          info: "#334155",
          sand: "#D97706",
        },
      },
    },
  },
});

async function bootstrap() {
  const { worker } = await import("./mocks/browser");
  await worker.start({
    onUnhandledRequest: "bypass",
    quiet: true,
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
  });

  HotelService.http = http;
  RevenueReportService.http = http;
  RevenuePlanService.http = http;

  const app = createApp(App);
  app.use(vuetify);
  app.use(store);
  app.use(router);
  app.use(i18n);
  app.use(createDialogPlugin());
  installVuetifyCompat(app);
  app.mixin(appStateMixin);
  app.mixin(vue2ListenersCompat);
  app.config.globalProperties.$set = (target, key, value) => {
    target[key] = value;
  };
  app.config.globalProperties.$localImage = localImage;
  app.config.globalProperties.$externalImage = externalImage;
  registerUIKit(app);

  await store.dispatch("hotel/getCurrentHotel").catch(() => {});
  await store.dispatch("hotelRoom/getRoomTypes").catch(() => {});

  app.mount("#app");
}

bootstrap();
