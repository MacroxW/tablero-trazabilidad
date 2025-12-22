# Tablero de Trazabilidad - Sistema de Emergencias

Sistema de trazabilidad en tiempo real para el seguimiento de pacientes y estudios médicos en un servicio de emergencias hospitalarias.

## 📋 Descripción del Proyecto

Este proyecto es una aplicación web desarrollada con **Next.js 16** que simula y visualiza el flujo de pacientes en un servicio de emergencias, permitiendo el seguimiento detallado de:

- **Admisión de pacientes** con datos demográficos y diagnósticos
- **Asignación de médicos** tratantes
- **Solicitud y seguimiento de estudios** médicos (laboratorio, imágenes, etc.)
- **Progreso de estudios** a través de diferentes estados
- **Alertas** por resultados anormales
- **Trazabilidad completa** del recorrido del paciente
- **Métricas y estadísticas** en tiempo real

## 🎯 Características Principales

### Dashboard en Tiempo Real
- **KPIs visuales**: Pacientes activos, críticos, alertas, estudios completados
- **Gráficos interactivos**: Distribución de estados, evolución temporal
- **Feed de eventos en vivo**: Actualizaciones automáticas cada 3 segundos
- **Filtros dinámicos**: Por severidad, alertas, estudios pendientes
- **Vista detallada por paciente**: Información completa y estudios asociados

### Sistema de Trazabilidad
- **Timeline visual** del recorrido del paciente
- **Métricas de tiempo**: Espera, proceso, revisión
- **Estadísticas por estudio**: Tiempos de cada fase
- **Identificación de cuellos de botella**

### Motor de Simulación
- **Generación automática** de pacientes y estudios
- **Velocidades configurables**: 0.5x, 1x, 2x, 5x
- **Admisión/alta automática** de pacientes
- **Progreso automático** de estudios
- **Control manual** de eventos

## 🏗️ Arquitectura del Proyecto

### Stack Tecnológico

```
Frontend:
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Radix UI (componentes)
- Recharts (gráficos)
- Lucide React (iconos)

Backend:
- Next.js API Routes
- Sistema de archivos JSON (persistencia)

Herramientas:
- pnpm (gestor de paquetes)
- ESLint (linting)
- PostCSS (procesamiento CSS)
```

### Estructura de Directorios

```
tablero-trazabilidad/
├── app/                          # App Router de Next.js
│   ├── api/                      # API Routes
│   │   ├── events/              # Endpoints de eventos
│   │   ├── patients/            # Endpoints de pacientes
│   │   ├── simulation/          # Endpoints de simulación
│   │   └── studies/             # Endpoints de estudios
│   ├── simulation/              # Página de control de simulación
│   ├── globals.css              # Estilos globales
│   ├── layout.tsx               # Layout principal
│   └── page.tsx                 # Dashboard principal
├── components/                   # Componentes React
│   ├── ui/                      # Componentes de UI (Radix)
│   ├── patient-timeline.tsx     # Timeline de trazabilidad
│   └── theme-provider.tsx       # Proveedor de temas
├── data/                        # Datos persistentes (JSON)
│   ├── config.json              # Configuración de simulación
│   ├── doctors.json             # Datos de médicos
│   ├── events.json              # Eventos del sistema
│   ├── patients.json            # Datos de pacientes
│   └── studies.json             # Datos de estudios
├── lib/                         # Lógica de negocio
│   ├── simulation.ts            # Motor de simulación
│   ├── storage.ts               # Capa de persistencia
│   ├── timeline.ts              # Generación de timeline
│   ├── types.ts                 # Definiciones TypeScript
│   └── utils.ts                 # Utilidades
├── hooks/                       # Custom hooks
├── public/                      # Archivos estáticos
└── styles/                      # Estilos adicionales
```

## 🔄 Flujo de Datos

### 1. Admisión de Paciente
```
Usuario/Simulación → POST /api/patients
  ↓
Genera paciente aleatorio con:
  - Datos demográficos
  - Diagnóstico
  - Severidad
  - Estudios iniciales
  ↓
Guarda en patients.json y studies.json
  ↓
Crea evento de admisión
  ↓
Dashboard actualiza en tiempo real
```

