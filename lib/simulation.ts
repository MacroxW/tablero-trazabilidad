import type { Patient, Study, Event } from "./types"
import { generateId } from "./storage"

// Datos para generación aleatoria
const DIAGNOSES = [
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

const STUDY_TYPES = [
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

const INSURANCES = [
  "Prepagas - Medifé",
  "OSDE",
  "Swiss Medical",
  "Galeno",
  "Presente",
  "PAMI",
  "Particular",
]

const FIRST_NAMES = [
  "Roberto", "María", "Juan", "Ana", "Carlos", "Marta", "Pedro", "Laura",
  "Miguel", "Isabel", "Francisco", "Rosa", "Diego", "Carmen", "Antonio",
  "Francisca", "Javier", "Esperanza", "Manuel", "Dolores",
]

const LAST_NAMES = [
  "García", "López", "Rodríguez", "Martínez", "Fernández", "Díaz",
  "Pérez", "Sánchez", "Moreno", "Jiménez", "Ruiz", "Hernández",
  "Torres", "Gómez", "Romero",
]

const ROOMS = ["Res.", "Obs.", "Trau.", "Neum.", "UCI"]

const DOCTOR_IDS = [
  "D001", "D002", "D003", "D004", "D005",
  "D006", "D007", "D008", "D009", "D010",
]

// Funciones de utilidad
function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Generar un paciente aleatorio
export function generateRandomPatient(): { patient: Patient; studies: Study[]; event: Event } {
  const patientId = generateId("P")
  const firstName = randomElement(FIRST_NAMES)
  const lastName1 = randomElement(LAST_NAMES)
  const lastName2 = randomElement(LAST_NAMES)
  const now = new Date().toISOString()
  
  // Simular tiempo de asignación al médico (1-5 minutos después de admisión)
  const assignedToDoctorAt = new Date(Date.now() + randomInt(1, 5) * 60000).toISOString()

  const patient: Patient = {
    id: patientId,
    name: `${firstName} ${lastName1} ${lastName2}`,
    age: randomInt(18, 88),
    gender: Math.random() > 0.5 ? "M" : "F",
    insurance: randomElement(INSURANCES),
    diagnosis: randomElement(DIAGNOSES),
    severity: Math.random() > 0.7 ? "Crítico" : Math.random() > 0.4 ? "Urgente" : "Estable",
    room: `${randomElement(ROOMS)} ${randomInt(1, 5)}-${String.fromCharCode(65 + randomInt(0, 2))}`,
    doctorId: randomElement(DOCTOR_IDS),
    phone: `123-456-${String(randomInt(0, 999)).padStart(3, "0")}`,
    admissionTime: now,
    status: "active",
    assignedToDoctorAt, // Timestamp de asignación al médico
    firstStudyRequestedAt: now, // Los estudios se solicitan al ingresar
  }

  // Generar estudios para el paciente
  const numStudies = Math.random() > 0.4 ? (Math.random() > 0.5 ? 2 : 3) : 1
  const studies: Study[] = []

  for (let i = 0; i < numStudies; i++) {
    const studyType = randomElement(STUDY_TYPES)
    studies.push({
      id: generateId("S"),
      patientId,
      name: studyType.name,
      type: studyType.type,
      status: "Solicitado",
      requestedAt: now,
      waitTime: 0,
      hasAlert: Math.random() > 0.9,
    })
  }

  const event: Event = {
    id: generateId("E"),
    type: "admission",
    patientId,
    message: `${patient.name} ha ingresado a emergencias`,
    timestamp: now,
  }

  return { patient, studies, event }
}

// Generar datos iniciales (múltiples pacientes)
export function generateInitialData(count: number = 15): {
  patients: Patient[]
  studies: Study[]
  events: Event[]
} {
  const patients: Patient[] = []
  const studies: Study[] = []
  const events: Event[] = []

  // Asegurar al menos un paciente por cada etapa del Kanban
  const kanbanStages = [
    "admission",           // En Admisión
    "waiting_doctor",      // Esperando Atención Médica
    "in_studies",          // En Estudios
    "results_ready",       // Resultados Listos
    "in_progress",         // Atención en Progreso
    "discharge"            // Alta/Derivación
  ]

  // Crear al menos un paciente por etapa
  kanbanStages.forEach((stage, index) => {
    const { patient, studies: patientStudies, event } = generateRandomPatient()
    
    // Configurar el paciente según la etapa
    switch (stage) {
      case "admission":
        // En Admisión: sin médico asignado
        delete patient.assignedToDoctorAt
        delete patient.firstStudyRequestedAt
        // Sin estudios
        patientStudies.length = 0
        break
        
      case "waiting_doctor":
        // Esperando Atención Médica: tiene médico pero sin estudios
        patient.assignedToDoctorAt = new Date(Date.now() - randomInt(5, 15) * 60000).toISOString()
        delete patient.firstStudyRequestedAt
        // Sin estudios
        patientStudies.length = 0
        break
        
      case "in_studies":
        // En Estudios: tiene estudios pendientes o en proceso
        patient.assignedToDoctorAt = new Date(Date.now() - randomInt(20, 40) * 60000).toISOString()
        patient.firstStudyRequestedAt = new Date(Date.now() - randomInt(10, 30) * 60000).toISOString()
        patientStudies.forEach((study) => {
          const rand = Math.random()
          if (rand > 0.5) {
            study.status = "Pendiente Resultado"
            study.inProgressAt = new Date(Date.now() - randomInt(5, 20) * 60000).toISOString()
            study.waitTime = randomInt(15, 40)
          } else {
            study.status = "Solicitado"
            study.waitTime = randomInt(5, 20)
          }
        })
        break
        
      case "results_ready":
        // Resultados Listos: todos los estudios completados pero no revisados
        patient.assignedToDoctorAt = new Date(Date.now() - randomInt(60, 90) * 60000).toISOString()
        patient.firstStudyRequestedAt = new Date(Date.now() - randomInt(50, 80) * 60000).toISOString()
        patientStudies.forEach((study) => {
          study.status = "Completado"
          study.inProgressAt = new Date(Date.now() - randomInt(30, 60) * 60000).toISOString()
          study.completedAt = new Date(Date.now() - randomInt(5, 15) * 60000).toISOString()
          study.waitTime = randomInt(40, 80)
        })
        // NO establecer allStudiesCompletedAt para que quede en "results_ready"
        break
        
      case "in_progress":
        // Atención en Progreso: estudios completados y revisados
        patient.assignedToDoctorAt = new Date(Date.now() - randomInt(90, 120) * 60000).toISOString()
        patient.firstStudyRequestedAt = new Date(Date.now() - randomInt(80, 110) * 60000).toISOString()
        patientStudies.forEach((study) => {
          study.status = "Completado"
          study.inProgressAt = new Date(Date.now() - randomInt(60, 90) * 60000).toISOString()
          study.completedAt = new Date(Date.now() - randomInt(20, 40) * 60000).toISOString()
          study.waitTime = randomInt(60, 100)
        })
        // Establecer allStudiesCompletedAt para indicar que fueron revisados
        const lastCompletedTime = Math.max(
          ...patientStudies.map((s) => new Date(s.completedAt || 0).getTime())
        )
        patient.allStudiesCompletedAt = new Date(lastCompletedTime).toISOString()
        break
        
      case "discharge":
        // Alta/Derivación: paciente dado de alta
        patient.status = "discharged"
        patient.assignedToDoctorAt = new Date(Date.now() - randomInt(120, 180) * 60000).toISOString()
        patient.firstStudyRequestedAt = new Date(Date.now() - randomInt(110, 170) * 60000).toISOString()
        patient.dischargedAt = new Date().toISOString()
        patientStudies.forEach((study) => {
          study.status = "Completado"
          study.inProgressAt = new Date(Date.now() - randomInt(90, 120) * 60000).toISOString()
          study.completedAt = new Date(Date.now() - randomInt(30, 60) * 60000).toISOString()
          study.waitTime = randomInt(80, 120)
        })
        const lastCompleted = Math.max(
          ...patientStudies.map((s) => new Date(s.completedAt || 0).getTime())
        )
        patient.allStudiesCompletedAt = new Date(lastCompleted).toISOString()
        break
    }
    
    patients.push(patient)
    studies.push(...patientStudies)
    events.push(event)
  })

  // Generar el resto de pacientes con estados aleatorios
  const remainingCount = count - kanbanStages.length
  for (let i = 0; i < remainingCount; i++) {
    const { patient, studies: patientStudies, event } = generateRandomPatient()
    
    // Variar los estados de los estudios para datos iniciales
    patientStudies.forEach((study) => {
      const rand = Math.random()
      if (rand > 0.6) {
        study.status = "Completado"
        study.inProgressAt = new Date(Date.now() - randomInt(60, 120) * 60000).toISOString()
        study.completedAt = new Date().toISOString()
        study.waitTime = randomInt(30, 120)
      } else if (rand > 0.3) {
        study.status = "Pendiente Resultado"
        study.inProgressAt = new Date(Date.now() - randomInt(15, 60) * 60000).toISOString()
        study.waitTime = randomInt(15, 60)
      } else {
        study.waitTime = randomInt(5, 30)
      }
    })

    // Actualizar allStudiesCompletedAt si todos están completados
    const allCompleted = patientStudies.every((s) => s.status === "Completado")
    if (allCompleted && patientStudies.length > 0) {
      const lastCompletedTime = Math.max(
        ...patientStudies.map((s) => new Date(s.completedAt || 0).getTime())
      )
      patient.allStudiesCompletedAt = new Date(lastCompletedTime).toISOString()
    }

    patients.push(patient)
    studies.push(...patientStudies)
    events.push(event)
  }

  return { patients, studies, events }
}

// Progresar un estudio al siguiente estado
export function progressStudyStatus(
  study: Study
): { updatedStudy: Study; event?: Event } | null {
  const now = new Date().toISOString()

  if (study.status === "Solicitado") {
    return {
      updatedStudy: {
        ...study,
        status: "Pendiente Resultado",
        inProgressAt: now, // Registrar cuando pasa a "en proceso"
        waitTime: study.waitTime + randomInt(5, 15),
      },
    }
  }

  if (study.status === "Pendiente Resultado") {
    const event: Event = {
      id: generateId("E"),
      type: study.hasAlert ? "alert" : "study_completed",
      patientId: study.patientId,
      studyId: study.id,
      message: study.hasAlert
        ? `⚠️ Alerta: Resultado anormal en ${study.name}`
        : `Estudio ${study.name} completado`,
      timestamp: now,
    }

    return {
      updatedStudy: {
        ...study,
        status: "Completado",
        completedAt: now,
        waitTime: study.waitTime + randomInt(5, 15),
      },
      event,
    }
  }

  return null // Ya está completado
}

// Crear evento de alta
export function createDischargeEvent(patient: Patient): Event {
  return {
    id: generateId("E"),
    type: "discharge",
    patientId: patient.id,
    message: `${patient.name} ha sido dado de alta`,
    timestamp: new Date().toISOString(),
  }
}

// Verificar si un paciente puede ser dado de alta
export function canDischargePatient(studies: Study[]): boolean {
  return studies.length > 0 && studies.every((s) => s.status === "Completado")
}
