function hasSessionCookie(): boolean {
  if (import.meta.server) {
    const cookie = useRequestHeaders(["cookie"]).cookie ?? "";
    return cookie.includes("connect.sid=");
  }
  return true;
}

export default defineNuxtRouteMiddleware(async (to) => {
  const { user, fetchUser } = useAuth();
  const isAuthPage = to.path.startsWith("/auth/");
  const isPublic = to.meta.auth === false || to.path === "/welcome";

  if (!user.value && !isPublic) {
    if (!isAuthPage || hasSessionCookie()) {
      await fetchUser();
    }
  }
  if (user.value) {
    if (isAuthPage) {
      return navigateTo("/");
    }
    return;
  }

  if (isPublic || isAuthPage) {
    return;
  }

  return navigateTo("/auth/login");
});
