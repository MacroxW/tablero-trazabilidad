import { NextRequest, NextResponse } from "next/server"
import { getEvents, clearEvents } from "@/lib/storage"

// GET /api/events - Obtener eventos recientes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get("limit")
    const limit = limitParam ? parseInt(limitParam, 10) : 10

    const events = await getEvents(limit)

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error getting events:", error)
    return NextResponse.json(
      { error: "Error al obtener eventos" },
      { status: 500 }
    )
  }
}

// DELETE /api/events - Limpiar todos los eventos
export async function DELETE() {
  try {
    await clearEvents()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error clearing events:", error)
    return NextResponse.json(
      { error: "Error al limpiar eventos" },
      { status: 500 }
    )
  }
}
