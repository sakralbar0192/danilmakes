import "./normalize-base-url";
import "@webcomponents/webcomponentsjs/webcomponents-loader.js";
import { worker } from "./mocks/browser";
import { trackDivisionsEvent } from "./utils/demo-analytics";

declare const __DEMO_BASE__: string;

async function bootstrap() {
  const demoBase = typeof __DEMO_BASE__ !== "undefined" ? __DEMO_BASE__ : "/divisions/";

  await worker.start({
    onUnhandledRequest: "bypass",
    quiet: true,
    serviceWorker: {
      url: `${demoBase}mockServiceWorker.js`,
      options: {
        scope: demoBase,
      },
    },
  });

  trackDivisionsEvent("demo_ready");

  await import("pages/Divisions/index");
}

bootstrap();
