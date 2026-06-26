import { trackDemoEvent } from "../../../shared/analytics/demo-analytics.ts";

const DEMO_ID = "divisions";

export function trackDivisionsEvent(event, params) {
  trackDemoEvent(DEMO_ID, event, params);
}

export default { trackDivisionsEvent };
