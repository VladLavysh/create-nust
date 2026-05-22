import type { IUser } from "@nust/shared";

export const useAuth = () => {
  const user = useState<IUser | null>("auth.user", () => null);
  const isAuthenticated = computed(() => false);

  async function login(_email: string, _password: string) {}
  async function register(_email: string, _password: string) {}
  async function fetchUser() {
    user.value = null;
  }
  async function logout() {
    user.value = null;
    await navigateTo("/");
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
