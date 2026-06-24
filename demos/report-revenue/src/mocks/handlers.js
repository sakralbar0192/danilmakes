import { http, HttpResponse } from "msw";
import hotelGet from "./fixtures/hotel-get.json";
import roomtypesGet from "./fixtures/roomtypes-get.json";
import {
  buildRevenuePlanResponse,
  buildRevenueReportResponse,
  buildRevenueServicesResponse,
} from "./revenue-fixture";

function matchPath(request, suffix) {
  const { pathname } = new URL(request.url);
  return pathname === suffix || pathname.endsWith(suffix);
}

export const handlers = [
  http.get(({ request }) => matchPath(request, "/hotel/get"), () => HttpResponse.json(hotelGet)),
  http.get(({ request }) => matchPath(request, "/roomTypes/get"), () => HttpResponse.json(roomtypesGet)),

  http.get(({ request }) => matchPath(request, "/reports/revenueGetServices"), () => (
    HttpResponse.json(buildRevenueServicesResponse())
  )),

  http.get(({ request }) => matchPath(request, "/reports/get_plan_data"), () => (
    HttpResponse.json(buildRevenuePlanResponse())
  )),

  http.post(({ request }) => matchPath(request, "/reports/get_revenue"), async ({ request: req }) => {
    const body = await req.json().catch(() => ({}));
    return HttpResponse.json(buildRevenueReportResponse(body));
  }),

  http.post(({ request }) => matchPath(request, "/reports/save_revenue_report_data"), () => (
    HttpResponse.json({ result: "success" })
  )),

  http.post(({ request }) => matchPath(request, "/reports/save_plan_data"), async ({ request: req }) => {
    const body = await req.json().catch(() => ({}));
    return HttpResponse.json({ result: "success", data: body });
  }),

  http.post(({ request }) => matchPath(request, "/reports/get_revenue_xlsx"), () => (
    HttpResponse.json({ result: "success" })
  )),
];
