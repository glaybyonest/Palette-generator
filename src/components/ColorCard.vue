<template>
  <div 
    class="color-card" 
    :style="{ backgroundColor: color }"
    @click="copyToClipboard"
  >
    <div class="color-info">
      <div class="color-hex">{{ displayFormat === 'hex' ? color : rgbValue }}</div>
      <div class="color-lock" @click.stop="toggleLock">
        {{ isLocked ? '🔒' : '🔓' }}
      </div>
      <div v-if="showNotification" class="copy-notification">
        Скопировано!
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'ColorCard',
  props: {
    color: {
      type: String,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    displayFormat: {
      type: String,
      default: 'hex'
    },
    isLocked: {
      type: Boolean,
      default: false
    }
  },
  emits: ['toggle-lock'],
  setup(props, { emit }) {
    const showNotification = ref(false)

    // Преобразование HEX в RGB
    const rgbValue = computed(() => {
      const hex = props.color.replace('#', '')
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      return `rgb(${r}, ${g}, ${b})`
    })

    // Копирование в буфер обмена
    const copyToClipboard = async () => {
      try {
        const textToCopy = props.displayFormat === 'hex' ? props.color : rgbValue.value
        await navigator.clipboard.writeText(textToCopy)
        showNotification.value = true
        setTimeout(() => {
          showNotification.value = false
        }, 2000)
      } catch (err) {
        console.error('Ошибка копирования:', err)
      }
    }

    const toggleLock = () => {
      emit('toggle-lock', props.index)
    }

    return {
      rgbValue,
      showNotification,
      copyToClipboard,
      toggleLock
    }
  }
}
</script>

<style scoped>
.color-card {
  width: 180px;
  height: 180px;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.color-card:hover {
  transform: translateY(-5px);
}

.color-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #ffffff;
}

.color-hex {
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 1rem;
}

.color-lock {
  cursor: pointer;
  font-size: 1.2rem;
  user-select: none;
}

.copy-notification {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  animation: fadeInOut 2s ease;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0; }
  20%, 80% { opacity: 1; }
}
</style>