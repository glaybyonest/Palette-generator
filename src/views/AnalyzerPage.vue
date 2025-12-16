<template>
  <div class="analyzer-page">
    <h2>🔍 Анализатор доступности</h2>
    
    <div class="analyzer-container">
      <!-- Выбор цветов для анализа -->
      <div class="color-selection">
        <h3>Выберите цвета для анализа</h3>
        <div class="color-inputs">
          <div class="color-input-group">
            <label>Цвет текста:</label>
            <input type="color" v-model="textColor">
            <input type="text" v-model="textColor" class="color-text">
          </div>
          <div class="color-input-group">
            <label>Цвет фона:</label>
            <input type="color" v-model="backgroundColor">
            <input type="text" v-model="backgroundColor" class="color-text">
          </div>
        </div>
        
        <div class="color-selection-actions">
          <button @click="checkContrast" class="btn primary">
            Проверить контрастность
          </button>
          <button @click="loadFromApi" class="btn secondary">
            Получить из внешнего API
          </button>
        </div>
      </div>
      
      <!-- Результаты анализа -->
      <div class="analysis-results" v-if="contrastResults">
        <h3>Результаты проверки WCAG</h3>
        
        <div class="contrast-display">
          <div 
            class="preview-box"
            :style="{ 
              backgroundColor: backgroundColor,
              color: textColor
            }"
          >
            <h4>Пример текста</h4>
            <p>Это пример текста для проверки контрастности.</p>
          </div>
          
          <div class="results-details">
            <div class="result-item">
              <strong>Соотношение контраста:</strong>
              <span class="contrast-ratio">{{ contrastResults.ratio.toFixed(2) }}:1</span>
            </div>
            
            <div class="result-item">
              <strong>WCAG AA (Normal text):</strong>
              <span :class="contrastResults.aa.normal.passed ? 'passed' : 'failed'">
                {{ contrastResults.aa.normal.passed ? '✅ Проходит' : '❌ Не проходит' }}
                ({{ contrastResults.aa.normal.required }}:1)
              </span>
            </div>
            
            <div class="result-item">
              <strong>WCAG AA (Large text):</strong>
              <span :class="contrastResults.aa.large.passed ? 'passed' : 'failed'">
                {{ contrastResults.aa.large.passed ? '✅ Проходит' : '❌ Не проходит' }}
                ({{ contrastResults.aa.large.required }}:1)
              </span>
            </div>
            
            <div class="result-item">
              <strong>WCAG AAA (Normal text):</strong>
              <span :class="contrastResults.aaa.normal.passed ? 'passed' : 'failed'">
                {{ contrastResults.aaa.normal.passed ? '✅ Проходит' : '❌ Не проходит' }}
                ({{ contrastResults.aaa.normal.required }}:1)
              </span>
            </div>
            
            <div class="result-item">
              <strong>WCAG AAA (Large text):</strong>
              <span :class="contrastResults.aaa.large.passed ? 'passed' : 'failed'">
                {{ contrastResults.aaa.large.passed ? '✅ Проходит' : '❌ Не проходит' }}
                ({{ contrastResults.aaa.large.required }}:1)
              </span>
            </div>
            
            <div class="recommendations" v-if="contrastResults.recommendations.length > 0">
              <h4>Рекомендации:</h4>
              <ul>
                <li v-for="(rec, index) in contrastResults.recommendations" :key="index">
                  {{ rec }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Цветовой круг -->
      <div class="color-wheel-section">
        <h3>Цветовой круг</h3>
        <p>Визуализация гармоничных цветовых схем</p>
        <div class="wheel-container">
          <canvas ref="colorWheelCanvas" width="400" height="400"></canvas>
        </div>
      </div>
      
      <!-- Подбор акцентных цветов -->
      <div class="accent-colors">
        <h3>Подбор акцентных цветов</h3>
        <div class="base-color-selector">
          <label>Базовый цвет:</label>
          <input type="color" v-model="baseAccentColor">
        </div>
        
        <button @click="generateAccentColors" class="btn secondary">
          Подобрать акцентные цвета
        </button>
        
        <div class="accent-palette" v-if="accentColors.length > 0">
          <div 
            v-for="(color, index) in accentColors" 
            :key="index"
            class="accent-color"
            :style="{ backgroundColor: color }"
            @click="copyColor(color)"
          >
            <span>{{ color }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'AnalyzerPage',
  setup() {
    const textColor = ref('#ffffff')
    const backgroundColor = ref('#333333')
    const contrastResults = ref(null)
    const baseAccentColor = ref('#667eea')
    const accentColors = ref([])
    const colorWheelCanvas = ref(null)

    // Рассчет яркости цвета
    const calculateLuminance = (hex) => {
      const rgb = parseInt(hex.slice(1), 16)
      const r = (rgb >> 16) & 0xff
      const g = (rgb >> 8) & 0xff
      const b = rgb & 0xff
      
      const sR = r / 255
      const sG = g / 255
      const sB = b / 255
      
      const rLinear = sR <= 0.03928 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4)
      const gLinear = sG <= 0.03928 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4)
      const bLinear = sB <= 0.03928 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4)
      
      return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear
    }

    // Рассчет контрастности
    const calculateContrast = (color1, color2) => {
      const lum1 = calculateLuminance(color1)
      const lum2 = calculateLuminance(color2)
      const brightest = Math.max(lum1, lum2)
      const darkest = Math.min(lum1, lum2)
      return (brightest + 0.05) / (darkest + 0.05)
    }

    // Проверка контрастности по WCAG
    const checkContrast = () => {
      const ratio = calculateContrast(textColor.value, backgroundColor.value)
      
      const results = {
        ratio,
        aa: {
          normal: {
            required: 4.5,
            passed: ratio >= 4.5
          },
          large: {
            required: 3.0,
            passed: ratio >= 3.0
          }
        },
        aaa: {
          normal: {
            required: 7.0,
            passed: ratio >= 7.0
          },
          large: {
            required: 4.5,
            passed: ratio >= 4.5
          }
        },
        recommendations: []
      }
      
      // Формирование рекомендаций
      if (!results.aa.normal.passed) {
        results.recommendations.push('Увеличьте контрастность для обычного текста (минимум 4.5:1)')
      }
      if (!results.aa.large.passed) {
        results.recommendations.push('Увеличьте контрастность для крупного текста (минимум 3:1)')
      }
      if (results.aaa.normal.passed) {
        results.recommendations.push('Отличная контрастность! Соответствует стандарту AAA для обычного текста')
      }
      if (results.aaa.large.passed) {
        results.recommendations.push('Отличная контрастность! Соответствует стандарту AAA для крупного текста')
      }
      
      contrastResults.value = results
    }

    // Генерация акцентных цветов
    const generateAccentColors = () => {
      const baseHex = baseAccentColor.value.replace('#', '')
      const baseRgb = parseInt(baseHex, 16)
      
      accentColors.value = [
        baseAccentColor.value,
        adjustHue(baseRgb, 30),
        adjustHue(baseRgb, 60),
        adjustHue(baseRgb, 120),
        adjustHue(baseRgb, 180),
        adjustHue(baseRgb, 240),
        adjustHue(baseRgb, 300),
        adjustHue(baseRgb, 330)
      ]
    }

    // Корректировка оттенка
    const adjustHue = (rgb, degrees) => {
      const r = (rgb >> 16) & 0xff
      const g = (rgb >> 8) & 0xff
      const b = rgb & 0xff
      
      // Преобразование RGB в HSL
      const rNorm = r / 255
      const gNorm = g / 255
      const bNorm = b / 255
      
      const max = Math.max(rNorm, gNorm, bNorm)
      const min = Math.min(rNorm, gNorm, bNorm)
      let h, s, l = (max + min) / 2
      
      if (max === min) {
        h = s = 0
      } else {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        
        switch (max) {
          case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break
          case gNorm: h = (bNorm - rNorm) / d + 2; break
          case bNorm: h = (rNorm - gNorm) / d + 4; break
        }
        h /= 6
      }
      
      // Корректировка оттенка
      h = (h * 360 + degrees) % 360 / 360
      
      // Преобразование обратно в RGB
      let r2, g2, b2
      
      if (s === 0) {
        r2 = g2 = b2 = l
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
        
        r2 = hue2rgb(p, q, h + 1/3)
        g2 = hue2rgb(p, q, h)
        b2 = hue2rgb(p, q, h - 1/3)
      }
      
      const toHex = x => {
        const hex = Math.round(x * 255).toString(16)
        return hex.length === 1 ? '0' + hex : hex
      }
      
      return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`
    }

    // Копирование цвета
    const copyColor = async (color) => {
      try {
        await navigator.clipboard.writeText(color)
        alert(`Цвет ${color} скопирован!`)
      } catch (err) {
        console.error('Ошибка копирования:', err)
      }
    }

    // Загрузка цвета из внешнего API (thecolorapi.com)
    const loadFromApi = async () => {
      try {
        const hex = textColor.value.replace('#', '')
        const response = await fetch(`https://www.thecolorapi.com/id?hex=${hex}`)
        if (!response.ok) {
          throw new Error('API error')
        }
        const data = await response.json()
        if (data.hex && data.hex.value) {
          textColor.value = data.hex.value
        }
        if (data._links && data._links.self && data._links.self.href) {
          // пробуем получить комплементарный цвет
          const compResponse = await fetch(`https://www.thecolorapi.com/scheme?hex=${hex}&mode=complement&count=2`)
          if (compResponse.ok) {
            const compData = await compResponse.json()
            if (compData.colors && compData.colors[1] && compData.colors[1].hex) {
              backgroundColor.value = compData.colors[1].hex.value
            }
          }
        }
        checkContrast()
      } catch (error) {
        console.error('Ошибка при обращении к внешнему API:', error)
        alert('Не удалось получить данные цвета из внешнего API. Проверьте подключение к сети.')
      }
    }

    // Рисование цветового круга
    const drawColorWheel = () => {
      const canvas = colorWheelCanvas.value
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = 150
      
      // Очистка canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Рисование цветового круга
      for (let angle = 0; angle < 360; angle += 1) {
        const startAngle = (angle - 2) * Math.PI / 180
        const endAngle = angle * Math.PI / 180
        
        for (let r = 0; r < radius; r++) {
          const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius
          )
          
          const hue = angle
          const saturation = r / radius * 100
          const lightness = 50
          
          const color = hslToHex(hue, saturation, lightness)
          gradient.addColorStop(r / radius, color)
          
          ctx.beginPath()
          ctx.arc(centerX, centerY, r, startAngle, endAngle)
          ctx.strokeStyle = gradient
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }
      
      // Центральная точка
      ctx.beginPath()
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2)
      ctx.fillStyle = '#000'
      ctx.fill()
    }

    // Преобразование HSL в HEX
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

    onMounted(() => {
      checkContrast()
      generateAccentColors()
      drawColorWheel()
    })

    return {
      textColor,
      backgroundColor,
      contrastResults,
      baseAccentColor,
      accentColors,
      colorWheelCanvas,
      loadFromApi,
      checkContrast,
      generateAccentColors,
      copyColor
    }
  }
}
</script>

