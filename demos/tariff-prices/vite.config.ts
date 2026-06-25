import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  base: "/tariffPrices/",
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
  ],
  resolve: {
    extensions: [".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json", ".vue"],
    alias: [
      {
        find: "@/uikit",
        replacement: fileURLToPath(new URL("./src/uikit-vue3", import.meta.url)),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
      {
        find: "vuelidate/lib/validators",
        replacement: fileURLToPath(new URL("./src/shims/vuelidate-validators.js", import.meta.url)),
      },
      {
        find: "vuelidate",
        replacement: fileURLToPath(new URL("./src/shims/vuelidate.js", import.meta.url)),
      },
      {
        find: "vue-the-mask",
        replacement: fileURLToPath(new URL("./src/shims/vue-the-mask.js", import.meta.url)),
      },
      {
        find: "vue",
        replacement: "vue/dist/vue.esm-bundler.js",
      },
    ],
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/vuetify-settings.scss" as *;\n@import "@/styles/demo-shims.scss";\n`,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
  },
});
