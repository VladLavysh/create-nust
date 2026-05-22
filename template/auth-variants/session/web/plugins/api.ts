export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const api = $fetch.create({
    baseURL: config.public.apiBase + "/api/v1/",
    credentials: import.meta.client ? "include" : undefined,
    onRequest({ options }) {
      if (import.meta.server) {
        const { cookie } = useRequestHeaders(["cookie"]);
        if (cookie) {
          const headers = new Headers(options.headers as HeadersInit | undefined);
          headers.set("cookie", cookie);
          options.headers = headers;
        }
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        // Let auth middleware decide when to redirect.
      }
    },
  });

  return {
    provide: {
      api,
    },
  };
});
