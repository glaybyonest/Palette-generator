<template>
  <div class="home-page">
    <div class="hero-section">
      <h2>Добро пожаловать в генератор цветовых палитр</h2>
      <p>Создавайте, анализируйте и сохраняйте красивые цветовые схемы для ваших проектов</p>
      
      <div class="quick-actions">
        <button @click="generateRandom" class="btn primary">
          🎲 Сгенерировать случайную палитру
        </button>
        <router-link to="/generator" class="btn secondary">
          ⚙️ Перейти к расширенному генератору
        </router-link>
      </div>
    </div>

    <div class="current-palette" v-if="colors.length > 0">
      <h3>Текущая палитра</h3>
      <div class="palette-display">
        <ColorCard
          v-for="(color, index) in colors"
          :key="index"
          :color="color"
          :index="index"
          :display-format="displayFormat"
          :is-locked="lockedColors[index]"
          @toggle-lock="toggleLockColor"
        />
      </div>
      
      <div class="palette-controls">
        <div class="controls-group">
          <label>Количество цветов:</label>
          <select v-model="colorCount" @change="generateHarmoniousPalette">
            <option value="3">3</option>
            <option value="5">5</option>
            <option value="7">7</option>
          </select>
        </div>
        
        <div class="controls-group">
          <DisplayFormatSwitcher v-model="displayFormat" />
        </div>
        
        <div class="controls-group">
          <button @click="saveToLibrary" class="btn">
            💾 Сохранить в библиотеку
          </button>
        </div>
      </div>
    </div>

    <div class="preview-section">
      <h3>Предпросмотр интерфейса</h3>
      <PalettePreview :colors="colors" />
    </div>

    <div class="features-section">
      <h3>Возможности приложения</h3>
      <div class="features-grid">
        <div class="feature-card">
          <h4>🎨 Генерация палитр</h4>
          <p>Создавайте гармоничные цветовые схемы различных типов</p>
        </div>
        <div class="feature-card">
          <h4>🔍 Анализ доступности</h4>
          <p>Проверяйте контрастность по стандарту WCAG</p>
        </div>
        <div class="feature-card">
          <h4>💾 Управление библиотекой</h4>
          <p>Сохраняйте и организуйте коллекции палитр</p>
        </div>
        <div class="feature-card">
          <h4>📤 Экспорт</h4>
          <p>Экспортируйте цвета в различные форматы</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useColorGenerator } from '../composables/useColorGenerator'
import ColorCard from '../components/ColorCard.vue'
import PalettePreview from '../components/PalettePreview.vue'
import DisplayFormatSwitcher from '../components/DisplayFormatSwitcher.vue'
import { useLocalStorage } from '../composables/useLocalStorage'

export default {
  name: 'HomePage',
  components: {
    ColorCard,
    PalettePreview,
    DisplayFormatSwitcher
  },
  setup() {
    const { 
      colors, 
      colorCount, 
      generateHarmoniousPalette,
      toggleLockColor,
      lockedColors,
      generateRandomColor
    } = useColorGenerator()
    
    const displayFormat = ref('hex')
    const { getItem, setItem } = useLocalStorage()

    // Загрузка сохраненной палитры из localStorage
    onMounted(() => {
      const savedPalette = getItem('currentPalette')
      if (savedPalette && savedPalette.colors) {
        colors.value = savedPalette.colors
        colorCount.value = savedPalette.count || 5
      } else {
        generateHarmoniousPalette()
      }
      
      const savedFormat = getItem('displayFormat')
      if (savedFormat) {
        displayFormat.value = savedFormat
      }
    })

    // Сохранение палитры в localStorage
    const savePalette = () => {
      setItem('currentPalette', {
        colors: colors.value,
        count: colorCount.value
      })
      setItem('displayFormat', displayFormat.value)
    }

    // Генерация случайной палитры
    const generateRandom = () => {
      colors.value = Array.from({ length: colorCount.value }, () => generateRandomColor())
      savePalette()
    }

    // Сохранение в библиотеку
    const saveToLibrary = () => {
      const library = getItem('paletteLibrary') || []
      const newPalette = {
        id: Date.now(),
        name: `Палитра ${new Date().toLocaleDateString()}`,
        colors: [...colors.value],
        createdAt: new Date().toISOString()
      }
      library.push(newPalette)
      setItem('paletteLibrary', library)
      alert('Палитра сохранена в библиотеку!')
    }

    return {
      colors,
      colorCount,
      displayFormat,
      lockedColors,
      generateHarmoniousPalette,
      toggleLockColor,
      generateRandom,
      saveToLibrary
    }
  }
}
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  text-align: center;
  padding: 3rem 1rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 20px;
  margin-bottom: 2rem;
}

.hero-section h2 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.hero-section p {
  font-size: 1.2rem;
  color: #34495e;
  margin-bottom: 2rem;
}

.quick-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  text-decoration: none;
  display: inline-block;
  transition: transform 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
}

.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.current-palette {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.palette-display {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin: 2rem 0;
}

.palette-controls {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 10px;
}

.controls-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.controls-group label {
  font-weight: bold;
  color: #495057;
}

.controls-group select {
  padding: 8px 12px;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  font-size: 1rem;
}

.preview-section {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.features-section {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.feature-card {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 10px;
  border-left: 4px solid #667eea;
}

.feature-card h4 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.feature-card p {
  color: #7f8c8d;
}
</style>