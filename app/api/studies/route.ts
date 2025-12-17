import { NextRequest, NextResponse } from "next/server"
import { getStudies, createStudy, generateId } from "@/lib/storage"
import type { Study } from "@/lib/types"

// GET /api/studies - Obtener todos los estudios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")
    const status = searchParams.get("status")

    let studies = await getStudies()

    // Filtrar por paciente si se especifica
    if (patientId) {
      studies = studies.filter((s) => s.patientId === patientId)
    }

    // Filtrar por estado si se especifica
    if (status) {
      studies = studies.filter((s) => s.status === status)
    }

    return NextResponse.json({ studies })
  } catch (error) {
    console.error("Error getting studies:", error)
    return NextResponse.json(
      { error: "Error al obtener estudios" },
      { status: 500 }
    )
  }
}

// POST /api/studies - Crear un nuevo estudio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.patientId || !body.name || !body.type) {
      return NextResponse.json(
        { error: "patientId, name y type son requeridos" },
        { status: 400 }
      )
    }

    const study: Study = {
      id: generateId("S"),
      patientId: body.patientId,
      name: body.name,
      type: body.type,
      status: "Solicitado",
      requestedAt: new Date().toISOString(),
      waitTime: 0,
      hasAlert: body.hasAlert || false,
    }

    await createStudy(study)

    return NextResponse.json({ study })
  } catch (error) {
    console.error("Error creating study:", error)
    return NextResponse.json(
      { error: "Error al crear estudio" },
      { status: 500 }
    )
  }
}
