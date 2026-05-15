export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

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
