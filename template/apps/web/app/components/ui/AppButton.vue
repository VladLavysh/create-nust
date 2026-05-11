<template>
  <button
    class="btn"
    :class="[`btn--${variant}`, { 'btn--loading': loading }]"
    :disabled="loading || disabled"
    v-bind="$attrs"
  >
    <span v-if="loading" class="btn__spinner" />
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'ghost'
  loading?: boolean
  disabled?: boolean
}>()
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background 0.15s, opacity 0.15s;
  width: 100%;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn--primary {
  background: var(--color-primary);
  color: white;
}

.btn--primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn--ghost {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn--ghost:hover:not(:disabled) {
  background: var(--color-bg-subtle);
}

.btn__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
