import { c as createBffClient, r as resolveBffBaseUrl } from './_plugin-vue_export-helper-DSX2Nh7D.js';

let defaultClient = null;
function getDefaultBffClient(envValue) {
  if (!defaultClient) {
    defaultClient = createBffClient(resolveBffBaseUrl(envValue));
  }
  return defaultClient;
}

function useBff() {
  return getDefaultBffClient("/familyMeals/bff/v1");
}

export { useBff as u };
