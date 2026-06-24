import "./normalize-base-url";
import "@webcomponents/webcomponentsjs/webcomponents-loader.js";
import { worker } from "./mocks/browser";

declare const __DEMO_BASE__: string;

async function bootstrap() {
  const demoBase = typeof __DEMO_BASE__ !== "undefined" ? __DEMO_BASE__ : "/divisions/";

  await worker.start({
    onUnhandledRequest: "bypass",
    quiet: true,
    serviceWorker: {
      url: `${demoBase}mockServiceWorker.js`,
    },
  });

  await import("pages/Divisions/index");
}

bootstrap();
