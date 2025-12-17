"use client"

import { useMemo } from "react"
import {
  UserPlus,
  Stethoscope,
  FileText,
  Clock,
  CheckCircle,
  Eye,
  CheckCircle2,
  UserX,
  Circle,
} from "lucide-react"
import type { Patient, Study } from "@/lib/types"
import {
  generatePatientTimeline,
  calculatePatientTimeStats,
  formatDuration,
} from "@/lib/timeline"

interface PatientTimelineProps {
  patient: Patient
  studies: Study[]
}

export function PatientTimeline({ patient, studies }: PatientTimelineProps) {
  const timeline = useMemo(
    () => generatePatientTimeline(patient, studies),
    [patient, studies]
  )

  const timeStats = useMemo(
    () => calculatePatientTimeStats(patient, studies),
    [patient, studies]
  )

  const getIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      admission: <UserPlus className="w-4 h-4" />,
      doctor_assigned: <Stethoscope className="w-4 h-4" />,
      study_requested: <FileText className="w-4 h-4" />,
      study_in_progress: <Clock className="w-4 h-4" />,
      study_completed: <CheckCircle className="w-4 h-4" />,
      study_reviewed: <Eye className="w-4 h-4" />,
      all_completed: <CheckCircle2 className="w-4 h-4" />,
      discharge: <UserX className="w-4 h-4" />,
    }
    return icons[type] || <Circle className="w-4 h-4" />
  }

  const getColor = (type: string) => {
    const colors: Record<string, string> = {
      admission: "text-primary bg-primary/10 border-primary/20",
      doctor_assigned: "text-accent bg-accent/10 border-accent/20",
      study_requested: "text-warning bg-warning/10 border-warning/20",
      study_in_progress: "text-info bg-info/10 border-info/20",
      study_completed: "text-success bg-success/10 border-success/20",
      study_reviewed: "text-success bg-success/10 border-success/20",
      all_completed: "text-success bg-success/10 border-success/20",
      discharge: "text-muted-foreground bg-muted border-border",
    }
    return colors[type] || "text-foreground bg-secondary border-border"
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas de Tiempo */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">Tiempo Total</div>
          <div className="text-lg font-bold">{formatDuration(timeStats.totalTime)}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">Esperando Estudios</div>
          <div className="text-lg font-bold text-warning">
            {formatDuration(timeStats.waitingForStudies)}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">Esperando Revisión</div>
          <div className="text-lg font-bold text-info">
            {formatDuration(timeStats.waitingForReview)}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">Estudios en Proceso</div>
          <div className="text-lg font-bold text-primary">
            {formatDuration(timeStats.studiesInProgress)}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">Promedio/Estudio</div>
          <div className="text-lg font-bold text-accent">
            {formatDuration(timeStats.averageStudyTime)}
          </div>
        </div>
      </div>

      {/* Timeline Visual */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
          Línea de Tiempo
        </h3>
        <div className="relative">
          {/* Línea vertical */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          {/* Eventos */}
          <div className="space-y-4">
            {timeline.map((event, index) => (
              <div key={event.id} className="relative flex gap-4">
                {/* Ícono */}
                <div
                  className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${getColor(event.type)}`}
                >
                  {getIcon(event.type)}
                </div>

                {/* Contenido */}
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <h4 className="font-semibold text-sm">{event.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {event.description}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      {event.duration !== undefined && event.duration > 0 && (
                        <div className="text-xs font-medium text-primary mt-0.5">
                          +{formatDuration(event.duration)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Barra de progreso si hay duración */}
                  {event.duration !== undefined && event.duration > 0 && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            event.type.includes("completed") || event.type === "discharge"
                              ? "bg-success"
                              : event.type.includes("progress")
                                ? "bg-warning"
                                : "bg-primary"
                          }`}
                          style={{
                            width: `${Math.min((event.duration / timeStats.totalTime) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resumen de Estudios */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
          Resumen de Estudios
        </h3>
        <div className="space-y-3">
          {studies.map((study) => {
            const requestedAt = new Date(study.requestedAt)
            const inProgressAt = study.inProgressAt ? new Date(study.inProgressAt) : null
            const completedAt = study.completedAt ? new Date(study.completedAt) : null
            const reviewedAt = study.reviewedAt ? new Date(study.reviewedAt) : null

            const waitingTime = inProgressAt
              ? Math.floor((inProgressAt.getTime() - requestedAt.getTime()) / 60000)
              : 0
            const processingTime =
              inProgressAt && completedAt
                ? Math.floor((completedAt.getTime() - inProgressAt.getTime()) / 60000)
                : 0
            const reviewTime =
              completedAt && reviewedAt
                ? Math.floor((reviewedAt.getTime() - completedAt.getTime()) / 60000)
                : 0

            return (
              <div
                key={study.id}
                className={`p-4 rounded-lg border ${
                  study.hasAlert
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-border bg-background"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-sm">{study.name}</h4>
                    <p className="text-xs text-muted-foreground">{study.type}</p>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      study.status === "Completado"
                        ? "bg-success/20 text-success"
                        : study.status === "Pendiente Resultado"
                          ? "bg-warning/20 text-warning"
                          : "bg-primary/20 text-primary"
                    }`}
                  >
                    {study.status}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">Espera</div>
                    <div className="font-medium">{formatDuration(waitingTime)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Proceso</div>
                    <div className="font-medium">{formatDuration(processingTime)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Revisión</div>
                    <div className="font-medium">
                      {reviewedAt ? formatDuration(reviewTime) : "Pendiente"}
                    </div>
                  </div>
                </div>

                {study.hasAlert && (
                  <div className="mt-2 text-xs text-destructive font-medium">
                    ⚠️ Resultado anormal detectado
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
