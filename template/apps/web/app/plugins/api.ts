import { useAuthTokens } from "../composables/useAuthTokens";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const { accessToken } = useAuthTokens();

  const api = $fetch.create({
    baseURL: config.public.apiBase + "/api/v1/",
    onRequest({ options }) {
      if (accessToken.value) {
        options.headers = new Headers(options.headers as HeadersInit);
        options.headers.set("Authorization", `Bearer ${accessToken.value}`);
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        // Let auth middleware/auth-init decide when to refresh or logout.
      }
    },
  });

  return {
    provide: {
      api,
    },
  };
});
