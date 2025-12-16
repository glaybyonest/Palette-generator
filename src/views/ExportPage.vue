<template>
  <div class="export-page">
    <h2>📤 Экспорт цветовых палитр</h2>
    
    <div class="export-container">
      <!-- Выбор палитры для экспорта -->
      <div class="palette-selector">
        <h3>Выберите палитру для экспорта</h3>
        <div class="palettes-grid">
          <div 
            v-for="palette in palettes"
            :key="palette.id"
            class="palette-option"
            :class="{ selected: selectedPalette?.id === palette.id }"
            @click="selectPalette(palette)"
          >
            <div class="palette-colors">
              <div 
                v-for="color in palette.colors.slice(0, 5)"
                :key="color"
                class="palette-color"
                :style="{ backgroundColor: color }"
              ></div>
            </div>
            <div class="palette-info">
              <h4>{{ palette.name }}</h4>
              <span class="palette-date">{{ formatDate(palette.createdAt) }}</span>
            </div>
          </div>
        </div>
        
        <div v-if="palettes.length === 0" class="empty-palettes">
          <p>Нет сохраненных палитр. Сначала создайте палитру в генераторе!</p>
          <router-link to="/generator" class="btn primary">
            Перейти к генератору
          </router-link>
        </div>
      </div>
      
      <!-- Настройки экспорта -->
      <div class="export-settings" v-if="selectedPalette">
        <h3>Настройки экспорта</h3>
        
        <div class="format-selector">
          <h4>Формат экспорта:</h4>
          <div class="format-buttons">
            <button 
              v-for="format in exportFormats"
              :key="format.id"
              @click="selectFormat(format)"
              class="format-btn"
              :class="{ active: selectedFormat.id === format.id }"
            >
              {{ format.name }}
            </button>
          </div>
        </div>
        
        <!-- Предпросмотр кода -->
        <div class="code-preview">
          <h4>Предпросмотр:</h4>
          <div class="preview-header">
            <span>{{ selectedFormat.name }}</span>
            <button @click="copyCode" class="copy-btn">
              📋 Копировать код
            </button>
          </div>
          <pre class="code-block"><code>{{ generatedCode }}</code></pre>
        </div>
        
        <!-- Дополнительные настройки -->
        <div class="advanced-settings">
          <h4>Дополнительные настройки</h4>
          
          <div class="settings-grid">
            <div class="setting-item">
              <label>
                <input type="checkbox" v-model="settings.addComments">
                Добавить комментарии
              </label>
            </div>
            
            <div class="setting-item">
              <label>
                <input type="checkbox" v-model="settings.useCamelCase">
                Использовать camelCase
              </label>
            </div>
            
            <div class="setting-item">
              <label>
                <input type="checkbox" v-model="settings.includePrefix">
                Добавить префикс
              </label>
              <input 
                v-if="settings.includePrefix"
                type="text" 
                v-model="settings.prefix"
                placeholder="palette-"
                class="prefix-input"
              >
            </div>
            
            <div class="setting-item">
              <label>Название переменных:</label>
              <select v-model="settings.namingStyle" class="naming-select">
                <option value="descriptive">Описательные (primary, secondary)</option>
                <option value="functional">Функциональные (bg-primary, text-primary)</option>
                <option value="numbered">Нумерованные (color-1, color-2)</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Кнопки экспорта -->
        <div class="export-actions">
          <button @click="downloadFile" class="btn primary large">
            ⬇️ Скачать файл
          </button>
          <button @click="copyCode" class="btn secondary large">
            📋 Копировать код
          </button>
          <button @click="sharePalette" class="btn success large">
            🔗 Поделиться ссылкой
          </button>
        </div>
      </div>
      
      <!-- Примеры использования -->
      <div class="usage-examples" v-if="selectedPalette">
        <h3>Примеры использования</h3>
        
        <div class="examples-grid">
          <div class="example-card">
            <h4>HTML/CSS</h4>
            <pre class="example-code"><code>.primary-button {
  background-color: {{ selectedPalette.colors[0] }};
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
}</code></pre>
          </div>
          
          <div class="example-card">
            <h4>React/Styled Components</h4>
            <pre class="example-code"><code>const Button = styled.button`
  background: ${props => props.primary ? '{{ selectedPalette.colors[1] }}' : 'white'};
  color: ${props => props.primary ? 'white' : '{{ selectedPalette.colors[1] }}'};
`;</code></pre>
          </div>
          
          <div class="example-card">
            <h4>Tailwind CSS</h4>
            <pre class="example-code"><code>/* tailwind.config.js */
