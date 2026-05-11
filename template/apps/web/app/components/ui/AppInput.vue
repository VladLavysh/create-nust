<template>
  <div class="field">
    <label v-if="label" :for="id" class="field__label">
      {{ label }}
    </label>
    <input
      :id="id"
      v-bind="$attrs"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      class="field__input"
      :class="{ 'field__input--error': error }"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" class="field__error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  label?: string
  type?: string
  placeholder?: string
  error?: string
  id?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.field__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.field__input {
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-size: 0.875rem;
  color: var(--color-text);
  background: var(--color-bg);
  transition: border-color 0.15s;
  outline: none;
  width: 100%;
}

.field__input:focus {
  border-color: var(--color-primary);
}

.field__input--error {
  border-color: var(--color-error);
}

.field__error {
  font-size: 0.75rem;
  color: var(--color-error);
}
</style>
