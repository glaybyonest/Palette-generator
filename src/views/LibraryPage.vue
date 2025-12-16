<template>
  <div class="library-page">
    <h2>📚 Библиотека палитр</h2>
    
    <div class="library-controls">
      <div class="search-filter">
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="Поиск по названию или цвету..."
          class="search-input"
        >
        <select v-model="filterTag" class="filter-select">
          <option value="">Все теги</option>
          <option v-for="tag in uniqueTags" :key="tag">{{ tag }}</option>
        </select>
        <label class="favorite-toggle">
          <input type="checkbox" v-model="onlyFavorites">
          Только избранные
        </label>
        <button @click="showCreateModal = true" class="btn primary">
          + Создать новую коллекцию
        </button>
      </div>
    </div>
    
    <div class="collections-grid">
      <div 
        v-for="collection in filteredCollections"
        :key="collection.id"
        class="collection-card"
      >
        <div class="collection-header">
          <h3>{{ collection.name }}</h3>
          <div class="collection-meta">
            <button 
              class="favorite-btn" 
              :class="{ active: collection.isFavorite }"
              @click.stop="toggleFavorite(collection)"
              :title="collection.isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'"
            >
              {{ collection.isFavorite ? '★' : '☆' }}
            </button>
            <span class="date">{{ formatDate(collection.createdAt) }}</span>
            <span class="count">{{ collection.palettes.length }} палитр</span>
          </div>
        </div>
        
        <div class="collection-tags">
          <span 
            v-for="tag in collection.tags" 
            :key="tag"
            class="tag"
          >
            {{ tag }}
          </span>
        </div>
        
        <div class="preview-palettes">
          <div 
            v-for="(palette, index) in collection.palettes.slice(0, 3)"
            :key="index"
            class="palette-preview"
          >
            <div class="palette-colors">
              <div 
                v-for="color in palette.colors.slice(0, 5)"
                :key="color"
                class="preview-color"
                :style="{ backgroundColor: color }"
                :title="color"
              ></div>
            </div>
          </div>
        </div>
        
        <div class="collection-actions">
          <button @click="editCollection(collection)" class="btn small">
            ✏️ Редактировать
          </button>
          <button @click="openCollection(collection)" class="btn small primary">
            👁️ Просмотреть
          </button>
          <button @click="deleteCollection(collection.id)" class="btn small danger">
            🗑️ Удалить
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="filteredCollections.length === 0" class="empty-library">
      <p>Библиотека пуста. Создайте первую коллекцию!</p>
    </div>
    
    <!-- Модальное окно создания коллекции -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal-content">
        <h3>{{ editingCollection ? 'Редактировать' : 'Создать' }} коллекцию</h3>
        
        <div class="form-group">
          <label>Название коллекции:</label>
          <input type="text" v-model="newCollection.name" class="form-input">
        </div>
        
        <div class="form-group">
          <label>Теги (через запятую):</label>
          <input 
            type="text" 
            v-model="newCollection.tagsString"
            placeholder="дизайн, веб, интерьер"
            class="form-input"
          >
        </div>
        
        <div class="form-group">
          <label>Выберите палитры:</label>
          <div class="palettes-selector">
            <div 
              v-for="palette in availablePalettes"
              :key="palette.id"
              class="palette-option"
              :class="{ selected: newCollection.paletteIds.includes(palette.id) }"
              @click="togglePaletteSelection(palette.id)"
            >
              <div class="option-colors">
                <div 
                  v-for="color in palette.colors.slice(0, 5)"
                  :key="color"
                  class="option-color"
                  :style="{ backgroundColor: color }"
                ></div>
              </div>
              <span class="option-name">{{ palette.name }}</span>
            </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="saveCollection" class="btn primary">
            {{ editingCollection ? 'Сохранить' : 'Создать' }}
          </button>
          <button @click="showCreateModal = false" class="btn">
            Отмена
          </button>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно просмотра коллекции -->
    <div v-if="selectedCollection" class="modal-overlay" @click.self="selectedCollection = null">
      <div class="modal-content large">
        <h3>{{ selectedCollection.name }}</h3>
        
        <div class="collection-details">
          <div class="collection-info">
            <p><strong>Создана:</strong> {{ formatDate(selectedCollection.createdAt) }}</p>
            <p><strong>Теги:</strong> {{ selectedCollection.tags.join(', ') }}</p>
            <p>
              <strong>Избранная:</strong>
              {{ selectedCollection.isFavorite ? 'Да' : 'Нет' }}
            </p>
          </div>
          
          <div class="collection-palettes">
            <div 
              v-for="palette in selectedCollection.palettes"
              :key="palette.id"
              class="full-palette"
            >
              <div class="full-palette-header">
                <h4>{{ palette.name }}</h4>
                <div class="full-palette-actions">
                  <button class="btn small" @click="startEditPalette(palette)">
                    ✏️ Редактировать палитру
                  </button>
                </div>
              </div>
              <div class="palette-colors-full">
                <div 
                  v-for="color in palette.colors"
                  :key="color"
                  class="full-color"
                  :style="{ backgroundColor: color }"
                  @click="copyColor(color)"
                >
                  <span>{{ color }}</span>
                </div>
              </div>
              <div class="palette-actions">
                <button @click="exportPalette(palette)" class="btn small">
                  📤 Экспорт
                </button>
                <button @click="duplicatePalette(palette)" class="btn small">
                  📋 Дублировать
                </button>
                <button @click="removeFromCollection(palette.id)" class="btn small danger">
                  🗑️ Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="selectedCollection = null" class="btn">
            Закрыть
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно редактирования палитры -->
    <div v-if="editingPalette" class="modal-overlay" @click.self="cancelEditPalette">
      <div class="modal-content">
        <h3>Редактировать палитру</h3>

        <div class="form-group">
          <label>Название палитры:</label>
          <input type="text" v-model="editingPaletteDraft.name" class="form-input">
        </div>

        <div class="form-group">
          <label>Цвета палитры:</label>
          <div class="edit-colors-list">
            <div 
              v-for="(color, index) in editingPaletteDraft.colors" 
              :key="index"
              class="edit-color-row"
            >
              <input 
                type="color" 
                v-model="editingPaletteDraft.colors[index]" 
                class="color-input"
              >
              <input 
                type="text" 
                v-model="editingPaletteDraft.colors[index]" 
                class="color-text-input"
              >
              <button class="btn small danger" @click="removeColorFromEditing(index)">
                🗑️
              </button>
            </div>
          </div>
          <button class="btn small" @click="addColorToEditing">
            + Добавить цвет
          </button>
        </div>

        <div class="modal-actions">
          <button @click="saveEditedPalette" class="btn primary">
            Сохранить изменения
          </button>
          <button @click="cancelEditPalette" class="btn">
            Отмена
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useLocalStorage } from '../composables/useLocalStorage'

