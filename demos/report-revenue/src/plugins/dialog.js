import { reactive } from "vue";

const state = reactive({
  snackbar: { show: false, text: "", color: "success", timeout: 4000 },
  message: { show: false, title: "", content: "", type: "info", buttons: [], closable: true },
  loader: false,
});

export const dialogState = state;

export function createDialogPlugin() {
  return {
    install(app) {
      const api = {
        message(options = {}) {
          Object.assign(state.message, {
            show: true,
            title: options.title || "",
            content: options.content || "",
            type: options.type || "info",
            buttons: options.buttons || [],
            closable: options.closable !== false,
            dataTest: options.dataTest,
          });
          return {
            close: () => { state.message.show = false; },
          };
        },
        toast(opts = {}) {
          Object.assign(state.snackbar, {
            show: true,
            text: opts.content || "",
            color: opts.type === "error" ? "error" : opts.type === "warning" ? "warning" : "success",
            timeout: opts.timeout ?? 4000,
          });
        },
        loader() { state.loader = true; },
        hideLoader() { state.loader = false; },
        hide() { state.message.show = false; },
        error(opts) { api.toast({ ...opts, type: "error" }); },
      };
      app.config.globalProperties.$dialog = api;
      app.provide("$dialog", api);
    },
  };
}
