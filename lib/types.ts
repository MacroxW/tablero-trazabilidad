// Tipos para el sistema de trazabilidad de pacientes

export interface Patient {
  id: string
  name: string
  age: number
  gender: "M" | "F"
  insurance: string
  diagnosis: string
  severity: "Crítico" | "Urgente" | "Estable"
  room: string
  doctorId: string
  phone: string
  admissionTime: string
  status: "active" | "discharged"
  dischargedAt?: string
  assignedToDoctorAt?: string // Cuando se asigna al médico
  firstStudyRequestedAt?: string // Primer estudio solicitado
  allStudiesCompletedAt?: string // Todos los estudios completados
}

export interface Study {
  id: string
  patientId: string
  name: string
  type: string
  status: "Solicitado" | "Pendiente Resultado" | "Completado"
  requestedAt: string
  inProgressAt?: string // Cuando pasa a "Pendiente Resultado"
  completedAt?: string
  reviewedAt?: string // Cuando el médico revisa el resultado
  waitTime: number
  hasAlert: boolean
  result?: string
}

export interface Doctor {
  id: string
  name: string
  specialty: string
  available: boolean
}

export interface Event {
  id: string
  type: "admission" | "discharge" | "study_requested" | "study_completed" | "alert"
  patientId: string
  studyId?: string
  message: string
  timestamp: string
}

export interface SimulationConfig {
  running: boolean
  speed: number // 0.5, 1, 2, 5
  autoAdmission: boolean
  autoDischarge: boolean
  autoStudyProgress: boolean
  admissionIntervalMs: number
  studyProgressIntervalMs: number
}

export interface Config {
  simulation: Partial<SimulationConfig>
  lastUpdated: string
}

// Tipos para las respuestas de API
export interface PatientsData {
  patients: Patient[]
}

export interface StudiesData {
  studies: Study[]
}

export interface DoctorsData {
  doctors: Doctor[]
}

export interface EventsData {
  events: Event[]
}

// Tipo combinado para el dashboard (paciente con sus estudios)
export interface PatientWithStudies extends Patient {
  studies: Study[]
  doctor?: Doctor
}

// Tipo para el timeline de trazabilidad
export interface TimelineEvent {
  id: string
  timestamp: string
  type: "admission" | "doctor_assigned" | "study_requested" | "study_in_progress" | "study_completed" | "study_reviewed" | "all_completed" | "discharge"
  title: string
  description: string
  duration?: number // Duración en minutos desde el evento anterior
  icon?: string
}

// Estadísticas de tiempo para un paciente
export interface PatientTimeStats {
  totalTime: number // Tiempo total en el hospital (minutos)
  waitingForStudies: number // Tiempo esperando que se completen estudios
  waitingForReview: number // Tiempo esperando revisión médica
  studiesInProgress: number // Tiempo que tomaron los estudios
  averageStudyTime: number // Tiempo promedio por estudio
}
