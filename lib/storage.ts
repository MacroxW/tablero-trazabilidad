import { promises as fs } from "fs"
import path from "path"
import type {
  Patient,
  Study,
  Doctor,
  Event,
  Config,
  PatientsData,
  StudiesData,
  DoctorsData,
  EventsData,
} from "./types"

const DATA_DIR = path.join(process.cwd(), "data")

// Asegurar que el directorio data existe
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

// Funciones genéricas de lectura/escritura
async function readJsonFile<T>(filename: string, defaultValue: T): Promise<T> {
  await ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)
  try {
    const content = await fs.readFile(filePath, "utf-8")
    return JSON.parse(content) as T
  } catch {
    // Si no existe, crear con valor por defecto
    await writeJsonFile(filename, defaultValue)
    return defaultValue
  }
}

async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8")
}

// ==================== PATIENTS ====================

const DEFAULT_PATIENTS: PatientsData = { patients: [] }

export async function getPatients(): Promise<Patient[]> {
  const data = await readJsonFile<PatientsData>("patients.json", DEFAULT_PATIENTS)
  return data.patients
}

export async function getActivePatients(): Promise<Patient[]> {
  const patients = await getPatients()
  return patients.filter((p) => p.status === "active")
}

export async function getPatientById(id: string): Promise<Patient | undefined> {
  const patients = await getPatients()
  return patients.find((p) => p.id === id)
}

export async function createPatient(patient: Patient): Promise<Patient> {
  const data = await readJsonFile<PatientsData>("patients.json", DEFAULT_PATIENTS)
  data.patients.push(patient)
  await writeJsonFile("patients.json", data)
  return patient
}

export async function updatePatient(id: string, updates: Partial<Patient>): Promise<Patient | null> {
  const data = await readJsonFile<PatientsData>("patients.json", DEFAULT_PATIENTS)
  const index = data.patients.findIndex((p) => p.id === id)
  if (index === -1) return null
  data.patients[index] = { ...data.patients[index], ...updates }
  await writeJsonFile("patients.json", data)
  return data.patients[index]
}

export async function deletePatient(id: string): Promise<boolean> {
  const data = await readJsonFile<PatientsData>("patients.json", DEFAULT_PATIENTS)
  const index = data.patients.findIndex((p) => p.id === id)
  if (index === -1) return false
  data.patients.splice(index, 1)
  await writeJsonFile("patients.json", data)
  return true
}

export async function setPatients(patients: Patient[]): Promise<void> {
  await writeJsonFile("patients.json", { patients })
}

// ==================== STUDIES ====================

const DEFAULT_STUDIES: StudiesData = { studies: [] }

export async function getStudies(): Promise<Study[]> {
  const data = await readJsonFile<StudiesData>("studies.json", DEFAULT_STUDIES)
  return data.studies
}

export async function getStudiesByPatientId(patientId: string): Promise<Study[]> {
  const studies = await getStudies()
  return studies.filter((s) => s.patientId === patientId)
}

export async function getStudyById(id: string): Promise<Study | undefined> {
  const studies = await getStudies()
  return studies.find((s) => s.id === id)
}

export async function createStudy(study: Study): Promise<Study> {
  const data = await readJsonFile<StudiesData>("studies.json", DEFAULT_STUDIES)
  data.studies.push(study)
  await writeJsonFile("studies.json", data)
  return study
}

export async function createStudies(studies: Study[]): Promise<Study[]> {
  const data = await readJsonFile<StudiesData>("studies.json", DEFAULT_STUDIES)
  data.studies.push(...studies)
  await writeJsonFile("studies.json", data)
  return studies
}

export async function updateStudy(id: string, updates: Partial<Study>): Promise<Study | null> {
  const data = await readJsonFile<StudiesData>("studies.json", DEFAULT_STUDIES)
  const index = data.studies.findIndex((s) => s.id === id)
  if (index === -1) return null
  data.studies[index] = { ...data.studies[index], ...updates }
  await writeJsonFile("studies.json", data)
  return data.studies[index]
}

