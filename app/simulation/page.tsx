"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Play,
  Pause,
  RotateCcw,
  UserPlus,
  Settings,
  Activity,
  Users,
  FileText,
  AlertCircle,
  ArrowLeft,
  Zap,
  Clock,
  TrendingUp,
} from "lucide-react"

interface SimulationConfig {
  running: boolean
  speed: number
  autoAdmission: boolean
  autoDischarge: boolean
  autoStudyProgress: boolean
  admissionIntervalMs: number
  studyProgressIntervalMs: number
}

interface Config {
  simulation: SimulationConfig
  lastUpdated: string
}

interface SimulationEvent {
  type: string
  message: string
}

interface TickResult {
  admissions: number
  discharges: number
  studyProgressions: number
  events: SimulationEvent[]
}

interface Stats {
  patients: number
  studies: number
  events: number
  activePatients: number
  completedStudies: number
  pendingStudies: number
}

export default function SimulationPage() {
  const [config, setConfig] = useState<Config | null>(null)
  const [stats, setStats] = useState<Stats>({
    patients: 0,
    studies: 0,
    events: 0,
    activePatients: 0,
    completedStudies: 0,
    pendingStudies: 0,
  })
  const [recentEvents, setRecentEvents] = useState<SimulationEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [tickCount, setTickCount] = useState(0)

  // Cargar configuración inicial
  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/simulation")
      const data = await res.json()
      setConfig(data)
    } catch (error) {
      console.error("Error loading config:", error)
    }
  }, [])

  // Cargar estadísticas
  const loadStats = useCallback(async () => {
    try {
      const [patientsRes, studiesRes, eventsRes] = await Promise.all([
        fetch("/api/patients"),
        fetch("/api/studies"),
        fetch("/api/events"),
      ])

      const patientsData = await patientsRes.json()
      const studiesData = await studiesRes.json()
      const eventsData = await eventsRes.json()

      // Extraer arrays correctamente
      const patients = patientsData.patients || []
      const studies = studiesData.studies || []
      const events = eventsData.events || []

      const activePatients = patients.filter((p: { status: string }) => p.status === "active")
      const completedStudies = studies.filter((s: { status: string }) => s.status === "Completado")
      const pendingStudies = studies.filter((s: { status: string }) => s.status !== "Completado")

      setStats({
        patients: patients.length,
        studies: studies.length,
        events: events.length,
        activePatients: activePatients.length,
        completedStudies: completedStudies.length,
        pendingStudies: pendingStudies.length,
      })

      // Cargar eventos recientes también
      if (events.length > 0) {
        setRecentEvents(events.slice(0, 10).map((e: any) => ({
          type: e.type,
          message: e.message,
        })))
      }
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }, [])

  // Cargar datos iniciales
  useEffect(() => {
    const init = async () => {
      await loadConfig()
      await loadStats()
      setLoading(false)
    }
    init()
  }, [loadConfig, loadStats])

  // Polling para actualizar estadísticas en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      loadStats()
    }, 3000) // Actualizar cada 3 segundos

    return () => clearInterval(interval)
  }, [loadStats])

  // Ejecutar tick de simulación
  const executeTick = useCallback(async () => {
    if (!config?.simulation.running) return

    try {
      const res = await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "tick" }),
      })

      const data = await res.json()
      if (data.success && data.results) {
        const results: TickResult = data.results
        setTickCount((prev) => prev + 1)

        if (results.events.length > 0) {
          setRecentEvents((prev) => [...results.events, ...prev].slice(0, 10))
        }

        // Recargar estadísticas
        await loadStats()
      }
    } catch (error) {
      console.error("Error executing tick:", error)
    }
  }, [config?.simulation.running, loadStats])

  // Loop de simulación
  useEffect(() => {
    if (!config?.simulation.running) return

    const interval = setInterval(
      executeTick,
      config.simulation.admissionIntervalMs / config.simulation.speed
    )

    return () => clearInterval(interval)
  }, [config?.simulation.running, config?.simulation.admissionIntervalMs, config?.simulation.speed, executeTick])

  // Acciones de simulación
  const handleAction = async (action: string, params?: Record<string, unknown>) => {
    try {
      const res = await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...params }),
      })

      const data = await res.json()

      if (data.config) {
        setConfig(data.config)
      }

      if (action === "reset") {
        setRecentEvents([])
        setTickCount(0)
        if (data.stats) {
          setStats({
            patients: data.stats.patients,
            studies: data.stats.studies,
            events: data.stats.events,
            activePatients: data.stats.patients,
            completedStudies: 0,
            pendingStudies: data.stats.studies,
          })
        }
      }

      if (action === "admit" && data.event) {
        setRecentEvents((prev) =>
          [{ type: data.event.type, message: data.event.message }, ...prev].slice(0, 10)
        )
        await loadStats()
      }

      if (action === "clear") {
        setStats({
          patients: 0,
          studies: 0,
          events: 0,
          activePatients: 0,
          completedStudies: 0,
          pendingStudies: 0,
        })
        setRecentEvents([])
        setTickCount(0)
      }
    } catch (error) {
      console.error("Error executing action:", error)
    }
  }

  const updateSimulationConfig = async (updates: Partial<SimulationConfig>) => {
    try {
      const res = await fetch("/api/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", ...updates }),
      })

      const data = await res.json()
      if (data.config) {
        setConfig(data.config)
      }
    } catch (error) {
      console.error("Error updating config:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando simulación...</p>
        </div>
      </div>
    )
  }

  const isRunning = config?.simulation.running ?? false

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Settings className="w-6 h-6 text-primary-foreground" />
                </div>
                Control de Simulación
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Gestiona la simulación de pacientes y estudios
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${
                isRunning
                  ? "bg-success/20 text-success"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isRunning ? "bg-success animate-pulse" : "bg-muted-foreground"
                }`}
              />
              {isRunning ? "Simulación Activa" : "Simulación Detenida"}
            </div>
          </div>
        </div>
      </header>

      <main className="p-8 space-y-8">
        {/* Control Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de Control */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Controles de Simulación
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <button
                onClick={() => handleAction(isRunning ? "stop" : "start")}
                className={`p-4 rounded-xl flex flex-col items-center gap-2 transition ${
                  isRunning
                    ? "bg-warning/20 hover:bg-warning/30 text-warning"
                    : "bg-success/20 hover:bg-success/30 text-success"
                }`}
              >
                {isRunning ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8" />
                )}
                <span className="font-medium">
                  {isRunning ? "Pausar" : "Iniciar"}
                </span>
              </button>

              <button
                onClick={() => handleAction("reset", { count: 15 })}
                className="p-4 rounded-xl bg-primary/20 hover:bg-primary/30 text-primary flex flex-col items-center gap-2 transition"
              >
                <RotateCcw className="w-8 h-8" />
                <span className="font-medium">Reiniciar</span>
              </button>

              <button
                onClick={() => handleAction("admit")}
                className="p-4 rounded-xl bg-accent/20 hover:bg-accent/30 text-accent flex flex-col items-center gap-2 transition"
              >
                <UserPlus className="w-8 h-8" />
                <span className="font-medium">Admitir</span>
              </button>

              <button
                onClick={() => handleAction("clear")}
                className="p-4 rounded-xl bg-destructive/20 hover:bg-destructive/30 text-destructive flex flex-col items-center gap-2 transition"
              >
                <AlertCircle className="w-8 h-8" />
                <span className="font-medium">Limpiar</span>
              </button>
            </div>

            {/* Velocidad */}
            <div className="mb-6">
              <label className="text-sm font-medium text-muted-foreground mb-3 block">
                Velocidad de Simulación
              </label>
              <div className="flex gap-2">
                {[0.5, 1, 2, 5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => updateSimulationConfig({ speed })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      config?.simulation.speed === speed
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Opciones */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground block">
                Opciones de Simulación
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 cursor-pointer hover:bg-secondary/70 transition">
                  <input
                    type="checkbox"
                    checked={config?.simulation.autoAdmission ?? true}
                    onChange={(e) =>
                      updateSimulationConfig({ autoAdmission: e.target.checked })
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Admisión automática</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 cursor-pointer hover:bg-secondary/70 transition">
                  <input
                    type="checkbox"
                    checked={config?.simulation.autoDischarge ?? true}
                    onChange={(e) =>
                      updateSimulationConfig({ autoDischarge: e.target.checked })
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Alta automática</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 cursor-pointer hover:bg-secondary/70 transition">
                  <input
                    type="checkbox"
                    checked={config?.simulation.autoStudyProgress ?? true}
                    onChange={(e) =>
                      updateSimulationConfig({ autoStudyProgress: e.target.checked })
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Progreso de estudios</span>
                </label>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Estadísticas
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-sm">Pacientes Activos</span>
                </div>
                <span className="text-xl font-bold">{stats.activePatients}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-accent" />
                  <span className="text-sm">Estudios Totales</span>
                </div>
                <span className="text-xl font-bold">{stats.studies}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-warning" />
                  <span className="text-sm">Estudios Pendientes</span>
                </div>
                <span className="text-xl font-bold text-warning">
                  {stats.pendingStudies}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-success" />
                  <span className="text-sm">Estudios Completados</span>
                </div>
                <span className="text-xl font-bold text-success">
                  {stats.completedStudies}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="text-sm">Ticks Ejecutados</span>
                </div>
                <span className="text-xl font-bold">{tickCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Eventos Recientes */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Eventos Recientes
          </h2>

          {recentEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay eventos recientes</p>
              <p className="text-sm">
                Inicia la simulación o admite un paciente para ver eventos
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentEvents.map((event, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg text-sm flex items-start gap-3 ${
                    event.type === "admission"
                      ? "bg-success/10 border border-success/20"
                      : event.type === "discharge"
                        ? "bg-muted border border-border"
                        : event.type === "alert"
                          ? "bg-destructive/10 border border-destructive/20"
                          : "bg-primary/10 border border-primary/20"
                  }`}
                >
                  {event.type === "admission" && (
                    <UserPlus className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  )}
                  {event.type === "discharge" && (
                    <Users className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  )}
                  {event.type === "alert" && (
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  {event.type === "study_completed" && (
                    <FileText className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  )}
                  <span>{event.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Link al Dashboard */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
          >
            <Activity className="w-5 h-5" />
            Ver Dashboard en Tiempo Real
          </Link>
        </div>
      </main>
    </div>
  )
}
