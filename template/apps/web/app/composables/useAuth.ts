import type { IAuthResponse, IUser } from "@nust/shared";

export const useAuth = () => {
  const { $api } = useNuxtApp();
  const config = useRuntimeConfig();

  const user = useState<IUser | null>("auth.user", () => null);
  const isAuthenticated = computed(() => !!user.value);

  const accessToken = useCookie("access_token", {
    // maxAge: +config.public.jwtAccessExpirationTimeInMs,
    maxAge: 60 * 1, // 1 minute
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  const refreshToken = useCookie("refresh_token", {
    // maxAge: +config.public.jwtRefreshExpirationTimeInMs,
    maxAge: 60 * 2, // 2 minute
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  function setCookieFallback(name: string, value: string, maxAge: number) {
    if (!process.client) return;

    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
  }

  function setAuthCookies(data: IAuthResponse) {
    accessToken.value = data.accessToken;
    refreshToken.value = data.refreshToken;

    // Ensure browser persistence immediately on client in case of hydration timing issues.
    setCookieFallback(
      "access_token",
      data.accessToken,
      +config.public.jwtAccessExpirationTimeInMs,
    );
    setCookieFallback(
      "refresh_token",
      data.refreshToken,
      +config.public.jwtRefreshExpirationTimeInMs,
    );
  }

  async function login(email: string, password: string) {
    const data = await $api<IAuthResponse>("auth/login", {
      method: "POST",
      body: { email, password },
    });

    setAuthCookies(data);
    await fetchUser(data.accessToken);
    await navigateTo("/");
  }

  async function register(email: string, password: string) {
    const data = await $api<IAuthResponse>("auth/register", {
      method: "POST",
      body: { email, password },
    });

    setAuthCookies(data);
    await fetchUser(data.accessToken);
    await navigateTo("/");
  }

  async function fetchUser(token?: string) {
    try {
      user.value = await $api<IUser>(
        "auth/me",
        token
          ? {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          : undefined,
      );
    } catch {
      user.value = null;
    }
  }

  async function logout() {
    accessToken.value = null;
    refreshToken.value = null;
    user.value = null;
    await navigateTo("/auth/login");
  }

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
  };
};