<style scoped>
.analyzer-page {
  max-width: 1200px;
  margin: 0 auto;
}

.analyzer-container {
  display: grid;
  gap: 2rem;
}

.color-selection {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.color-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.color-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.color-input-group label {
  font-weight: bold;
  color: #495057;
}

.color-input-group input[type="color"] {
  width: 60px;
  height: 40px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.color-text {
  padding: 8px;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  font-family: monospace;
}

.color-selection-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.analysis-results {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.contrast-display {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  margin-top: 1.5rem;
}

.preview-box {
  padding: 2rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.preview-box h4 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.results-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.contrast-ratio {
  font-weight: bold;
  font-size: 1.2rem;
  color: #667eea;
}

.passed {
  color: #28a745;
  font-weight: bold;
}

.failed {
  color: #dc3545;
  font-weight: bold;
}

.recommendations {
  margin-top: 1rem;
  padding: 1rem;
  background: #e9ecef;
  border-radius: 6px;
}

.recommendations ul {
  margin: 0.5rem 0 0 1.5rem;
}

.color-wheel-section {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  text-align: center;
}

.wheel-container {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.accent-colors {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.base-color-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
}

.base-color-selector input[type="color"] {
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.accent-palette {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.accent-color {
  flex: 1;
  min-width: 100px;
  height: 80px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;
  overflow: hidden;
}

.accent-color:hover {
  transform: translateY(-3px);
}

.accent-color span {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 3px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.8rem;
}

.btn {
  padding: 10px 20px;
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

.secondary {
  background: #6c757d;
  color: white;
}
</style>