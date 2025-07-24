import ApiClient from "../helpers/ApiClient";

export async function getFeedbackInit() {
    try {
      const res = await ApiClient.get("/feedback/");
      return res;
    } catch (error) {
      throw error;
    }
}

export async function getFeedbacks(type, from = null, to = null) {
    try {
      const res = await ApiClient.get(`/feedback/filter?type=${type}&from=${from}&to=${to}`);
      return res;
    } catch (error) {
      throw error;
    }
}

export async function searchFeedbacks(q) {
    try {
      const res = await ApiClient.get(`/feedback/search?q=${q}`);
      return res;
    } catch (error) {
      throw error;
    }
}