import { trackDemoEvent } from "../../../shared/analytics/demo-analytics.ts";

const DEMO_ID = "reportRevenue";

export function trackReportRevenueEvent(event, params) {
  trackDemoEvent(DEMO_ID, event, params);
}

export default { trackReportRevenueEvent };
