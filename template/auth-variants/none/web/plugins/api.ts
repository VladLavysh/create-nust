export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const api = $fetch.create({
    baseURL: config.public.apiBase + "/api/v1/",
  });

  return {
    provide: {
      api,
    },
  };
});
