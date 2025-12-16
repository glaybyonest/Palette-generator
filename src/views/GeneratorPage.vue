<template>
  <div class="generator-page">
    <h2>🎨 Продвинутый генератор палитр</h2>
    
    <div class="generator-controls">
      <div class="control-section">
        <h3>Базовые настройки</h3>
        <div class="control-group">
          <label>Базовый цвет:</label>
          <input type="color" v-model="baseColor" @change="generateFromBase">
        </div>
        
        <div class="control-group">
          <label>Тип палитры:</label>
          <select v-model="paletteType" @change="generateFromBase">
            <option value="analogous">Аналогичная</option>
            <option value="monochromatic">Монохромная</option>
            <option value="triadic">Триадная</option>
            <option value="complementary">Комплементарная</option>
            <option value="splitComplementary">Раздельно-комплементарная</option>
            <option value="square">Квадратная</option>
          </select>
        </div>
        
        <div class="control-group">
          <label>Количество цветов:</label>
          <input type="range" v-model="colorCount" min="3" max="12" @change="generateFromBase">
          <span>{{ colorCount }}</span>
        </div>
      </div>
      
      <div class="control-section">
        <h3>Настроение палитры</h3>
        <div class="mood-buttons">
          <button 
            v-for="mood in moods" 
            :key="mood.id"
            @click="generateByMood(mood)"
            class="mood-btn"
            :style="{ backgroundColor: mood.color }"
          >
            {{ mood.label }}
          </button>
        </div>
      </div>
    </div>
    
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
    
    <div class="action-buttons">
      <button @click="generateRandom" class="btn primary">
        🎲 Случайная палитра
      </button>
      <button @click="saveToLibrary" class="btn success">
        💾 Сохранить
      </button>
      <button @click="resetLocks" class="btn warning">
        🔓 Снять все блокировки
      </button>
    </div>
    
    <div class="color-wheel-section">
      <h3>Цветовой круг</h3>
      <ColorWheel :colors="colors" />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useColorGenerator } from '../composables/useColorGenerator'
import { useLocalStorage } from '../composables/useLocalStorage'
import ColorCard from '../components/ColorCard.vue'
import ColorWheel from '../components/ColorWheel.vue'