module.exports = {
  theme: {
    extend: {
      colors: {
        'palette-primary': '{{ selectedPalette.colors[0] }}',
        'palette-secondary': '{{ selectedPalette.colors[1] }}',
      }
    }
  }
}</code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useLocalStorage } from '../composables/useLocalStorage'

export default {
  name: 'ExportPage',
  setup() {
    const { getItem } = useLocalStorage()
    
    const palettes = ref([])
    const selectedPalette = ref(null)
    const selectedFormat = ref(null)
    
    const settings = ref({
      addComments: true,
      useCamelCase: true,
      includePrefix: true,
      prefix: 'palette-',
      namingStyle: 'descriptive'
    })
    
    const exportFormats = [
      { id: 'css', name: 'CSS Variables', extension: '.css' },
      { id: 'scss', name: 'SCSS Variables', extension: '.scss' },
      { id: 'less', name: 'LESS Variables', extension: '.less' },
      { id: 'js', name: 'JavaScript Object', extension: '.js' },
      { id: 'json', name: 'JSON', extension: '.json' },
      { id: 'tailwind', name: 'Tailwind Config', extension: '.js' },
      { id: 'styled', name: 'Styled Components', extension: '.js' }
    ]
    
    // Загрузка палитр
    onMounted(() => {
      loadPalettes()
      selectedFormat.value = exportFormats[0]
    })
    
    const loadPalettes = () => {
      palettes.value = getItem('paletteLibrary') || []
      if (palettes.value.length > 0) {
        selectedPalette.value = palettes.value[0]
      }
    }
    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('ru-RU')
    }
    
    const selectPalette = (palette) => {
      selectedPalette.value = palette
    }
    
    const selectFormat = (format) => {
      selectedFormat.value = format
    }
    
    // Генерация кода в зависимости от формата
    const generatedCode = computed(() => {
      if (!selectedPalette.value || !selectedFormat.value) return ''
      
      const palette = selectedPalette.value
      const format = selectedFormat.value.id
      const s = settings.value
      
      const getVariableName = (index) => {
        const names = {
          descriptive: ['primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'info', 'light', 'dark'],
          functional: ['bg-primary', 'text-primary', 'border-primary', 'bg-secondary', 'text-secondary'],
          numbered: ['color-1', 'color-2', 'color-3', 'color-4', 'color-5']
        }
        
        const style = s.namingStyle
        const nameList = names[style] || names.descriptive
        const baseName = nameList[index] || `color-${index + 1}`
        
        return s.includePrefix ? `${s.prefix}${baseName}` : baseName
      }
      
      let code = ''
      
      switch (format) {
        case 'css':
          code = ':root {\n'
          palette.colors.forEach((color, index) => {
            const varName = getVariableName(index)
            const formattedName = s.useCamelCase ? 
              varName.replace(/-([a-z])/g, (g) => g[1].toUpperCase()) : 
              varName
            code += `  --${formattedName}: ${color};\n`
          })
          code += '}'
          break
          
        case 'scss':
          palette.colors.forEach((color, index) => {
            const varName = getVariableName(index)
            code += `$${varName}: ${color};\n`
          })
          break
          
        case 'less':
          palette.colors.forEach((color, index) => {
            const varName = getVariableName(index)
            code += `@${varName}: ${color};\n`
          })
          break
          
        case 'js':
          code = 'const colors = {\n'
          palette.colors.forEach((color, index) => {
            const varName = getVariableName(index)
            const jsName = s.useCamelCase ? 
              varName.replace(/-([a-z])/g, (g) => g[1].toUpperCase()) : 
              varName
            code += `  ${jsName}: '${color}',\n`
          })
          code += '}\n\nexport default colors;'
          break
          
        case 'json':
          const jsonObj = {}
          palette.colors.forEach((color, index) => {
            const varName = getVariableName(index)
            const jsName = s.useCamelCase ? 
              varName.replace(/-([a-z])/g, (g) => g[1].toUpperCase()) : 
              varName
            jsonObj[jsName] = color
          })
          code = JSON.stringify(jsonObj, null, 2)
          break
          
        case 'tailwind':
          code = 'module.exports = {\n'
          code += '  theme: {\n'
          code += '    extend: {\n'
          code += '      colors: {\n'
          palette.colors.forEach((color, index) => {
            const varName = getVariableName(index)
            const tailwindName = varName.replace('palette-', '')
            code += `        '${tailwindName}': '${color}',\n`
          })
          code += '      }\n'
          code += '    }\n'
          code += '  }\n'
          code += '}'
          break
          
        case 'styled':
          code = 'import styled from "styled-components";\n\n'
          code += '// Color palette\n'
          palette.colors.forEach((color, index) => {
            const varName = getVariableName(index)
            const jsName = s.useCamelCase ? 
              varName.replace(/-([a-z])/g, (g) => g[1].toUpperCase()) : 
              varName
            code += `export const ${jsName} = '${color}';\n`
          })
          code += '\n// Usage example:\n'
          code += 'const Button = styled.button`\n'
          code += `  background: \${${getVariableName(0).replace(/-([a-z])/g, (g) => g[1].toUpperCase())}};\n`
          code += '  color: white;\n'
          code += '  padding: 10px 20px;\n'
          code += '`;'
          break
      }
      
      // Добавление комментариев
      if (s.addComments) {
        const comment = format === 'css' ? '/*' : '//'
        const header = `${comment} ${palette.name}\n${comment} Generated: ${new Date().toLocaleString()}\n${comment}\n\n`
        code = header + code
      }
      
      return code
    })
    
    // Копирование кода в буфер обмена
    const copyCode = async () => {
      try {
        await navigator.clipboard.writeText(generatedCode.value)
        alert('Код скопирован в буфер обмена!')
      } catch (err) {
        console.error('Ошибка копирования:', err)
      }
    }
    
    // Скачивание файла
    const downloadFile = () => {
      const blob = new Blob([generatedCode.value], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedPalette.value.name.toLowerCase().replace(/\s+/g, '-')}${selectedFormat.value.extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
    
    // Поделиться ссылкой
    const sharePalette = () => {
      if (!selectedPalette.value) return
      
      const paletteData = encodeURIComponent(JSON.stringify(selectedPalette.value))
      const url = `${window.location.origin}/share?palette=${paletteData}`
      
      if (navigator.share) {
        navigator.share({
          title: `Палитра: ${selectedPalette.value.name}`,
          text: 'Посмотрите эту цветовую палитру!',
          url: url
        })
      } else {
        navigator.clipboard.writeText(url)
        alert('Ссылка скопирована в буфер обмена!')
      }
    }
    
    return {
      palettes,
      selectedPalette,
      selectedFormat,
      exportFormats,
      settings,
      generatedCode,
      formatDate,
      selectPalette,
      selectFormat,
      copyCode,
      downloadFile,
      sharePalette
    }
  }
}
</script>

<style scoped>
.export-page {
  max-width: 1200px;
  margin: 0 auto;
}

.export-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.palette-selector {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.palettes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
}

.palette-option {
  border: 2px solid #dee2e6;
  border-radius: 10px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.palette-option:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.palette-option.selected {
  border-color: #667eea;
  background: #f0f4ff;
}

.palette-colors {
  display: flex;
  gap: 2px;
  margin-bottom: 0.75rem;
}

.palette-color {
  flex: 1;
  height: 30px;
  border-radius: 4px;
}

.palette-info h4 {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
}

.palette-date {
  font-size: 0.9rem;
  color: #6c757d;
}

.empty-palettes {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.empty-palettes .btn {
  display: inline-block;
  margin-top: 1rem;
}

.export-settings {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.format-selector {
  margin-bottom: 2rem;
}

.format-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.format-btn {
  padding: 8px 16px;
  border: 2px solid #dee2e6;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.format-btn:hover {
  border-color: #667eea;
}

.format-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.code-preview {
  margin: 2rem 0;
  background: #f8f9fa;
  border-radius: 10px;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #2c3e50;
  color: white;
}

.copy-btn {
  padding: 6px 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.code-block {
  margin: 0;
  padding: 1.5rem;
  background: #1a1a1a;
  color: #f8f8f2;
  overflow-x: auto;
  max-height: 300px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
}

.advanced-settings {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  margin: 1.5rem 0;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-item label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.prefix-input {
  padding: 6px 10px;
  border: 2px solid #dee2e6;
  border-radius: 4px;
  margin-top: 0.5rem;
}

.naming-select {
  padding: 6px 10px;
  border: 2px solid #dee2e6;
  border-radius: 4px;
  background: white;
}

.export-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin: 2rem 0;
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

.btn.large {
  padding: 15px 30px;
  font-size: 1.1rem;
}

.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.secondary {
  background: #6c757d;
  color: white;
}

.success {
  background: #28a745;
  color: white;
}

.usage-examples {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.example-card {
  border: 1px solid #dee2e6;
  border-radius: 10px;
  padding: 1rem;
}

.example-card h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.example-code {
  margin: 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.85rem;
  overflow-x: auto;
}
</style>