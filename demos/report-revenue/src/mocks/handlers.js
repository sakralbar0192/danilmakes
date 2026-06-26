import { http, HttpResponse } from "msw";
import { DemoApi } from "@/config/demo-api";
import hotelGet from "./fixtures/hotel-get.json";
import roomtypesGet from "./fixtures/roomtypes-get.json";
import {
  buildRevenuePlanResponse,
  buildRevenueReportResponse,
} from "./revenue-fixture";

function matchPath(request, suffix) {
  const { pathname } = new URL(request.url);
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  return (
    pathname === suffix
    || pathname.endsWith(suffix)
    || (base && pathname.endsWith(`${base}${suffix}`))
  );
}

export const handlers = [
  http.get(({ request }) => matchPath(request, DemoApi.hotel), () => HttpResponse.json(hotelGet)),
  http.get(({ request }) => matchPath(request, DemoApi.roomTypes), () => HttpResponse.json(roomtypesGet)),

  http.get(({ request }) => matchPath(request, DemoApi.revenuePlan), () => (
    HttpResponse.json(buildRevenuePlanResponse())
  )),

  http.post(({ request }) => matchPath(request, DemoApi.revenueReport), async ({ request: req }) => {
    const body = await req.json().catch(() => ({}));
    return HttpResponse.json(buildRevenueReportResponse(body));
  }),

  http.post(({ request }) => matchPath(request, DemoApi.savePlan), async ({ request: req }) => {
    const body = await req.json().catch(() => ({}));
    return HttpResponse.json({ result: "success", data: body });
  }),
];
