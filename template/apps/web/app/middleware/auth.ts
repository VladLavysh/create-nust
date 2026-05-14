export default defineNuxtRouteMiddleware(() => {
  const accessToken = useCookie("access_token");

  if (!accessToken.value) {
    return navigateTo("/auth/login");
  }
});