### 2. Progreso de Estudios
```
Estado: Solicitado
  ↓ (automático o manual)
Estado: Pendiente Resultado
  ↓ (automático o manual)
Estado: Completado
  ↓
Genera evento (con alerta si es anormal)
  ↓
Actualiza métricas y timeline
```

### 3. Alta de Paciente
```
Verifica: Todos los estudios completados
  ↓
Marca paciente como "discharged"
  ↓
Crea evento de alta
  ↓
Actualiza estadísticas
```

## 📊 Modelos de Datos

### Patient (Paciente)
```typescript
{
  id: string                    // P001, P002, etc.
  name: string                  // Nombre completo
  age: number                   // Edad
  gender: "M" | "F"            // Género
  insurance: string             // Cobertura médica
  diagnosis: string             // Diagnóstico
  severity: "Crítico" | "Urgente" | "Estable"
  room: string                  // Habitación/Box
  doctorId: string              // ID del médico
  phone: string                 // Teléfono de contacto
  admissionTime: string         // Timestamp de ingreso
  status: "active" | "discharged"
  assignedToDoctorAt?: string   // Timestamp asignación
  firstStudyRequestedAt?: string
  allStudiesCompletedAt?: string
}
```

### Study (Estudio)
```typescript
{
  id: string                    // S001, S002, etc.
  patientId: string             // Referencia al paciente
  name: string                  // Nombre del estudio
  type: string                  // Tipo (Análisis, Rx, TC, etc.)
  status: "Solicitado" | "Pendiente Resultado" | "Completado"
  requestedAt: string           // Timestamp solicitud
  inProgressAt?: string         // Timestamp inicio proceso
  completedAt?: string          // Timestamp finalización
  reviewedAt?: string           // Timestamp revisión médica
  waitTime: number              // Tiempo de espera (minutos)
  hasAlert: boolean             // Resultado anormal
  result?: string               // Resultado del estudio
}
```

### Event (Evento)
```typescript
{
  id: string                    // E001, E002, etc.
  type: "admission" | "discharge" | "study_requested" | 
        "study_completed" | "alert"
  patientId: string
  studyId?: string
  message: string               // Descripción del evento
  timestamp: string             // Timestamp del evento
}
```

## 🚀 Instalación y Uso

### Requisitos Previos
- Node.js 18 o superior
- pnpm 10 o superior

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/MacroxW/tablero-trazabilidad.git
cd tablero-trazabilidad

# Instalar dependencias
pnpm install
```

### Ejecución en Desarrollo

```bash
# Iniciar servidor de desarrollo
pnpm dev

# La aplicación estará disponible en:
# http://localhost:3000
```

### Compilación para Producción

```bash
# Compilar aplicación
pnpm build

# Iniciar servidor de producción
pnpm start
```

### Linting

```bash
# Ejecutar ESLint
pnpm lint
```

## 📱 Uso de la Aplicación

### Dashboard Principal (`/`)

1. **Vista General**
   - Visualiza KPIs principales en la parte superior
   - Observa gráficos de distribución y evolución
   - Revisa eventos en tiempo real

2. **Gestión de Pacientes**
   - Filtra por: Todos, Críticos, Alertas, Pendientes
   - Ordena por: Severidad, Tiempo de espera
   - Click en un paciente para ver detalles

3. **Detalles del Paciente**
   - Información completa del paciente
   - Lista de estudios con estados
   - Botón "Cambiar Estado" para progresar estudios manualmente
   - Botón "Ver Trazabilidad Completa" para timeline detallado

4. **Timeline de Trazabilidad**
   - Visualización cronológica de eventos
   - Métricas de tiempo por fase
   - Resumen detallado de cada estudio

### Control de Simulación (`/simulation`)

1. **Controles Principales**
   - **Iniciar/Pausar**: Activa/desactiva la simulación automática
   - **Reiniciar**: Genera 15 pacientes nuevos con datos aleatorios
   - **Admitir**: Crea un paciente individual manualmente
   - **Limpiar**: Elimina todos los datos

2. **Configuración**
   - **Velocidad**: 0.5x, 1x, 2x, 5x
   - **Admisión automática**: Genera pacientes periódicamente
   - **Alta automática**: Da de alta pacientes con estudios completos
   - **Progreso de estudios**: Avanza estudios automáticamente

3. **Estadísticas en Tiempo Real**
   - Pacientes activos
   - Estudios totales/pendientes/completados
   - Ticks ejecutados

## 🔧 API Endpoints

### Pacientes

```typescript
// GET /api/patients
// Obtiene todos los pacientes activos con sus estudios
Response: { patients: PatientWithStudies[] }

