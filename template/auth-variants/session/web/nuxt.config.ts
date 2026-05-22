import { fileURLToPath } from "node:url";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  alias: {
    "@web": fileURLToPath(new URL("./app", import.meta.url)),
  },

  runtimeConfig: {
    public: {
      apiBase: "",
    },
  },

  nitro: {
    devProxy: {
      "/api/v1": {
        target: `${process.env.API_URL ?? "http://localhost:3001"}/api/v1`,
        changeOrigin: true,
      },
    },
  },

  routeRules: {
    "/api/v1/**": {
      proxy: `${process.env.API_URL ?? "http://localhost:3001"}/api/v1/**`,
    },
  },

  css: ["~/assets/css/main.css"],
});
