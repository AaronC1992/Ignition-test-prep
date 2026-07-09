import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import './App.css'

type Tool = 'fill' | 'brush' | 'eraser'

type Region = {
  id: string
  d: string
}

type Artwork = {
  id: string
  title: string
  prompt: string
  viewBox: string
  regions: Region[]
}

type ArtworkState = {
  fills: Record<string, string>
  drawing: string | null
}

type GameMeta = {
  streak: number
  lastActive: string
  gems: number
  totalSessions: number
  completedScenes: string[]
  unlocked: string[]
  dailyClaimed: string | null
  challengeWins: number
  totalBrushStrokes: number
  totalExports: number
}

type ChallengeType = 'fills' | 'scene' | 'brush' | 'export'

type DailyChallenge = {
  id: string
  title: string
  description: string
  type: ChallengeType
  target: number
  reward: number
}

type Metrics = {
  totalFills: number
  totalRegions: number
  completedScenes: number
}

type Achievement = {
  id: string
  title: string
  description: string
  check: (metrics: Metrics, meta: GameMeta) => boolean
}

type ApplyStateOptions = {
  brushStrokeDelta?: number
}

const STORAGE_KEY = 'chromatic_haven_v1'
const META_KEY = 'chromatic_haven_meta_v1'

const DEFAULT_META: GameMeta = {
  streak: 1,
  lastActive: '',
  gems: 0,
  totalSessions: 0,
  completedScenes: [],
  unlocked: [],
  dailyClaimed: null,
  challengeWins: 0,
  totalBrushStrokes: 0,
  totalExports: 0,
}

