import { trackDemoEvent } from "../../../shared/analytics/demo-analytics.ts";

const DEMO_ID = "tariffPrices";

const ACTION_MAP = {
  restrictions_filter_change: "restriction_filter",
  categories_filter_save: "category_filter",
};

function normalizeParams(params = {}) {
  const result = {};

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      result[key] = value.length;
    } else if (
      typeof value === "string"
      || typeof value === "number"
      || typeof value === "boolean"
    ) {
      result[key] = value;
    }
  }

  return result;
}

export function reachGoal(action, params) {
  trackDemoEvent(DEMO_ID, action, normalizeParams(params));
}

export function sendHit(_counter, action, _title, params) {
  const event = ACTION_MAP[action] || action;
  trackDemoEvent(DEMO_ID, event, normalizeParams(params));
}

export default { reachGoal, sendHit };
