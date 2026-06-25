import { createRouter, createWebHistory } from "vue-router";
import ReportRevenueScreen from "@/screens/report-revenue/index.vue";

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
