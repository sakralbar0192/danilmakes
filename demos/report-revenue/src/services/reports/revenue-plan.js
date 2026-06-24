import CoreService from "@/services/core";

export default class RevenuePlanService extends CoreService {
  static isDev = false;

  static getLocalPostProd = this.isDev ? "get" : "post";

  static async loadPlan() {
    const url = this.getUrl("/reports/get_plan_data");
    const resp = await this.http.get(url, {}, true);
    return resp?.result === "success" ? resp.data : {};
  }

  static async savePlan(data) {
    const url = this.getUrl("/reports/save_plan_data");
    return await this.http[this.getLocalPostProd](url, data);
  }
}
