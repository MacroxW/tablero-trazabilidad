import { NextRequest, NextResponse } from "next/server"
import {
  getActivePatients,
  getPatients,
  createPatient,
  getStudiesByPatientId,
  createStudies,
  createEvent,
  getDoctorById,
} from "@/lib/storage"
import { generateRandomPatient } from "@/lib/simulation"
import type { PatientWithStudies } from "@/lib/types"

// GET /api/patients - Obtener todos los pacientes activos con sus estudios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeAll = searchParams.get("all") === "true"

    const patients = includeAll ? await getPatients() : await getActivePatients()

    // Enriquecer con estudios y doctor
    const patientsWithStudies: PatientWithStudies[] = await Promise.all(
      patients.map(async (patient) => {
        const studies = await getStudiesByPatientId(patient.id)
        const doctor = await getDoctorById(patient.doctorId)
        return {
          ...patient,
          studies,
          doctor,
        }
      })
    )

    return NextResponse.json({ patients: patientsWithStudies })
  } catch (error) {
    console.error("Error getting patients:", error)
    return NextResponse.json(
      { error: "Error al obtener pacientes" },
      { status: 500 }
    )
  }
}

// POST /api/patients - Crear un nuevo paciente (manual o aleatorio)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { random = true } = body

    if (random) {
      // Generar paciente aleatorio
      const { patient, studies, event } = generateRandomPatient()

      await createPatient(patient)
      await createStudies(studies)
      await createEvent(event)

      const doctor = await getDoctorById(patient.doctorId)

      return NextResponse.json({
        patient: { ...patient, studies, doctor },
        event,
      })
    } else {
      // Crear paciente con datos proporcionados
      const { patient: patientData, studies: studiesData } = body

      if (!patientData) {
        return NextResponse.json(
          { error: "Datos del paciente requeridos" },
          { status: 400 }
        )
      }

      await createPatient(patientData)
      if (studiesData && studiesData.length > 0) {
        await createStudies(studiesData)
      }

      const event = {
        id: `E${Date.now()}`,
        type: "admission" as const,
        patientId: patientData.id,
        message: `${patientData.name} ha ingresado a emergencias`,
        timestamp: new Date().toISOString(),
      }
      await createEvent(event)

      return NextResponse.json({ patient: patientData, event })
    }
  } catch (error) {
    console.error("Error creating patient:", error)
    return NextResponse.json(
      { error: "Error al crear paciente" },
      { status: 500 }
    )
  }
}
