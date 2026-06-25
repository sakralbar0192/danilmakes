import CoreService from "@/services/core";
import { DemoApi } from "@/config/demo-api";

export default class RevenuePlanService extends CoreService {
  static isDev = false;

  static getLocalPostProd = this.isDev ? "get" : "post";

  static async loadPlan() {
    const url = this.getUrl(DemoApi.revenuePlan);
    const resp = await this.http.get(url, {}, true);
    return resp?.result === "success" ? resp.data : {};
  }

  static async savePlan(data) {
    const url = this.getUrl(DemoApi.savePlan);
    return await this.http[this.getLocalPostProd](url, data);
  }
}