const ARTWORKS: Artwork[] = [
  {
    id: 'moon-garden',
    title: 'Moon Garden',
    prompt: 'Petals and leaves around a calm moon',
    viewBox: '0 0 1000 1000',
    regions: [
      { id: 'm_center', d: 'M500 310a165 165 0 1 0 0.1 0z' },
      {
        id: 'm_ring_1',
        d: 'M500 110c78 98 78 98 190 56-32 122-32 122 62 196-123 18-123 18-153 134-89-87-89-87-218 0-30-116-30-116-153-134 94-74 94-74 62-196 112 42 112 42 190-56z',
      },
      {
        id: 'm_petal_1',
        d: 'M500 32c44 62 44 62 0 124-44-62-44-62 0-124z',
      },
      {
        id: 'm_petal_2',
        d: 'M788 124c-9 76-9 76-75 98 9-76 9-76 75-98z',
      },
      {
        id: 'm_petal_3',
        d: 'M918 370c-72 24-72 24-121-25 72-24 72-24 121 25z',
      },
      {
        id: 'm_petal_4',
        d: 'M870 668c-62-45-62-45-48-113 62 45 62 45 48 113z',
      },
      {
        id: 'm_petal_5',
        d: 'M656 870c-23-72-23-72 29-121 23 72 23 72-29 121z',
      },
      {
        id: 'm_petal_6',
        d: 'M344 870c52-49 52-49 29-121-52 49-52 49-29 121z',
      },
      {
        id: 'm_petal_7',
        d: 'M130 668c48-68 48-68 48-113-48 68-48 68-48 113z',
      },
      {
        id: 'm_petal_8',
        d: 'M82 370c71 49 71 49 121-25-71-49-71-49-121 25z',
      },
      {
        id: 'm_petal_9',
        d: 'M212 124c66 22 66 22 75 98-66-22-66-22-75-98z',
      },
      {
        id: 'm_leaf_1',
        d: 'M265 530c105-50 105-50 80-150-105 50-105 50-80 150z',
      },
      {
        id: 'm_leaf_2',
        d: 'M735 530c-105-50-105-50-80-150 105 50 105 50 80 150z',
      },
      {
        id: 'm_leaf_3',
        d: 'M500 760c74-89 74-89 0-172-74 89-74 89 0 172z',
      },
      {
        id: 'm_leaf_4',
        d: 'M395 655c-24-110-24-110-135-117 24 110 24 110 135 117z',
      },
      {
        id: 'm_leaf_5',
        d: 'M605 655c24-110 24-110 135-117-24 110-24 110-135 117z',
      },
    ],
  },
  {
    id: 'owl-temple',
    title: 'Owl Temple',
    prompt: 'A geometric owl with glowing eyes',
    viewBox: '0 0 1000 1000',
    regions: [
      { id: 'o_head', d: 'M500 140c210 0 320 130 320 290S710 770 500 770 180 590 180 430s110-290 320-290z' },
      { id: 'o_brow_left', d: 'M250 290c90-50 90-50 180 0-90 35-90 35-180 0z' },
      { id: 'o_brow_right', d: 'M570 290c90-50 90-50 180 0-90 35-90 35-180 0z' },
      { id: 'o_eye_left', d: 'M355 430a90 90 0 1 0 0.1 0z' },
      { id: 'o_eye_right', d: 'M645 430a90 90 0 1 0 0.1 0z' },
      { id: 'o_pupil_left', d: 'M355 430a42 42 0 1 0 0.1 0z' },
      { id: 'o_pupil_right', d: 'M645 430a42 42 0 1 0 0.1 0z' },
      { id: 'o_beak', d: 'M500 470l70 120h-140z' },
      { id: 'o_chest_1', d: 'M500 555c95 70 95 70 0 140-95-70-95-70 0-140z' },
      { id: 'o_chest_2', d: 'M395 585c70 55 70 55 0 115-70-55-70-55 0-115z' },
      { id: 'o_chest_3', d: 'M605 585c-70 55-70 55 0 115 70-55 70-55 0-115z' },
      { id: 'o_wing_left', d: 'M205 445c120 65 120 65 90 250-120-65-120-65-90-250z' },
      { id: 'o_wing_right', d: 'M795 445c-120 65-120 65-90 250 120-65 120-65 90-250z' },
      { id: 'o_orb_left', d: 'M270 830a60 60 0 1 0 0.1 0z' },
      { id: 'o_orb_right', d: 'M730 830a60 60 0 1 0 0.1 0z' },
    ],
  },
  {
    id: 'sun-citadel',
    title: 'Sun Citadel',
    prompt: 'An ornate sun over calm waves',
    viewBox: '0 0 1000 1000',
    regions: [
      { id: 's_core', d: 'M500 290a140 140 0 1 0 0.1 0z' },
      { id: 's_ring', d: 'M500 110c118 0 215 97 215 215s-97 215-215 215-215-97-215-215 97-215 215-215zm0 70c-80 0-145 65-145 145s65 145 145 145 145-65 145-145-65-145-145-145z' },
      { id: 's_ray_1', d: 'M500 12l40 88h-80z' },
      { id: 's_ray_2', d: 'M706 72l20 95-70-35z' },
      { id: 's_ray_3', d: 'M870 220l-40 88-45-66z' },
      { id: 's_ray_4', d: 'M910 430l-88 40 10-79z' },
      { id: 's_ray_5', d: 'M812 638l-95 20 35-70z' },
      { id: 's_ray_6', d: 'M640 802l-88-40 66-45z' },
      { id: 's_ray_7', d: 'M430 910l-40-88 79 10z' },
      { id: 's_ray_8', d: 'M220 812l-20-95 70 35z' },
      { id: 's_ray_9', d: 'M90 640l40-88 45 66z' },
      { id: 's_ray_10', d: 'M42 430l88-40-10 79z' },
      { id: 's_ray_11', d: 'M130 222l95-20-35 70z' },
      { id: 's_ray_12', d: 'M300 72l88 40-66 45z' },
      { id: 's_wave_1', d: 'M140 690c120-70 220 70 340 0s220 70 340 0v90c-120 70-220-70-340 0s-220-70-340 0z' },
      { id: 's_wave_2', d: 'M110 810c120-70 220 70 340 0s220 70 340 0v120H110z' },
    ],
  },
]

const PALETTES = [
  {
    name: 'Velvet Night',
    colors: ['#3A86FF', '#B5179E', '#FF006E', '#FB5607', '#FFBE0B'],
  },
  {
    name: 'Botanical Calm',
    colors: ['#3D5A40', '#588157', '#A3B18A', '#DAD7CD', '#E07A5F'],
  },
  {
    name: 'Ink and Gold',
    colors: ['#111111', '#2A2A72', '#7C3AED', '#E9C46A', '#F4A261'],
  },
]

