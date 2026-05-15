export default defineNuxtPlugin(async () => {
  const { fetchUser } = useAuth();
  const { accessToken, refreshToken } = useAuthTokens();

  if (accessToken.value) {
    await fetchUser(accessToken.value);
    return;
  }

  if (refreshToken.value) {
    // Refresh is handled by route middleware to avoid duplicate refresh calls.
    return;
  }
});
