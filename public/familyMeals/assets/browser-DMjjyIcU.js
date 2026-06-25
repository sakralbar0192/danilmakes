const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-BaHwtL1H.js","assets/cookieStore-D-ixA_Tn.js","assets/handlers-BXv6mXra.js"])))=>i.map(i=>d[i]);
import { _ as __vitePreload } from './preload-helper-DpTZsdyT.js';

async function startDemoMocks() {
  const { setupWorker } = await __vitePreload(async () => { const { setupWorker } = await import('./index-BaHwtL1H.js');return { setupWorker }},true?__vite__mapDeps([0,1]):void 0);
  const { demoHandlers } = await __vitePreload(async () => { const { demoHandlers } = await import('./handlers-BXv6mXra.js');return { demoHandlers }},true?__vite__mapDeps([2,1]):void 0);
  const worker = setupWorker(...demoHandlers);
  await worker.start({
    onUnhandledRequest: "bypass",
    quiet: true,
    serviceWorker: {
      url: `${"/familyMeals/"}mockServiceWorker.js`
    }
  });
}

export { startDemoMocks };
