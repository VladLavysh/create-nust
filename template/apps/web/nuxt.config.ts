export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  runtimeConfig: {
    public: {
      apiBase: process.env.API_URL,
      jwtAccessExpirationTimeInMs: process.env.JWT_ACCESS_EXPIRATION_TIME_IN_MS,
      jwtRefreshExpirationTimeInMs:
        process.env.JWT_REFRESH_EXPIRATION_TIME_IN_MS,
    },
  },

  css: ["~/assets/css/main.css"],
});