export default {
  name: 'LibraryPage',
  setup() {
    const { getItem, setItem } = useLocalStorage()
    
    const collections = ref([])
    const searchQuery = ref('')
    const filterTag = ref('')
    const onlyFavorites = ref(false)
    const showCreateModal = ref(false)
    const selectedCollection = ref(null)
    const editingCollection = ref(null)
    const editingPalette = ref(null)
    const editingPaletteDraft = ref({
      id: null,
      name: '',
      colors: []
    })
    
    const newCollection = ref({
      name: '',
      tagsString: '',
      paletteIds: []
    })
    
    // Загрузка данных из localStorage
    onMounted(() => {
      loadCollections()
    })
    
    // Загрузка коллекций
    const loadCollections = () => {
      const savedCollections = getItem('paletteCollections') || []
      const savedPalettes = getItem('paletteLibrary') || []
      
      // Объединяем данные
      collections.value = savedCollections.map(collection => ({
        ...collection,
        palettes: collection.paletteIds
          .map(id => savedPalettes.find(p => p.id === id))
          .filter(Boolean)
      }))
    }
    
    // Уникальные теги
    const uniqueTags = computed(() => {
      const tags = new Set()
      collections.value.forEach(collection => {
        collection.tags?.forEach(tag => tags.add(tag))
      })
      return Array.from(tags)
    })
    
    // Доступные палитры
    const availablePalettes = computed(() => {
      return getItem('paletteLibrary') || []
    })
    
    // Отфильтрованные коллекции
    const filteredCollections = computed(() => {
      return collections.value.filter(collection => {
        const matchesSearch = !searchQuery.value || 
          collection.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          collection.tags?.some(tag => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))
        
        const matchesTag = !filterTag.value || 
          collection.tags?.includes(filterTag.value)

        const matchesFavorite = !onlyFavorites.value || collection.isFavorite
        
        return matchesSearch && matchesTag && matchesFavorite
      })
    })
    
    // Форматирование даты
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('ru-RU')
    }
    
    // Создание/редактирование коллекции
    const editCollection = (collection) => {
      editingCollection.value = collection
      newCollection.value = {
        name: collection.name,
        tagsString: collection.tags?.join(', ') || '',
        paletteIds: collection.paletteIds || []
      }
      showCreateModal.value = true
    }
    
    // Переключение выбора палитры
    const togglePaletteSelection = (paletteId) => {
      const index = newCollection.value.paletteIds.indexOf(paletteId)
      if (index === -1) {
        newCollection.value.paletteIds.push(paletteId)
      } else {
        newCollection.value.paletteIds.splice(index, 1)
      }
    }
    
    // Сохранение коллекции
    const saveCollection = () => {
      const tags = newCollection.value.tagsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag)
      
      const collectionData = {
        id: editingCollection.value?.id || Date.now(),
        name: newCollection.value.name,
        tags,
        paletteIds: newCollection.value.paletteIds,
        isFavorite: editingCollection.value?.isFavorite || false,
        createdAt: editingCollection.value?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      let savedCollections = getItem('paletteCollections') || []
      
      if (editingCollection.value) {
        // Обновление существующей
        const index = savedCollections.findIndex(c => c.id === editingCollection.value.id)
        if (index !== -1) {
          savedCollections[index] = collectionData
        }
      } else {
        // Добавление новой
        savedCollections.push(collectionData)
      }
      
      setItem('paletteCollections', savedCollections)
      loadCollections()
      
      // Сброс формы
      showCreateModal.value = false
      editingCollection.value = null
      newCollection.value = {
        name: '',
        tagsString: '',
        paletteIds: []
      }
    }
    
    // Открытие коллекции
    const openCollection = (collection) => {
      selectedCollection.value = collection
    }
    
    // Удаление коллекции
    const deleteCollection = (id) => {
      if (confirm('Вы уверены, что хотите удалить эту коллекцию?')) {
        let savedCollections = getItem('paletteCollections') || []
        savedCollections = savedCollections.filter(c => c.id !== id)
        setItem('paletteCollections', savedCollections)
        loadCollections()
      }
    }
    
    // Удаление палитры из коллекции
    const removeFromCollection = (paletteId) => {
      if (!selectedCollection.value) return
      
      const collection = selectedCollection.value
      collection.paletteIds = collection.paletteIds.filter(id => id !== paletteId)
      
      let savedCollections = getItem('paletteCollections') || []
      const index = savedCollections.findIndex(c => c.id === collection.id)
      if (index !== -1) {
        savedCollections[index] = collection
        setItem('paletteCollections', savedCollections)
        loadCollections()
        openCollection(collection) // Обновить просмотр
      }
    }
    
    // Переключение избранности коллекции
    const toggleFavorite = (collection) => {
      const savedCollections = getItem('paletteCollections') || []
      const index = savedCollections.findIndex(c => c.id === collection.id)
      if (index !== -1) {
        savedCollections[index] = {
          ...savedCollections[index],
          isFavorite: !savedCollections[index].isFavorite
        }
        setItem('paletteCollections', savedCollections)
        loadCollections()
        if (selectedCollection.value && selectedCollection.value.id === collection.id) {
          selectedCollection.value = collections.value.find(c => c.id === collection.id) || null
        }
      }
    }

    // Редактирование палитры
    const startEditPalette = (palette) => {
      editingPalette.value = palette
      editingPaletteDraft.value = {
        id: palette.id,
        name: palette.name,
        colors: [...palette.colors]
      }
    }

    const cancelEditPalette = () => {
      editingPalette.value = null
      editingPaletteDraft.value = {
        id: null,
        name: '',
        colors: []
      }
    }

    const addColorToEditing = () => {
      editingPaletteDraft.value.colors.push('#ffffff')
    }

    const removeColorFromEditing = (index) => {
      editingPaletteDraft.value.colors.splice(index, 1)
    }

    const saveEditedPalette = () => {
      if (!editingPalette.value) return

      let savedPalettes = getItem('paletteLibrary') || []
      const index = savedPalettes.findIndex(p => p.id === editingPaletteDraft.value.id)
      if (index !== -1) {
        savedPalettes[index] = {
          ...savedPalettes[index],
          name: editingPaletteDraft.value.name,
          colors: editingPaletteDraft.value.colors
        }
        setItem('paletteLibrary', savedPalettes)
        loadCollections()
        if (selectedCollection.value) {
          const updated = collections.value.find(c => c.id === selectedCollection.value.id)
          if (updated) {
            selectedCollection.value = updated
          }
        }
      }

      cancelEditPalette()
      alert('Палитра обновлена!')
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
    
    // Экспорт палитры
    const exportPalette = (palette) => {
      alert(`Экспорт палитры "${palette.name}" будет реализован на странице экспорта`)
    }
    
    // Дублирование палитры
    const duplicatePalette = (palette) => {
      const newPalette = {
        ...palette,
        id: Date.now(),
        name: `${palette.name} (копия)`,
        createdAt: new Date().toISOString()
      }
      
      let savedPalettes = getItem('paletteLibrary') || []
      savedPalettes.push(newPalette)
      setItem('paletteLibrary', savedPalettes)
      
      alert('Палитра дублирована!')
    }
    
    return {
      collections,
      searchQuery,
      filterTag,
      onlyFavorites,
      uniqueTags,
      filteredCollections,
      showCreateModal,
      selectedCollection,
      editingCollection,
      editingPalette,
      editingPaletteDraft,
      newCollection,
      availablePalettes,
      formatDate,
      editCollection,
      togglePaletteSelection,
      saveCollection,
      openCollection,
      deleteCollection,
      removeFromCollection,
      toggleFavorite,
      startEditPalette,
      cancelEditPalette,
      addColorToEditing,
      removeColorFromEditing,
      saveEditedPalette,
      copyColor,
      exportPalette,
      duplicatePalette
    }
  }
}
</script>

