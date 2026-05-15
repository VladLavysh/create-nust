import type { IAuthResponse, IUser } from "@nust/shared";
import { useAuthTokens } from "./useAuthTokens";

export const useAuth = () => {
  const { $api } = useNuxtApp();
  const { refreshToken, setAuthCookies, clearAuthCookies } = useAuthTokens();
  const refreshInFlight = useState<Promise<boolean> | null>(
    "auth.refreshInFlight",
    () => null,
  );

  const user = useState<IUser | null>("auth.user", () => null);
  const isAuthenticated = computed(() => !!user.value);

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
      const reqOptions = token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : undefined;

      user.value = await $api<IUser>("auth/me", reqOptions);
    } catch {
      user.value = null;
    }
  }

  async function refreshSession() {
    if (refreshInFlight.value) {
      return await refreshInFlight.value;
    }

    if (!refreshToken.value) return false;

    refreshInFlight.value = (async () => {
      try {
        const data = await $api<IAuthResponse>("auth/refresh", {
          method: "POST",
          body: { refreshToken: refreshToken.value },
        });

        setAuthCookies(data);
        await fetchUser(data.accessToken);
        return true;
      } catch (error: any) {
        const status = error?.response?.status;

        if (status === 401 || status === 403) {
          clearAuthCookies();
          user.value = null;
        }
        return false;
      } finally {
        refreshInFlight.value = null;
      }
    })();

    return await refreshInFlight.value;
  }

  async function logout() {
    clearAuthCookies();
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
    refreshSession,
  };
};
