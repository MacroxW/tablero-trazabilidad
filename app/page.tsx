"use client"

import { useState, useMemo, useEffect } from "react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { AlertCircle, Stethoscope, TrendingUp, UserPlus, UserX, ChevronDown } from "lucide-react"

export default function ERDashboard() {
  const [patients, setPatients] = useState(generateInitialPatients())
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [filter, setFilter] = useState("all")
  const [sortBy, setSortBy] = useState("severity")
  const [liveEvents, setLiveEvents] = useState([])

  // Simulación de entrada/salida de pacientes
  useEffect(() => {
    const interval = setInterval(() => {
      setPatients((prev) => {
        const newPatients = [...prev]

        // 30% de probabilidad de que salga un paciente completado
        const completedIdx = newPatients.findIndex(
          (p) => p.studies.length > 0 && p.studies.every((s) => s.status === "Completado") && Math.random() > 0.7,
        )

        if (completedIdx !== -1) {
          const removedPatient = newPatients[completedIdx]
          newPatients.splice(completedIdx, 1)
          addLiveEvent(`${removedPatient.name} ha sido dado de alta`, "discharge")
        }

        // 40% de probabilidad de que ingrese un nuevo paciente
        if (Math.random() > 0.6) {
          const newPatient = generateRandomPatient()
          newPatients.unshift(newPatient)
          addLiveEvent(`${newPatient.name} ha ingresado a emergencias`, "admission")
        }

        return newPatients
      })
    }, 8000) // Cada 8 segundos

    return () => clearInterval(interval)
  }, [])

  // Actualizar tiempos de espera
  useEffect(() => {
    const interval = setInterval(() => {
      setPatients((prev) =>
        prev.map((p) => ({
          ...p,
          studies: p.studies.map((s) => ({
            ...s,
            waitTime: Math.min(s.waitTime + 1, 180),
          })),
        })),
      )
    }, 30000) // Cada 30 segundos
  }, [])

  const addLiveEvent = (message, type) => {
    const event = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString("es-AR"),
    }
    setLiveEvents((prev) => [event, ...prev.slice(0, 4)])
  }

  const handleStudyStatusChange = (patientId, studyIndex) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          const newStudies = [...p.studies]
          const currentStatuses = ["Solicitado", "Pendiente Resultado", "Completado"]
          const currentIndex = currentStatuses.indexOf(newStudies[studyIndex].status)
          newStudies[studyIndex].status = currentStatuses[(currentIndex + 1) % currentStatuses.length]
        }
        return p
      }),
    )
  }

  // Filtrado y ordenamiento
  const filteredAndSortedPatients = useMemo(() => {
    let filtered = patients

    if (filter === "critical") {
      filtered = filtered.filter((p) => p.severity === "Crítico")
    } else if (filter === "alerts") {
      filtered = filtered.filter((p) => p.studies.some((s) => s.hasAlert))
    } else if (filter === "pending") {
      filtered = filtered.filter((p) => p.studies.some((s) => s.status !== "Completado"))
    }

    return filtered.sort((a, b) => {
      if (sortBy === "severity") {
        const severityOrder = { Crítico: 0, Urgente: 1, Estable: 2 }
        return severityOrder[a.severity] - severityOrder[b.severity]
      } else if (sortBy === "waitTime") {
        const maxWaitA = Math.max(...a.studies.map((s) => s.waitTime), 0)
        const maxWaitB = Math.max(...b.studies.map((s) => s.waitTime), 0)
        return maxWaitB - maxWaitA
      }
      return 0
    })
  }, [patients, filter, sortBy])

  const stats = useMemo(() => {
    const total = patients.length
    const critical = patients.filter((p) => p.severity === "Crítico").length
    const alerts = patients.filter((p) => p.studies.some((s) => s.hasAlert)).length
    const studies = patients.reduce((acc, p) => acc + p.studies.length, 0)
    const completed = patients.reduce((acc, p) => acc + p.studies.filter((s) => s.status === "Completado").length, 0)
    const avgWaitTime = (
      patients.reduce((acc, p) => acc + Math.max(...p.studies.map((s) => s.waitTime), 0), 0) /
      Math.max(patients.length, 1)
    ).toFixed(0)

    return { total, critical, alerts, studies, completed, avgWaitTime }
  }, [patients])

  const chartData = [
    {
      name: "Solicitado",
      value: patients.reduce((acc, p) => acc + p.studies.filter((s) => s.status === "Solicitado").length, 0),
      fill: "oklch(0.72 0.2 55)",
    },
    {
      name: "Pendiente",
      value: patients.reduce((acc, p) => acc + p.studies.filter((s) => s.status === "Pendiente Resultado").length, 0),
      fill: "oklch(0.55 0.18 180)",
    },
    {
      name: "Completado",
      value: patients.reduce((acc, p) => acc + p.studies.filter((s) => s.status === "Completado").length, 0),
      fill: "oklch(0.55 0.15 140)",
    },
  ]

  const timeSeriesData = [
    { time: "08:00", pacientes: 8, completados: 3 },
    { time: "09:00", pacientes: 14, completados: 8 },
    { time: "10:00", pacientes: 19, completados: 12 },
    { time: "11:00", pacientes: 25, completados: 18 },
    { time: "12:00", pacientes: 22, completados: 16 },
    { time: "13:00", pacientes: stats.total, completados: stats.completed },
  ]

  const alertPatients = patients.filter((p) => p.studies.some((s) => s.hasAlert))

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-primary-foreground" />
              </div>
              Command Center - Emergencias
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Trazabilidad en tiempo real • Simulación en vivo</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Última actualización</div>
            <div className="text-xl font-semibold">{new Date().toLocaleTimeString("es-AR")}</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-muted-foreground text-sm font-medium">Pacientes Activos</div>
            <div className="text-3xl font-bold mt-2">{stats.total}</div>
            <div className="text-xs text-accent mt-2">En emergencias</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-muted-foreground text-sm font-medium">Críticos</div>
            <div className="text-3xl font-bold mt-2 text-destructive">{stats.critical}</div>
            <div className="text-xs text-destructive/70 mt-2">Requieren atención inmediata</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-muted-foreground text-sm font-medium">Alertas</div>
            <div className="text-3xl font-bold mt-2 text-warning">{stats.alerts}</div>
            <div className="text-xs text-warning/70 mt-2">Resultados anormales</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-muted-foreground text-sm font-medium">Estudios Totales</div>
            <div className="text-3xl font-bold mt-2 text-primary">{stats.studies}</div>
            <div className="text-xs text-primary/70 mt-2">En diferentes estados</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-muted-foreground text-sm font-medium">Completados</div>
            <div className="text-3xl font-bold mt-2 text-success">{stats.completed}</div>
            <div className="text-xs text-success/70 mt-2">Listos para médico</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-muted-foreground text-sm font-medium">Espera Promedio</div>
            <div className="text-3xl font-bold mt-2">{stats.avgWaitTime}m</div>
            <div className="text-xs text-muted-foreground mt-2">Tiempo en minutos</div>
          </div>
        </div>

        {/* Live Events Feed */}
        {liveEvents.length > 0 && (
          <div className="mb-8 bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary animate-pulse" />
              <h3 className="font-semibold text-sm">Eventos en Tiempo Real</h3>
            </div>
            <div className="space-y-2">
              {liveEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 text-sm p-2 bg-secondary/30 rounded-lg">
                  {event.type === "admission" ? (
                    <UserPlus className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  ) : (
                    <UserX className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p>{event.message}</p>
                    <p className="text-xs text-muted-foreground">{event.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Status Distribution */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Distribución de Estados</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "oklch(0.12 0 0)", border: "none", borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Timeline */}
          <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2">
            <h3 className="font-semibold mb-4">Evolución de Pacientes</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.2 0 0)" />
                <XAxis dataKey="time" stroke="oklch(0.65 0 0)" />
                <YAxis stroke="oklch(0.65 0 0)" />
                <Tooltip contentStyle={{ backgroundColor: "oklch(0.12 0 0)", border: "none", borderRadius: "8px" }} />
                <Legend />
                <Line type="monotone" dataKey="pacientes" stroke="oklch(0.55 0.18 180)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="completados" stroke="oklch(0.55 0.15 140)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patients Grid with Filters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-xl font-semibold">Pacientes en Emergencias ({filteredAndSortedPatients.length})</h3>
            <div className="flex gap-2 flex-wrap">
              <div className="flex gap-1">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilter("critical")}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${filter === "critical" ? "bg-destructive text-destructive-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                >
                  Críticos
                </button>
                <button
                  onClick={() => setFilter("alerts")}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${filter === "alerts" ? "bg-warning text-warning-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                >
                  Alertas
                </button>
                <button
                  onClick={() => setFilter("pending")}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${filter === "pending" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                >
                  Pendientes
                </button>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 rounded-lg text-sm bg-secondary text-secondary-foreground border border-border"
              >
                <option value="severity">Ordenar por severidad</option>
                <option value="waitTime">Ordenar por tiempo espera</option>
              </select>
            </div>
          </div>

          {/* Patient Grid */}
          <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
            {filteredAndSortedPatients.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <p>No hay pacientes que coincidan con los filtros seleccionados</p>
              </div>
            ) : (
              filteredAndSortedPatients.map((patient) => {
                const maxWaitTime = Math.max(...patient.studies.map((s) => s.waitTime), 0)
                const hasAlert = patient.studies.some((s) => s.hasAlert)
                const completedStudies = patient.studies.filter((s) => s.status === "Completado").length
                const pendingStudies = patient.studies.filter((s) => s.status !== "Completado").length

                return (
                  <div
                    key={patient.id}
                    className={`border rounded-lg transition cursor-pointer hover:shadow-md hover:border-accent/50 ${
                      hasAlert ? "border-destructive/50 bg-destructive/5" : "border-border bg-card/50"
                    }`}
                    onClick={() => setSelectedPatient(selectedPatient?.id === patient.id ? null : patient)}
                  >
                    {/* Compact Row Layout */}
                    <div className="px-4 py-3 flex items-center justify-between gap-4">
                      {/* Patient Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-semibold text-sm truncate">{patient.name}</h4>
                          {hasAlert && (
                            <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0 animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {patient.age}a • {patient.gender} • Plan: {patient.insurance} • Hab: {patient.room}
                        </p>
                      </div>

                      {/* Diagnosis */}
                      <div className="hidden md:block flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{patient.diagnosis}</p>
                      </div>

                      {/* Studies Summary */}
                      <div className="flex items-center gap-3 text-xs flex-shrink-0">
                        <div className="text-center">
                          <p className="text-muted-foreground font-medium">Estudios</p>
                          <p className="font-semibold">{patient.studies.length}</p>
                        </div>
                        <div className="w-px h-8 bg-border" />
                        <div className="text-center">
                          <p className="text-muted-foreground font-medium">Completados</p>
                          <p className="font-semibold text-success">{completedStudies}</p>
                        </div>
                        <div className="w-px h-8 bg-border" />
                        <div className="text-center">
                          <p className="text-muted-foreground font-medium">Pendientes</p>
                          <p className="font-semibold text-warning">{pendingStudies}</p>
                        </div>
                        <div className="w-px h-8 bg-border" />
                        <div className="text-center">
                          <p className="text-muted-foreground font-medium">Espera</p>
                          <p className="font-semibold">{maxWaitTime}m</p>
                        </div>
                      </div>

                      {/* Severity Badge */}
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                          patient.severity === "Crítico"
                            ? "bg-destructive/20 text-destructive"
                            : patient.severity === "Urgente"
                              ? "bg-warning/20 text-warning"
                              : "bg-success/20 text-success"
                        }`}
                      >
                        {patient.severity}
                      </div>

                      {/* Expand Icon */}
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition ${
                          selectedPatient?.id === patient.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {/* Expanded Details */}
                    {selectedPatient?.id === patient.id && (
                      <div className="border-t border-border px-4 py-4 bg-secondary/20 space-y-4">
                        {/* Info Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div>
                            <p className="text-muted-foreground font-medium">Médico Tratante</p>
                            <p className="mt-1 font-medium text-sm">{patient.doctor}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground font-medium">Hora Ingreso</p>
                            <p className="mt-1 font-medium text-sm">{patient.admissionTime}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground font-medium">Cobertura</p>
                            <p className="mt-1 font-medium text-sm">{patient.insurance}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground font-medium">Contacto</p>
                            <p className="mt-1 font-medium text-sm">{patient.phone}</p>
                          </div>
                        </div>

                        {/* Studies Details */}
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                            Detalle de Estudios
                          </p>
                          <div className="space-y-2">
                            {patient.studies.map((study, idx) => (
                              <div
                                key={idx}
                                className={`bg-background rounded-lg p-3 border text-xs transition ${
                                  study.hasAlert
                                    ? "border-destructive/30 bg-destructive/5"
                                    : "border-border hover:border-accent/30"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <span className="font-medium text-foreground">{study.type}</span>
                                  <span className="text-muted-foreground">{study.waitTime}m</span>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <div
                                    className={`h-2 rounded-full flex-1 ${
                                      study.status === "Completado"
                                        ? "bg-success"
                                        : study.status === "Pendiente Resultado"
                                          ? "bg-warning"
                                          : "bg-primary"
                                    }`}
                                  />
                                  <span
                                    className={`font-medium text-xs ${
                                      study.status === "Completado"
                                        ? "text-success"
                                        : study.status === "Pendiente Resultado"
                                          ? "text-warning"
                                          : "text-primary"
                                    }`}
                                  >
                                    {study.status}
                                  </span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleStudyStatusChange(patient.id, idx)
                                  }}
                                  className="w-full px-2 py-1.5 rounded text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition"
                                >
                                  Cambiar Estado
                                </button>
                                {study.hasAlert && (
                                  <p className="text-destructive text-xs mt-2 font-medium">
                                    ⚠️ Resultado anormal detectado
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

// Función para generar pacientes iniciales (mucho mayor volumen)
function generateInitialPatients() {
  const diagnoses = [
    "Infarto Agudo de Miocardio",
    "Apendicitis Aguda",
    "Accidente Cerebrovascular",
    "Fractura de Fémur",
    "Tromboembolismo Pulmonar",
    "Neumonía Bilateral",
    "Pancreatitis Aguda",
    "Hemorragia Digestiva",
    "Sepsis",
    "Traumatismo Craneoencefálico",
    "Pielonefritis Complicada",
    "Dolor Torácico Atípico",
    "Cetoacidosis Diabética",
    "Insuficiencia Cardíaca Descompensada",
    "Embolia Mesentérica",
  ]

  const studies = [
    { name: "ECG", type: "Cardiología" },
    { name: "Rx de Tórax", type: "Radiografía" },
    { name: "TC Torax", type: "Tomografía" },
    { name: "Ecografía Abdominal", type: "Ecografía" },
    { name: "Análisis Sangre", type: "Análisis Sangre" },
    { name: "Troponina T", type: "Análisis Sangre" },
    { name: "TC Cerebral", type: "Tomografía" },
    { name: "RM Cerebral", type: "Resonancia" },
    { name: "Rx Pelvis", type: "Radiografía" },
    { name: "D-Dímero", type: "Análisis Sangre" },
    { name: "Angiografía TC", type: "Tomografía" },
    { name: "Análisis Orina", type: "Análisis Orina" },
    { name: "Cultivo Esputo", type: "Microbiología" },
    { name: "Lipasa", type: "Análisis Sangre" },
    { name: "Ecografía Cardíaca", type: "Ecografía" },
  ]

  const doctors = [
    "Dr. Carlos Ruiz",
    "Dra. Patricia González",
    "Dr. Fernando López",
    "Dr. Miguel Ángel Sosa",
    "Dra. Elena Moreno",
    "Dr. Roberto Fuentes",
    "Dra. Ana García",
    "Dr. José María López",
    "Dra. Lucía Martínez",
    "Dr. Alfonso Rodríguez",
  ]

  const insurances = ["Prepagas - Medifé", "OSDE", "Swiss Medical", "Galeno", "Presente", "PAMI", "Particular"]

  const firstNames = [
    "Roberto",
    "María",
    "Juan",
    "Ana",
    "Carlos",
    "Marta",
    "Pedro",
    "Laura",
    "Miguel",
    "Isabel",
    "Francisco",
    "Rosa",
    "Diego",
    "Carmen",
    "Antonio",
    "Francisca",
    "Javier",
    "Esperanza",
    "Manuel",
    "Dolores",
  ]

  const lastNames = [
    "García",
    "López",
    "Rodríguez",
    "Martínez",
    "Fernández",
    "Díaz",
    "Pérez",
    "Sánchez",
    "Moreno",
    "Jiménez",
    "Ruiz",
    "Hernández",
    "Torres",
    "Gómez",
    "Romero",
  ]

  const patients = []
  let patientId = 1

  for (let i = 0; i < 28; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName1 = lastNames[Math.floor(Math.random() * lastNames.length)]
    const lastName2 = lastNames[Math.floor(Math.random() * lastNames.length)]

    const numStudies = Math.random() > 0.4 ? (Math.random() > 0.5 ? 2 : 3) : 1
    const patientStudies = []

    for (let j = 0; j < numStudies; j++) {
      const study = studies[Math.floor(Math.random() * studies.length)]
      const statuses = ["Solicitado", "Pendiente Resultado", "Completado"]
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const hasAlert = Math.random() > 0.85

      patientStudies.push({
        name: study.name,
        type: study.type,
        status,
        waitTime: Math.floor(Math.random() * 120) + 5,
        hasAlert,
      })
    }

    const severity = Math.random() > 0.7 ? "Crítico" : Math.random() > 0.4 ? "Urgente" : "Estable"

    patients.push({
      id: `P${String(patientId).padStart(3, "0")}`,
      name: `${firstName} ${lastName1} ${lastName2}`,
      age: Math.floor(Math.random() * 70) + 18,
      gender: Math.random() > 0.5 ? "M" : "F",
      insurance: insurances[Math.floor(Math.random() * insurances.length)],
      diagnosis: diagnoses[Math.floor(Math.random() * diagnoses.length)],
      admissionTime: `${String(Math.floor(Math.random() * 6) + 8).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
      severity,
      doctor: doctors[Math.floor(Math.random() * doctors.length)],
      room: `${["Res.", "Obs.", "Trau.", "Neum.", "UCI"][Math.floor(Math.random() * 5)]} ${Math.floor(Math.random() * 5) + 1}-${String.fromCharCode(65 + Math.floor(Math.random() * 3))}`,
      studies: patientStudies,
      phone: `123-456-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
    })

    patientId++
  }

  return patients
}

// Función para generar un paciente aleatorio
function generateRandomPatient() {
  const diagnoses = [
    "Infarto Agudo de Miocardio",
    "Apendicitis Aguda",
    "Accidente Cerebrovascular",
    "Fractura de Fémur",
    "Tromboembolismo Pulmonar",
    "Neumonía Bilateral",
    "Pancreatitis Aguda",
    "Hemorragia Digestiva",
    "Sepsis",
    "Traumatismo Craneoencefálico",
    "Pielonefritis Complicada",
    "Dolor Torácico Atípico",
    "Cetoacidosis Diabética",
    "Insuficiencia Cardíaca Descompensada",
    "Embolia Mesentérica",
  ]

  const studies = [
    { name: "ECG", type: "Cardiología" },
    { name: "Rx de Tórax", type: "Radiografía" },
    { name: "TC Torax", type: "Tomografía" },
    { name: "Ecografía Abdominal", type: "Ecografía" },
    { name: "Análisis Sangre", type: "Análisis Sangre" },
    { name: "Troponina T", type: "Análisis Sangre" },
    { name: "TC Cerebral", type: "Tomografía" },
    { name: "RM Cerebral", type: "Resonancia" },
    { name: "Rx Pelvis", type: "Radiografía" },
    { name: "D-Dímero", type: "Análisis Sangre" },
    { name: "Angiografía TC", type: "Tomografía" },
    { name: "Análisis Orina", type: "Análisis Orina" },
    { name: "Cultivo Esputo", type: "Microbiología" },
    { name: "Lipasa", type: "Análisis Sangre" },
    { name: "Ecografía Cardíaca", type: "Ecografía" },
  ]

  const doctors = [
    "Dr. Carlos Ruiz",
    "Dra. Patricia González",
    "Dr. Fernando López",
    "Dr. Miguel Ángel Sosa",
    "Dra. Elena Moreno",
    "Dr. Roberto Fuentes",
    "Dra. Ana García",
    "Dr. José María López",
    "Dra. Lucía Martínez",
    "Dr. Alfonso Rodríguez",
  ]

  const insurances = ["Prepagas - Medifé", "OSDE", "Swiss Medical", "Galeno", "Presente", "PAMI", "Particular"]

  const firstNames = [
    "Roberto",
    "María",
    "Juan",
    "Ana",
    "Carlos",
    "Marta",
    "Pedro",
    "Laura",
    "Miguel",
    "Isabel",
    "Francisco",
    "Rosa",
    "Diego",
    "Carmen",
    "Antonio",
    "Francisca",
    "Javier",
    "Esperanza",
    "Manuel",
    "Dolores",
  ]

  const lastNames = [
    "García",
    "López",
    "Rodríguez",
    "Martínez",
    "Fernández",
    "Díaz",
    "Pérez",
    "Sánchez",
    "Moreno",
    "Jiménez",
    "Ruiz",
    "Hernández",
    "Torres",
    "Gómez",
    "Romero",
  ]

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName1 = lastNames[Math.floor(Math.random() * lastNames.length)]
  const lastName2 = lastNames[Math.floor(Math.random() * lastNames.length)]

  const nextPatientId = Math.floor(Math.random() * 900) + 100

  const numStudies = Math.random() > 0.4 ? (Math.random() > 0.5 ? 2 : 3) : 1
  const patientStudies = []

  for (let j = 0; j < numStudies; j++) {
    const study = studies[Math.floor(Math.random() * studies.length)]
    const hasAlert = Math.random() > 0.9

    patientStudies.push({
      name: study.name,
      type: study.type,
      status: "Solicitado",
      waitTime: 5,
      hasAlert,
    })
  }

  const severity = Math.random() > 0.7 ? "Crítico" : Math.random() > 0.4 ? "Urgente" : "Estable"

  return {
    id: `P${String(nextPatientId).padStart(3, "0")}`,
    name: `${firstName} ${lastName1} ${lastName2}`,
    age: Math.floor(Math.random() * 70) + 18,
    gender: Math.random() > 0.5 ? "M" : "F",
    insurance: insurances[Math.floor(Math.random() * insurances.length)],
    diagnosis: diagnoses[Math.floor(Math.random() * diagnoses.length)],
    admissionTime: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
    severity,
    doctor: doctors[Math.floor(Math.random() * doctors.length)],
    room: `${["Res.", "Obs.", "Trau.", "Neum.", "UCI"][Math.floor(Math.random() * 5)]} ${Math.floor(Math.random() * 5) + 1}-${String.fromCharCode(65 + Math.floor(Math.random() * 3))}`,
    studies: patientStudies,
    phone: `123-456-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
  }
}
