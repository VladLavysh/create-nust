<template>
  <a class="oauth-btn oauth-btn--github" :href="href">
    Continue with GitHub
  </a>
</template>

<script setup lang="ts">
defineProps<{
  href: string
}>()
</script>

<style scoped>
.oauth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  border-radius: 0.5rem;
  border: 1px solid var(--color-border, #e5e7eb);
  color: var(--color-text);
  background: var(--color-surface, #fff);
  transition: background 0.15s ease;
}

.oauth-btn:hover {
  background: var(--color-surface-hover, #f9fafb);
}

.oauth-btn--github {
  border-color: #24292f;
  color: #fff;
  background: #24292f;
}

.oauth-btn--github:hover {
  background: #1b1f23;
}
</style>