const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'daily-fill-20',
    title: 'Color Sprint',
    description: 'Fill 20 regions in any scene',
    type: 'fills',
    target: 20,
    reward: 25,
  },
  {
    id: 'daily-scene-1',
    title: 'Scene Finisher',
    description: 'Complete one full scene',
    type: 'scene',
    target: 1,
    reward: 35,
  },
  {
    id: 'daily-brush-15',
    title: 'Brush Flow',
    description: 'Create 15 brush strokes',
    type: 'brush',
    target: 15,
    reward: 20,
  },
  {
    id: 'daily-export-1',
    title: 'Share Worthy',
    description: 'Export one piece as PNG',
    type: 'export',
    target: 1,
    reward: 30,
  },
]

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-color',
    title: 'First Color',
    description: 'Fill your first region',
    check: (metrics) => metrics.totalFills >= 1,
  },
  {
    id: 'color-keeper',
    title: 'Color Keeper',
    description: 'Fill 25 regions',
    check: (metrics) => metrics.totalFills >= 25,
  },
  {
    id: 'scene-master',
    title: 'Scene Master',
    description: 'Finish one scene',
    check: (metrics) => metrics.completedScenes >= 1,
  },
  {
    id: 'gallery-legend',
    title: 'Gallery Legend',
    description: 'Finish every scene in the gallery',
    check: (metrics) => metrics.completedScenes === ARTWORKS.length,
  },
  {
    id: 'brush-poet',
    title: 'Brush Poet',
    description: 'Create 40 brush strokes',
    check: (_, meta) => meta.totalBrushStrokes >= 40,
  },
  {
    id: 'daily-devotee',
    title: 'Daily Devotee',
    description: 'Claim daily challenge 3 times',
    check: (_, meta) => meta.challengeWins >= 3,
  },
]

const cloneState = (state: ArtworkState): ArtworkState => ({
  fills: { ...state.fills },
  drawing: state.drawing,
})

const emptyArtworkState = (): ArtworkState => ({
  fills: {},
  drawing: null,
})

const loadSavedStates = (): Record<string, ArtworkState> => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {}
    }
    const parsed = JSON.parse(raw) as Record<string, ArtworkState>
    return parsed
  } catch {
    return {}
  }
}

const getDayKey = (date: Date = new Date()) =>
  date.toISOString().slice(0, 10)

const getDayDiff = (fromDay: string, toDay: string) => {
  if (!fromDay || !toDay) {
    return 0
  }
  const from = new Date(`${fromDay}T00:00:00`).getTime()
  const to = new Date(`${toDay}T00:00:00`).getTime()
  return Math.round((to - from) / 86400000)
}

const loadSavedMeta = (): GameMeta => {
  const today = getDayKey()

  try {
    const raw = window.localStorage.getItem(META_KEY)
    const parsed = raw ? (JSON.parse(raw) as Partial<GameMeta>) : {}
    const merged: GameMeta = {
      ...DEFAULT_META,
      ...parsed,
      completedScenes: Array.isArray(parsed.completedScenes)
        ? parsed.completedScenes
        : [],
      unlocked: Array.isArray(parsed.unlocked) ? parsed.unlocked : [],
      lastActive: parsed.lastActive ?? '',
      dailyClaimed: parsed.dailyClaimed ?? null,
    }

    if (!merged.lastActive) {
      return {
        ...merged,
        streak: 1,
        totalSessions: 1,
        lastActive: today,
      }
    }

    const dayGap = getDayDiff(merged.lastActive, today)

    if (dayGap <= 0) {
      return merged
    }

    return {
      ...merged,
      streak: dayGap === 1 ? merged.streak + 1 : 1,
      totalSessions: merged.totalSessions + 1,
      lastActive: today,
    }
  } catch {
    return {
      ...DEFAULT_META,
      streak: 1,
      totalSessions: 1,
      lastActive: today,
    }
  }
}

const computeMetrics = (states: Record<string, ArtworkState>): Metrics => {
  let totalFills = 0
  let totalRegions = 0
  let completedScenes = 0

  for (const artwork of ARTWORKS) {
    const fills = Object.keys(states[artwork.id]?.fills ?? {}).length
    totalFills += fills
    totalRegions += artwork.regions.length
    if (fills === artwork.regions.length) {
      completedScenes += 1
    }
  }

  return { totalFills, totalRegions, completedScenes }
}

