import './style.css'

// ─── Types ──────────────────────────────────────────────────────────────────
interface FloorElement {
  id: string
  type: string
  x: number
  y: number
  w: number
  h: number
  rotation: number
  color: string
  stroke: string
  label: string
}

interface FloorPlan {
  gridSize: number
  elements: FloorElement[]
}

type CatalogEntry = {
  name: string
  category: 'structural' | 'furniture' | 'fixtures' | 'other'
  w: number
  h: number
  color: string
  stroke: string
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, color: string, stroke: string) => void
}

// ─── Catalog of predefined elements ─────────────────────────────────────────

function drawRect(ctx: CanvasRenderingContext2D, w: number, h: number, color: string, stroke: string) {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = stroke
  ctx.lineWidth = 0.02
  ctx.strokeRect(0, 0, w, h)
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, w: number, h: number, color: string, stroke: string, r = 0.06) {
  ctx.beginPath()
  ctx.roundRect(0, 0, w, h, r)
  ctx.fillStyle = color
  ctx.fill()
  ctx.strokeStyle = stroke
  ctx.lineWidth = 0.02
  ctx.stroke()
}

const CATALOG: Record<string, CatalogEntry> = {
  room: {
    name: 'Room', category: 'structural', w: 3, h: 3, color: '#2c3e50', stroke: '#1a252f',
    draw(ctx, w, h, color, _stroke) {
      const t = 0.2
      ctx.fillStyle = color
      ctx.fillRect(0, 0, w, t)
      ctx.fillRect(0, h - t, w, t)
      ctx.fillRect(0, t, t, h - 2 * t)
      ctx.fillRect(w - t, t, t, h - 2 * t)
    },
  },
  wall: {
    name: 'Wall', category: 'structural', w: 2, h: 0.2, color: '#2c3e50', stroke: '#1a252f',
    draw: drawRect,
  },
  door: {
    name: 'Door', category: 'structural', w: 0.9, h: 0.08, color: '#e8dcc8', stroke: '#8a7a6a',
    draw(ctx, w, h, color, stroke) {
      // leaf
      ctx.fillStyle = color
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = stroke
      ctx.lineWidth = 0.02
      ctx.strokeRect(0, 0, w, h)
      // arc
      ctx.beginPath()
      ctx.arc(0, h, w, -Math.PI / 2, 0)
      ctx.strokeStyle = stroke
      ctx.lineWidth = 0.015
      ctx.stroke()
    },
  },
  window: {
    name: 'Window', category: 'structural', w: 1.2, h: 0.15, color: '#aad4f5', stroke: '#5fa8d3',
    draw(ctx, w, h, color, stroke) {
      ctx.fillStyle = color
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = stroke
      ctx.lineWidth = 0.02
      ctx.strokeRect(0, 0, w, h)
      // centre line
      ctx.beginPath()
      if (w >= h) {
        ctx.moveTo(0, h / 2)
        ctx.lineTo(w, h / 2)
      } else {
        ctx.moveTo(w / 2, 0)
        ctx.lineTo(w / 2, h)
      }
      ctx.strokeStyle = stroke
      ctx.lineWidth = 0.01
      ctx.stroke()
    },
  },
  stairs: {
    name: 'Stairs', category: 'structural', w: 2.5, h: 1.0, color: '#d4c9b0', stroke: '#9a8a70',
    draw(ctx, w, h, color, stroke) {
      const n = 12
      const sw = w / n
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = i % 2 === 0 ? color : '#c0af90'
        ctx.fillRect(i * sw, 0, sw, h)
        ctx.strokeStyle = stroke
        ctx.lineWidth = 0.01
        ctx.strokeRect(i * sw, 0, sw, h)
      }
    },
  },
  sofa: {
    name: 'Sofa', category: 'furniture', w: 2.0, h: 0.8, color: '#d4c8b0', stroke: '#9a8a6a',
    draw(ctx, w, h, color, stroke) {
      // back
      drawRoundedRect(ctx, w, h * 0.35, color, stroke, 0.05)
      // seat
      ctx.save()
      ctx.translate(0, h * 0.35)
      drawRoundedRect(ctx, w, h * 0.65, color, stroke, 0.05)
      ctx.restore()
      // armrests
      ctx.fillStyle = stroke
      ctx.fillRect(0, h * 0.3, 0.12, h * 0.7)
      ctx.fillRect(w - 0.12, h * 0.3, 0.12, h * 0.7)
    },
  },
  bed_single: {
    name: 'Single Bed', category: 'furniture', w: 0.9, h: 2.0, color: '#c8d8e8', stroke: '#7090b0',
    draw(ctx, w, h, color, stroke) {
      drawRoundedRect(ctx, w, h, color, stroke, 0.04)
      // pillow
      ctx.fillStyle = '#e8f0f8'
      ctx.strokeStyle = stroke
      ctx.lineWidth = 0.01
      ctx.beginPath()
      ctx.roundRect(0.1, 0.08, w - 0.2, 0.3, 0.05)
      ctx.fill()
      ctx.stroke()
    },
  },
  bed_double: {
    name: 'Double Bed', category: 'furniture', w: 1.6, h: 2.0, color: '#c8d8e8', stroke: '#7090b0',
    draw(ctx, w, h, color, stroke) {
      drawRoundedRect(ctx, w, h, color, stroke, 0.04)
      // pillows
      ctx.fillStyle = '#e8f0f8'
      ctx.strokeStyle = stroke
      ctx.lineWidth = 0.01
      ctx.beginPath()
      ctx.roundRect(0.1, 0.08, w / 2 - 0.15, 0.3, 0.05)
      ctx.fill(); ctx.stroke()
      ctx.beginPath()
      ctx.roundRect(w / 2 + 0.05, 0.08, w / 2 - 0.15, 0.3, 0.05)
      ctx.fill(); ctx.stroke()
    },
  },
  table: {
    name: 'Table', category: 'furniture', w: 1.2, h: 0.8, color: '#c8b898', stroke: '#9a8a6a',
    draw: (ctx, w, h, color, stroke) => drawRoundedRect(ctx, w, h, color, stroke, 0.04),
  },
  chair: {
    name: 'Chair', category: 'furniture', w: 0.45, h: 0.45, color: '#e0d5c1', stroke: '#9a8a6a',
    draw(ctx, w, h, color, stroke) {
      drawRoundedRect(ctx, w, h, color, stroke, 0.04)
      // backrest
      ctx.fillStyle = stroke
      ctx.fillRect(0.05, 0, w - 0.1, 0.08)
    },
  },
  dining_table: {
    name: 'Dining Table', category: 'furniture', w: 1.4, h: 0.9, color: '#b8a878', stroke: '#8a7a5a',
    draw: (ctx, w, h, color, stroke) => drawRoundedRect(ctx, w, h, color, stroke, 0.04),
  },
  wardrobe: {
    name: 'Wardrobe', category: 'furniture', w: 1.8, h: 0.6, color: '#a08060', stroke: '#705030',
    draw(ctx, w, h, color, stroke) {
      drawRect(ctx, w, h, color, stroke)
      // doors
      ctx.strokeStyle = stroke
      ctx.lineWidth = 0.015
      ctx.beginPath()
      ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h)
      ctx.stroke()
    },
  },
  desk: {
    name: 'Desk', category: 'furniture', w: 1.2, h: 0.6, color: '#b0a080', stroke: '#807050',
    draw: (ctx, w, h, color, stroke) => drawRoundedRect(ctx, w, h, color, stroke, 0.03),
  },
  l_shaped_sofa: {
    name: 'L-Sofa', category: 'furniture', w: 2.2, h: 2.0, color: '#d4c8b0', stroke: '#9a8a6a',
    draw(ctx, w, h, color, stroke) {
      const depth = 0.8
      const bw = depth * 0.35 // backrest thickness

      // Left backrest
      drawRoundedRect(ctx, bw, h, color, stroke, 0.05)
      // Top backrest
      ctx.save()
      ctx.translate(bw, 0)
      drawRoundedRect(ctx, w - bw, bw, color, stroke, 0.05)
      ctx.restore()

      // Corner seat
      ctx.save()
      ctx.translate(bw, bw)
      drawRoundedRect(ctx, depth - bw, depth - bw, color, stroke, 0.05)
      ctx.restore()

      // Bottom seat
      ctx.save()
      ctx.translate(bw, depth)
      drawRoundedRect(ctx, depth - bw, h - depth, color, stroke, 0.05)
      ctx.restore()

      // Right seat
      ctx.save()
      ctx.translate(depth, bw)
      drawRoundedRect(ctx, w - depth, depth - bw, color, stroke, 0.05)
      ctx.restore()

      // Armrests
      ctx.fillStyle = stroke
      ctx.fillRect(w - 0.12, depth * 0.3, 0.12, depth * 0.7)
      ctx.fillRect(depth * 0.3, h - 0.12, depth * 0.7, 0.12)
    },
  },
  tv: {
    name: 'TV', category: 'furniture', w: 1.2, h: 0.1, color: '#1a1a1a', stroke: '#000000',
    draw(ctx, w, h, color, stroke) {
      ctx.fillStyle = color
      ctx.strokeStyle = stroke
      ctx.lineWidth = 0.02
      ctx.beginPath()
      ctx.roundRect(0, 0, w, h, 0.02)
      ctx.fill()
      ctx.stroke()
      // Screen area
      ctx.fillStyle = '#2a2a2a'
      ctx.beginPath()
      ctx.roundRect(0.02, 0.02, w - 0.04, h - 0.04, 0.01)
      ctx.fill()
    },
  },
  tv_stand: {
    name: 'TV Stand', category: 'furniture', w: 1.5, h: 0.4, color: '#4a4a4a', stroke: '#2a2a2a',
    draw(ctx, w, h, color, stroke) {
      drawRect(ctx, w, h, color, stroke)
      // TV base
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(w / 2 - 0.15, h * 0.25, 0.3, 0.05)
      // TV
      ctx.fillStyle = '#1a1a1a'
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 0.02
      ctx.beginPath()
      ctx.roundRect(0.1, h * 0.1, w - 0.2, 0.05, 0.02)
      ctx.fill()
      ctx.stroke()
    },
  },
  armchair: {
    name: 'Armchair', category: 'furniture', w: 0.8, h: 0.8, color: '#d4c8b0', stroke: '#9a8a6a',
    draw(ctx, w, h, color, stroke) {
      // back
      drawRoundedRect(ctx, w, h * 0.35, color, stroke, 0.05)
      // seat
      ctx.save()
      ctx.translate(0, h * 0.35)
      drawRoundedRect(ctx, w, h * 0.65, color, stroke, 0.05)
      ctx.restore()
      // armrests
      ctx.fillStyle = stroke
      ctx.fillRect(0, h * 0.2, 0.15, h * 0.8)
      ctx.fillRect(w - 0.15, h * 0.2, 0.15, h * 0.8)
    },
  },
  coffee_table: {
    name: 'Coffee Table', category: 'furniture', w: 0.9, h: 0.5, color: '#c8b898', stroke: '#9a8a6a',
    draw(ctx, w, h, color, stroke) {
      ctx.beginPath()
      ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = stroke
      ctx.lineWidth = 0.02
      ctx.stroke()
    },
  },
  bookcase: {
    name: 'Bookcase', category: 'furniture', w: 1.2, h: 0.4, color: '#8a6a4a', stroke: '#5a3a1a',
    draw(ctx, w, h, color, stroke) {
      drawRect(ctx, w, h, color, stroke)
      // Shelves vertical lines
      ctx.strokeStyle = stroke
      ctx.lineWidth = 0.02
      for (let i = 1; i < 4; i++) {
        ctx.beginPath()
        ctx.moveTo(w * i / 4, 0)
        ctx.lineTo(w * i / 4, h)
        ctx.stroke()
      }
      // Some books
      ctx.fillStyle = '#a83232'
      ctx.fillRect(0.1, 0.05, 0.15, h - 0.1)
      ctx.fillStyle = '#32a852'
      ctx.fillRect(0.4, 0.05, 0.1, h - 0.1)
      ctx.fillStyle = '#3252a8'
      ctx.fillRect(0.8, 0.05, 0.2, h - 0.1)
      ctx.fillStyle = '#d4c8b0'
      ctx.fillRect(0.95, 0.05, 0.05, h - 0.1)
    },
  },
  toilet: {
    name: 'Toilet', category: 'fixtures', w: 0.45, h: 0.7, color: '#e8f0f4', stroke: '#5090a8',
    draw(ctx, w, h, color, stroke) {
      // tank
      ctx.fillStyle = color
      ctx.strokeStyle = stroke
      ctx.lineWidth = 0.02
      ctx.fillRect(0.05, 0, w - 0.1, h * 0.3)
      ctx.strokeRect(0.05, 0, w - 0.1, h * 0.3)
      // bowl
      ctx.beginPath()
      ctx.ellipse(w / 2, h * 0.65, w / 2 - 0.02, h * 0.34, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    },
  },
  shower: {
    name: 'Shower', category: 'fixtures', w: 0.9, h: 0.9, color: '#d0e8f0', stroke: '#5090a8',
    draw(ctx, w, h, color, stroke) {
      drawRect(ctx, w, h, color, stroke)
      // drain
      ctx.beginPath()
      ctx.arc(w / 2, h / 2, 0.08, 0, Math.PI * 2)
      ctx.strokeStyle = stroke
      ctx.lineWidth = 0.015
      ctx.stroke()
      // grid lines
      for (let i = 1; i < 4; i++) {
        ctx.beginPath()
        ctx.moveTo(0, h * i / 4); ctx.lineTo(w, h * i / 4)
        ctx.strokeStyle = 'rgba(80,144,168,0.3)'
        ctx.lineWidth = 0.008
        ctx.stroke()
      }
    },
  },
  bathtub: {
    name: 'Bathtub', category: 'fixtures', w: 0.8, h: 1.7, color: '#d0e8f0', stroke: '#5090a8',
    draw(ctx, w, h, color, stroke) {
      ctx.beginPath()
      ctx.roundRect(0, 0, w, h, 0.15)
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = stroke
      ctx.lineWidth = 0.02
      ctx.stroke()
      // inner
      ctx.beginPath()
      ctx.roundRect(0.06, 0.06, w - 0.12, h - 0.12, 0.12)
      ctx.strokeStyle = 'rgba(80,144,168,0.4)'
      ctx.lineWidth = 0.01
      ctx.stroke()
    },
  },
  sink: {
    name: 'Sink', category: 'fixtures', w: 0.5, h: 0.45, color: '#e0f0f4', stroke: '#5090a8',
    draw(ctx, w, h, color, stroke) {
      ctx.beginPath()
      ctx.roundRect(0, 0, w, h, 0.06)
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = stroke
      ctx.lineWidth = 0.02
      ctx.stroke()
      // basin
      ctx.beginPath()
      ctx.ellipse(w / 2, h / 2, w / 3, h / 3, 0, 0, Math.PI * 2)
      ctx.strokeStyle = stroke
      ctx.lineWidth = 0.015
      ctx.stroke()
    },
  },
  kitchen_counter: {
    name: 'Counter', category: 'fixtures', w: 2.0, h: 0.6, color: '#bce8b0', stroke: '#70a860',
    draw: drawRect,
  },
  kitchen_island: {
    name: 'Island', category: 'fixtures', w: 1.8, h: 0.9, color: '#e8e8e8', stroke: '#8a8a8a',
    draw(ctx, w, h, color, stroke) {
      drawRect(ctx, w, h, color, stroke)
      // Stovetop overlay
      ctx.fillStyle = '#2a2a2a'
      ctx.beginPath()
      ctx.roundRect(0.2, 0.2, 0.6, 0.5, 0.05)
      ctx.fill()
      // Burners
      ctx.strokeStyle = '#ea5a5a'
      ctx.lineWidth = 0.015
      const burners = [[0.35, 0.45], [0.65, 0.45]]
      for (const [bx, by] of burners) {
        ctx.beginPath()
        ctx.arc(bx, by, 0.1, 0, Math.PI * 2)
        ctx.stroke()
      }
    },
  },
  washer: {
    name: 'Washer', category: 'fixtures', w: 0.6, h: 0.6, color: '#f0f0f0', stroke: '#c0c0c0',
    draw(ctx, w, h, color, stroke) {
      drawRect(ctx, w, h, color, stroke)
      // Top panel
      ctx.fillStyle = '#e0e0e0'
      ctx.fillRect(0, 0, w, h * 0.2)
      ctx.strokeStyle = stroke
      ctx.strokeRect(0, 0, w, h * 0.2)
      // Drum
      ctx.beginPath()
      ctx.arc(w / 2, h * 0.6, w * 0.25, 0, Math.PI * 2)
      ctx.fillStyle = '#d0d0d0'
      ctx.fill()
      ctx.lineWidth = 0.02
      ctx.stroke()
      // Drum inner
      ctx.beginPath()
      ctx.arc(w / 2, h * 0.6, w * 0.2, 0, Math.PI * 2)
      ctx.fillStyle = '#2a2a2a'
      ctx.fill()
    },
  },
  fridge: {
    name: 'Fridge', category: 'fixtures', w: 0.8, h: 0.6, color: '#f5f5f5', stroke: '#d0d0d0',
    draw(ctx, w, h, color, stroke) {
      drawRect(ctx, w, h, color, stroke)
      // Left door
      ctx.strokeStyle = stroke
      ctx.lineWidth = 0.02
      ctx.beginPath()
      ctx.moveTo(w / 2, 0)
      ctx.lineTo(w / 2, h)
      ctx.stroke()
      // Handles
      ctx.fillStyle = '#b0b0b0'
      ctx.fillRect(w / 2 - 0.06, h * 0.4, 0.02, h * 0.2)
      ctx.fillRect(w / 2 + 0.04, h * 0.4, 0.02, h * 0.2)
    },
  },
  stove: {
    name: 'Stove', category: 'fixtures', w: 0.6, h: 0.6, color: '#e8e8e8', stroke: '#a0a0a0',
    draw(ctx, w, h, color, stroke) {
      drawRect(ctx, w, h, color, stroke)
      // Control panel
      ctx.fillStyle = '#3a3a3a'
      ctx.fillRect(0, 0, w, h * 0.15)
      // Burners
      ctx.strokeStyle = '#ea5a5a'
      ctx.lineWidth = 0.015
      const burners = [[w * 0.25, h * 0.35], [w * 0.75, h * 0.35], [w * 0.25, h * 0.75], [w * 0.75, h * 0.75]]
      for (const [bx, by] of burners) {
        ctx.beginPath()
        ctx.arc(bx, by, 0.12, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(bx, by, 0.05, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(234, 90, 90, 0.2)'
        ctx.fill()
      }
    },
  },
  oven_tower: {
    name: 'Oven', category: 'fixtures', w: 0.6, h: 0.6, color: '#404040', stroke: '#202020',
    draw(ctx, w, h, color, stroke) {
      drawRect(ctx, w, h, color, stroke)
      // Oven door
      ctx.fillStyle = '#1a1a1a'
      ctx.beginPath()
      ctx.roundRect(0.05, 0.05, w - 0.1, h * 0.6, 0.02)
      ctx.fill()
      ctx.strokeStyle = '#505050'
      ctx.lineWidth = 0.02
      ctx.stroke()
      // Handle
      ctx.fillStyle = '#b0b0b0'
      ctx.fillRect(0.1, 0.1, w - 0.2, 0.04)
      // Controls
      ctx.fillStyle = '#606060'
      ctx.fillRect(0.05, h * 0.7, w - 0.1, h * 0.25)
      ctx.fillStyle = '#202020'
      ctx.beginPath()
      ctx.arc(w * 0.2, h * 0.825, 0.04, 0, Math.PI * 2)
      ctx.arc(w * 0.8, h * 0.825, 0.04, 0, Math.PI * 2)
      ctx.fill()
    },
  },
  kitchen_sink: {
    name: 'Kit. Sink', category: 'fixtures', w: 0.8, h: 0.5, color: '#e8e8e8', stroke: '#a0a0a0',
    draw(ctx, w, h, color, stroke) {
      drawRect(ctx, w, h, color, stroke)
      // Left bowl
      ctx.fillStyle = '#d0d4d8'
      ctx.strokeStyle = stroke
      ctx.lineWidth = 0.015
      ctx.beginPath()
      ctx.roundRect(0.05, 0.15, w * 0.4, h - 0.2, 0.05)
      ctx.fill()
      ctx.stroke()
      // Right bowl
      ctx.beginPath()
      ctx.roundRect(w * 0.55, 0.15, w * 0.4, h - 0.2, 0.05)
      ctx.fill()
      ctx.stroke()
      // Faucet base & spout
      ctx.fillStyle = '#a0a0a0'
      ctx.beginPath()
      ctx.arc(w / 2, 0.08, 0.04, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#a0a0a0'
      ctx.lineWidth = 0.02
      ctx.beginPath()
      ctx.moveTo(w / 2, 0.08)
      ctx.lineTo(w / 2, 0.2)
      ctx.stroke()
    },
  },
  plant: {
    name: 'Plant', category: 'other', w: 0.4, h: 0.4, color: '#70b048', stroke: '#408020',
    draw(ctx, w, h, color, stroke) {
      // pot
      ctx.fillStyle = '#c08050'
      ctx.fillRect(w * 0.25, h * 0.6, w * 0.5, h * 0.4)
      // foliage
      ctx.beginPath()
      ctx.arc(w / 2, h * 0.45, w / 2.2, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = stroke
      ctx.lineWidth = 0.015
      ctx.stroke()
    },
  },
  rug: {
    name: 'Rug', category: 'other', w: 2.0, h: 1.5, color: 'rgba(160,120,80,0.4)', stroke: 'rgba(160,120,80,0.6)',
    draw(ctx, w, h, color, stroke) {
      ctx.beginPath()
      ctx.roundRect(0, 0, w, h, 0.08)
      ctx.fillStyle = color
      ctx.fill()
      ctx.strokeStyle = stroke
      ctx.lineWidth = 0.02
      ctx.stroke()
    },
  },
  label: {
    name: 'Label', category: 'other', w: 1.5, h: 0.4, color: 'transparent', stroke: 'transparent',
    draw(ctx, _w, h, _color, _stroke) {
      ctx.fillStyle = 'rgba(240,246,255,0.7)'
      ctx.font = `${h * 0.6}px Inter, sans-serif`
      ctx.textBaseline = 'middle'
      ctx.fillText('Label', 0.05, h / 2)
    },
  },
}

// ─── Default plan from JSON ────────────────────────────────────────────────
async function loadDefaultPlan() {
  try {
    const response = await fetch('floor-plan-1773587553711.json')
    if (!response.ok) throw new Error('Failed to load default plan')
    const data = await response.json() as FloorPlan
    plan = data
    selected = null
    history = []
    historyIdx = -1
    pushHistory()
    updatePropsPanel()
    render()
  } catch (err) {
    console.error('Error loading default plan:', err)
  }
}


// ─── State ──────────────────────────────────────────────────────────────────
let plan: FloorPlan = { gridSize: 0.1, elements: [] }
let selected: FloorElement | null = null
let clipboard: FloorElement | null = null
let placingType: string | null = null
let showGrid = true
let snapEnabled = true
let showFloor = true
let floorColor = '#e6ded0'

// History for undo/redo
let history: string[] = []
let historyIdx = -1
const MAX_HISTORY = 80

// Canvas transform (pan & zoom)
let scale = 55  // pixels per metre – slightly zoomed in for default plan
let panX = 40
let panY = 80

// Interaction state
let isDragging = false
let isResizing = false
let resizeHandle = ''
let dragStartWorld: [number, number] = [0, 0]
let dragStartEl: { x: number; y: number; w: number; h: number } = { x: 0, y: 0, w: 0, h: 0 }
let isPanning = false
let panStart: [number, number] = [0, 0]
let panStartOffset: [number, number] = [0, 0]
let isDrawingRoom = false
let drawRoomStart: [number, number] | null = null

// ─── DOM refs ───────────────────────────────────────────────────────────────
const canvas = document.getElementById('editor-canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!
const coordsEl = document.getElementById('canvas-coords')!
const propsEmpty = document.getElementById('props-empty')!
const propsForm = document.getElementById('props-form')!
const propType = document.getElementById('prop-type')!
const propX = document.getElementById('prop-x') as HTMLInputElement
const propY = document.getElementById('prop-y') as HTMLInputElement
const propW = document.getElementById('prop-w') as HTMLInputElement
const propH = document.getElementById('prop-h') as HTMLInputElement
const propRot = document.getElementById('prop-rot') as HTMLInputElement
const propColor = document.getElementById('prop-color') as HTMLInputElement
const propLabel = document.getElementById('prop-label') as HTMLInputElement

const fileInput = document.getElementById('file-import') as HTMLInputElement

// ─── Helpers ────────────────────────────────────────────────────────────────
function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

function snap(v: number): number {
  if (!snapEnabled) return v
  return Math.round(v / plan.gridSize) * plan.gridSize
}

function screenToWorld(sx: number, sy: number): [number, number] {
  return [(sx - panX) / scale, (sy - panY) / scale]
}

function worldToScreen(wx: number, wy: number): [number, number] {
  return [wx * scale + panX, wy * scale + panY]
}

let activeSnapLinesX: number[] = []
let activeSnapLinesY: number[] = []

function getMagneticSnap(x: number, y: number, w: number, h: number, skipEl: FloorElement | null = null) {
  if (!snapEnabled) return { snapX: x, snapY: y, lineX: null, lineY: null }
  const snapThreshold = 0.2 // meters
  let bestDx = snapThreshold
  let bestDy = snapThreshold
  let snapX = x
  let snapY = y
  let snappedToX = false
  let snappedToY = false
  let lineX: number | null = null
  let lineY: number | null = null

  const rotation = skipEl ? skipEl.rotation : 0
  const rad = rotation * Math.PI / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)

  const corners = [
    [-w / 2, -h / 2],
    [w / 2, -h / 2],
    [-w / 2, h / 2],
    [w / 2, h / 2]
  ]
  let minRx = Infinity, maxRx = -Infinity
  let minRy = Infinity, maxRy = -Infinity
  for (const [lx, ly] of corners) {
    const rx = lx * cos - ly * sin
    const ry = lx * sin + ly * cos
    if (rx < minRx) minRx = rx
    if (rx > maxRx) maxRx = rx
    if (ry < minRy) minRy = ry
    if (ry > maxRy) maxRy = ry
  }

  const myCenterX = x + w / 2
  const myCenterY = y + h / 2

  const myLeft = myCenterX + minRx
  const myRight = myCenterX + maxRx
  const myTop = myCenterY + minRy
  const myBottom = myCenterY + maxRy

  const xEdges = [
    { val: myLeft, offset: -w / 2 - minRx },
    { val: myRight, offset: -w / 2 - maxRx },
    { val: myCenterX, offset: -w / 2 }
  ]

  const yEdges = [
    { val: myTop, offset: -h / 2 - minRy },
    { val: myBottom, offset: -h / 2 - maxRy },
    { val: myCenterY, offset: -h / 2 }
  ]

  for (const el of plan.elements) {
    if (el === skipEl) continue

    const elRad = el.rotation * Math.PI / 180
    const elCos = Math.cos(elRad)
    const elSin = Math.sin(elRad)
    const elCorners = [
      [-el.w / 2, -el.h / 2],
      [el.w / 2, -el.h / 2],
      [-el.w / 2, el.h / 2],
      [el.w / 2, el.h / 2]
    ]
    let elMinRx = Infinity, elMaxRx = -Infinity
    let elMinRy = Infinity, elMaxRy = -Infinity
    for (const [lx, ly] of elCorners) {
      const rx = lx * elCos - ly * elSin
      const ry = lx * elSin + ly * elCos
      if (rx < elMinRx) elMinRx = rx
      if (rx > elMaxRx) elMaxRx = rx
      if (ry < elMinRy) elMinRy = ry
      if (ry > elMaxRy) elMaxRy = ry
    }

    const elCenterX = el.x + el.w / 2
    const elCenterY = el.y + el.h / 2

    const elLeft = elCenterX + elMinRx
    const elRight = elCenterX + elMaxRx
    const elTop = elCenterY + elMinRy
    const elBottom = elCenterY + elMaxRy

    const elXEdges = [elLeft, elRight, elCenterX]
    const elYEdges = [elTop, elBottom, elCenterY]

    for (const myE of xEdges) {
      for (const elE of elXEdges) {
        const dist = Math.abs(myE.val - elE)
        if (dist < bestDx) {
          bestDx = dist
          snapX = elE + myE.offset
          snappedToX = true
          lineX = elE
        }
      }
    }

    for (const myE of yEdges) {
      for (const elE of elYEdges) {
        const dist = Math.abs(myE.val - elE)
        if (dist < bestDy) {
          bestDy = dist
          snapY = elE + myE.offset
          snappedToY = true
          lineY = elE
        }
      }
    }
  }

  if (!snappedToX && snapEnabled) snapX = Math.round(x / plan.gridSize) * plan.gridSize
  if (!snappedToY && snapEnabled) snapY = Math.round(y / plan.gridSize) * plan.gridSize

  return { snapX, snapY, lineX, lineY }
}

// ─── History ────────────────────────────────────────────────────────────────
function pushHistory() {
  const json = JSON.stringify(plan)
  // trim future
  history = history.slice(0, historyIdx + 1)
  history.push(json)
  if (history.length > MAX_HISTORY) history.shift()
  historyIdx = history.length - 1
}

function undo() {
  if (historyIdx <= 0) return
  historyIdx--
  plan = JSON.parse(history[historyIdx])
  selected = null
  updatePropsPanel()
  render()
}

function redo() {
  if (historyIdx >= history.length - 1) return
  historyIdx++
  plan = JSON.parse(history[historyIdx])
  selected = null
  updatePropsPanel()
  render()
}

// ─── Palette setup ──────────────────────────────────────────────────────────
function buildPalette() {
  const groups: Record<string, HTMLElement> = {
    structural: document.getElementById('palette-structural')!,
    furniture: document.getElementById('palette-furniture')!,
    fixtures: document.getElementById('palette-fixtures')!,
    other: document.getElementById('palette-other')!,
  }

  for (const [key, cat] of Object.entries(CATALOG)) {
    const item = document.createElement('div')
    item.className = 'palette-item'
    item.dataset.type = key

    // Preview canvas
    const preview = document.createElement('div')
    preview.className = 'palette-preview'
    const pc = document.createElement('canvas')
    pc.width = 80
    pc.height = 64
    preview.appendChild(pc)

    const pctx = pc.getContext('2d')!
    pctx.clearRect(0, 0, 80, 64)
    const previewScale = Math.min(70 / cat.w, 54 / cat.h)
    pctx.save()
    pctx.translate((80 - cat.w * previewScale) / 2, (64 - cat.h * previewScale) / 2)
    pctx.scale(previewScale, previewScale)
    cat.draw(pctx, cat.w, cat.h, cat.color, cat.stroke)
    pctx.restore()

    const label = document.createElement('span')
    label.className = 'palette-label'
    label.textContent = cat.name

    item.appendChild(preview)
    item.appendChild(label)

    item.addEventListener('click', () => {
      // Deselect old
      document.querySelectorAll('.palette-item.selected').forEach(el => el.classList.remove('selected'))
      if (placingType === key) {
        placingType = null
        canvas.style.cursor = 'crosshair'
      } else {
        placingType = key
        item.classList.add('selected')
        canvas.style.cursor = 'copy'
      }
    })

    groups[cat.category].appendChild(item)
  }
}

// ─── Floor detection & rendering ────────────────────────────────────────────
const STRUCTURAL_TYPES = new Set(['wall', 'kitchen_counter', 'window', 'stairs'])

function computeFloorBounds(): { minX: number; minY: number; maxX: number; maxY: number } | null {
  // Collect world-space corners of all structural elements
  const xs: number[] = []
  const ys: number[] = []

  for (const el of plan.elements) {
    if (!STRUCTURAL_TYPES.has(el.type)) continue
    const cx = el.x + el.w / 2
    const cy = el.y + el.h / 2
    const rad = el.rotation * Math.PI / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    const halfW = el.w / 2
    const halfH = el.h / 2
    const corners: [number, number][] = [
      [-halfW, -halfH], [halfW, -halfH],
      [-halfW, halfH], [halfW, halfH],
    ]
    for (const [lx, ly] of corners) {
      xs.push(cx + lx * cos - ly * sin)
      ys.push(cy + lx * sin + ly * cos)
    }
  }

  if (xs.length === 0) return null

  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  // Only draw a floor if the plan has meaningful spread (> 0.5 m each axis)
  if (maxX - minX < 0.5 || maxY - minY < 0.5) return null

  return { minX, minY, maxX, maxY }
}

function drawFloor() {
  if (!showFloor) return
  const bounds = computeFloorBounds()
  if (!bounds) return

  const [sx, sy] = worldToScreen(bounds.minX, bounds.minY)
  const [ex, ey] = worldToScreen(bounds.maxX, bounds.maxY)

  // Main floor fill
  ctx.save()
  ctx.fillStyle = floorColor
  ctx.fillRect(sx, sy, ex - sx, ey - sy)

  // Subtle inner shadow / border to give depth
  const inset = 6
  const grad = ctx.createLinearGradient(sx, sy, sx, ey)
  grad.addColorStop(0, 'rgba(0,0,0,0.06)')
  grad.addColorStop(0.08, 'rgba(0,0,0,0)')
  grad.addColorStop(0.92, 'rgba(0,0,0,0)')
  grad.addColorStop(1, 'rgba(0,0,0,0.06)')
  ctx.fillStyle = grad
  ctx.fillRect(sx + inset, sy + inset, ex - sx - inset * 2, ey - sy - inset * 2)

  // Border stroke
  ctx.strokeStyle = 'rgba(0,0,0,0.12)'
  ctx.lineWidth = 1.5
  ctx.strokeRect(sx, sy, ex - sx, ey - sy)
  ctx.restore()
}

// ─── Render ─────────────────────────────────────────────────────────────────
function render() {
  const dpr = window.devicePixelRatio || 1
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  ctx.clearRect(0, 0, w, h)

  // Grid
  if (showGrid) {
    drawGrid(w, h)
  }

  // Floor (drawn before any elements)
  drawFloor()

  // Elements grouped by layer
  const layers: FloorElement[][] = [[], [], [], []]
  // 0: floor, 1: structures, 2: other, 3: cutouts (doors/windows)
  for (const el of plan.elements) {
    if (el.type === 'rug') layers[0].push(el)
    else if (['wall', 'kitchen_counter'].includes(el.type)) layers[1].push(el)
    else if (['window', 'door'].includes(el.type)) layers[3].push(el)
    else layers[2].push(el)
  }

  for (const el of layers[0]) drawElementBase(el)
  for (const el of layers[1]) drawElementBase(el)

  // Fuse pass for structures
  for (const el of layers[1]) {
    const [sx, sy] = worldToScreen(el.x, el.y)
    ctx.save()
    ctx.translate(sx, sy)
    if (el.rotation) {
      ctx.translate(el.w * scale / 2, el.h * scale / 2)
      ctx.rotate(el.rotation * Math.PI / 180)
      ctx.translate(-el.w * scale / 2, -el.h * scale / 2)
    }
    ctx.scale(scale, scale)
    ctx.fillStyle = el.color
    ctx.fillRect(0, 0, el.w, el.h)
    ctx.restore()
  }

  for (const el of layers[2]) drawElementBase(el)
  for (const el of layers[3]) drawElementBase(el)

  if (selected) {
    drawSelection(selected)
  }

  // Placing preview at cursor
  if (isDrawingRoom && drawRoomStart && lastMouseScreen) {
    const [wx, wy] = screenToWorld(lastMouseScreen[0], lastMouseScreen[1])
    const endWx = snapEnabled ? snap(wx) : wx
    const endWy = snapEnabled ? snap(wy) : wy
    const minX = Math.min(drawRoomStart[0], endWx)
    const minY = Math.min(drawRoomStart[1], endWy)
    const w = Math.abs(endWx - drawRoomStart[0])
    const h = Math.abs(endWy - drawRoomStart[1])

    if (w > 0 && h > 0) {
      ctx.save()
      const [scrX, scrY] = worldToScreen(minX, minY)
      ctx.translate(scrX, scrY)
      ctx.scale(scale, scale)
      ctx.globalAlpha = 0.4
      const t = 0.2
      ctx.fillStyle = '#2c3e50'
      ctx.fillRect(0, 0, w, t)
      ctx.fillRect(0, h - t, w, t)
      ctx.fillRect(0, t, t, h - 2 * t)
      ctx.fillRect(w - t, t, t, h - 2 * t)
      ctx.restore()
    }
  } else if (placingType && placingType !== 'room' && lastMouseScreen) {
    const cat = CATALOG[placingType]
    if (cat) {
      const [wx, wy] = screenToWorld(lastMouseScreen[0], lastMouseScreen[1])
      const rawX = wx - cat.w / 2
      const rawY = wy - cat.h / 2
      const snapInfo = getMagneticSnap(rawX, rawY, cat.w, cat.h, null)
      const sx = snapInfo.snapX
      const sy = snapInfo.snapY

      activeSnapLinesX = snapInfo.lineX !== null ? [snapInfo.lineX] : []
      activeSnapLinesY = snapInfo.lineY !== null ? [snapInfo.lineY] : []

      ctx.save()
      ctx.globalAlpha = 0.4
      const [scrX, scrY] = worldToScreen(sx, sy)
      ctx.translate(scrX, scrY)
      ctx.scale(scale, scale)
      cat.draw(ctx, cat.w, cat.h, cat.color, cat.stroke)
      ctx.restore()
    }
  } else if (!isDragging && !isResizing) {
    activeSnapLinesX = []
    activeSnapLinesY = []
  }

  // Draw snap lines
  if (activeSnapLinesX.length > 0 || activeSnapLinesY.length > 0) {
    ctx.save()
    ctx.strokeStyle = '#ef4444' // red
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    for (const lx of activeSnapLinesX) {
      const [sx] = worldToScreen(lx, 0)
      ctx.beginPath()
      ctx.moveTo(sx, 0)
      ctx.lineTo(sx, h)
      ctx.stroke()
    }
    for (const ly of activeSnapLinesY) {
      const [, sy] = worldToScreen(0, ly)
      ctx.beginPath()
      ctx.moveTo(0, sy)
      ctx.lineTo(w, sy)
      ctx.stroke()
    }
    ctx.restore()
  }
}

let lastMouseScreen: [number, number] | null = null

function drawGrid(cw: number, ch: number) {
  const gs = plan.gridSize
  const [x0, y0] = screenToWorld(0, 0)
  const [x1, y1] = screenToWorld(cw, ch)

  const startX = Math.floor(x0 / gs) * gs
  const startY = Math.floor(y0 / gs) * gs

  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 0.5

  for (let x = startX; x <= x1; x += gs) {
    const [sx] = worldToScreen(x, 0)
    ctx.beginPath()
    ctx.moveTo(sx, 0)
    ctx.lineTo(sx, ch)
    ctx.stroke()
  }
  for (let y = startY; y <= y1; y += gs) {
    const [, sy] = worldToScreen(0, y)
    ctx.beginPath()
    ctx.moveTo(0, sy)
    ctx.lineTo(cw, sy)
    ctx.stroke()
  }

  // Stronger lines at every metre
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 1
  const startXm = Math.floor(x0)
  const startYm = Math.floor(y0)
  for (let x = startXm; x <= x1; x += 1) {
    const [sx] = worldToScreen(x, 0)
    ctx.beginPath()
    ctx.moveTo(sx, 0)
    ctx.lineTo(sx, ch)
    ctx.stroke()
  }
  for (let y = startYm; y <= y1; y += 1) {
    const [, sy] = worldToScreen(0, y)
    ctx.beginPath()
    ctx.moveTo(0, sy)
    ctx.lineTo(cw, sy)
    ctx.stroke()
  }

  // Origin marker
  const [ox, oy] = worldToScreen(0, 0)
  ctx.fillStyle = 'rgba(59,130,246,0.5)'
  ctx.beginPath()
  ctx.arc(ox, oy, 4, 0, Math.PI * 2)
  ctx.fill()
}

function drawElementBase(el: FloorElement) {
  const cat = CATALOG[el.type]
  if (!cat) return

  const [sx, sy] = worldToScreen(el.x, el.y)

  ctx.save()
  ctx.translate(sx, sy)
  if (el.rotation) {
    ctx.translate(el.w * scale / 2, el.h * scale / 2)
    ctx.rotate(el.rotation * Math.PI / 180)
    ctx.translate(-el.w * scale / 2, -el.h * scale / 2)
  }
  ctx.scale(scale, scale)

  cat.draw(ctx, el.w, el.h, el.color, el.stroke)
  ctx.restore()

  // Label
  if (el.label) {
    const [lx, ly] = worldToScreen(el.x + el.w / 2, el.y + el.h + 0.15)
    ctx.save()
    ctx.fillStyle = 'rgba(240,246,255,0.7)'
    ctx.font = '11px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(el.label, lx, ly)
    ctx.restore()
  }
}

function drawSelection(el: FloorElement) {
  const [sx, sy] = worldToScreen(el.x, el.y)

  ctx.save()
  ctx.translate(sx, sy)
  if (el.rotation) {
    ctx.translate(el.w * scale / 2, el.h * scale / 2)
    ctx.rotate(el.rotation * Math.PI / 180)
    ctx.translate(-el.w * scale / 2, -el.h * scale / 2)
  }

  const pad = 4
  const ew = el.w * scale
  const eh = el.h * scale

  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 2
  ctx.setLineDash([6, 3])
  ctx.strokeRect(-pad, -pad, ew + pad * 2, eh + pad * 2)
  ctx.setLineDash([])

  // Corner and Edge handles
  const hs = 8
  const corners = [
    { x: -pad, y: -pad, h: 'nw' },
    { x: ew + pad, y: -pad, h: 'ne' },
    { x: -pad, y: eh + pad, h: 'sw' },
    { x: ew + pad, y: eh + pad, h: 'se' },
    { x: ew / 2, y: -pad, h: 'n' },
    { x: ew / 2, y: eh + pad, h: 's' },
    { x: -pad, y: eh / 2, h: 'w' },
    { x: ew + pad, y: eh / 2, h: 'e' },
  ]

  for (const c of corners) {
    ctx.fillStyle = '#3b82f6'
    ctx.fillRect(c.x - hs / 2, c.y - hs / 2, hs, hs)
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1
    ctx.strokeRect(c.x - hs / 2, c.y - hs / 2, hs, hs)
  }

  // Rotation handle
  const rotX = ew / 2
  const rotY = -pad - 25
  ctx.beginPath()
  ctx.moveTo(rotX, -pad)
  ctx.lineTo(rotX, rotY)
  ctx.strokeStyle = '#3b82f6'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(rotX, rotY, 6, 0, Math.PI * 2)
  ctx.fillStyle = '#3b82f6'
  ctx.fill()
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.restore()
}

function getLocalCoord(wx: number, wy: number, el: FloorElement): [number, number] {
  const cx = el.x + el.w / 2
  const cy = el.y + el.h / 2
  const dx = wx - cx
  const dy = wy - cy
  const rad = -el.rotation * Math.PI / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  // Rotate around center
  const lx = dx * cos - dy * sin + el.w / 2
  const ly = dx * sin + dy * cos + el.h / 2
  return [lx, ly]
}

// ─── Hit testing ────────────────────────────────────────────────────────────
function hitTest(wx: number, wy: number): FloorElement | null {
  for (let i = plan.elements.length - 1; i >= 0; i--) {
    const el = plan.elements[i]
    const [lx, ly] = getLocalCoord(wx, wy, el)
    if (lx >= 0 && lx <= el.w && ly >= 0 && ly <= el.h) {
      return el
    }
  }
  return null
}

function hitHandle(sx: number, sy: number): string {
  if (!selected) return ''
  const el = selected
  const [wx, wy] = screenToWorld(sx, sy)
  const [lx, ly] = getLocalCoord(wx, wy, el)

  const pad = 4 / scale
  const hs = 12 / scale // hit area in metres
  const ew = el.w
  const eh = el.h

  const corners = [
    { x: -pad, y: -pad, name: 'nw' },
    { x: ew + pad, y: -pad, name: 'ne' },
    { x: -pad, y: eh + pad, name: 'sw' },
    { x: ew + pad, y: eh + pad, name: 'se' },
    { x: ew / 2, y: -pad, name: 'n' },
    { x: ew / 2, y: eh + pad, name: 's' },
    { x: -pad, y: eh / 2, name: 'w' },
    { x: ew + pad, y: eh / 2, name: 'e' },
  ]

  for (const c of corners) {
    if (Math.abs(lx - c.x) < hs && Math.abs(ly - c.y) < hs) return c.name
  }

  // Rotation handle
  const rotX = ew / 2
  const rotY = -pad - 25 / scale
  if (Math.abs(lx - rotX) < hs && Math.abs(ly - rotY) < hs) return 'rotate'

  return ''
}

// ─── Properties panel ───────────────────────────────────────────────────────
function updatePropsPanel() {
  if (!selected) {
    propsEmpty.style.display = ''
    propsForm.style.display = 'none'
    return
  }
  propsEmpty.style.display = 'none'
  propsForm.style.display = ''

  const cat = CATALOG[selected.type]
  propType.textContent = cat?.name ?? selected.type
  propX.value = selected.x.toFixed(2)
  propY.value = selected.y.toFixed(2)
  propW.value = selected.w.toFixed(2)
  propH.value = selected.h.toFixed(2)
  propRot.value = String(Math.round(selected.rotation))
  propColor.value = selected.color.startsWith('rgba') ? '#cccccc' : selected.color
  propLabel.value = selected.label
}

function bindPropInputs() {
  const update = () => {
    if (!selected) return
    selected.x = parseFloat(propX.value) || 0
    selected.y = parseFloat(propY.value) || 0
    selected.w = Math.max(0.1, parseFloat(propW.value) || 0.1)
    selected.h = Math.max(0.1, parseFloat(propH.value) || 0.1)
    let rot = (parseFloat(propRot.value) || 0) % 360
    if (rot < 0) rot += 360
    selected.rotation = rot
    selected.label = propLabel.value
    pushHistory()
    render()
  }

  propX.addEventListener('change', update)
  propY.addEventListener('change', update)
  propW.addEventListener('change', update)
  propH.addEventListener('change', update)
  propRot.addEventListener('change', update)
  propLabel.addEventListener('change', update)
  propColor.addEventListener('input', () => {
    if (!selected) return
    selected.color = propColor.value
    render()
  })
  propColor.addEventListener('change', () => {
    pushHistory()
  })
}

// ─── Mouse events ───────────────────────────────────────────────────────────
function onMouseDown(e: MouseEvent) {
  const rect = canvas.getBoundingClientRect()
  const sx = e.clientX - rect.left
  const sy = e.clientY - rect.top
  const [wx, wy] = screenToWorld(sx, sy)

  // Middle click → pan
  if (e.button === 1) {
    isPanning = true
    panStart = [e.clientX, e.clientY]
    panStartOffset = [panX, panY]
    canvas.style.cursor = 'grabbing'
    e.preventDefault()
    return
  }

  if (e.button !== 0) return

  // Placing mode
  if (placingType) {
    if (placingType === 'room') {
      isDrawingRoom = true
      drawRoomStart = [snapEnabled ? snap(wx) : wx, snapEnabled ? snap(wy) : wy]
      return
    }

    const cat = CATALOG[placingType]
    if (!cat) return
    const rawX = wx - cat.w / 2
    const rawY = wy - cat.h / 2
    const snapInfo = getMagneticSnap(rawX, rawY, cat.w, cat.h, null)
    const el: FloorElement = {
      id: uid(),
      type: placingType,
      x: snapInfo.snapX,
      y: snapInfo.snapY,
      w: cat.w,
      h: cat.h,
      rotation: 0,
      color: cat.color,
      stroke: cat.stroke,
      label: '',
    }
    plan.elements.push(el)
    selected = el
    pushHistory()
    updatePropsPanel()
    render()

    // Deselect palette if not holding shift
    if (!e.shiftKey) {
      placingType = null
      document.querySelectorAll('.palette-item.selected').forEach(el => el.classList.remove('selected'))
      canvas.style.cursor = 'crosshair'
    }
    return
  }

  // Check resize handles first
  const handle = hitHandle(sx, sy)
  if (handle && selected) {
    if (handle === 'rotate') {
      isResizing = true
      resizeHandle = 'rotate'
      dragStartWorld = [wx, wy]
      dragStartEl = { x: selected.x, y: selected.y, w: selected.w, h: selected.h }
      return
    }
    isResizing = true
    resizeHandle = handle
    dragStartWorld = [wx, wy]
    dragStartEl = { x: selected.x, y: selected.y, w: selected.w, h: selected.h }
    return
  }

  // Hit test elements
  const hit = hitTest(wx, wy)
  if (hit) {
    selected = hit
    isDragging = true
    dragStartWorld = [wx, wy]
    dragStartEl = { x: hit.x, y: hit.y, w: hit.w, h: hit.h }
    updatePropsPanel()
    render()
    canvas.style.cursor = 'move'
    return
  }

  // Click on empty space → deselect
  selected = null
  updatePropsPanel()
  render()
}

function onMouseMove(e: MouseEvent) {
  const rect = canvas.getBoundingClientRect()
  const sx = e.clientX - rect.left
  const sy = e.clientY - rect.top
  const [wx, wy] = screenToWorld(sx, sy)

  lastMouseScreen = [sx, sy]
  coordsEl.textContent = `${wx.toFixed(2)}, ${wy.toFixed(2)} m`

  if (isPanning) {
    panX = panStartOffset[0] + (e.clientX - panStart[0])
    panY = panStartOffset[1] + (e.clientY - panStart[1])
    render()
    return
  }

  if (isDrawingRoom) {
    render()
    return
  }

  if (isDragging && selected) {
    const dx = wx - dragStartWorld[0]
    const dy = wy - dragStartWorld[1]
    const rawX = dragStartEl.x + dx
    const rawY = dragStartEl.y + dy

    const snapInfo = getMagneticSnap(rawX, rawY, selected.w, selected.h, selected)
    selected.x = snapInfo.snapX
    selected.y = snapInfo.snapY

    activeSnapLinesX = snapInfo.lineX !== null ? [snapInfo.lineX] : []
    activeSnapLinesY = snapInfo.lineY !== null ? [snapInfo.lineY] : []

    updatePropsPanel()
    render()
    return
  }

  if (isResizing && selected) {
    if (resizeHandle === 'rotate') {
      const cx = selected.x + selected.w / 2
      const cy = selected.y + selected.h / 2
      let angle = (Math.atan2(wy - cy, wx - cx) * 180 / Math.PI + 90) % 360
      if (angle < 0) angle += 360

      const step = e.shiftKey ? 45 : (snapEnabled ? 15 : 1)
      selected.rotation = Math.round(angle / step) * step

      updatePropsPanel()
      render()
      return
    }

    const [wxL, wyL] = getLocalCoord(wx, wy, selected)
    const [startWxL, startWyL] = getLocalCoord(dragStartWorld[0], dragStartWorld[1], selected)
    const dlx = wxL - startWxL
    const dly = wyL - startWyL

    // For better resizing of rotated elements, we work in local coordinates but 
    // need to be careful about shifting the top-left origin (x, y) which is in world space.
    // Simplifying: we fix the opposite corner.
    activeSnapLinesX = []
    activeSnapLinesY = []

    const resize = (dW: number, dH: number, fx: number, fy: number, allowW = true, allowH = true) => {
      const startW = dragStartEl.w
      const startH = dragStartEl.h
      let newW = startW + (allowW ? dW : 0)
      let newH = startH + (allowH ? dH : 0)

      const rad = selected!.rotation * Math.PI / 180
      const cos = Math.cos(rad)
      const sin = Math.sin(rad)

      let lineX: number | null = null
      let lineY: number | null = null
      let snappedTargetW = false
      let snappedTargetH = false

      const commonSizes = new Set<number>()
      for (const el of plan.elements) {
        if (el === selected) continue
        commonSizes.add(el.w)
        commonSizes.add(el.h)
      }

      const sizeSnapThresh = 0.04;
      let bestDw = sizeSnapThresh;
      let bestDh = sizeSnapThresh;

      if (allowW && snapEnabled) {
        for (const size of commonSizes) {
          if (Math.abs(newW - size) < bestDw) {
            bestDw = Math.abs(newW - size)
            newW = size
            snappedTargetW = true
          }
        }
      }
      if (allowH && snapEnabled) {
        for (const size of commonSizes) {
          if (Math.abs(newH - size) < bestDh) {
            bestDh = Math.abs(newH - size)
            newH = size
            snappedTargetH = true
          }
        }
      }

      const isOrthogonal = (selected!.rotation % 90) === 0;
      if (isOrthogonal && snapEnabled) {
        const fpxLocal = (fx - 0.5) * startW
        const fpyLocal = (fy - 0.5) * startH
        const fixedWorldX = dragStartEl.x + startW / 2 + (fpxLocal * cos - fpyLocal * sin)
        const fixedWorldY = dragStartEl.y + startH / 2 + (fpxLocal * sin + fpyLocal * cos)

        const getSimBox = (testW: number, testH: number) => {
          const nfpx = (fx - 0.5) * testW
          const nfpy = (fy - 0.5) * testH
          const cx = fixedWorldX - (nfpx * cos - nfpy * sin)
          const cy = fixedWorldY - (nfpx * sin + nfpy * cos)

          let visW = testW
          let visH = testH
          if (selected!.rotation % 180 === 90 || selected!.rotation % 180 === -90) {
            visW = testH
            visH = testW
          }
          return { cx, cy, l: cx - visW / 2, r: cx + visW / 2, t: cy - visH / 2, b: cy + visH / 2 }
        }

        const sim = getSimBox(newW, newH)

        // In orthogonal mode, figure out which visual edges are moving based on rotation
        const simW_minus = getSimBox(newW - 0.01, newH)
        const simH_minus = getSimBox(newW, newH - 0.01)

        let movingVisualX: number | null = null
        let movingVisualXIsLeft = false
        if (allowW && Math.abs(sim.l - simW_minus.l) > 0.001) { movingVisualX = sim.l; movingVisualXIsLeft = true }
        else if (allowW && Math.abs(sim.r - simW_minus.r) > 0.001) { movingVisualX = sim.r; movingVisualXIsLeft = false }
        if (allowH && Math.abs(sim.l - simH_minus.l) > 0.001) { movingVisualX = sim.l; movingVisualXIsLeft = true }
        else if (allowH && Math.abs(sim.r - simH_minus.r) > 0.001) { movingVisualX = sim.r; movingVisualXIsLeft = false }

        let movingVisualY: number | null = null
        let movingVisualYIsTop = false
        if (allowH && Math.abs(sim.t - simH_minus.t) > 0.001) { movingVisualY = sim.t; movingVisualYIsTop = true }
        else if (allowH && Math.abs(sim.b - simH_minus.b) > 0.001) { movingVisualY = sim.b; movingVisualYIsTop = false }
        if (allowW && Math.abs(sim.t - simW_minus.t) > 0.001) { movingVisualY = sim.t; movingVisualYIsTop = true }
        else if (allowW && Math.abs(sim.b - simW_minus.b) > 0.001) { movingVisualY = sim.b; movingVisualYIsTop = false }

        let alignSnapX: number | null = null
        let alignSnapY: number | null = null
        let bestAlignDx = 0.05
        let bestAlignDy = 0.05

        for (const el of plan.elements) {
          if (el === selected) continue
          let elVisW = el.w
          let elVisH = el.h
          if (el.rotation % 180 === 90 || el.rotation % 180 === -90) {
            elVisW = el.h
            elVisH = el.w
          }
          const elCenterX = el.x + el.w / 2
          const elCenterY = el.y + el.h / 2

          if (!snappedTargetW && movingVisualX !== null) {
            for (const ex of [elCenterX - elVisW / 2, elCenterX + elVisW / 2, elCenterX]) {
              if (Math.abs(movingVisualX - ex) < bestAlignDx) {
                bestAlignDx = Math.abs(movingVisualX - ex)
                alignSnapX = ex
              }
            }
          }
          if (!snappedTargetH && movingVisualY !== null) {
            for (const ey of [elCenterY - elVisH / 2, elCenterY + elVisH / 2, elCenterY]) {
              if (Math.abs(movingVisualY - ey) < bestAlignDy) {
                bestAlignDy = Math.abs(movingVisualY - ey)
                alignSnapY = ey
              }
            }
          }
        }

        if (alignSnapX !== null) {
          const deltaX = alignSnapX - movingVisualX!
          if (selected!.rotation % 180 === 0) {
            newW += (movingVisualXIsLeft ? -deltaX : deltaX)
            snappedTargetW = true
          } else {
            newH += (movingVisualXIsLeft ? -deltaX : deltaX)
            snappedTargetH = true
          }
          lineX = alignSnapX
        }

        if (alignSnapY !== null) {
          const deltaY = alignSnapY - movingVisualY!
          if (selected!.rotation % 180 === 0) {
            newH += (movingVisualYIsTop ? -deltaY : deltaY)
            snappedTargetH = true
          } else {
            newW += (movingVisualYIsTop ? -deltaY : deltaY)
            snappedTargetW = true
          }
          lineY = alignSnapY
        }
      }

      if (!snappedTargetW && snapEnabled) newW = snap(newW)
      if (!snappedTargetH && snapEnabled) newH = snap(newH)

      newW = Math.max(0.1, newW)
      newH = Math.max(0.1, newH)

      if (lineX !== null) activeSnapLinesX.push(lineX)
      if (lineY !== null) activeSnapLinesY.push(lineY)

      const fpx = (fx - 0.5) * startW
      const fpy = (fy - 0.5) * startH
      const fixedWorldX = dragStartEl.x + startW / 2 + (fpx * cos - fpy * sin)
      const fixedWorldY = dragStartEl.y + startH / 2 + (fpx * sin + fpy * cos)

      selected!.w = newW
      selected!.h = newH

      const nfpx = (fx - 0.5) * newW
      const nfpy = (fy - 0.5) * newH
      selected!.x = fixedWorldX - newW / 2 - (nfpx * cos - nfpy * sin)
      selected!.y = fixedWorldY - newH / 2 - (nfpx * sin + nfpy * cos)
    }

    if (resizeHandle === 'se') resize(dlx, dly, 0, 0)
    if (resizeHandle === 'nw') resize(-dlx, -dly, 1, 1)
    if (resizeHandle === 'ne') resize(dlx, -dly, 0, 1)
    if (resizeHandle === 'sw') resize(-dlx, dly, 1, 0)
    if (resizeHandle === 'e') resize(dlx, 0, 0, 0.5, true, false)
    if (resizeHandle === 'w') resize(-dlx, 0, 1, 0.5, true, false)
    if (resizeHandle === 's') resize(0, dly, 0.5, 0, false, true)
    if (resizeHandle === 'n') resize(0, -dly, 0.5, 1, false, true)

    updatePropsPanel()
    render()
    return
  }

  // Cursor hint
  if (placingType) {
    render() // re-render preview ghost
    return
  }

  // Hover cursor
  const handle = hitHandle(sx, sy)
  if (handle === 'rotate') {
    canvas.style.cursor = 'crosshair'
  } else if (handle === 'nw' || handle === 'se') {
    canvas.style.cursor = 'nwse-resize'
  } else if (handle === 'ne' || handle === 'sw') {
    canvas.style.cursor = 'nesw-resize'
  } else if (handle === 'n' || handle === 's') {
    canvas.style.cursor = 'ns-resize'
  } else if (handle === 'e' || handle === 'w') {
    canvas.style.cursor = 'ew-resize'
  } else if (hitTest(wx, wy)) {
    canvas.style.cursor = 'move'
  } else {
    canvas.style.cursor = placingType ? 'copy' : 'crosshair'
  }
}

function onMouseUp(e: MouseEvent) {
  if (isPanning) {
    isPanning = false
    canvas.style.cursor = placingType ? 'copy' : 'crosshair'
    return
  }
  
  if (isDrawingRoom && drawRoomStart) {
    const rect = canvas.getBoundingClientRect()
    const sx = e.clientX - rect.left
    const sy = e.clientY - rect.top
    const [wx, wy] = screenToWorld(sx, sy)
    
    const endWx = snapEnabled ? snap(wx) : wx
    const endWy = snapEnabled ? snap(wy) : wy
    let minX = Math.min(drawRoomStart[0], endWx)
    let minY = Math.min(drawRoomStart[1], endWy)
    let w = Math.abs(endWx - drawRoomStart[0])
    let h = Math.abs(endWy - drawRoomStart[1])
    
    const t = 0.2
    if (w <= t || h <= t) {
      w = 3
      h = 3
      minX = drawRoomStart[0] - w / 2
      minY = drawRoomStart[1] - h / 2
      if (snapEnabled) {
        minX = snap(minX)
        minY = snap(minY)
      }
    }
    
    const color = CATALOG['wall'].color
    const stroke = CATALOG['wall'].stroke
    plan.elements.push(
      { id: uid(), type: 'wall', x: minX, y: minY, w, h: t, rotation: 0, color, stroke, label: '' },
      { id: uid(), type: 'wall', x: minX, y: minY + h - t, w, h: t, rotation: 0, color, stroke, label: '' },
      { id: uid(), type: 'wall', x: minX, y: minY + t, w: t, h: h - 2 * t, rotation: 0, color, stroke, label: '' },
      { id: uid(), type: 'wall', x: minX + w - t, y: minY + t, w: t, h: h - 2 * t, rotation: 0, color, stroke, label: '' }
    )
    pushHistory()
    
    isDrawingRoom = false
    drawRoomStart = null
    
    if (!e.shiftKey) {
      placingType = null
      document.querySelectorAll('.palette-item.selected').forEach(el => el.classList.remove('selected'))
    }
    canvas.style.cursor = placingType ? 'copy' : 'crosshair'
    render()
    return
  }

  if (isDragging || isResizing) {
    pushHistory()
    isDragging = false
    isResizing = false
    activeSnapLinesX = []
    activeSnapLinesY = []
    resizeHandle = ''
    canvas.style.cursor = placingType ? 'copy' : 'crosshair'
    render()
  }
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const rect = canvas.getBoundingClientRect()
  const sx = e.clientX - rect.left
  const sy = e.clientY - rect.top

  const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12
  const newScale = Math.min(400, Math.max(5, scale * factor))

  // Zoom towards cursor
  panX = sx - (sx - panX) * (newScale / scale)
  panY = sy - (sy - panY) * (newScale / scale)
  scale = newScale
  render()
}

// ─── Keyboard ───────────────────────────────────────────────────────────────
function onKeyDown(e: KeyboardEvent) {
  // Don't capture if typing in inputs
  if ((e.target as HTMLElement).tagName === 'INPUT') return

  if ((e.key === 'Delete' || e.key === 'Backspace') && selected) {
    plan.elements = plan.elements.filter(el => el !== selected)
    selected = null
    pushHistory()
    updatePropsPanel()
    render()
    e.preventDefault()
    return
  }

  if (e.key === 'Escape') {
    if (placingType) {
      placingType = null
      document.querySelectorAll('.palette-item.selected').forEach(el => el.classList.remove('selected'))
      canvas.style.cursor = 'crosshair'
    }
    isDrawingRoom = false
    drawRoomStart = null
    selected = null
    updatePropsPanel()
    render()
    return
  }

  if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault()
    if (e.shiftKey) redo(); else undo()
    return
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
    e.preventDefault()
    redo()
    return
  }

  // Copy
  if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selected) {
    e.preventDefault()
    clipboard = { ...selected }
    return
  }

  // Paste
  if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboard) {
    e.preventDefault()
    const pasted: FloorElement = { ...clipboard, id: uid(), x: clipboard.x + 0.3, y: clipboard.y + 0.3 }
    plan.elements.push(pasted)
    selected = pasted
    clipboard = { ...pasted } // Shift offset for next paste
    pushHistory()
    updatePropsPanel()
    render()
    return
  }

  // Duplicate
  if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selected) {
    e.preventDefault()
    const dup: FloorElement = { ...selected, id: uid(), x: selected.x + 0.3, y: selected.y + 0.3 }
    plan.elements.push(dup)
    selected = dup
    pushHistory()
    updatePropsPanel()
    render()
    return
  }
}

