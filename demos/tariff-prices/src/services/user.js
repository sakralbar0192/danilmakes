import CoreService from "@/services/core";
import ymHelpers from "@/utils/ym-helpers";

export default class UserService extends CoreService {
  static uploadUsersUrlPath = "/public/upload/users/";

  static async deleteActiveSession(profileId) {
    const url = "/users/reset_user_session";
    const result = await this.http.post(url, { user_id: profileId });
    return result.response === "ok";
  }

  static applyContrastColors(trackMetrics = true) {
    // TODO: тк цвета используются только на шахматке, перенести реализацию стилей в state, а не на body
    document.querySelector("body").classList.add("has-contrast-colors");
    if (trackMetrics) {
      ymHelpers.sendHit("main", "/planning/set_pale_colors", "Шахматка: включил бледные цвета");
    }
  }

  static removeContrastColors(trackMetrics = true) {
    // TODO: тк цвета используются только на шахматке, перенести реализацию стилей в state, а не на body
    document.querySelector("body").classList.remove("has-contrast-colors");
    if (trackMetrics) {
      ymHelpers.sendHit("main", "/planning/set_bright_colors", "Шахматка: включил яркие цвета");
    }
  }
}
