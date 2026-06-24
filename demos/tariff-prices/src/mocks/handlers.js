import { http, HttpResponse } from "msw";
import hotelGet from "./fixtures/hotel-get.json";
import tariffGet from "./fixtures/tariff-get.json";
import roomtypesGet from "./fixtures/roomtypes-get.json";
import serviceGet from "./fixtures/service-get.json";
import calendarBase from "./fixtures/calendar/base.json";
import calendarPlanPrices from "./fixtures/calendar/planPrices.json";
import calendarMeta from "./fixtures/calendar/meta.json";
import calendarRestrictions from "./fixtures/calendar/restrictions.json";
import calendarDynamic from "./fixtures/calendar/dynamic.json";
import calendarExtra from "./fixtures/calendar/extra.json";
import calendarOtherTariffsPrices from "./fixtures/calendar/otherTariffsPrices.json";
import calendarOtherTariffsExtra from "./fixtures/calendar/otherTariffsExtra.json";

const calendarParts = {
  base: calendarBase,
  planPrices: calendarPlanPrices,
  meta: calendarMeta,
  restrictions: calendarRestrictions,
  dynamic: calendarDynamic,
  extra: calendarExtra,
  otherTariffsPrices: calendarOtherTariffsPrices,
  otherTariffsExtra: calendarOtherTariffsExtra,
};

function mergeCalendarParts(parts) {
  const merged = {};
  for (const part of parts) {
    if (calendarParts[part]) {
      Object.assign(merged, calendarParts[part]);
    }
  }
  return merged;
}

function matchPath(request, suffix) {
  const { pathname } = new URL(request.url);
  return pathname === suffix || pathname.endsWith(suffix);
}

export const handlers = [
  http.get(({ request }) => matchPath(request, "/hotel/get"), () => HttpResponse.json(hotelGet)),
  http.get(({ request }) => matchPath(request, "/tariff/get"), () => HttpResponse.json(tariffGet)),
  http.get(({ request }) => matchPath(request, "/roomTypes/get"), () => HttpResponse.json(roomtypesGet)),
  http.get(({ request }) => matchPath(request, "/service/get"), () => HttpResponse.json(serviceGet)),

  http.get(({ request }) => matchPath(request, "/tariff/getPricesAndRestrictionsData"), ({ request: req }) => {
    const url = new URL(req.url);
    const partsParam = url.searchParams.get("parts") || "base";
    const parts = partsParam.split(",").map((p) => p.trim()).filter(Boolean);
    return HttpResponse.json(mergeCalendarParts(parts));
  }),

  http.post(({ request }) => matchPath(request, "/tariff/updatePrices"), () => HttpResponse.json({ result: "success" })),
  http.post(({ request }) => matchPath(request, "/tariff/updateMassivePrices"), () => HttpResponse.json({ result: "success" })),
  http.post(({ request }) => matchPath(request, "/tariff/updateMassiveAvailability"), () => HttpResponse.json({ result: "success" })),
  http.post(({ request }) => matchPath(request, "/tariff/restrictions_massive_update_any_plans"), () => HttpResponse.json({ result: "success" })),
  http.post(({ request }) => matchPath(request, "/tariff/save_price_and_restrictions_choosen_categories_filter"), () => HttpResponse.json({ result: "success" })),
  http.post(({ request }) => matchPath(request, "/tariff/save_price_and_restrictions_choosen_restrictions_filter"), () => HttpResponse.json({ result: "success" })),
  http.post(({ request }) => matchPath(request, "/tariff/save_price_and_restrictions_choosen_restriction_view_mode"), () => HttpResponse.json({ result: "success" })),
  http.post(({ request }) => matchPath(request, "/tariff/save_interface_settings"), () => HttpResponse.json({ result: "success" })),
  http.post(({ request }) => matchPath(request, "/tariff/setMain"), () => HttpResponse.json({ result: "success" })),
];