// ─── Export / Import ────────────────────────────────────────────────────────
function exportJSON() {
  const json = JSON.stringify(plan, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `floor-plan-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function importJSON(file: File) {
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result as string) as FloorPlan
      if (!data.elements || !Array.isArray(data.elements)) {
        alert('Invalid floor plan JSON.')
        return
      }
      plan = data
      selected = null
      pushHistory()
      updatePropsPanel()
      render()
    } catch {
      alert('Failed to parse JSON file.')
    }
  }
  reader.readAsText(file)
}

// ─── Toolbar bindings ───────────────────────────────────────────────────────
function bindToolbar() {
  document.getElementById('btn-undo')!.addEventListener('click', undo)
  document.getElementById('btn-redo')!.addEventListener('click', redo)

  document.getElementById('btn-grid')!.addEventListener('click', (e) => {
    showGrid = !showGrid;
    (e.currentTarget as HTMLElement).classList.toggle('active', showGrid)
    render()
  })

  document.getElementById('btn-snap')!.addEventListener('click', (e) => {
    snapEnabled = !snapEnabled;
    (e.currentTarget as HTMLElement).classList.toggle('active', snapEnabled)
  })

  document.getElementById('btn-floor')!.addEventListener('click', (e) => {
    showFloor = !showFloor;
    (e.currentTarget as HTMLElement).classList.toggle('active', showFloor)
    render()
  })

  const floorColorInput = document.getElementById('floor-color-input') as HTMLInputElement
  floorColorInput.value = floorColor
  floorColorInput.addEventListener('input', () => {
    floorColor = floorColorInput.value
    render()
  })

  document.getElementById('btn-delete')!.addEventListener('click', () => {
    if (!selected) return
    plan.elements = plan.elements.filter(el => el !== selected)
    selected = null
    pushHistory()
    updatePropsPanel()
    render()
  })

  document.getElementById('btn-export')!.addEventListener('click', exportJSON)

  document.getElementById('btn-import')!.addEventListener('click', () => {
    fileInput.click()
  })

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0]
    if (file) importJSON(file)
    fileInput.value = ''
  })
}

// ─── Drag-drop JSON import ──────────────────────────────────────────────────
function bindDragDrop() {
  canvas.addEventListener('dragover', (e) => { e.preventDefault() })
  canvas.addEventListener('drop', (e) => {
    e.preventDefault()
    const file = e.dataTransfer?.files[0]
    if (file && file.name.endsWith('.json')) importJSON(file)
  })
}

// ─── Resize observer ────────────────────────────────────────────────────────
function bindResize() {
  const observer = new ResizeObserver(() => render())
  observer.observe(canvas.parentElement!)
}

// ─── Init ───────────────────────────────────────────────────────────────────
async function init() {
  buildPalette()
  bindToolbar()
  bindPropInputs()
  bindDragDrop()
  bindResize()

  canvas.addEventListener('mousedown', onMouseDown)
  canvas.addEventListener('mousemove', onMouseMove)
  canvas.addEventListener('mouseup', onMouseUp)
  canvas.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('keydown', onKeyDown)

  // Prevent context menu on canvas
  canvas.addEventListener('contextmenu', e => e.preventDefault())

  await loadDefaultPlan()
}


init()
