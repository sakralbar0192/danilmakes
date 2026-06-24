import { createRouter, createWebHistory } from "vue-router";
import ReportRevenueScreen from "@/screens/report-revenue/index.vue";
import moment from "moment";

const defaultFrom = moment().startOf("month").format("DD-MM-YYYY");
const defaultTo = moment().endOf("month").format("DD-MM-YYYY");

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "report-revenue",
      component: ReportRevenueScreen,
    },
  ],
});

export function getDefaultRouteQuery() {
  return { dfrom: defaultFrom, dto: defaultTo };
}
