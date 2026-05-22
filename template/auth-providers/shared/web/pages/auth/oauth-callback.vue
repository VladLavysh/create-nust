<template>
  <div class="oauth-callback">
    <p>Signing you in…</p>
  </div>
</template>

<script setup lang="ts">
/**
 * Dev-only: tokens are passed via query string after OAuth.
 * For production, switch to an authorization-code exchange on this page.
 */
const route = useRoute()
const { setAuthCookies } = useAuthTokens()
const { fetchUser } = useAuth()

onMounted(async () => {
  const accessToken = route.query.accessToken as string | undefined
  const refreshToken = route.query.refreshToken as string | undefined

  if (!accessToken || !refreshToken) {
    await navigateTo('/auth/login?error=oauth')
    return
  }

  setAuthCookies({ accessToken, refreshToken })
  await fetchUser(accessToken)
  await navigateTo('/')
})
</script>

<style scoped>
.oauth-callback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 12rem;
  color: var(--color-text-muted);
}
</style>
