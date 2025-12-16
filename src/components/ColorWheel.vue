<template>
  <div class="color-wheel">
    <canvas ref="wheelCanvas" :width="size" :height="size"></canvas>
    <div class="wheel-info">
      <p>Цветовой круг показывает гармоничные цветовые сочетания</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'

export default {
  name: 'ColorWheel',
  props: {
    colors: {
      type: Array,
      default: () => []
    },
    size: {
      type: Number,
      default: 400
    }
  },
  setup(props) {
    const wheelCanvas = ref(null)

    const drawColorWheel = () => {
      const canvas = wheelCanvas.value
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radius = Math.min(centerX, centerY) - 20

      // Очистка canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Рисование цветового круга
      for (let angle = 0; angle < 360; angle += 0.5) {
        const startAngle = (angle - 0.5) * Math.PI / 180
        const endAngle = angle * Math.PI / 180
        
        for (let r = 0; r < radius; r++) {
          const hue = angle
          const saturation = r / radius * 100
          const lightness = 50
          
          const color = hslToHex(hue, saturation, lightness)
          
          ctx.beginPath()
          ctx.arc(centerX, centerY, r, startAngle, endAngle)
          ctx.strokeStyle = color
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }

      // Отметки для переданных цветов
      if (props.colors && props.colors.length > 0) {
        props.colors.forEach((color, index) => {
          const angle = (index * 360 / props.colors.length) * Math.PI / 180
          const x = centerX + Math.cos(angle) * (radius + 15)
          const y = centerY + Math.sin(angle) * (radius + 15)
          
          // Точка цвета
          ctx.beginPath()
          ctx.arc(x, y, 10, 0, Math.PI * 2)
          ctx.fillStyle = color
          ctx.fill()
          ctx.strokeStyle = '#000'
          ctx.lineWidth = 2
          ctx.stroke()
          
          // Линия к центру
          ctx.beginPath()
          ctx.moveTo(centerX, centerY)
          ctx.lineTo(x, y)
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
          ctx.lineWidth = 1
          ctx.stroke()
        })
      }

      // Центральная точка
      ctx.beginPath()
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2)
      ctx.fillStyle = '#000'
      ctx.fill()
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

    onMounted(() => {
      drawColorWheel()
    })

    watch(() => props.colors, () => {
      drawColorWheel()
    }, { deep: true })

    return {
      wheelCanvas
    }
  }
}
</script>

<style scoped>
.color-wheel {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

canvas {
  display: block;
  max-width: 100%;
  height: auto;
}

.wheel-info {
  margin-top: 1rem;
  color: #6c757d;
  font-size: 0.9rem;
}
</style>