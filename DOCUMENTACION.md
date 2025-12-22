# Documentación Técnica - Tablero de Trazabilidad

## Índice

1. [Análisis del Proyecto](#análisis-del-proyecto)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Modelos de Datos](#modelos-de-datos)
4. [API Reference](#api-reference)
5. [Componentes](#componentes)
6. [Flujos de Trabajo](#flujos-de-trabajo)
7. [Configuración](#configuración)

---

## Análisis del Proyecto

### Descripción General

El **Tablero de Trazabilidad** es un sistema de gestión y monitoreo en tiempo real para servicios de emergencias hospitalarias. Permite rastrear el recorrido completo de cada paciente desde su admisión hasta el alta, incluyendo todos los estudios médicos solicitados y sus resultados.

### Propósito

- **Visibilidad en tiempo real** del estado de todos los pacientes en emergencias
- **Trazabilidad completa** de cada estudio médico solicitado
- **Identificación de cuellos de botella** en el proceso de atención
- **Alertas automáticas** para resultados anormales
- **Métricas de rendimiento** del servicio de emergencias
- **Simulación realista** para pruebas y capacitación

### Casos de Uso Principales

1. **Monitoreo de Emergencias**
   - Visualizar todos los pacientes activos
   - Identificar casos críticos que requieren atención inmediata
   - Revisar alertas de resultados anormales

2. **Gestión de Estudios**
   - Seguimiento del estado de cada estudio
   - Identificar estudios pendientes
   - Medir tiempos de espera y procesamiento

3. **Análisis de Trazabilidad**
   - Ver el timeline completo de un paciente
   - Analizar tiempos en cada fase del proceso
   - Identificar demoras y optimizar flujos

4. **Simulación y Capacitación**
   - Generar escenarios realistas de emergencias
   - Probar flujos de trabajo
   - Capacitar personal en el uso del sistema

### Funcionalidades Principales

#### 3.1. Dashboard de Trazabilidad en Tiempo Real

La interfaz principal es un **tablero visual dinámico** inspirado en la metodología **Kanban**, que organiza a todos los pacientes en columnas representando las etapas clave del flujo de atención.

**Columnas del Dashboard:**
1. **En Admisión** - Pacientes recién ingresados
2. **Esperando Atención Médica** - Pacientes asignados a médico pero sin evaluación inicial
3. **En Estudios** - Pacientes con estudios solicitados en proceso
4. **Resultados Listos / Esperando Revisión** - Estudios completados pendientes de revisión médica
5. **Atención en Progreso** - Pacientes siendo evaluados o tratados
6. **Alta / Derivación** - Pacientes listos para egreso o derivación

**Tarjetas de Paciente:**

Cada paciente se representa mediante una **tarjeta visual** que se mueve automáticamente entre columnas a medida que avanza en su recorrido. La tarjeta muestra:

- **Nombre del paciente** - Identificación clara
- **Motivo de consulta** - Diagnóstico principal
- **Nivel de triage** - Severidad (Crítico, Urgente, Estable)
- **Tiempo de espera acumulado** - En la etapa actual
- **Indicador visual de estudios** - Estado de estudios solicitados
  - 🔴 Estudios pendientes
  - 🟡 Estudios en proceso
  - 🟢 Estudios completados
  - ⚠️ Alertas por resultados anormales

**Características de la Tarjeta:**
```typescript
interface PatientCard {
  // Información básica
  patientName: string
  diagnosis: string
  severity: "Crítico" | "Urgente" | "Estable"
  
  // Métricas de tiempo
  currentStageTime: number        // Tiempo en etapa actual (minutos)
  totalWaitTime: number           // Tiempo total de espera
  
  // Estado de estudios
  studiesStatus: {
    total: number                 // Total de estudios
    pending: number               // Pendientes
    inProgress: number            // En proceso
    completed: number             // Completados
    hasAlerts: boolean            // Tiene alertas
  }
  
  // Ubicación y asignación
  room: string                    // Habitación/Box
  assignedDoctor: string          // Médico tratante
  
  // Indicadores visuales
  colorCode: string               // Color según severidad
  alertIcon: boolean              // Mostrar icono de alerta
}
```

**Movimiento Automático:**

Las tarjetas se mueven automáticamente entre columnas según eventos del sistema:
- **Admisión** → Columna "En Admisión"
- **Asignación de médico** → "Esperando Atención Médica"
- **Solicitud de estudios** → "En Estudios"
- **Estudios completados** → "Resultados Listos / Esperando Revisión"
- **Revisión médica** → "Atención en Progreso"
- **Alta médica** → "Alta / Derivación"

#### 3.2. Seguimiento Detallado por Paciente (Línea de Tiempo)

Al seleccionar la tarjeta de un paciente, el usuario accede a una **vista detallada** que presenta una **línea de tiempo completa** del episodio en emergencias.

**Timeline Cronológico:**

El timeline registra cada evento significativo con:

```typescript
interface TimelineEntry {
  // Identificación del evento
  eventId: string
  eventType: string               // Tipo de evento
  
  // Timestamps
  startTime: string               // Fecha y hora de inicio
  endTime?: string                // Fecha y hora de fin
  duration: number                // Duración en minutos
  
  // Responsables
  responsibleProfessional?: string  // Médico/Enfermera
  responsibleArea?: string          // Área/Departamento
  
  // Detalles
  description: string             // Descripción del evento
  observations?: string           // Observaciones adicionales
  
  // Metadata
  status: string                  // Estado del evento
  priority: string                // Prioridad
}
```

**Eventos Registrados en el Timeline:**

1. **Admisión del Paciente**
   - Timestamp: Hora de ingreso
   - Responsable: Personal de admisión
   - Observaciones: Motivo de consulta, triage inicial

2. **Asignación de Médico**
   - Timestamp: Hora de asignación
   - Responsable: Médico asignado
   - Observaciones: Especialidad del médico

3. **Solicitud de Estudios**
   - Timestamp: Hora de solicitud
   - Responsable: Médico solicitante
   - Observaciones: Tipo y cantidad de estudios

4. **Inicio de Estudio**
   - Timestamp: Hora de inicio
   - Responsable: Área de estudios (Lab, Rx, etc.)
   - Observaciones: Estudio específico iniciado

5. **Finalización de Estudio**
   - Timestamp: Hora de finalización
   - Responsable: Área de estudios
   - Observaciones: Resultado, alertas si corresponde

6. **Revisión de Resultados**
   - Timestamp: Hora de revisión
   - Responsable: Médico tratante
   - Observaciones: Interpretación, decisiones clínicas

7. **Cambios de Estado**
   - Timestamp: Hora del cambio
   - Responsable: Personal médico
   - Observaciones: Nuevo estado, razón del cambio

8. **Alta o Derivación**
   - Timestamp: Hora de alta
   - Responsable: Médico tratante
   - Observaciones: Destino, indicaciones

**Funcionalidades del Timeline:**

- **Vista cronológica completa** - Todos los eventos ordenados temporalmente
- **Filtros por tipo de evento** - Mostrar solo ciertos tipos de eventos
- **Búsqueda de eventos** - Buscar por palabra clave
- **Exportación** - Generar reporte PDF del timeline
- **Indicadores visuales** - Colores según tipo de evento
- **Duración entre eventos** - Tiempo transcurrido entre cada paso
- **Pista de auditoría** - Registro completo para auditoría médica

**Beneficios del Timeline:**

1. **Contexto Clínico Inmediato**
   - Visión completa del recorrido del paciente
   - Identificación rápida de eventos relevantes
   - Comprensión del estado actual

2. **Pista de Auditoría Completa**
   - Registro granular de cada acción
   - Trazabilidad de responsables
   - Cumplimiento normativo

3. **Análisis de Tiempos**
   - Identificación de demoras
   - Optimización de procesos
   - Mejora continua

4. **Comunicación entre Equipos**
   - Información compartida
   - Continuidad de atención
   - Reducción de errores

**Visualización del Timeline:**

```
┌─────────────────────────────────────────────────────────────┐
│ TIMELINE - Roberto García López                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🔵 10:30 AM - ADMISIÓN                                     │
│    Personal: Enfermera Admisión                            │
│    Observaciones: Dolor torácico, Triage Rojo              │
│    Duración: 3 min                                         │
│                                                             │
│ 🟢 10:33 AM - ASIGNACIÓN DE MÉDICO                         │
│    Responsable: Dr. Juan Pérez (Emergentología)            │
│    Observaciones: Paciente asignado a box UCI 1-A          │
│    Duración: 0 min                                         │
│                                                             │
│ 🟡 10:33 AM - SOLICITUD DE ESTUDIOS                        │
│    Responsable: Dr. Juan Pérez                             │
│    Observaciones: ECG, Troponina T, Rx Tórax               │
│    Duración: 12 min                                        │
│                                                             │
│ 🟠 10:45 AM - INICIO ECG                                   │
│    Responsable: Área Cardiología                           │
│    Observaciones: Estudio iniciado                         │
│    Duración: 15 min                                        │
│                                                             │
│ 🔴 11:00 AM - FINALIZACIÓN ECG - ⚠️ ALERTA                │
│    Responsable: Área Cardiología                           │
│    Observaciones: Elevación del segmento ST detectada      │
│    Duración: 5 min                                         │
│                                                             │
│ 🟣 11:05 AM - REVISIÓN DE RESULTADOS                       │
│    Responsable: Dr. Juan Pérez                             │
│    Observaciones: Confirmado IAM, iniciar protocolo        │
│    Duración: En progreso...                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Métricas Calculadas Automáticamente:**

El sistema calcula y muestra métricas clave:

- **Tiempo total de estadía** - Desde admisión hasta alta
- **Tiempo de espera por etapa** - Cuánto tiempo en cada fase
- **Tiempo de respuesta** - Desde solicitud hasta resultado
- **Tiempo de revisión** - Desde resultado hasta revisión médica
- **Cuellos de botella** - Identificación de demoras significativas
- **Cumplimiento de SLA** - Comparación con tiempos objetivo

---

## Arquitectura del Sistema

### Stack Tecnológico Completo

```
┌─────────────────────────────────────────┐
│           FRONTEND LAYER                │
├─────────────────────────────────────────┤
│ Next.js 16 (App Router)                 │
│ React 19 (Server & Client Components)   │
│ TypeScript 5                             │
│ Tailwind CSS 4                           │
├─────────────────────────────────────────┤
│           UI COMPONENTS                  │
├─────────────────────────────────────────┤
│ Radix UI (Primitivos accesibles)        │
│ Recharts (Visualizaciones)              │
│ Lucide React (Iconografía)              │
│ Sonner (Notificaciones)                 │
│ React Hook Form + Zod (Formularios)     │
├─────────────────────────────────────────┤
│           BACKEND LAYER                  │
├─────────────────────────────────────────┤
│ Next.js API Routes                       │
│ File System (JSON Storage)              │
├─────────────────────────────────────────┤
│           BUSINESS LOGIC                 │
├─────────────────────────────────────────┤
│ Simulation Engine                        │
│ Timeline Generator                       │
│ Storage Layer                            │
│ Type Definitions                         │
└─────────────────────────────────────────┘
```

### Estructura de Directorios Detallada

```
tablero-trazabilidad/
│
├── app/                                    # Next.js App Router
│   ├── api/                               # API Routes (Backend)
│   │   ├── events/
│   │   │   └── route.ts                   # GET eventos
│   │   ├── patients/
│   │   │   ├── route.ts                   # GET/POST pacientes
│   │   │   └── [id]/
│   │   │       └── route.ts               # GET/PUT/DELETE paciente específico
│   │   ├── simulation/
│   │   │   └── route.ts                   # GET/POST control simulación
│   │   └── studies/
│   │       ├── route.ts                   # GET estudios
│   │       └── [id]/
│   │           └── route.ts               # PUT estudio específico
│   │
│   ├── simulation/                        # Página de control
│   │   └── page.tsx                       # UI de simulación
│   │
│   ├── globals.css                        # Estilos globales + variables CSS
│   ├── layout.tsx                         # Layout raíz con providers
│   └── page.tsx                           # Dashboard principal
│
├── components/                            # Componentes React
│   ├── ui/                               # Componentes base (Radix UI)
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── alert.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── chart.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   └── ... (50+ componentes)
│   │
│   ├── patient-timeline.tsx              # Timeline de trazabilidad
│   └── theme-provider.tsx                # Provider de temas
│
├── data/                                  # Persistencia (JSON)
│   ├── config.json                       # Configuración de simulación
│   ├── doctors.json                      # Catálogo de médicos
│   ├── events.json                       # Historial de eventos
│   ├── patients.json                     # Datos de pacientes
│   └── studies.json                      # Datos de estudios
│
├── lib/                                   # Lógica de negocio
│   ├── simulation.ts                     # Motor de simulación
│   ├── storage.ts                        # Capa de persistencia
│   ├── timeline.ts                       # Generación de timeline
│   ├── types.ts                          # Definiciones TypeScript
│   └── utils.ts                          # Utilidades generales
│
├── hooks/                                 # Custom React Hooks
│   ├── use-mobile.ts                     # Detección de móvil
│   └── use-toast.ts                      # Sistema de notificaciones
│
├── public/                                # Archivos estáticos
│   ├── icon.svg                          # Icono de la app
│   └── placeholder-*.{png,jpg,svg}       # Imágenes placeholder
│
├── styles/                                # Estilos adicionales
│   └── globals.css                       # Estilos complementarios
│
├── .gitignore                            # Archivos ignorados por Git
├── components.json                       # Configuración de componentes UI
├── next.config.mjs                       # Configuración de Next.js
├── package.json                          # Dependencias y scripts
├── pnpm-lock.yaml                        # Lock file de pnpm
├── postcss.config.mjs                    # Configuración de PostCSS
├── README.md                             # Documentación principal
├── DOCUMENTACION.md                      # Este archivo
└── tsconfig.json                         # Configuración de TypeScript
```

### Patrones de Diseño Utilizados

1. **Repository Pattern** (`lib/storage.ts`)
   - Abstracción de la capa de persistencia
   - Facilita cambio a base de datos real

2. **Factory Pattern** (`lib/simulation.ts`)
   - Generación de pacientes y estudios
   - Datos aleatorios pero realistas

3. **Observer Pattern** (Polling)
   - Actualización automática cada 3 segundos
   - Sincronización entre dashboard y simulación

4. **Composition Pattern** (React)
   - Componentes pequeños y reutilizables
   - Composición sobre herencia

---

## Modelos de Datos

### Patient (Paciente)

```typescript
interface Patient {
  // Identificación
  id: string                              // Formato: P001, P002, P003...
  name: string                            // Nombre completo del paciente
  
  // Datos demográficos
  age: number                             // Edad en años
  gender: "M" | "F"                       // Género
  phone: string                           // Teléfono de contacto
  
  // Datos médicos
  insurance: string                       // Cobertura médica
  diagnosis: string                       // Diagnóstico principal
  severity: "Crítico" | "Urgente" | "Estable"  // Nivel de severidad
  
  // Ubicación y asignación
  room: string                            // Habitación/Box (ej: "Res. 1-A")
  doctorId: string                        // ID del médico tratante
  
  // Timestamps de trazabilidad
  admissionTime: string                   // ISO timestamp de ingreso
  assignedToDoctorAt?: string            // Cuándo se asignó al médico
  firstStudyRequestedAt?: string         // Primer estudio solicitado
  allStudiesCompletedAt?: string         // Todos los estudios completados
  dischargedAt?: string                  // Timestamp de alta
  
  // Estado
  status: "active" | "discharged"        // Estado actual del paciente
}
```

**Ejemplo de datos:**
```json
{
  "id": "P001",
  "name": "Roberto García López",
  "age": 65,
  "gender": "M",
  "phone": "123-456-789",
  "insurance": "OSDE",
  "diagnosis": "Infarto Agudo de Miocardio",
  "severity": "Crítico",
  "room": "UCI 1-A",
  "doctorId": "D001",
  "admissionTime": "2024-12-19T10:30:00.000Z",
  "assignedToDoctorAt": "2024-12-19T10:33:00.000Z",
  "firstStudyRequestedAt": "2024-12-19T10:30:00.000Z",
  "status": "active"
}
```

### Study (Estudio Médico)

```typescript
interface Study {
  // Identificación
  id: string                              // Formato: S001, S002, S003...
  patientId: string                       // Referencia al paciente
  
  // Información del estudio
  name: string                            // Nombre del estudio (ej: "ECG")
  type: string                            // Tipo (ej: "Cardiología")
  
  // Estado y progreso
  status: "Solicitado" | "Pendiente Resultado" | "Completado"
  
  // Timestamps de trazabilidad
  requestedAt: string                     // Cuándo se solicitó
  inProgressAt?: string                   // Cuándo comenzó el proceso
  completedAt?: string                    // Cuándo se completó
  reviewedAt?: string                     // Cuándo el médico lo revisó
  
  // Métricas
  waitTime: number                        // Tiempo de espera en minutos
  
  // Resultados
  hasAlert: boolean                       // Si tiene resultado anormal
  result?: string                         // Resultado del estudio
}
```

**Flujo de estados:**
```
Solicitado → Pendiente Resultado → Completado
    ↓              ↓                    ↓
requestedAt   inProgressAt        completedAt
                                       ↓
                                  reviewedAt (opcional)
```

**Ejemplo de datos:**
```json
{
  "id": "S001",
  "patientId": "P001",
  "name": "ECG",
  "type": "Cardiología",
  "status": "Completado",
  "requestedAt": "2024-12-19T10:30:00.000Z",
  "inProgressAt": "2024-12-19T10:45:00.000Z",
  "completedAt": "2024-12-19T11:00:00.000Z",
  "waitTime": 30,
  "hasAlert": true,
  "result": "Elevación del segmento ST"
}
```

### Doctor (Médico)

```typescript
interface Doctor {
  id: string                              // Formato: D001, D002, D003...
  name: string                            // Nombre completo
  specialty: string                       // Especialidad médica
  available: boolean                      // Disponibilidad actual
}
```

**Ejemplo de datos:**
```json
{
  "id": "D001",
  "name": "Dr. Juan Pérez",
  "specialty": "Emergentología",
  "available": true
}
```

### Event (Evento del Sistema)

```typescript
interface Event {
  id: string                              // Formato: E001, E002, E003...
  type: "admission" | "discharge" | "study_requested" | 
        "study_completed" | "alert"       // Tipo de evento
  patientId: string                       // Paciente relacionado
  studyId?: string                        // Estudio relacionado (opcional)
  message: string                         // Descripción del evento
  timestamp: string                       // ISO timestamp del evento
}
```

**Tipos de eventos:**
- `admission`: Ingreso de paciente
- `discharge`: Alta de paciente
- `study_requested`: Estudio solicitado
- `study_completed`: Estudio completado
- `alert`: Alerta por resultado anormal

**Ejemplo de datos:**
```json
{
  "id": "E001",
  "type": "admission",
  "patientId": "P001",
  "message": "Roberto García López ha ingresado a emergencias",
  "timestamp": "2024-12-19T10:30:00.000Z"
}
```

### SimulationConfig (Configuración de Simulación)

```typescript
interface SimulationConfig {
  running: boolean                        // Si la simulación está activa
  speed: number                           // Velocidad: 0.5, 1, 2, 5
  autoAdmission: boolean                  // Admisión automática de pacientes
  autoDischarge: boolean                  // Alta automática de pacientes
  autoStudyProgress: boolean              // Progreso automático de estudios
  admissionIntervalMs: number             // Intervalo entre admisiones (ms)
  studyProgressIntervalMs: number         // Intervalo de progreso de estudios (ms)
}
```

### Tipos Compuestos

```typescript
// Paciente con sus estudios y médico
interface PatientWithStudies extends Patient {
  studies: Study[]
  doctor?: Doctor
}

// Evento del timeline
interface TimelineEvent {
  id: string
  timestamp: string
  type: "admission" | "doctor_assigned" | "study_requested" | 
        "study_in_progress" | "study_completed" | "study_reviewed" | 
        "all_completed" | "discharge"
  title: string
  description: string
  duration?: number                       // Duración desde evento anterior (min)
  icon?: string
}

// Estadísticas de tiempo
interface PatientTimeStats {
  totalTime: number                       // Tiempo total en hospital (min)
  waitingForStudies: number               // Esperando estudios (min)
  waitingForReview: number                // Esperando revisión (min)
  studiesInProgress: number               // Estudios en proceso (min)
  averageStudyTime: number                // Promedio por estudio (min)
}
```

---

## API Reference

### Endpoints de Pacientes

#### GET /api/patients

Obtiene todos los pacientes activos con sus estudios y médicos asignados.

**Query Parameters:**
- `all` (opcional): Si es "true", incluye pacientes dados de alta

**Response:**
```typescript
{
  patients: PatientWithStudies[]
}
```

**Ejemplo:**
```bash
curl http://localhost:3000/api/patients
curl http://localhost:3000/api/patients?all=true
```

#### POST /api/patients

Crea un nuevo paciente.

**Request Body:**
```typescript
{
  random?: boolean                        // true = generar aleatorio
  patient?: Patient                       // Datos del paciente (si random=false)
  studies?: Study[]                       // Estudios iniciales (opcional)
}
```

**Response:**
```typescript
{
  patient: PatientWithStudies
  event: Event
}
```

**Ejemplo:**
```bash
# Crear paciente aleatorio
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -d '{"random": true}'

# Crear paciente específico
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "random": false,
    "patient": {
      "id": "P999",
      "name": "Test Patient",
      "age": 45,
      "gender": "M",
      "insurance": "OSDE",
      "diagnosis": "Test",
      "severity": "Estable",
      "room": "Obs. 1-A",
      "doctorId": "D001",
      "phone": "123-456-789",
      "admissionTime": "2024-12-19T10:00:00.000Z",
      "status": "active"
    }
  }'
```

#### GET /api/patients/[id]

Obtiene un paciente específico con sus estudios.

**Response:**
```typescript
{
  patient: PatientWithStudies
}
```

**Ejemplo:**
```bash
curl http://localhost:3000/api/patients/P001
```

#### PUT /api/patients/[id]

Actualiza un paciente.

**Request Body:**
```typescript
Partial<Patient>
```

**Response:**
```typescript
{
  patient: Patient
}
```

**Ejemplo:**
```bash
curl -X PUT http://localhost:3000/api/patients/P001 \
  -H "Content-Type: application/json" \
  -d '{"severity": "Crítico"}'
```

#### DELETE /api/patients/[id]

Da de alta a un paciente (marca como discharged).

**Response:**
```typescript
{
  patient: Patient
  event: Event
}
```

**Ejemplo:**
```bash
curl -X DELETE http://localhost:3000/api/patients/P001
```

### Endpoints de Estudios

#### GET /api/studies

Obtiene todos los estudios o los de un paciente específico.

**Query Parameters:**
- `patientId` (opcional): Filtrar por paciente

**Response:**
```typescript
{
  studies: Study[]
}
```

**Ejemplo:**
```bash
curl http://localhost:3000/api/studies
curl http://localhost:3000/api/studies?patientId=P001
```

#### PUT /api/studies/[id]

Actualiza un estudio.

**Request Body:**
```typescript
Partial<Study>
```

**Response:**
```typescript
{
  study: Study
  event?: Event                           // Si se completó o tiene alerta
}
```

**Ejemplo:**
```bash
curl -X PUT http://localhost:3000/api/studies/S001 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Completado",
    "completedAt": "2024-12-19T11:00:00.000Z"
  }'
```

### Endpoints de Eventos

#### GET /api/events

Obtiene eventos del sistema ordenados por timestamp descendente.

**Query Parameters:**
- `limit` (opcional): Número máximo de eventos a retornar

**Response:**
```typescript
{
  events: Event[]
}
```

**Ejemplo:**
```bash
curl http://localhost:3000/api/events
curl http://localhost:3000/api/events?limit=10
```

### Endpoints de Simulación

#### GET /api/simulation

Obtiene la configuración actual de la simulación.

**Response:**
```typescript
{
  simulation: SimulationConfig
  lastUpdated: string
}
```

**Ejemplo:**
```bash
curl http://localhost:3000/api/simulation
```

#### POST /api/simulation

Ejecuta acciones de simulación.

**Request Body:**
```typescript
{
  action: "start" | "stop" | "reset" | "tick" | "admit" | "clear"
  // Parámetros adicionales según la acción
}
```

**Acciones disponibles:**

1. **start** - Inicia la simulación
```json
{
  "action": "start",
  "speed": 1,
  "autoAdmission": true,
  "autoDischarge": true,
  "autoStudyProgress": true
}
```

2. **stop** - Detiene la simulación
```json
{
  "action": "stop"
}
```

3. **reset** - Reinicia con nuevos pacientes
```json
{
  "action": "reset",
  "count": 15
}
```

4. **tick** - Ejecuta un ciclo de simulación
```json
{
  "action": "tick"
}
```

5. **admit** - Admite un paciente manualmente
```json
{
  "action": "admit"
}
```

6. **clear** - Limpia todos los datos
```json
{
  "action": "clear"
}
```

**Response (varía según acción):**
```typescript
{
  success: boolean
  config?: Config
  results?: TickResult
  event?: Event
  stats?: {
    patients: number
    studies: number
    events: number
  }
}
```

**Ejemplo:**
```bash
# Iniciar simulación
curl -X POST http://localhost:3000/api/simulation \
  -H "Content-Type: application/json" \
  -d '{"action": "start", "speed": 2}'

# Admitir paciente
curl -X POST http://localhost:3000/api/simulation \
  -H "Content-Type: application/json" \
  -d '{"action": "admit"}'

# Reiniciar
curl -X POST http://localhost:3000/api/simulation \
  -H "Content-Type: application/json" \
  -d '{"action": "reset", "count": 20}'
```

---

## Componentes

### Componentes de Página

#### Dashboard Principal (`app/page.tsx`)

**Responsabilidades:**
- Mostrar KPIs en tiempo real
- Renderizar gráficos de distribución y evolución
- Listar pacientes con filtros y ordenamiento
- Mostrar feed de eventos en vivo
- Gestionar modal de trazabilidad

**Estado principal:**
```typescript
const [patients, setPatients] = useState<Patient[]>([])
const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
const [timelinePatient, setTimelinePatient] = useState<Patient | null>(null)
const [filter, setFilter] = useState("all")
const [sortBy, setSortBy] = useState("severity")
const [liveEvents, setLiveEvents] = useState<Event[]>([])
```

**Hooks utilizados:**
- `useState` - Gestión de estado local
- `useEffect` - Carga inicial y polling
- `useMemo` - Cálculos optimizados de stats y filtrado
- `useCallback` - Funciones memoizadas

**Características:**
- Polling cada 3 segundos para actualización en tiempo real
- Filtros: Todos, Críticos, Alertas, Pendientes
- Ordenamiento: Por severidad, Por tiempo de espera
- Vista expandible por paciente
- Modal de trazabilidad completa

#### Control de Simulación (`app/simulation/page.tsx`)

**Responsabilidades:**
- Controlar el motor de simulación
- Configurar parámetros de simulación
- Mostrar estadísticas en tiempo real
- Listar eventos recientes

**Controles disponibles:**
- Iniciar/Pausar simulación
- Reiniciar con nuevos datos
- Admitir paciente manual
- Limpiar todos los datos
- Ajustar velocidad (0.5x - 5x)
- Configurar opciones automáticas

### Componentes Reutilizables

#### PatientTimeline (`components/patient-timeline.tsx`)

**Props:**
```typescript
interface PatientTimelineProps {
  patient: Patient
  studies: Study[]
}
```

**Funcionalidad:**
- Genera timeline visual del recorrido del paciente
- Calcula estadísticas de tiempo
- Muestra resumen detallado de estudios
- Visualiza duración de cada fase

**Secciones:**
1. Estadísticas de tiempo (5 métricas)
2. Timeline visual con iconos y duraciones
3. Resumen de estudios con tiempos detallados

#### ThemeProvider (`components/theme-provider.tsx`)

**Funcionalidad:**
- Gestiona tema claro/oscuro
- Persiste preferencia del usuario
- Integración con `next-themes`

### Componentes UI (Radix)

Más de 50 componentes base en `components/ui/`:

**Navegación:**
- `navigation-menu.tsx` - Menú de navegación
- `menubar.tsx` - Barra de menú
- `breadcrumb.tsx` - Migas de pan
- `tabs.tsx` - Pestañas

**Formularios:**
- `input.tsx` - Campo de texto
- `textarea.tsx` - Área de texto
- `select.tsx` - Selector
- `checkbox.tsx` - Casilla de verificación
- `radio-group.tsx` - Grupo de radio
- `switch.tsx` - Interruptor
- `slider.tsx` - Deslizador
- `calendar.tsx` - Calendario
- `form.tsx` - Formulario con validación

**Feedback:**
- `alert.tsx` - Alertas
- `toast.tsx` - Notificaciones
- `progress.tsx` - Barra de progreso
- `spinner.tsx` - Indicador de carga
- `skeleton.tsx` - Placeholder de carga

**Overlays:**
- `dialog.tsx` - Diálogo modal
- `alert-dialog.tsx` - Diálogo de confirmación
- `sheet.tsx` - Panel lateral
- `drawer.tsx` - Cajón
- `popover.tsx` - Popover
- `tooltip.tsx` - Tooltip
- `hover-card.tsx` - Tarjeta al hover

**Visualización:**
- `card.tsx` - Tarjeta
- `table.tsx` - Tabla
- `chart.tsx` - Gráficos
- `badge.tsx` - Insignia
- `avatar.tsx` - Avatar
- `separator.tsx` - Separador

---

## Flujos de Trabajo

### Flujo 1: Admisión de Paciente

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario hace click en "Admitir" o simulación automática │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. POST /api/patients con { random: true }                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. generateRandomPatient() crea:                           │
│    - Paciente con datos aleatorios                         │
│    - 1-3 estudios iniciales                                │
│    - Evento de admisión                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Guardar en archivos JSON:                               │
│    - patients.json                                          │
│    - studies.json                                           │
│    - events.json                                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Response con paciente creado y evento                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Dashboard actualiza en próximo polling (3s)             │
│    - Incrementa contador de pacientes                      │
│    - Muestra en lista de pacientes                         │
│    - Agrega evento al feed                                 │
└─────────────────────────────────────────────────────────────┘
```

### Flujo 2: Progreso de Estudio

```
┌─────────────────────────────────────────────────────────────┐
│ Estado Inicial: "Solicitado"                               │
│ - requestedAt: timestamp                                    │
│ - waitTime: 0                                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Usuario click "Cambiar Estado" o simulación automática     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ PUT /api/studies/[id]                                       │
│ { status: "Pendiente Resultado" }                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Estado: "Pendiente Resultado"                              │
│ - inProgressAt: timestamp actual                           │
│ - waitTime: incrementado                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Usuario click "Cambiar Estado" o simulación automática     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ PUT /api/studies/[id]                                       │
│ { status: "Completado", completedAt: timestamp }           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Estado: "Completado"                                        │
│ - completedAt: timestamp actual                            │
│ - waitTime: tiempo total                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Si hasAlert = true:                                         │
│ - Crear evento de tipo "alert"                            │
│ - Mostrar en feed de eventos                               │
└─────────────────────────────────────────────────────────────┘
```

### Flujo 3: Alta de Paciente

```
┌─────────────────────────────────────────────────────────────┐
│ Verificar: ¿Todos los estudios completados?                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ DELETE /api/patients/[id]                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Actualizar paciente:                                        │
│ - status: "discharged"                                      │
│ - dischargedAt: timestamp actual                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Crear evento de tipo "discharge"                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Dashboard actualiza:                                        │
│ - Decrementa pacientes activos                             │
│ - Muestra evento de alta                                   │
└─────────────────────────────────────────────────────────────┘
```

### Flujo 4: Ciclo de Simulación (Tick)

```
┌─────────────────────────────────────────────────────────────┐
│ Timer ejecuta cada X segundos (según velocidad)            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ POST /api/simulation con { action: "tick" }                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Si autoAdmission = true:                                    │
│ - Probabilidad de admitir nuevo paciente                   │
│ - Generar paciente aleatorio                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Si autoStudyProgress = true:                                │
│ - Para cada estudio no completado:                         │
│   - Probabilidad de progresar al siguiente estado          │
│   - Actualizar timestamps y waitTime                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Si autoDischarge = true:                                    │
│ - Para cada paciente con estudios completados:             │
│   - Probabilidad de dar de alta                            │
│   - Crear evento de discharge                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Response con resultados del tick:                          │
│ - Número de admisiones                                     │
│ - Número de altas                                          │
│ - Número de estudios progresados                           │
│ - Lista de eventos generados                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Configuración

### Variables de Entorno

El proyecto no requiere variables de entorno para funcionar en desarrollo, pero puedes configurar:

```env
# .env.local (opcional)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Configuración de Next.js

**next.config.mjs:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración por defecto
}

export default nextConfig
```

### Configuración de TypeScript

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Configuración de Tailwind CSS

**postcss.config.mjs:**
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

### Configuración de Componentes UI

**components.json:**
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Archivos de Datos Iniciales

#### data/config.json
```json
{
  "simulation": {
    "running": false,
    "speed": 1,
    "autoAdmission": true,
    "autoDischarge": true,
    "autoStudyProgress": true,
    "admissionIntervalMs": 10000,
    "studyProgressIntervalMs": 5000
  },
  "lastUpdated": "2024-12-19T10:00:00.000Z"
}
```

#### data/doctors.json
```json
{
  "doctors": [
    {
      "id": "D001",
      "name": "Dr. Juan Pérez",
      "specialty": "Emergentología",
      "available": true
    },
    {
      "id": "D002",
      "name": "Dra. María González",
      "specialty": "Cardiología",
      "available": true
    }
    // ... más médicos
  ]
}
```

#### data/patients.json
```json
{
  "patients": []
}
```

#### data/studies.json
```json
{
  "studies": []
}
```

#### data/events.json
```json
{
  "events": []
}
```

### Scripts de Package.json

```json
{
  "scripts": {
    "dev": "next dev",           // Desarrollo en http://localhost:3000
    "build": "next build",       // Compilar para producción
    "start": "next start",       // Servidor de producción
    "lint": "eslint ."          // Ejecutar linter
  }
}
```

### Personalización de Temas

Los colores se definen en `app/globals.css` usando variables CSS:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ... más variables */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... más variables */
  }
}
```

---

## Mejoras Futuras

### Corto Plazo

1. **Base de Datos Real**
   - Migrar de JSON a PostgreSQL o MongoDB
   - Implementar Prisma ORM
   - Agregar migraciones

2. **Autenticación**
   - Implementar NextAuth.js
   - Roles de usuario (médico, enfermera, admin)
   - Permisos por rol

3. **WebSockets**
   - Reemplazar polling por WebSockets
   - Actualizaciones en tiempo real más eficientes
   - Menor carga en el servidor

### Mediano Plazo

4. **Notificaciones Push**
   - Alertas en navegador
   - Notificaciones por email
   - Integración con Telegram/Slack

5. **Reportes y Analytics**
   - Exportar datos a PDF/Excel
   - Dashboards de métricas históricas
   - Análisis de tendencias

6. **Integración con Sistemas Externos**
   - HL7/FHIR para interoperabilidad
   - Integración con sistemas de laboratorio
   - Integración con PACS (imágenes médicas)

### Largo Plazo

7. **Machine Learning**
   - Predicción de tiempos de espera
   - Detección de patrones anormales
   - Optimización de recursos

8. **Mobile App**
   - App nativa para iOS/Android
   - Notificaciones push móviles
   - Acceso offline

9. **Multi-tenancy**
   - Soporte para múltiples hospitales
   - Configuración por institución
   - Datos aislados por tenant

---

## Glosario

- **Admisión**: Ingreso de un paciente al servicio de emergencias
- **Alta**: Egreso de un paciente del servicio de emergencias
- **Estudio**: Examen médico solicitado (laboratorio, imagen, etc.)
- **Trazabilidad**: Seguimiento completo del recorrido del paciente
- **Timeline**: Línea de tiempo visual de eventos
- **KPI**: Key Performance Indicator (Indicador Clave de Rendimiento)
- **Polling**: Consulta periódica al servidor para obtener actualizaciones
- **Tick**: Ciclo de ejecución de la simulación
- **Severidad**: Nivel de criticidad del paciente (Crítico, Urgente, Estable)
- **Wait Time**: Tiempo de espera en minutos

---

**Última actualización**: Diciembre 2024  
**Versión del documento**: 1.0
