import type { IUserPublic } from "@nust/shared";

export const useAuth = () => {
  const { $api } = useNuxtApp();

  const user = useState<IUserPublic | null>("auth.user", () => null);
  const sessionChecked = useState("auth.sessionChecked", () => false);
  const isAuthenticated = computed(() => !!user.value);

  async function login(email: string, password: string) {
    const data = await $api<IUserPublic>("auth/login", {
      method: "POST",
      body: { email, password },
    });

    user.value = data;
    await navigateTo("/");
  }

  async function register(email: string, password: string) {
    const data = await $api<IUserPublic>("auth/register", {
      method: "POST",
      body: { email, password },
    });

    user.value = data;
    await navigateTo("/");
  }

  async function fetchUser() {
    if (sessionChecked.value) return;

    sessionChecked.value = true;
    try {
      user.value = await $api<IUserPublic>("auth/me");
    } catch {
      user.value = null;
    }
  }

  async function logout() {
    try {
      await $api("auth/logout", { method: "POST" });
    } catch {
      console.error("Failed to logout");
    }
    user.value = null;
    sessionChecked.value = false;
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
