import { ref, computed } from 'vue'

export function useColorGenerator() {
  const colors = ref([])
  const colorCount = ref(5)
  const baseColor = ref('#667eea')
  const paletteType = ref('analogous')
  const lockedColors = ref([])

  // Генерация случайного цвета в формате HEX
  const generateRandomColor = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
  }

  // Вспомогательные функции для работы с цветами
  const hexToHsl = (hex) => {
    const normalized = hex.replace('#', '')
    const bigint = parseInt(normalized, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255

    const rNorm = r / 255
    const gNorm = g / 255
    const bNorm = b / 255

    const max = Math.max(rNorm, gNorm, bNorm)
    const min = Math.min(rNorm, gNorm, bNorm)
    let h
    let s
    const l = (max + min) / 2

    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case rNorm:
          h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)
          break
        case gNorm:
          h = (bNorm - rNorm) / d + 2
          break
        case bNorm:
          h = (rNorm - gNorm) / d + 4
          break
      }

      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }

  // Генерация гармоничной палитры
  const generateHarmoniousPalette = () => {
    const newColors = []
    const { h: baseH, s: baseS, l: baseL } = hexToHsl(baseColor.value)

    const pushWithVariation = (baseHue, index, options = {}) => {
      const {
        s = baseS,
        l = baseL,
        sJitter = 10,
        lJitter = 10
      } = options

      const saturation = Math.max(0, Math.min(100, s + (Math.random() * sJitter - sJitter / 2)))
      const lightness = Math.max(0, Math.min(100, l + (Math.random() * lJitter - lJitter / 2)))
      const hue = (baseHue + index * (options.step || 0)) % 360

      newColors.push(hslToHex(hue, saturation, lightness))
    }

    switch (paletteType.value) {
      case 'analogous': {
        const step = 20
        const start = baseH - Math.floor((colorCount.value - 1) / 2) * step
        for (let i = 0; i < colorCount.value; i++) {
          const hue = (start + i * step + 360) % 360
          pushWithVariation(hue, 0, { s: baseS, l: baseL })
        }
        break
      }
      case 'monochromatic': {
        for (let i = 0; i < colorCount.value; i++) {
          const lightness = Math.max(10, Math.min(90, baseL - 20 + i * (40 / Math.max(1, colorCount.value - 1))))
          newColors.push(hslToHex(baseH, baseS, lightness))
        }
        break
      }
      case 'triadic': {
        const triadHues = [baseH, (baseH + 120) % 360, (baseH + 240) % 360]
        for (let i = 0; i < colorCount.value; i++) {
          const hue = triadHues[i % triadHues.length]
          pushWithVariation(hue, i, { s: baseS, l: baseL })
        }
        break
      }
      case 'complementary': {
        const compHues = [baseH, (baseH + 180) % 360]
        for (let i = 0; i < colorCount.value; i++) {
          const hue = compHues[i % compHues.length]
          pushWithVariation(hue, i, { s: baseS, l: baseL })
        }
        break
      }
      case 'splitComplementary': {
        const splitHues = [(baseH + 150) % 360, baseH, (baseH + 210) % 360]
        for (let i = 0; i < colorCount.value; i++) {
          const hue = splitHues[i % splitHues.length]
          pushWithVariation(hue, i, { s: baseS, l: baseL })
        }
        break
      }
      case 'square': {
        const squareHues = [baseH, (baseH + 90) % 360, (baseH + 180) % 360, (baseH + 270) % 360]
        for (let i = 0; i < colorCount.value; i++) {
          const hue = squareHues[i % squareHues.length]
          pushWithVariation(hue, i, { s: baseS, l: baseL })
        }
        break
      }
      default: {
        for (let i = 0; i < colorCount.value; i++) {
          newColors.push(generateRandomColor())
        }
      }
    }

    // Сохраняем закрепленные цвета
    colors.value = newColors.map((color, index) => 
      lockedColors.value[index] ? lockedColors.value[index] : color
    )
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

  // Закрепить/открепить цвет
  const toggleLockColor = (index) => {
    if (lockedColors.value[index]) {
      lockedColors.value[index] = null
    } else {
      lockedColors.value[index] = colors.value[index]
    }
  }

  // Вычисляемые свойства
  const lockedCount = computed(() => {
    return lockedColors.value.filter(color => color !== null).length
  })

  return {
    colors,
    colorCount,
    baseColor,
    paletteType,
    lockedColors,
    generateHarmoniousPalette,
    toggleLockColor,
    lockedCount,
    generateRandomColor
  }
}