export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  runtimeConfig: {
    public: {
      apiBase: process.env.API_URL,
    },
  },

  css: ["~/assets/css/main.css"],
});
