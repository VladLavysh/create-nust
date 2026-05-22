<template>
  <form class="form" @submit.prevent="handleSubmit">
    <div class="form__header">
      <h1 class="form__title">Welcome back</h1>
      <p class="form__subtitle">Sign in to your account</p>
    </div>

    <div class="form__fields">
      <UiAppInput
        v-model="form.email"
        id="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        :error="errors.email"
      />
      <UiAppInput
        v-model="form.password"
        id="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        :error="errors.password"
      />
    </div>

    <p v-if="errors.general" class="form__error">
      {{ errors.general }}
    </p>

    <UiAppButton type="submit" variant="primary" :loading="loading">
      Sign in
    </UiAppButton>

    <!-- __OAUTH_BUTTONS_START__ -->
    <!-- __OAUTH_BUTTONS_END__ -->

    <p class="form__footer">
      Don't have an account?
      <NuxtLink to="/auth/register">Register</NuxtLink>
    </p>
  </form>
</template>

<script setup lang="ts">
const { login } = useAuth()

const loading = ref(false)
const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '', general: '' })

function validate() {
  errors.email = ''
  errors.password = ''
  errors.general = ''

  if (!form.email) errors.email = 'Email is required'
  else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Invalid email'
  if (!form.password) errors.password = 'Password is required'
  else if (form.password.length < 8) errors.password = 'Minimum 8 characters'

  return !errors.email && !errors.password
}

async function handleSubmit() {
  if (!validate()) return

  loading.value = true
  try {
    await login(form.email, form.password)
  } catch (err: any) {
    errors.general = err?.data?.message ?? 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form__header {
  text-align: center;
}

.form__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
}

.form__subtitle {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-top: 0.25rem;
}

.form__fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form__error {
  font-size: 0.875rem;
  color: var(--color-error);
  text-align: center;
}

.form__footer {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  text-align: center;
}
</style>
