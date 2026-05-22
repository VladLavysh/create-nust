<template>
  <div class="welcome">
    <div class="welcome__hero">
      <h1 class="welcome__title">
        Welcome to Nust
      </h1>
      <p class="welcome__subtitle">
        A modern full-stack TypeScript application template
      </p>
    </div>

    <div class="welcome__features">
      <div class="welcome__feature">
        <h3>🚀 Fast Development</h3>
        <p>Built with modern tools for rapid development and deployment</p>
      </div>

      <div class="welcome__feature">
        <h3>🛡️ Type Safe</h3>
        <p>End-to-end TypeScript support for better code quality</p>
      </div>

      <div class="welcome__feature">
        <h3>🐳 Container Ready</h3>
        <p>Docker configuration included for easy deployment</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  auth: false,
})

useHead({
  title: 'Welcome - Nust',
  meta: [
    { name: 'description', content: 'Welcome to Nust - A modern full-stack TypeScript application template' }
  ]
})
</script>

<style scoped>
.welcome {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.welcome__hero {
  text-align: center;
  padding: 3rem 0;
}

.welcome__title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome__subtitle {
  font-size: 1.25rem;
  color: var(--color-text-muted);
  max-width: 500px;
  margin: 0 auto;
}

.welcome__features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}

.welcome__feature {
  text-align: center;
  padding: 2rem;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.welcome__feature:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.welcome__feature h3 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  color: var(--color-text);
}

.welcome__feature p {
  color: var(--color-text-muted);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .welcome {
    padding: 1rem;
  }

  .welcome__title {
    font-size: 2rem;
  }

  .welcome__subtitle {
    font-size: 1rem;
  }

  .welcome__features {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
