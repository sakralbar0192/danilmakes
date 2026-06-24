import axios from "axios";

const basePath = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

const http = axios.create({
  baseURL: "/",
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  },
});

http.interceptors.request.use((config) => {
  if (typeof config.url === "string" && config.url.startsWith("/") && basePath) {
    config.url = `${basePath}${config.url}`;
  }
  return config;
});

export default {
  get: (url, config) => http.get(url, config).then((r) => r.data),
  post: (url, data, config) => http.post(url, data, config).then((r) => r.data),
  put: (url, data, config) => http.put(url, data, config).then((r) => r.data),
  delete: (url, config) => http.delete(url, config).then((r) => r.data),
};
