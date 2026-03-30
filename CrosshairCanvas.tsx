import { useEffect, useRef } from 'react'
import { CrosshairPreset } from '../types'

interface CrosshairCanvasProps {
  preset: CrosshairPreset
  size?: number
  background?: string
  className?: string
  scale?: number
}

export function CrosshairCanvas({ preset, size = 200, background = '#1a1a2e', className = '', scale = 1 }: CrosshairCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, size, size)
    ctx.fillStyle = background
    ctx.fillRect(0, 0, size, size)

    const cx = size / 2, cy = size / 2
    const hex2rgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r},${g},${b},${alpha / 255})`
    }
    const color = hex2rgba(preset.color, preset.opacity)
    const outlineColor = hex2rgba(preset.outlineColor, preset.opacity)
    const s = scale
    const gap = preset.gap * s
    const len = preset.size * 4 * s
    const thick = preset.thickness * 2 * s
    const dotSize = preset.dotSize * 2 * s
    const outlineT = preset.outlineThickness * 2 * s
    const spread = preset.spread * s

    const drawLine = (x1: number, y1: number, x2: number, y2: number, w: number, col: string) => {
      ctx.beginPath()
      ctx.strokeStyle = col
      ctx.lineWidth = Math.max(0.5, w)
      ctx.lineCap = 'square'
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }

    if (preset.style === 'dot') {
      if (preset.outlineEnabled) {
        ctx.beginPath()
        ctx.arc(cx, cy, dotSize + outlineT, 0, Math.PI * 2)
        ctx.fillStyle = outlineColor
        ctx.fill()
      }
      ctx.beginPath()
      ctx.arc(cx, cy, dotSize, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      return
    }

    if (preset.style === 'circle') {
      if (preset.outlineEnabled) {
        ctx.beginPath()
        ctx.arc(cx, cy, len + outlineT, 0, Math.PI * 2)
        ctx.strokeStyle = outlineColor
        ctx.lineWidth = thick + outlineT * 2
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.arc(cx, cy, len, 0, Math.PI * 2)
      ctx.strokeStyle = color
      ctx.lineWidth = thick
      ctx.stroke()
      if (preset.dotEnabled) {
        ctx.beginPath()
        ctx.arc(cx, cy, dotSize, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      }
      return
    }

    const gapPx = Math.abs(gap)
    const gapOffset = gap < 0 ? 0 : gapPx

    if (preset.style === 'classic' || preset.style === 'cross' || preset.style === 'crossdot') {
      if (preset.outlineEnabled) {
        if (preset.topEnabled) drawLine(cx, cy - gapOffset, cx, cy - gapOffset - len, thick + outlineT * 2, outlineColor)
        if (preset.bottomEnabled && !preset.tStyleEnabled) drawLine(cx, cy + gapOffset, cx, cy + gapOffset + len, thick + outlineT * 2, outlineColor)
        if (preset.leftEnabled) drawLine(cx - gapOffset, cy, cx - gapOffset - len, cy, thick + outlineT * 2, outlineColor)
        if (preset.rightEnabled) drawLine(cx + gapOffset, cy, cx + gapOffset + len, cy, thick + outlineT * 2, outlineColor)
      }
      if (preset.topEnabled) drawLine(cx, cy - gapOffset, cx, cy - gapOffset - len, thick, color)
      if (preset.bottomEnabled && !preset.tStyleEnabled) drawLine(cx, cy + gapOffset, cx, cy + gapOffset + len, thick, color)
      if (preset.leftEnabled) drawLine(cx - gapOffset, cy, cx - gapOffset - len, cy, thick, color)
      if (preset.rightEnabled) drawLine(cx + gapOffset, cy, cx + gapOffset + len, cy, thick, color)
    }

    if (preset.dotEnabled && (preset.style === 'classic' || preset.style === 'crossdot' || preset.style === 'cross')) {
      if (preset.outlineEnabled) {
        ctx.beginPath()
        ctx.arc(cx, cy, dotSize + outlineT, 0, Math.PI * 2)
        ctx.fillStyle = outlineColor
        ctx.fill()
      }
      ctx.beginPath()
      ctx.arc(cx, cy, dotSize, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
    }

    if (spread > 0) {
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 1
      ctx.arc(cx, cy, (len + gapPx + spread * 4) * 1.1, 0, Math.PI * 2)
      ctx.stroke()
    }
  }, [preset, size, background, scale])

  return <canvas ref={canvasRef} className={className} />
}


