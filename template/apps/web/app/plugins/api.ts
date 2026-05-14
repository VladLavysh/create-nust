export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const api = $fetch.create({
    baseURL: config.public.apiBase + "/api/v1/",
    onRequest({ options }) {
      const access_token = useCookie("access_token");

      if (access_token.value) {
        options.headers = new Headers(options.headers as HeadersInit);
        options.headers.set("Authorization", `Bearer ${access_token.value}`);
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        useCookie("access_token").value = null;
        useCookie("refresh_token").value = null;
        navigateTo("/auth/login");
      }
    },
  });

  return {
    provide: {
      api,
    },
  };
});