export default {
  name: 'GeneratorPage',
  components: {
    ColorCard,
    ColorWheel
  },
  setup() {
    const { 
      colors, 
      colorCount, 
      baseColor,
      paletteType,
      lockedColors,
      generateHarmoniousPalette,
      toggleLockColor,
      generateRandomColor
    } = useColorGenerator()
    
    const displayFormat = ref('hex')
    const { getItem, setItem } = useLocalStorage()
    
    const moods = [
      { id: 1, label: '😌 Спокойная', type: 'calm', color: '#a8e6cf' },
      { id: 2, label: '⚡ Энергичная', type: 'energetic', color: '#ffaaa5' },
      { id: 3, label: '💼 Профессиональная', type: 'professional', color: '#dcedc1' },
      { id: 4, label: '🎨 Творческая', type: 'creative', color: '#ffd3b6' },
      { id: 5, label: '🌿 Природная', type: 'natural', color: '#b5ead7' }
    ]

    onMounted(() => {
      const savedPalette = getItem('currentPalette')
      if (savedPalette) {
        colors.value = savedPalette.colors
        colorCount.value = savedPalette.count || 5
      } else {
        generateHarmoniousPalette()
      }
    })

    const generateFromBase = () => {
      generateHarmoniousPalette()
      saveCurrentPalette()
    }

    const generateByMood = (mood) => {
      // Логика генерации по настроению
      const moodGenerators = {
        calm: () => generateCalmPalette(),
        energetic: () => generateEnergeticPalette(),
        professional: () => generateProfessionalPalette(),
        creative: () => generateCreativePalette(),
        natural: () => generateNaturalPalette()
      }
      
      if (moodGenerators[mood.type]) {
        moodGenerators[mood.type]()
      }
      saveCurrentPalette()
    }

    const generateCalmPalette = () => {
      const baseHue = 200 // Сине-голубые тона
      colors.value = Array.from({ length: colorCount.value }, (_, i) => {
        const hue = (baseHue + i * 20) % 360
        return hslToHex(hue, 40 + Math.random() * 20, 60 + Math.random() * 20)
      })
    }

    const generateEnergeticPalette = () => {
      const baseHue = 0 // Красные и оранжевые тона
      colors.value = Array.from({ length: colorCount.value }, (_, i) => {
        const hue = (baseHue + i * 40) % 360
        return hslToHex(hue, 80 + Math.random() * 15, 50 + Math.random() * 20)
      })
    }

    const generateProfessionalPalette = () => {
      const baseHue = 220 // Синие и серые тона
      colors.value = Array.from({ length: colorCount.value }, (_, i) => {
        const hue = (baseHue + i * 15) % 360
        return hslToHex(hue, 30 + Math.random() * 20, 40 + Math.random() * 20)
      })
    }

    const generateCreativePalette = () => {
      colors.value = Array.from({ length: colorCount.value }, () => {
        const hue = Math.floor(Math.random() * 360)
        return hslToHex(hue, 70 + Math.random() * 25, 50 + Math.random() * 30)
      })
    }

    const generateNaturalPalette = () => {
      const naturalHues = [120, 140, 60, 30, 0] // Зеленые, земляные тона
      colors.value = Array.from({ length: colorCount.value }, (_, i) => {
        const hue = naturalHues[i % naturalHues.length]
        return hslToHex(hue, 50 + Math.random() * 30, 40 + Math.random() * 30)
      })
    }

    const hslToHex = (h, s, l) => {
      h /= 360
      s /= 100
      l /= 100
      
      let r, g, b
      
      if (s === 0) {
        r = g = b = l
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1
          if (t > 1) t -= 1
          if (t < 1/6) return p + (q - p) * 6 * t
          if (t < 1/2) return q
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
          return p
        }
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        
        r = hue2rgb(p, q, h + 1/3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1/3)
      }
      
      const toHex = x => {
        const hex = Math.round(x * 255).toString(16)
        return hex.length === 1 ? '0' + hex : hex
      }
      
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`
    }

    const generateRandom = () => {
      colors.value = Array.from({ length: colorCount.value }, () => generateRandomColor())
      saveCurrentPalette()
    }

    const resetLocks = () => {
      lockedColors.value = []
    }

    const saveCurrentPalette = () => {
      setItem('currentPalette', {
        colors: colors.value,
        count: colorCount.value,
        baseColor: baseColor.value,
        paletteType: paletteType.value
      })
    }

    const saveToLibrary = () => {
      const library = getItem('paletteLibrary') || []
      const name = prompt('Введите название палитры:', 
        `${paletteType.value} палитра ${new Date().toLocaleDateString()}`)
      
      if (name) {
        const newPalette = {
          id: Date.now(),
          name,
          colors: [...colors.value],
          baseColor: baseColor.value,
          paletteType: paletteType.value,
          createdAt: new Date().toISOString()
        }
        library.push(newPalette)
        setItem('paletteLibrary', library)
        alert('Палитра сохранена в библиотеку!')
      }
    }

    return {
      colors,
      colorCount,
      baseColor,
      paletteType,
      displayFormat,
      lockedColors,
      moods,
      generateFromBase,
      generateByMood,
      generateRandom,
      toggleLockColor,
      resetLocks,
      saveToLibrary
    }
  }
}
</script>

<style scoped>
.generator-page {
  max-width: 1200px;
  margin: 0 auto;
}

.generator-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin: 2rem 0;
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.control-section h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.control-group {
  margin-bottom: 1rem;
}

.control-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #495057;
}

.control-group input[type="color"] {
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.control-group select,
.control-group input[type="range"] {
  width: 100%;
  padding: 8px;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  font-size: 1rem;
}

.mood-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mood-btn {
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: white;
  font-weight: bold;
  transition: transform 0.2s;
}

.mood-btn:hover {
  transform: translateY(-2px);
}

.palette-display {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  margin: 2rem 0;
  padding: 2rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: transform 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
}

.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.success {
  background: #28a745;
  color: white;
}

.warning {
  background: #ffc107;
  color: #212529;
}

.color-wheel-section {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  margin-top: 2rem;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.color-wheel-section h3 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}
</style>