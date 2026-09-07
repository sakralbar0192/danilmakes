import axios from "axios";

const basePath = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
const useLiveApi = import.meta.env.VITE_DEMO_API !== "msw";
const apiPrefix = useLiveApi ? "/api/demos/tariffs" : basePath;

const http = axios.create({
  baseURL: "/",
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  },
});

http.interceptors.request.use((config) => {
  if (typeof config.url === "string" && config.url.startsWith("/") && apiPrefix) {
    config.url = `${apiPrefix}${config.url}`;
  }
  return config;
});

export const isLiveDemoApi = useLiveApi;

export default {
  get: (url, config) => http.get(url, config).then((r) => r.data),
  post: (url, data, config) => http.post(url, data, config).then((r) => r.data),
  put: (url, data, config) => http.put(url, data, config).then((r) => r.data),
  delete: (url, config) => http.delete(url, config).then((r) => r.data),
};
