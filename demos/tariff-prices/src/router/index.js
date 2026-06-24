import { createRouter, createWebHistory } from "vue-router";
import TariffPricesScreen from "@/screens/tariff-prices/index.vue";
import exportContext from "@/mocks/fixtures/export-context.json";

const defaultPlanId = String(exportContext.defaultPlanId || "515367");
const dateFrom = exportContext.dateFrom || "24-6-2026";

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: `/tariff/index/${defaultPlanId}`,
    },
    {
      path: "/tariff/index/:id",
      name: "tariff-prices",
      component: TariffPricesScreen,
      props: true,
    },
  ],
});

export function getDefaultRouteQuery() {
  return { dfrom: dateFrom, mode: "prices" };
}
