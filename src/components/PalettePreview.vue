<template>
  <div class="palette-preview">
    <div class="preview-controls">
      <button 
        @click="toggleBackground"
        class="bg-toggle"
      >
        {{ isDarkBackground ? '🌙 Тёмный фон' : '☀️ Светлый фон' }}
      </button>
    </div>
    
    <div class="preview-container" :class="{ 'dark-bg': isDarkBackground }">
      <div class="ui-mockup">
        <!-- Header -->
        <div class="ui-header" :style="{ backgroundColor: colors[0] || '#667eea' }">
          <div class="ui-logo" :style="{ color: getContrastColor(colors[0]) }">
            Brand
          </div>
          <nav class="ui-nav">
            <div 
              v-for="(_, index) in 3" 
              :key="index" 
              class="nav-item"
              :style="{ color: getContrastColor(colors[0]) }"
              @click="handleNavClick(index + 1)"
            >
              Menu {{ index + 1 }}
            </div>
          </nav>
        </div>
        
        <!-- Main content -->
        <div class="ui-content">
          <!-- Card -->
          <div 
            class="ui-card"
            :style="{ 
              backgroundColor: colors[1] || '#f8f9fa',
              color: getContrastColor(colors[1])
            }"
          >
            <h3>Пример карточки</h3>
            <p>Это демонстрация использования цветов палитры в UI-элементах</p>
            <button 
              class="ui-button"
              :style="{ 
                backgroundColor: colors[2] || '#28a745',
                color: getContrastColor(colors[2])
              }"
              @click="handleActionClick"
            >
              Кнопка действия
            </button>
          </div>
          
          <!-- Sidebar -->
          <div 
            class="ui-sidebar"
            :style="{ backgroundColor: colors[3] || '#343a40' }"
          >
            <div 
              v-for="(_, index) in 4" 
              :key="index" 
              class="sidebar-item"
              :style="{ color: getContrastColor(colors[3]) }"
              @click="handleSidebarClick(index + 1)"
            >
              Пункт {{ index + 1 }}
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div 
          class="ui-footer"
          :style="{ backgroundColor: colors[4] || '#6c757d' }"
        >
          <div :style="{ color: getContrastColor(colors[4]) }">
            © 2024 Пример интерфейса
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'PalettePreview',
  props: {
    colors: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const isDarkBackground = ref(false)

    const toggleBackground = () => {
      isDarkBackground.value = !isDarkBackground.value
    }

    // Определение цвета текста на основе яркости фона
    const getContrastColor = (hexColor) => {
      if (!hexColor) return '#ffffff'
      
      const hex = hexColor.replace('#', '')
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      
      // Формула яркости
      const brightness = (r * 299 + g * 587 + b * 114) / 1000
      return brightness > 128 ? '#000000' : '#ffffff'
    }

    const handleActionClick = () => {
      alert('Кнопка действия: здесь мог бы быть ваш обработчик 🙂')
    }

    const handleNavClick = (index) => {
      alert(`Навигация: клик по пункту меню ${index}`)
    }

    const handleSidebarClick = (index) => {
      alert(`Сайдбар: клик по пункту ${index}`)
    }

    return {
      isDarkBackground,
      toggleBackground,
      getContrastColor,
      handleActionClick,
      handleNavClick,
      handleSidebarClick
    }
  }
}
</script>

<style scoped>
.palette-preview {
  margin: 2rem 0;
}

.preview-controls {
  margin-bottom: 1rem;
  text-align: center;
}

.bg-toggle {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.preview-container {
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  transition: background-color 0.3s;
}

.preview-container.dark-bg {
  background: #2c3e50;
}

.ui-mockup {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.ui-header {
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ui-logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.ui-nav {
  display: flex;
  gap: 2rem;
}

.nav-item {
  cursor: pointer;
  padding: 0.5rem;
  transition: opacity 0.2s;
}

.nav-item:hover {
  opacity: 0.8;
}

.ui-content {
  display: flex;
  min-height: 300px;
}

.ui-card {
  flex: 3;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ui-button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  align-self: flex-start;
  transition: transform 0.2s;
}

.ui-button:hover {
  transform: translateY(-2px);
}

.ui-sidebar {
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sidebar-item {
  padding: 0.75rem;
  cursor: pointer;
  transition: opacity 0.2s;
}

.sidebar-item:hover {
  opacity: 0.8;
}

.ui-footer {
  padding: 1.5rem 2rem;
  text-align: center;
}
</style>