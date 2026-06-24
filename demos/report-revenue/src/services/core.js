import http from "@/utils/http";

export default class CoreService {
  static http = http;

  static isDev = false;

  static url = "";

  static getLocalPostProd = "post";

  static getUrl(uri) {
    return this.url + uri;
  }

  static async delay() {}
}