<style scoped>
.library-page {
  max-width: 1400px;
  margin: 0 auto;
}

.library-controls {
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  margin-bottom: 2rem;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.search-filter {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 10px 15px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 1rem;
}

.filter-select {
  padding: 10px 15px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
}

.favorite-toggle {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.9rem;
  color: #495057;
}

.favorite-toggle input {
  cursor: pointer;
}

.collections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.collection-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.collection-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.collection-header h3 {
  margin: 0;
  color: #2c3e50;
}

.collection-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.9rem;
  color: #6c757d;
}

.favorite-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
  color: #adb5bd;
  transition: color 0.2s, transform 0.2s;
}

.favorite-btn.active {
  color: #f1c40f;
  transform: scale(1.1);
}

.collection-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: #e9ecef;
  color: #495057;
  padding: 3px 8px;
  border-radius: 15px;
  font-size: 0.8rem;
}

.preview-palettes {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.palette-preview {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 0.75rem;
}

.palette-colors {
  display: flex;
  gap: 2px;
}

.preview-color {
  flex: 1;
  height: 30px;
  border-radius: 4px;
}

.collection-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: transform 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn.small {
  padding: 6px 12px;
  font-size: 0.8rem;
}

.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.danger {
  background: #dc3545;
  color: white;
}

.empty-library {
  text-align: center;
  padding: 4rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  color: #6c757d;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  max-width: 800px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content.large {
  max-width: 1000px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #495057;
}

.form-input {
  width: 100%;
  padding: 10px 15px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 1rem;
}

.palettes-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
  padding: 1rem;
  border: 2px solid #dee2e6;
  border-radius: 8px;
}

.palette-option {
  border: 2px solid #dee2e6;
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.palette-option:hover {
  border-color: #667eea;
}

.palette-option.selected {
  border-color: #667eea;
  background: #f0f4ff;
}

.option-colors {
  display: flex;
  gap: 1px;
  margin-bottom: 0.5rem;
}

.option-color {
  flex: 1;
  height: 20px;
  border-radius: 3px;
}

.option-name {
  font-size: 0.9rem;
  color: #495057;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.collection-details {
  margin: 1.5rem 0;
}

.collection-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.collection-palettes {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.full-palette {
  border: 1px solid #dee2e6;
  border-radius: 10px;
  padding: 1rem;
}

.full-palette-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.full-palette-header h4 {
  margin: 0;
  color: #2c3e50;
}

.full-palette-actions {
  display: flex;
  gap: 0.5rem;
}

.palette-colors-full {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.full-color {
  flex: 1;
  height: 60px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;
}

.full-color:hover {
  transform: translateY(-3px);
}

.full-color span {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 3px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9rem;
}

.palette-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-colors-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.edit-color-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-input {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.color-text-input {
  flex: 1;
  padding: 8px 10px;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  font-family: monospace;
}
</style>