export async function deleteStudiesByPatientId(patientId: string): Promise<number> {
  const data = await readJsonFile<StudiesData>("studies.json", DEFAULT_STUDIES)
  const initialLength = data.studies.length
  data.studies = data.studies.filter((s) => s.patientId !== patientId)
  await writeJsonFile("studies.json", data)
  return initialLength - data.studies.length
}

export async function setStudies(studies: Study[]): Promise<void> {
  await writeJsonFile("studies.json", { studies })
}

// ==================== DOCTORS ====================

const DEFAULT_DOCTORS: DoctorsData = {
  doctors: [
    { id: "D001", name: "Dr. Carlos Ruiz", specialty: "Cardiología", available: true },
    { id: "D002", name: "Dra. Patricia González", specialty: "Neurología", available: true },
    { id: "D003", name: "Dr. Fernando López", specialty: "Traumatología", available: true },
    { id: "D004", name: "Dr. Miguel Ángel Sosa", specialty: "Medicina Interna", available: true },
    { id: "D005", name: "Dra. Elena Moreno", specialty: "Neumología", available: true },
    { id: "D006", name: "Dr. Roberto Fuentes", specialty: "Gastroenterología", available: true },
    { id: "D007", name: "Dra. Ana García", specialty: "Emergencias", available: true },
    { id: "D008", name: "Dr. José María López", specialty: "Cirugía General", available: true },
    { id: "D009", name: "Dra. Lucía Martínez", specialty: "Nefrología", available: true },
    { id: "D010", name: "Dr. Alfonso Rodríguez", specialty: "UCI", available: true },
  ],
}

export async function getDoctors(): Promise<Doctor[]> {
  const data = await readJsonFile<DoctorsData>("doctors.json", DEFAULT_DOCTORS)
  return data.doctors
}

export async function getDoctorById(id: string): Promise<Doctor | undefined> {
  const doctors = await getDoctors()
  return doctors.find((d) => d.id === id)
}

export async function getRandomDoctor(): Promise<Doctor> {
  const doctors = await getDoctors()
  const availableDoctors = doctors.filter((d) => d.available)
  return availableDoctors[Math.floor(Math.random() * availableDoctors.length)]
}

// ==================== EVENTS ====================

const DEFAULT_EVENTS: EventsData = { events: [] }

export async function getEvents(limit?: number): Promise<Event[]> {
  const data = await readJsonFile<EventsData>("events.json", DEFAULT_EVENTS)
  const sorted = data.events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
  return limit ? sorted.slice(0, limit) : sorted
}

export async function createEvent(event: Event): Promise<Event> {
  const data = await readJsonFile<EventsData>("events.json", DEFAULT_EVENTS)
  data.events.push(event)
  // Mantener solo los últimos 100 eventos
  if (data.events.length > 100) {
    data.events = data.events.slice(-100)
  }
  await writeJsonFile("events.json", data)
  return event
}

export async function clearEvents(): Promise<void> {
  await writeJsonFile("events.json", { events: [] })
}

// ==================== CONFIG ====================

const DEFAULT_CONFIG: Config = {
  simulation: {
    running: false,
    speed: 1,
    autoAdmission: true,
    autoDischarge: true,
    autoStudyProgress: true,
    admissionIntervalMs: 8000,
    studyProgressIntervalMs: 5000,
  },
  lastUpdated: new Date().toISOString(),
}

export async function getConfig(): Promise<Config> {
  return await readJsonFile<Config>("config.json", DEFAULT_CONFIG)
}

export async function updateConfig(updates: Partial<Config>): Promise<Config> {
  const config = await getConfig()
  const newConfig = {
    ...config,
    ...updates,
    simulation: {
      ...config.simulation,
      ...(updates.simulation || {}),
    },
    lastUpdated: new Date().toISOString(),
  }
  await writeJsonFile("config.json", newConfig)
  return newConfig
}

export async function resetConfig(): Promise<Config> {
  await writeJsonFile("config.json", DEFAULT_CONFIG)
  return DEFAULT_CONFIG
}

// ==================== RESET ALL ====================

export async function resetAllData(): Promise<void> {
  await setPatients([])
  await setStudies([])
  await clearEvents()
  await resetConfig()
}

// ==================== UTILITY ====================

export function generateId(prefix: string): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`
}
