import type { IAuthResponse, IUser } from '@nust/shared'

export const useAuth = () => {
  const { $api } = useNuxtApp()

  const user = useState<IUser | null>('auth.user', () => null)
  const isAuthenticated = computed(() => !!user.value)

  const accessToken = useCookie('access_token', {
    maxAge: 60 * 15,        // 15 minutes
    sameSite: 'lax',
  })

  const refreshToken = useCookie('refresh_token', {
    maxAge: 60 * 60 * 24 * 7,  // 7 days
    sameSite: 'lax',
  })

  async function login(email: string, password: string) {
    const data = await $api<IAuthResponse>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })

    accessToken.value = data.accessToken
    refreshToken.value = data.refreshToken

    await fetchUser()
    await navigateTo('/')
  }

  async function register(email: string, password: string) {
    const data = await $api<IAuthResponse>('/api/auth/register', {
      method: 'POST',
      body: { email, password },
    })

    accessToken.value = data.accessToken
    refreshToken.value = data.refreshToken

    await fetchUser()
    await navigateTo('/')
  }

  async function fetchUser() {
    try {
      user.value = await $api<IUser>('/api/auth/me')
    } catch {
      user.value = null
    }
  }

  async function logout() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    await navigateTo('/auth/login')
  }

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
  }
}
