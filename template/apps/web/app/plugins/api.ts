export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      const token = useCookie('access_token').value
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        }
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        useCookie('access_token').value = null
        useCookie('refresh_token').value = null
        navigateTo('/auth/login')
      }
    },
  })

  return {
    provide: {
      api,
    },
  }
})
