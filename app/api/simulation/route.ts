import { NextRequest, NextResponse } from "next/server"
import {
  getConfig,
  updateConfig,
  resetAllData,
  setPatients,
  setStudies,
  clearEvents,
  getActivePatients,
  getStudies,
  updatePatient,
  updateStudy,
  createPatient,
  createStudies,
  createEvent,
  getStudiesByPatientId,
} from "@/lib/storage"
import {
  generateInitialData,
  generateRandomPatient,
  progressStudyStatus,
  canDischargePatient,
  createDischargeEvent,
} from "@/lib/simulation"

// GET /api/simulation - Obtener configuración de simulación
export async function GET() {
  try {
    const config = await getConfig()
    return NextResponse.json(config)
  } catch (error) {
    console.error("Error getting simulation config:", error)
    return NextResponse.json(
      { error: "Error al obtener configuración" },
      { status: 500 }
    )
  }
}

// POST /api/simulation - Controlar la simulación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case "start": {
        // Iniciar simulación
        const config = await updateConfig({
          simulation: { running: true, ...params },
        })
        return NextResponse.json({ success: true, config })
      }

      case "stop": {
        // Detener simulación
        const config = await updateConfig({
          simulation: { running: false },
        })
        return NextResponse.json({ success: true, config })
      }

      case "toggle": {
        // Alternar estado
        const currentConfig = await getConfig()
        const config = await updateConfig({
          simulation: { running: !currentConfig.simulation.running },
        })
        return NextResponse.json({ success: true, config })
      }

      case "speed": {
        // Cambiar velocidad
        if (!params.speed) {
          return NextResponse.json(
            { error: "speed es requerido" },
            { status: 400 }
          )
        }
        const config = await updateConfig({
          simulation: { speed: params.speed },
        })
        return NextResponse.json({ success: true, config })
      }

      case "reset": {
        // Reiniciar con datos frescos
        await resetAllData()
        const { patients, studies, events } = generateInitialData(
          params.count || 15
        )
        await setPatients(patients)
        await setStudies(studies)
        for (const event of events) {
          await createEvent(event)
        }
        const config = await updateConfig({
          simulation: { running: false },
        })
        return NextResponse.json({
          success: true,
          config,
          stats: {
            patients: patients.length,
            studies: studies.length,
            events: events.length,
          },
        })
      }

      case "clear": {
        // Limpiar todos los datos
        await resetAllData()
        return NextResponse.json({ success: true })
      }

      case "tick": {
        // Ejecutar un tick de simulación (llamado desde el cliente)
        const config = await getConfig()
        if (!config.simulation.running) {
          return NextResponse.json({ success: false, reason: "Simulation not running" })
        }

        const results = {
          admissions: 0,
          discharges: 0,
          studyProgressions: 0,
          events: [] as Array<{ type: string; message: string }>,
        }

        // 1. Progresar estudios automáticamente
        if (config.simulation.autoStudyProgress) {
          const studies = await getStudies()
          const pendingStudies = studies.filter(
            (s) => s.status !== "Completado"
          )

          // Progresar algunos estudios aleatoriamente
          for (const study of pendingStudies) {
            if (Math.random() > 0.7) {
              // 30% de probabilidad
              const result = progressStudyStatus(study)
              if (result) {
                await updateStudy(study.id, result.updatedStudy)
                results.studyProgressions++
                if (result.event) {
                  await createEvent(result.event)
                  results.events.push({
                    type: result.event.type,
                    message: result.event.message,
                  })
                }
              }
            }
          }
        }

        // 2. Dar de alta pacientes con todos los estudios completados
        if (config.simulation.autoDischarge) {
          const patients = await getActivePatients()
          for (const patient of patients) {
            const studies = await getStudiesByPatientId(patient.id)
            if (canDischargePatient(studies) && Math.random() > 0.7) {
              await updatePatient(patient.id, {
                status: "discharged",
                dischargedAt: new Date().toISOString(),
              })
              const event = createDischargeEvent(patient)
              await createEvent(event)
              results.discharges++
              results.events.push({
                type: "discharge",
                message: event.message,
              })
            }
          }
        }

        // 3. Admitir nuevos pacientes
        if (config.simulation.autoAdmission) {
          if (Math.random() > 0.6) {
            // 40% de probabilidad
            const { patient, studies, event } = generateRandomPatient()
            await createPatient(patient)
            await createStudies(studies)
            await createEvent(event)
            results.admissions++
            results.events.push({
              type: "admission",
              message: event.message,
            })
          }
        }

        return NextResponse.json({ success: true, results })
      }

      case "admit": {
        // Admitir un paciente manualmente
        const { patient, studies, event } = generateRandomPatient()
        await createPatient(patient)
        await createStudies(studies)
        await createEvent(event)
        return NextResponse.json({
          success: true,
          patient: { ...patient, studies },
          event,
        })
      }

      default:
        return NextResponse.json(
          { error: `Acción desconocida: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Error in simulation:", error)
    return NextResponse.json(
      { error: "Error en la simulación" },
      { status: 500 }
    )
  }
}
