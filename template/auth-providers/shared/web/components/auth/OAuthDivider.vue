<template>
  <div class="oauth-divider">
    <span class="oauth-divider__line" />
    <span class="oauth-divider__text">or</span>
    <span class="oauth-divider__line" />
  </div>
</template>

<style scoped>
.oauth-divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.oauth-divider__line {
  flex: 1;
  height: 1px;
  background: var(--color-border, #e5e7eb);
}

.oauth-divider__text {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
