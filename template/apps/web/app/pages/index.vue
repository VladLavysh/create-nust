<template>
  <div class="home">
    <div class="home__hero">
      <h1 class="home__title">
        Welcome, {{ user?.email }}
      </h1>
      <p class="home__subtitle">
        Your Nust app is running. Start building.
      </p>
    </div>

    <div class="home__card">
      <h2>Stack</h2>
      <ul class="home__stack">
        <li v-for="item in stack" :key="item.name">
          <strong>{{ item.name }}</strong> — {{ item.description }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: ['auth'],
})

const { user } = useAuth()

const stack = [
  { name: 'Nuxt 4', description: 'Frontend framework with SSR' },
  { name: 'NestJS', description: 'Backend API framework' },
  { name: 'PostgreSQL', description: 'Relational database' },
  { name: 'TypeORM', description: 'Database ORM' },
  { name: 'Docker', description: 'Containerized infrastructure' },
]
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 700px;
}

.home__hero {
  padding: 3rem 0 1rem;
}

.home__title {
  font-size: 2rem;
  font-weight: 700;
}

.home__subtitle {
  color: var(--color-text-muted);
  margin-top: 0.5rem;
}

.home__card {
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 1.5rem;
}

.home__card h2 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.home__stack {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.home__stack li {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.home__stack strong {
  color: var(--color-text);
}
</style>