const challengeProgress = (
  challenge: DailyChallenge,
  metrics: Metrics,
  meta: GameMeta,
) => {
  switch (challenge.type) {
    case 'fills':
      return metrics.totalFills
    case 'scene':
      return metrics.completedScenes
    case 'brush':
      return meta.totalBrushStrokes
    case 'export':
      return meta.totalExports
    default:
      return 0
  }
}

function App() {
  const [activeArtworkId, setActiveArtworkId] = useState(ARTWORKS[0].id)
  const [tool, setTool] = useState<Tool>('fill')
  const [activeColor, setActiveColor] = useState(PALETTES[0].colors[0])
  const [activePalette, setActivePalette] = useState(PALETTES[0].name)
  const [brushSize, setBrushSize] = useState(10)
  const [message, setMessage] = useState('')
  const [allStates, setAllStates] = useState<Record<string, ArtworkState>>(() =>
    loadSavedStates(),
  )
  const [history, setHistory] = useState<ArtworkState[]>([])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [meta, setMeta] = useState<GameMeta>(() => loadSavedMeta())
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [focusMode, setFocusMode] = useState(false)
  const [hintRegionId, setHintRegionId] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<AudioContext | null>(null)
  const hintTimerRef = useRef<number | null>(null)
  const allStatesRef = useRef(allStates)
  const metaRef = useRef(meta)
  const isDrawingRef = useRef(false)
  const didDrawRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)

  const activeArtwork = useMemo(
    () => ARTWORKS.find((art) => art.id === activeArtworkId) ?? ARTWORKS[0],
    [activeArtworkId],
  )

  const activeState = allStates[activeArtwork.id] ?? emptyArtworkState()

  const metrics = useMemo(() => computeMetrics(allStates), [allStates])

  const todayKey = getDayKey()
  const challengeSeed = Number(todayKey.replaceAll('-', ''))
  const todaysChallenge = DAILY_CHALLENGES[
    challengeSeed % DAILY_CHALLENGES.length
  ]

  const todaysChallengeProgress = challengeProgress(
    todaysChallenge,
    metrics,
    meta,
  )

  const setToast = (text: string) => {
    setMessage(text)
    window.setTimeout(() => {
      setMessage('')
    }, 1800)
  }

  const persistStates = (next: Record<string, ArtworkState>) => {
    setAllStates(next)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const persistMeta = useCallback((next: GameMeta) => {
    setMeta(next)
    window.localStorage.setItem(META_KEY, JSON.stringify(next))
  }, [])

  const playTone = useCallback(
    (type: 'paint' | 'reward' | 'clear') => {
      if (!soundEnabled) {
        return
      }

      const AudioApi =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      if (!AudioApi) {
        return
      }

      if (!audioRef.current) {
        audioRef.current = new AudioApi()
      }

      const context = audioRef.current
      const oscillator = context.createOscillator()
      const gain = context.createGain()

      oscillator.connect(gain)
      gain.connect(context.destination)

      const now = context.currentTime
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)

      if (type === 'paint') {
        oscillator.frequency.setValueAtTime(420, now)
        oscillator.type = 'triangle'
      }

      if (type === 'reward') {
        oscillator.frequency.setValueAtTime(720, now)
        oscillator.type = 'sine'
      }

      if (type === 'clear') {
        oscillator.frequency.setValueAtTime(260, now)
        oscillator.type = 'square'
      }

      oscillator.start(now)
      oscillator.stop(now + 0.2)
    },
    [soundEnabled],
  )

  const evaluateAchievements = useCallback(
    (baseMeta: GameMeta, states: Record<string, ArtworkState>) => {
      const sceneMetrics = computeMetrics(states)
      const unlockedNow = ACHIEVEMENTS.filter(
        (item) => !baseMeta.unlocked.includes(item.id) && item.check(sceneMetrics, baseMeta),
      )

      if (unlockedNow.length === 0) {
        return baseMeta
      }

      const nextMeta = {
        ...baseMeta,
        unlocked: [...baseMeta.unlocked, ...unlockedNow.map((item) => item.id)],
        gems: baseMeta.gems + unlockedNow.length * 15,
      }

      const unlockNames = unlockedNow.map((item) => item.title).join(', ')
      setToast(`Achievement unlocked: ${unlockNames}`)
      playTone('reward')

      return nextMeta
    },
    [playTone],
  )

  const applyState = (
    nextState: ArtworkState,
    pushToHistory: boolean,
    options: ApplyStateOptions = {},
  ) => {
    const merged = {
      ...allStates,
      [activeArtwork.id]: cloneState(nextState),
    }
    persistStates(merged)

    if (pushToHistory) {
      const nextHistory = [...history.slice(0, historyIndex + 1), cloneState(nextState)]
      setHistory(nextHistory)
      setHistoryIndex(nextHistory.length - 1)
    }

    const sceneCompleted =
      Object.keys(nextState.fills).length === activeArtwork.regions.length

    let nextMeta = metaRef.current

    if (options.brushStrokeDelta) {
      nextMeta = {
        ...nextMeta,
        totalBrushStrokes: nextMeta.totalBrushStrokes + options.brushStrokeDelta,
      }
    }

    if (
      sceneCompleted &&
      !nextMeta.completedScenes.includes(activeArtwork.id)
    ) {
      nextMeta = {
        ...nextMeta,
        completedScenes: [...nextMeta.completedScenes, activeArtwork.id],
        gems: nextMeta.gems + 40,
      }
      setToast('Scene completed, bonus gems awarded')
      playTone('reward')
    }

    const finalMeta = evaluateAchievements(nextMeta, merged)
    if (finalMeta !== metaRef.current) {
      persistMeta(finalMeta)
    }
  }

  const paintSavedDrawing = (drawing: string | null) => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!drawing) {
      return
    }

    const image = new Image()
    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    }
    image.src = drawing
  }

  const snapshotCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) {
      return null
    }
    return canvas.toDataURL('image/png')
  }

  useEffect(() => {
    allStatesRef.current = allStates
  }, [allStates])

  useEffect(() => {
    metaRef.current = meta
  }, [meta])

  useEffect(() => {
    return () => {
      if (hintTimerRef.current) {
        window.clearTimeout(hintTimerRef.current)
      }
      if (audioRef.current) {
        audioRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    const known = allStatesRef.current[activeArtwork.id]
    const initial = known ? cloneState(known) : emptyArtworkState()
    setHistory([initial])
    setHistoryIndex(0)
    paintSavedDrawing(initial.drawing)
  }, [activeArtwork.id])

  useEffect(() => {
    const resizeCanvas = () => {
      const board = boardRef.current
      const canvas = canvasRef.current
      if (!board || !canvas) {
        return
      }
      const rect = board.getBoundingClientRect()
      const width = Math.max(1, Math.round(rect.width))
      const height = Math.max(1, Math.round(rect.height))

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        paintSavedDrawing(activeState.drawing)
      }
    }

    resizeCanvas()

    const observer = new ResizeObserver(() => {
      resizeCanvas()
    })

    if (boardRef.current) {
      observer.observe(boardRef.current)
    }

    window.addEventListener('resize', resizeCanvas)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [activeArtwork.id, activeState.drawing])

  const getPoint = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) {
      return { x: 0, y: 0 }
    }
    const rect = canvas.getBoundingClientRect()
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  const drawSegment = (
    from: { x: number; y: number },
    to: { x: number; y: number },
    mode: Tool,
  ) => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.lineWidth = brushSize

    if (mode === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = activeColor
    }

    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()
    ctx.closePath()
  }

  const beginDraw = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (tool === 'fill') {
      return
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    isDrawingRef.current = true
    didDrawRef.current = false
    const point = getPoint(event)
    lastPointRef.current = point
    drawSegment(point, point, tool)
    didDrawRef.current = true
  }

  const continueDraw = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || tool === 'fill') {
      return
    }
    const point = getPoint(event)
    const previous = lastPointRef.current
    if (!previous) {
      lastPointRef.current = point
      return
    }
    drawSegment(previous, point, tool)
    lastPointRef.current = point
    didDrawRef.current = true
  }

  const endDraw = () => {
    if (!isDrawingRef.current) {
      return
    }
    isDrawingRef.current = false
    lastPointRef.current = null

    if (!didDrawRef.current) {
      return
    }

    const nextState: ArtworkState = {
      fills: { ...activeState.fills },
      drawing: snapshotCanvas(),
    }

    applyState(nextState, true, { brushStrokeDelta: 1 })
    playTone('paint')
  }

  const onRegionClick = (regionId: string) => {
    if (tool !== 'fill') {
      return
    }

    const nextState: ArtworkState = {
      fills: {
        ...activeState.fills,
        [regionId]: activeColor,
      },
      drawing: activeState.drawing,
    }

    applyState(nextState, true)

    setHintRegionId(null)
    playTone('paint')
  }

  const undo = () => {
    if (historyIndex <= 0) {
      return
    }
    const nextIndex = historyIndex - 1
    const snapshot = history[nextIndex]
    if (!snapshot) {
      return
    }
    setHistoryIndex(nextIndex)
    applyState(snapshot, false)
    paintSavedDrawing(snapshot.drawing)
    playTone('clear')
  }

  const redo = () => {
    if (historyIndex >= history.length - 1) {
      return
    }
    const nextIndex = historyIndex + 1
    const snapshot = history[nextIndex]
    if (!snapshot) {
      return
    }
    setHistoryIndex(nextIndex)
    applyState(snapshot, false)
    paintSavedDrawing(snapshot.drawing)
    playTone('clear')
  }

  const clearCurrentArtwork = () => {
    const nextState = emptyArtworkState()
    paintSavedDrawing(null)
    applyState(nextState, true)
    setToast('Artwork cleared')
    playTone('clear')
  }

  const saveNow = () => {
    const drawing = snapshotCanvas()
    const nextState: ArtworkState = {
      fills: { ...activeState.fills },
      drawing,
    }
    applyState(nextState, false)
    setToast('Progress saved')
  }

  const inspireColor = () => {
    const colors =
      PALETTES.find((palette) => palette.name === activePalette)?.colors ??
      PALETTES[0].colors
    const randomColor = colors[Math.floor(Math.random() * colors.length)]
    setActiveColor(randomColor)
    setToast(`Color selected ${randomColor}`)
    playTone('paint')
  }

  const revealHint = () => {
    const nextRegion = activeArtwork.regions.find(
      (region) => !activeState.fills[region.id],
    )

    if (!nextRegion) {
      setToast('Scene is complete, no hint needed')
      return
    }

    setHintRegionId(nextRegion.id)

    if (hintTimerRef.current) {
      window.clearTimeout(hintTimerRef.current)
    }

    hintTimerRef.current = window.setTimeout(() => {
      setHintRegionId(null)
    }, 2600)
  }

  const claimDailyReward = () => {
    if (metaRef.current.dailyClaimed === todayKey) {
      setToast('Daily reward already claimed')
      return
    }

    if (todaysChallengeProgress < todaysChallenge.target) {
      setToast('Complete the daily challenge to claim reward')
      return
    }

    const baseMeta = {
      ...metaRef.current,
      gems: metaRef.current.gems + todaysChallenge.reward,
      dailyClaimed: todayKey,
      challengeWins: metaRef.current.challengeWins + 1,
    }

    const finalMeta = evaluateAchievements(baseMeta, allStates)
    persistMeta(finalMeta)
    playTone('reward')
    setToast(`Daily reward claimed, +${todaysChallenge.reward} gems`)
  }

  const exportAsPng = async () => {
    const canvas = canvasRef.current
    const svg = svgRef.current

    if (!canvas || !svg) {
      return
    }

    const serializer = new XMLSerializer()
    const clone = svg.cloneNode(true) as SVGSVGElement
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')

    const svgMarkup = serializer.serializeToString(clone)
    const blob = new Blob([svgMarkup], {
      type: 'image/svg+xml;charset=utf-8',
    })
    const blobUrl = URL.createObjectURL(blob)

    const image = new Image()
    await new Promise<void>((resolve) => {
      image.onload = () => resolve()
      image.src = blobUrl
    })

    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = canvas.width
    exportCanvas.height = canvas.height

    const exportCtx = exportCanvas.getContext('2d')
    if (!exportCtx) {
      URL.revokeObjectURL(blobUrl)
      return
    }

    exportCtx.fillStyle = '#fffef8'
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)
    exportCtx.drawImage(image, 0, 0, exportCanvas.width, exportCanvas.height)
    exportCtx.drawImage(canvas, 0, 0)

    const link = document.createElement('a')
    link.href = exportCanvas.toDataURL('image/png')
    link.download = `${activeArtwork.id}.png`
    link.click()

    URL.revokeObjectURL(blobUrl)

    const baseMeta = {
      ...metaRef.current,
      totalExports: metaRef.current.totalExports + 1,
    }
    const finalMeta = evaluateAchievements(baseMeta, allStates)
    persistMeta(finalMeta)

    setToast('PNG exported')
    playTone('reward')
  }

  const completion = Math.round(
    (Object.keys(activeState.fills).length / activeArtwork.regions.length) * 100,
  )

  const totalColored = ARTWORKS.reduce((sum, artwork) => {
    const count = Object.keys(allStates[artwork.id]?.fills ?? {}).length
    return sum + count
  }, 0)

  const totalRegions = ARTWORKS.reduce(
    (sum, artwork) => sum + artwork.regions.length,
    0,
  )

  const libraryCompletion = Math.round((totalColored / totalRegions) * 100)
  const challengePercent = Math.min(
    100,
    Math.round((todaysChallengeProgress / todaysChallenge.target) * 100),
  )
  const challengeDone = todaysChallengeProgress >= todaysChallenge.target
  const canClaimChallenge = challengeDone && meta.dailyClaimed !== todayKey

  return (
    <main className={`app-shell ${focusMode ? 'focus-mode' : ''}`}>
      <header className="top-bar">
        <div>
          <p className="brand">CHROMATIC HAVEN</p>
          <h1>Chromatic Haven</h1>
          <p className="subline">
            Fill intricate scenes, paint freehand details, and build your art library.
          </p>
        </div>
        <div className="stats-panel">
          <div>
            <span>Scene progress</span>
            <strong>{completion}%</strong>
          </div>
          <div>
            <span>Library progress</span>
            <strong>{libraryCompletion}%</strong>
          </div>
          <div>
            <span>Daily streak</span>
            <strong>{meta.streak} days</strong>
          </div>
          <div>
            <span>Studio gems</span>
            <strong>{meta.gems}</strong>
          </div>
        </div>
      </header>

      <section className="workspace">
        <aside className="left-rail">
          <h2>Gallery</h2>
          <div className="gallery-list">
            {ARTWORKS.map((artwork) => {
              const artworkState = allStates[artwork.id] ?? emptyArtworkState()
              const fillCount = Object.keys(artworkState.fills).length
              const previewPercent = Math.round(
                (fillCount / artwork.regions.length) * 100,
              )

              return (
                <button
                  key={artwork.id}
                  type="button"
                  className={`gallery-card ${
                    artwork.id === activeArtwork.id ? 'is-active' : ''
                  }`}
                  onClick={() => setActiveArtworkId(artwork.id)}
                >
                  <svg viewBox={artwork.viewBox} role="img" aria-label={artwork.title}>
                    {artwork.regions.map((region) => (
                      <path
                        key={region.id}
                        d={region.d}
                        fill={artworkState.fills[region.id] ?? '#fffef8'}
                        stroke="#1e1e1e"
                        strokeWidth="10"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    ))}
                  </svg>
                  <div className="gallery-meta">
                    <strong>{artwork.title}</strong>
                    <span>{previewPercent}% complete</span>
                  </div>
                </button>
              )
            })}
          </div>
        </aside>

        <div className="canvas-panel">
          <div className="canvas-header">
            <div>
              <h2>{activeArtwork.title}</h2>
              <p>{activeArtwork.prompt}</p>
            </div>
            <div className="quick-actions">
              <button type="button" onClick={undo} disabled={historyIndex === 0}>
                Undo
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
              >
                Redo
              </button>
              <button type="button" onClick={saveNow}>
                Save
              </button>
              <button type="button" onClick={exportAsPng}>
                Export PNG
              </button>
              <button type="button" onClick={revealHint}>
                Hint
              </button>
              <button type="button" onClick={inspireColor}>
                Inspire Color
              </button>
              <button type="button" onClick={() => setFocusMode((prev) => !prev)}>
                {focusMode ? 'Exit Focus' : 'Focus Mode'}
              </button>
            </div>
          </div>

          <div className="canvas-board" ref={boardRef}>
            <svg ref={svgRef} viewBox={activeArtwork.viewBox} role="img" aria-label="Coloring canvas">
              {activeArtwork.regions.map((region) => (
                <path
                  key={region.id}
                  d={region.d}
                  className={hintRegionId === region.id ? 'hint-region' : ''}
                  fill={activeState.fills[region.id] ?? '#fffef8'}
                  stroke="#1d1d1d"
                  strokeWidth="10"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  onClick={() => onRegionClick(region.id)}
                />
              ))}
            </svg>
            <canvas
              ref={canvasRef}
              className={tool === 'fill' ? 'pass-through' : ''}
              onPointerDown={beginDraw}
              onPointerMove={continueDraw}
              onPointerUp={endDraw}
              onPointerLeave={endDraw}
            />
          </div>
        </div>

        <aside className="right-rail">
          <h2>Studio Tools</h2>
          <div className="tool-grid">
            <button
              type="button"
              className={tool === 'fill' ? 'selected' : ''}
              onClick={() => setTool('fill')}
            >
              Fill
            </button>
            <button
              type="button"
              className={tool === 'brush' ? 'selected' : ''}
              onClick={() => setTool('brush')}
            >
              Brush
            </button>
            <button
              type="button"
              className={tool === 'eraser' ? 'selected' : ''}
              onClick={() => setTool('eraser')}
            >
              Erase
            </button>
            <button type="button" className="warn" onClick={clearCurrentArtwork}>
              Clear Scene
            </button>
          </div>

          <div className="control-block">
            <label htmlFor="brush-size">Brush size: {brushSize}px</label>
            <input
              id="brush-size"
              type="range"
              min={2}
              max={30}
              value={brushSize}
              onChange={(event) => setBrushSize(Number(event.target.value))}
            />
          </div>

          <div className="control-block">
            <p>Palettes</p>
            <div className="palette-tabs">
              {PALETTES.map((palette) => (
                <button
                  key={palette.name}
                  type="button"
                  className={activePalette === palette.name ? 'selected' : ''}
                  onClick={() => {
                    setActivePalette(palette.name)
                    setActiveColor(palette.colors[0])
                  }}
                >
                  {palette.name}
                </button>
              ))}
            </div>
            <div className="swatch-row">
              {PALETTES.find((palette) => palette.name === activePalette)?.colors.map(
                (color) => (
                  <button
                    key={color}
                    type="button"
                    className={`swatch ${activeColor === color ? 'selected' : ''}`}
                    onClick={() => setActiveColor(color)}
                    style={{ background: color }}
                    aria-label={`Select ${color}`}
                  />
                ),
              )}
            </div>
          </div>

          <div className="control-block">
            <label htmlFor="custom-color">Custom color</label>
            <input
              id="custom-color"
              type="color"
              value={activeColor}
              onChange={(event) => setActiveColor(event.target.value)}
            />
          </div>

          <div className="control-block challenge-block">
            <p>Daily challenge</p>
            <strong>{todaysChallenge.title}</strong>
            <span>{todaysChallenge.description}</span>
            <div className="challenge-bar" role="progressbar" aria-valuenow={challengePercent} aria-valuemin={0} aria-valuemax={100}>
              <div style={{ width: `${challengePercent}%` }} />
            </div>
            <p className="challenge-text">
              {Math.min(todaysChallengeProgress, todaysChallenge.target)} / {todaysChallenge.target}
            </p>
            <button type="button" onClick={claimDailyReward} disabled={!canClaimChallenge}>
              {meta.dailyClaimed === todayKey ? 'Reward Claimed' : `Claim ${todaysChallenge.reward} Gems`}
            </button>
          </div>

          <div className="control-block settings-block">
            <p>Studio settings</p>
            <label className="toggle-row" htmlFor="sound-toggle">
              <span>Sound effects</span>
              <input
                id="sound-toggle"
                type="checkbox"
                checked={soundEnabled}
                onChange={(event) => setSoundEnabled(event.target.checked)}
              />
            </label>
            <span className="tiny-note">Sessions: {meta.totalSessions}</span>
          </div>

          <div className="control-block achievements-block">
            <p>Achievements</p>
            <div className="achievement-list">
              {ACHIEVEMENTS.map((achievement) => {
                const unlocked = meta.unlocked.includes(achievement.id)
                return (
                  <div key={achievement.id} className={`achievement ${unlocked ? 'done' : ''}`}>
                    <strong>{achievement.title}</strong>
                    <span>{achievement.description}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {message && <div className="toast">{message}</div>}
        </aside>
      </section>
    </main>
  )
}

export default App
