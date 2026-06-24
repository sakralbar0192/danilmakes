import CoreService from "@/services/core";

export default class FeedbackService extends CoreService {
  static financeFeedbackStateEnum = {
    showDialog: 0,
    showButton: 1,
    hideAll: 2,
  };

  static async updateFinanceFeedbackState(state) {
    const url = "/users/updateFinanceFeedbackState";
    return await this.http.post(url, { ...state });
  }
}
