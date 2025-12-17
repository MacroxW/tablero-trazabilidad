import { NextRequest, NextResponse } from "next/server"
import {
  getPatientById,
  updatePatient,
  deletePatient,
  getStudiesByPatientId,
  deleteStudiesByPatientId,
  getDoctorById,
  createEvent,
} from "@/lib/storage"
import { createDischargeEvent } from "@/lib/simulation"

// GET /api/patients/[id] - Obtener un paciente por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const patient = await getPatientById(id)

    if (!patient) {
      return NextResponse.json(
        { error: "Paciente no encontrado" },
        { status: 404 }
      )
    }

    const studies = await getStudiesByPatientId(id)
    const doctor = await getDoctorById(patient.doctorId)

    return NextResponse.json({
      patient: { ...patient, studies, doctor },
    })
  } catch (error) {
    console.error("Error getting patient:", error)
    return NextResponse.json(
      { error: "Error al obtener paciente" },
      { status: 500 }
    )
  }
}

// PUT /api/patients/[id] - Actualizar un paciente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const patient = await getPatientById(id)
    if (!patient) {
      return NextResponse.json(
        { error: "Paciente no encontrado" },
        { status: 404 }
      )
    }

    // Si se está dando de alta
    if (body.status === "discharged" && patient.status === "active") {
      body.dischargedAt = new Date().toISOString()
      const event = createDischargeEvent(patient)
      await createEvent(event)
    }

    const updatedPatient = await updatePatient(id, body)

    return NextResponse.json({ patient: updatedPatient })
  } catch (error) {
    console.error("Error updating patient:", error)
    return NextResponse.json(
      { error: "Error al actualizar paciente" },
      { status: 500 }
    )
  }
}

// DELETE /api/patients/[id] - Eliminar un paciente y sus estudios
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const patient = await getPatientById(id)
    if (!patient) {
      return NextResponse.json(
        { error: "Paciente no encontrado" },
        { status: 404 }
      )
    }

    // Eliminar estudios asociados
    await deleteStudiesByPatientId(id)

    // Eliminar paciente
    await deletePatient(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting patient:", error)
    return NextResponse.json(
      { error: "Error al eliminar paciente" },
      { status: 500 }
    )
  }
}
