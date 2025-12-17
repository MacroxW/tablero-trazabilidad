import { NextRequest, NextResponse } from "next/server"
import { getStudyById, updateStudy, createEvent, getPatientById } from "@/lib/storage"
import { progressStudyStatus } from "@/lib/simulation"

// GET /api/studies/[id] - Obtener un estudio por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const study = await getStudyById(id)

    if (!study) {
      return NextResponse.json(
        { error: "Estudio no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ study })
  } catch (error) {
    console.error("Error getting study:", error)
    return NextResponse.json(
      { error: "Error al obtener estudio" },
      { status: 500 }
    )
  }
}

// PUT /api/studies/[id] - Actualizar un estudio
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const study = await getStudyById(id)
    if (!study) {
      return NextResponse.json(
        { error: "Estudio no encontrado" },
        { status: 404 }
      )
    }

    // Si se solicita progresar al siguiente estado
    if (body.action === "progress") {
      const result = progressStudyStatus(study)

      if (!result) {
        return NextResponse.json(
          { error: "El estudio ya está completado" },
          { status: 400 }
        )
      }

      const updatedStudy = await updateStudy(id, result.updatedStudy)

      // Crear evento si hay uno
      if (result.event) {
        await createEvent(result.event)
      }

      return NextResponse.json({ study: updatedStudy, event: result.event })
    }

    // Actualización manual
    const updatedStudy = await updateStudy(id, body)

    // Si se completó el estudio, crear evento
    if (body.status === "Completado" && study.status !== "Completado") {
      const patient = await getPatientById(study.patientId)
      const event = {
        id: `E${Date.now()}`,
        type: study.hasAlert ? ("alert" as const) : ("study_completed" as const),
        patientId: study.patientId,
        studyId: id,
        message: study.hasAlert
          ? `⚠️ Alerta: Resultado anormal en ${study.name} - ${patient?.name || "Paciente"}`
          : `Estudio ${study.name} completado - ${patient?.name || "Paciente"}`,
        timestamp: new Date().toISOString(),
      }
      await createEvent(event)
      return NextResponse.json({ study: updatedStudy, event })
    }

    return NextResponse.json({ study: updatedStudy })
  } catch (error) {
    console.error("Error updating study:", error)
    return NextResponse.json(
      { error: "Error al actualizar estudio" },
      { status: 500 }
    )
  }
}
