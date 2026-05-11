<template>
  <div class="layout">
    <header class="header">
      <nav class="nav">
        <NuxtLink to="/" class="nav__brand">
          🚀 {{ appName }}
        </NuxtLink>

        <div class="nav__actions">
          <template v-if="isAuthenticated">
            <span class="nav__user">{{ user?.email }}</span>
            <button class="btn btn--ghost" @click="logout">
              Logout
            </button>
          </template>
          <template v-else>
            <NuxtLink to="/auth/login" class="btn btn--ghost">
              Login
            </NuxtLink>
            <NuxtLink to="/auth/register" class="btn btn--primary">
              Register
            </NuxtLink>
          </template>
        </div>
      </nav>
    </header>

    <main class="main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { user, isAuthenticated, logout } = useAuth()
const appName = useState('app.name', () => '__PROJECT_NAME__')
</script>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  border-bottom: 1px solid var(--color-border);
  padding: 0 1.5rem;
}

.nav {
  max-width: 1200px;
  margin: 0 auto;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav__brand {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--color-text);
}

.nav__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav__user {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background 0.15s;
}

.btn--primary {
  background: var(--color-primary);
  color: white;
}

.btn--primary:hover {
  background: var(--color-primary-hover);
}

.btn--ghost {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn--ghost:hover {
  background: var(--color-bg-subtle);
}
</style>
