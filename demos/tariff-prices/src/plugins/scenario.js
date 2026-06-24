export default {
  open() {},
  reset() {},
  resume() {},
};

export function installScenario(app) {
  const scenario = { open() {}, reset() {}, resume() {} };
  app.config.globalProperties.$scenario = scenario;
}
