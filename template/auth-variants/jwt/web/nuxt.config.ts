import { fileURLToPath } from "node:url";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  alias: {
    "@web": fileURLToPath(new URL("./app", import.meta.url)),
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.API_URL,
      jwtAccessExpirationTimeInSec:
        process.env.JWT_ACCESS_EXPIRATION_TIME_IN_SEC,
      jwtRefreshExpirationTimeInSec:
        process.env.JWT_REFRESH_EXPIRATION_TIME_IN_SEC,
    },
  },

  css: ["~/assets/css/main.css"],
});
