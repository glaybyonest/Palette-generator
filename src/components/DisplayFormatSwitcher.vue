<template>
  <div class="format-switcher">
    <label class="format-label">Формат отображения:</label>
    <select
      class="format-select"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option value="hex">HEX</option>
      <option value="rgb">RGB</option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'DisplayFormatSwitcher',
  props: {
    modelValue: {
      type: String,
      default: 'hex'
    }
  },
  emits: ['update:modelValue']
}
</script>

<style scoped>
.format-switcher {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.format-label {
  font-weight: bold;
  color: #495057;
}

.format-select {
  padding: 8px 12px;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  font-size: 1rem;
}
</style>


