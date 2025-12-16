import { ref, watch } from 'vue'

export function useLocalStorage() {
  // Получение элемента из localStorage
  const getItem = (key) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  }

  // Сохранение элемента в localStorage
  const setItem = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Error writing to localStorage:', error)
      return false
    }
  }

  // Удаление элемента из localStorage
  const removeItem = (key) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Error removing from localStorage:', error)
      return false
    }
  }

  // Создание реактивной переменной, связанной с localStorage
  const useStoredRef = (key, defaultValue) => {
    const storedValue = getItem(key)
    const value = ref(storedValue !== null ? storedValue : defaultValue)

    watch(value, (newValue) => {
      setItem(key, newValue)
    }, { deep: true })

    return value
  }

  return {
    getItem,
    setItem,
    removeItem,
    useStoredRef
  }
}