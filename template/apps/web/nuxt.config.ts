export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  future: {
    compatibilityVersion: 4,
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.API_URL ?? 'http://localhost:3001',
    },
  },

  app: {
    head: {
      title: '__APPNAME__',
      meta: [
        { name: '__DESCRIPTION__', content: '__CONTENT__' },
      ],
    },
  },

  modules: [],

  css: ['~/assets/css/main.css'],
})
