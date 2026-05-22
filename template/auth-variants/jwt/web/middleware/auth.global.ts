import { useAuthTokens } from "@web/composables/useAuthTokens";
import { useAuth } from "@web/composables/useAuth";

export default defineNuxtRouteMiddleware(async (to) => {
  const { accessToken, refreshToken } = useAuthTokens();
  const { refreshSession } = useAuth();
  const isAuthPage = to.path.startsWith("/auth/");
  const isPublic = to.meta.auth === false || to.path === "/welcome";

  if (accessToken.value) {
    if (isAuthPage) {
      return navigateTo("/");
    }
    return;
  }

  if (refreshToken.value) {
    if (await refreshSession()) {
      if (isAuthPage) {
        return navigateTo("/");
      }
      return;
    }
  }

  if (isPublic || isAuthPage) {
    return;
  }

  return navigateTo("/auth/login");
});