// GET /api/patients?all=true
// Obtiene todos los pacientes (incluidos dados de alta)
Response: { patients: PatientWithStudies[] }

// POST /api/patients
// Crea un nuevo paciente (aleatorio por defecto)
Body: { random?: boolean, patient?: Patient, studies?: Study[] }
Response: { patient: PatientWithStudies, event: Event }

// GET /api/patients/[id]
// Obtiene un paciente específico
Response: { patient: PatientWithStudies }

// PUT /api/patients/[id]
// Actualiza un paciente
Body: Partial<Patient>
Response: { patient: Patient }

// DELETE /api/patients/[id]
// Da de alta a un paciente
Response: { patient: Patient, event: Event }
```

### Estudios

```typescript
// GET /api/studies
// Obtiene todos los estudios
Response: { studies: Study[] }

// GET /api/studies?patientId=P001
// Obtiene estudios de un paciente
Response: { studies: Study[] }

// PUT /api/studies/[id]
// Actualiza un estudio
Body: Partial<Study>
Response: { study: Study, event?: Event }
```

### Eventos

```typescript
// GET /api/events
// Obtiene todos los eventos (ordenados por timestamp desc)
Response: { events: Event[] }

// GET /api/events?limit=10
// Obtiene eventos limitados
Response: { events: Event[] }
```

### Simulación

```typescript
// GET /api/simulation
// Obtiene configuración actual
Response: { simulation: SimulationConfig, lastUpdated: string }

// POST /api/simulation
// Ejecuta acciones de simulación
Body: {
  action: "start" | "stop" | "reset" | "tick" | "admit" | "clear"
  // Parámetros adicionales según la acción
}
Response: Varía según la acción
```

## 🎨 Personalización

### Temas
El proyecto usa `next-themes` para soporte de tema claro/oscuro. Los colores se definen en `app/globals.css` usando variables CSS.

### Componentes UI
Los componentes de UI están basados en Radix UI y se pueden personalizar en `components/ui/`.

### Datos de Simulación
Modifica los arrays en `lib/simulation.ts` para cambiar:
- Diagnósticos disponibles
- Tipos de estudios
- Coberturas médicas
- Nombres y apellidos

## 📈 Métricas y KPIs

El sistema calcula automáticamente:

- **Tiempo total de estadía**: Desde admisión hasta alta
- **Tiempo de espera**: Desde solicitud hasta inicio de estudio
- **Tiempo de proceso**: Desde inicio hasta completado
- **Tiempo de revisión**: Desde completado hasta revisión médica
- **Tiempo promedio por estudio**: Media de todos los estudios
- **Tasa de completitud**: Estudios completados vs totales
- **Alertas activas**: Estudios con resultados anormales

## 🔒 Persistencia de Datos

Los datos se almacenan en archivos JSON en el directorio `data/`:

- `patients.json`: Lista de pacientes
- `studies.json`: Lista de estudios
- `doctors.json`: Lista de médicos
- `events.json`: Historial de eventos
- `config.json`: Configuración de simulación

**Nota**: En producción, se recomienda migrar a una base de datos real (PostgreSQL, MongoDB, etc.)

## 🐛 Troubleshooting

### La simulación no inicia
- Verifica que el archivo `data/config.json` exista
- Revisa la consola del navegador para errores
- Asegúrate de que los permisos de escritura estén correctos

### Los datos no se actualizan
- El polling está configurado a 3 segundos
- Verifica la conexión de red
- Revisa los logs del servidor

### Errores de compilación
```bash
# Limpia caché y reinstala
rm -rf .next node_modules
pnpm install
pnpm dev
```

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y pertenece a Softtek.

## 👥 Autores

- **MacroxW** - Desarrollo inicial

## 🙏 Agradecimientos

- Next.js team por el excelente framework
- Radix UI por los componentes accesibles
- Recharts por las visualizaciones
- Vercel por el hosting y analytics

---

**Versión**: 0.1.0  
**Última actualización**: Diciembre 2024
