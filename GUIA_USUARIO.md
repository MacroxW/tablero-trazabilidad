# Guía de Usuario - Tablero de Trazabilidad

## Índice

1. [Dashboard Principal](#dashboard-principal)
2. [Vista Kanban](#vista-kanban)
3. [Control de Simulación](#control-de-simulación)
4. [Timeline de Trazabilidad](#timeline-de-trazabilidad)

---

## Dashboard Principal

**URL**: `http://localhost:3000/`

### Descripción General

El Dashboard Principal es el centro de comando para el monitoreo en tiempo real de todos los pacientes en el servicio de emergencias. Proporciona una vista completa del estado actual del sistema con actualización automática cada 3 segundos.

### Elementos de la Interfaz

#### 1. Header (Barra Superior)

**Ubicación**: Parte superior de la pantalla, fija al hacer scroll

**Elementos**:
- **Título**: "Command Center - Emergencias"
- **Subtítulo**: "Trazabilidad en tiempo real • Datos en vivo"
- **Botón "Vista Kanban"**: Acceso rápido a la vista de flujo por etapas
- **Botón "Control de Simulación"**: Acceso a la configuración de la simulación
- **Reloj**: Muestra la hora de última actualización

#### 2. KPI Cards (Tarjetas de Indicadores)

**Ubicación**: Primera sección debajo del header

**6 Tarjetas con Métricas Clave**:

1. **Pacientes Activos**
   - Número total de pacientes en emergencias
   - Color: Azul/Accent
   - Descripción: "En emergencias"

2. **Críticos**
   - Cantidad de pacientes con severidad "Crítico"
   - Color: Rojo/Destructive
   - Descripción: "Requieren atención inmediata"

3. **Alertas**
   - Pacientes con resultados anormales en estudios
   - Color: Amarillo/Warning
   - Descripción: "Resultados anormales"

4. **Estudios Totales**
   - Suma de todos los estudios solicitados
   - Color: Azul/Primary
   - Descripción: "En diferentes estados"

5. **Completados**
   - Estudios finalizados listos para revisión
   - Color: Verde/Success
   - Descripción: "Listos para médico"

6. **Espera Promedio**
   - Tiempo promedio de espera en minutos
   - Color: Gris/Muted
   - Descripción: "Tiempo en minutos"

#### 3. Feed de Eventos en Tiempo Real

**Ubicación**: Debajo de los KPIs

**Características**:
- Muestra los últimos 5 eventos del sistema
- Actualización automática cada 3 segundos
- Iconos por tipo de evento:
  - 🟢 **Admisión**: Nuevo paciente ingresado
  - 🔴 **Alta**: Paciente dado de alta
  - ⚠️ **Alerta**: Resultado anormal detectado
  - 🔵 **Estudio**: Estudio completado

**Información por Evento**:
- Mensaje descriptivo del evento
- Hora exacta del evento (formato HH:MM)

#### 4. Gráficos de Análisis

**Ubicación**: Sección central

**Dos Gráficos Principales**:

1. **Distribución de Estados** (Gráfico de Torta)
   - Muestra la proporción de estudios por estado
   - Colores:
     - 🟡 Solicitado
     - 🔵 Pendiente Resultado
     - 🟢 Completado
   - Interactivo: Hover muestra cantidad exacta

2. **Evolución de Pacientes** (Gráfico de Líneas)
   - Muestra tendencia temporal de pacientes
   - Dos líneas:
     - 🔵 Pacientes totales
     - 🟢 Estudios completados
   - Eje X: Horarios del día
   - Eje Y: Cantidad

#### 5. Lista de Pacientes

**Ubicación**: Sección inferior

**Controles de Filtrado**:

**Filtros Disponibles**:
- **Todos**: Muestra todos los pacientes activos
- **Críticos**: Solo pacientes con severidad "Crítico"
- **Alertas**: Solo pacientes con resultados anormales
- **Pendientes**: Solo pacientes con estudios no completados

**Ordenamiento**:
- Por severidad (Crítico → Urgente → Estable)
- Por tiempo de espera (Mayor a menor)

**Vista Compacta de Paciente** (Tarjeta Colapsada):

Cada tarjeta muestra:
- **Nombre del paciente**
- **Icono de alerta** (si tiene resultados anormales, pulsante)
- **Datos demográficos**: Edad, género, plan de salud, habitación
- **Diagnóstico**: Motivo de consulta
- **Resumen de estudios**:
  - Total de estudios
  - Completados (verde)
  - Pendientes (amarillo)
  - Tiempo de espera máximo
- **Badge de severidad**: Crítico (rojo), Urgente (amarillo), Estable (verde)
- **Icono expandir** (chevron)

**Vista Expandida de Paciente** (Al hacer click):

Información adicional:
- **Médico tratante**: Nombre y especialidad
- **Hora de ingreso**: Timestamp de admisión
- **Cobertura**: Plan de salud
- **Contacto**: Teléfono

**Botón "Ver Trazabilidad Completa"**:
- Abre modal con timeline detallado
- Muestra todo el recorrido del paciente

**Detalle de Estudios**:
- Lista de todos los estudios del paciente
- Por cada estudio:
  - Nombre del estudio
  - Tiempo de espera
  - Barra de progreso con color según estado
  - Botón "Cambiar Estado" (para simulación manual)
  - Indicador de alerta si corresponde

**Colores de Tarjetas**:
- Borde rojo pulsante: Paciente con alertas
- Borde rojo sólido: Paciente crítico
- Borde amarillo: Paciente urgente
- Borde normal: Paciente estable

#### 6. Estado Vacío

Si no hay pacientes que coincidan con los filtros:
- Icono de actividad
- Mensaje: "No hay pacientes que coincidan con los filtros seleccionados"
- Botón para ir a Control de Simulación

---

## Vista Kanban

**URL**: `http://localhost:3000/kanban`

### Descripción General

La Vista Kanban organiza a todos los pacientes en columnas que representan las etapas del flujo de atención en emergencias. Las tarjetas se mueven automáticamente entre columnas según el progreso del paciente.

### Elementos de la Interfaz

#### 1. Header

**Elementos**:
- **Botón Volver**: Regresa al dashboard principal
- **Título**: "Tablero Kanban - Flujo de Atención"
- **Subtítulo**: "Vista de trazabilidad por etapas • Actualización en tiempo real"
- **Reloj**: Hora de última actualización

#### 2. Columnas del Kanban

**6 Columnas Verticales**:

##### Columna 1: 🔵 En Admisión

**Color de Header**: Azul
**Descripción**: Pacientes recién ingresados al servicio de emergencias

**Criterio de Ubicación**:
- Paciente sin médico asignado
- Sin estudios solicitados
- Recién admitido

**Información en Tarjeta**:
- Nombre y edad
- Diagnóstico
- Severidad
- Tiempo en esta etapa
- Habitación

##### Columna 2: 🟣 Esperando Atención Médica

**Color de Header**: Púrpura
**Descripción**: Pacientes asignados a médico pero sin evaluación inicial

**Criterio de Ubicación**:
- Médico asignado
- Sin estudios solicitados aún
- Esperando primera evaluación

**Información en Tarjeta**:
- Nombre y edad
- Diagnóstico
- Severidad
- Tiempo esperando
- Médico asignado
- Habitación

##### Columna 3: 🟡 En Estudios

**Color de Header**: Amarillo
**Descripción**: Pacientes con estudios solicitados en proceso

**Criterio de Ubicación**:
- Tiene estudios solicitados
- Al menos un estudio en estado "Solicitado" o "Pendiente Resultado"
- Ningún estudio completado o algunos completados pero no todos

**Información en Tarjeta**:
- Nombre y edad
- Diagnóstico
- Severidad
- Tiempo en estudios
- Resumen de estudios:
  - 🔴 X pendientes
  - 🟡 X en proceso
  - 🟢 X completados
- Indicador de alerta (si aplica)
- Médico y habitación

##### Columna 4: 🟠 Resultados Listos / Esperando Revisión

**Color de Header**: Naranja
**Descripción**: Estudios completados pendientes de revisión médica

**Criterio de Ubicación**:
- Todos los estudios en estado "Completado"
- Resultados no revisados por el médico
- Esperando interpretación

**Información en Tarjeta**:
- Nombre y edad
- Diagnóstico
- Severidad
- Tiempo esperando revisión
- Cantidad de estudios completados
- Indicador de alerta (si aplica)
- Médico y habitación

##### Columna 5: 🔷 Atención en Progreso

**Color de Header**: Cyan
**Descripción**: Pacientes siendo evaluados o tratados

**Criterio de Ubicación**:
- Todos los estudios completados
- Resultados revisados por el médico
- En proceso de tratamiento/decisión

**Información en Tarjeta**:
- Nombre y edad
- Diagnóstico
- Severidad
- Tiempo en atención
- Estudios completados
- Médico y habitación

##### Columna 6: 🟢 Alta / Derivación

**Color de Header**: Verde
**Descripción**: Pacientes listos para egreso o derivación

**Criterio de Ubicación**:
- Estado "discharged"
- Proceso de atención completado
- Listo para alta o derivación

**Información en Tarjeta**:
- Nombre y edad
- Diagnóstico
- Severidad
- Tiempo total de estadía
- Estudios realizados
- Médico tratante

#### 3. Tarjetas de Paciente

**Diseño de Tarjeta**:

**Header de Tarjeta**:
- Nombre del paciente (negrita)
- Edad y género
- Badge de severidad (esquina superior derecha)

**Cuerpo de Tarjeta**:
- Diagnóstico (2 líneas máximo)
- Icono de reloj + tiempo en etapa actual
- Resumen de estudios (si aplica):
  - Total de estudios
  - Desglose por estado con indicadores de color
- Indicador de alerta (si tiene resultados anormales)

**Footer de Tarjeta**:
- Icono de habitación + número
- Icono de médico + nombre del médico

**Interactividad**:
- **Hover**: Sombra y elevación
- **Click**: Abre modal con timeline completo

**Indicadores Visuales**:
- **Borde rojo pulsante**: Paciente con alertas
- **Ring rojo**: Paciente crítico
- **Ring amarillo**: Paciente urgente
- **Borde normal**: Paciente estable

#### 4. Contador de Pacientes

**Ubicación**: Header de cada columna

**Formato**: Círculo blanco con número
- Muestra cantidad de pacientes en esa columna
- Actualización en tiempo real

#### 5. Estado Vacío por Columna

Si una columna no tiene pacientes:
- Icono de la columna (opacidad 30%)
- Texto: "Sin pacientes"
- Centrado verticalmente

#### 6. Scroll Independiente

- Cada columna tiene scroll vertical independiente
- Altura máxima: calc(100vh - 300px)
- Permite ver muchos pacientes sin perder contexto

#### 7. Modal de Timeline

**Activación**: Click en cualquier tarjeta de paciente

**Contenido**:
- Header con nombre y diagnóstico del paciente
- Botón cerrar (X)
- Componente PatientTimeline completo
- Scroll vertical si es necesario

---

## Control de Simulación

**URL**: `http://localhost:3000/simulation`

### Descripción General

Página de administración para controlar el motor de simulación que genera y gestiona pacientes automáticamente.

### Elementos de la Interfaz

#### 1. Header

**Elementos**:
- Botón volver al dashboard
- Título: "Control de Simulación"
- Indicador de estado:
  - 🟢 "Simulación Activa" (pulsante)
  - ⚪ "Simulación Detenida"

#### 2. Controles Principales

**4 Botones de Acción**:

1. **Iniciar/Pausar**
   - Verde: Iniciar simulación
   - Amarillo: Pausar simulación
   - Activa/desactiva el motor automático

2. **Reiniciar**
   - Color: Azul/Primary
   - Genera 15 pacientes nuevos
   - Limpia datos anteriores

3. **Admitir**
   - Color: Cyan/Accent
   - Crea un paciente individual
   - Útil para pruebas manuales

4. **Limpiar**
   - Color: Rojo/Destructive
   - Elimina todos los datos
   - Resetea el sistema

#### 3. Velocidad de Simulación

**Selector de Velocidad**:
- 0.5x (Lento)
- 1x (Normal)
- 2x (Rápido)
- 5x (Muy rápido)

**Efecto**: Controla la frecuencia de eventos automáticos

#### 4. Opciones de Simulación

**3 Checkboxes**:

1. **Admisión automática**
   - Genera nuevos pacientes periódicamente
   - Intervalo configurable

2. **Alta automática**
   - Da de alta pacientes con estudios completados
   - Simula flujo completo

3. **Progreso de estudios**
   - Avanza estudios automáticamente
   - Simula procesamiento de laboratorio/imágenes

#### 5. Panel de Estadísticas

**5 Métricas en Tiempo Real**:

1. **Pacientes Activos**
   - Icono: Usuarios
   - Color: Azul

2. **Estudios Totales**
   - Icono: Documentos
   - Color: Cyan

3. **Estudios Pendientes**
   - Icono: Reloj
   - Color: Amarillo

4. **Estudios Completados**
   - Icono: Actividad
   - Color: Verde

5. **Ticks Ejecutados**
   - Icono: Rayo
   - Color: Azul
   - Contador de ciclos de simulación

#### 6. Eventos Recientes

**Lista de Últimos 10 Eventos**:

**Formato por Evento**:
- Icono según tipo
- Mensaje descriptivo
- Sin timestamp (solo en dashboard principal)

**Tipos de Eventos**:
- 🟢 Admisión
- ⚪ Alta
- 🔴 Alerta
- 🔵 Estudio completado

#### 7. Link al Dashboard

**Botón Grande Centrado**:
- "Ver Dashboard en Tiempo Real"
- Icono de actividad
- Color: Primary
- Lleva al dashboard principal

---

## Timeline de Trazabilidad

**Activación**: Modal que se abre desde dashboard o vista Kanban

### Descripción General

Vista detallada del recorrido completo de un paciente desde su admisión hasta el alta, mostrando todos los eventos con timestamps y duraciones.

### Elementos de la Interfaz

#### 1. Header del Modal

**Elementos**:
- Nombre del paciente (grande, negrita)
- Diagnóstico y severidad
- Botón cerrar (X)

#### 2. Estadísticas de Tiempo

**5 Tarjetas de Métricas**:

1. **Tiempo Total**
   - Desde admisión hasta ahora/alta
   - Formato: Xh Ym o Ym

2. **Esperando Estudios**
   - Tiempo en espera de resultados
   - Color: Amarillo/Warning

3. **Esperando Revisión**
   - Tiempo esperando al médico
   - Color: Azul/Info

4. **Estudios en Proceso**
   - Tiempo de procesamiento
   - Color: Azul/Primary

5. **Promedio/Estudio**
   - Tiempo medio por estudio
   - Color: Cyan/Accent

#### 3. Timeline Visual

**Formato de Línea de Tiempo**:

**Línea Vertical**:
- Color: Gris/Border
- Conecta todos los eventos
- Ubicada a la izquierda

**Eventos en el Timeline**:

Cada evento muestra:

**Icono Circular**:
- Tamaño: 48px
- Borde de 2px
- Color según tipo de evento
- Icono representativo

**Contenido del Evento**:
- **Título**: Tipo de evento (negrita)
- **Descripción**: Detalles del evento
- **Hora**: Timestamp (HH:MM)
- **Duración**: Tiempo desde evento anterior (si aplica)

**Barra de Progreso** (si hay duración):
- Altura: 6px
- Color según estado:
  - Verde: Completado
  - Amarillo: En progreso
  - Azul: Otros
- Ancho proporcional al tiempo total

**Tipos de Eventos en Timeline**:

1. **🔵 Admisión**
   - Color: Azul
   - Icono: UserPlus
   - Marca el inicio

2. **🟢 Asignación de Médico**
   - Color: Verde
   - Icono: Stethoscope
   - Muestra médico asignado

3. **🟡 Solicitud de Estudios**
   - Color: Amarillo
   - Icono: FileText
   - Lista estudios solicitados

4. **🟠 Inicio de Estudio**
   - Color: Naranja
   - Icono: Clock
   - Por cada estudio

5. **🔴 Finalización de Estudio**
   - Color: Rojo (si alerta) o Verde
   - Icono: CheckCircle
   - Muestra resultado

6. **🟣 Revisión de Resultados**
   - Color: Púrpura
   - Icono: Eye
   - Interpretación médica

7. **⚪ Alta/Derivación**
   - Color: Gris
   - Icono: UserX
   - Marca el fin

#### 4. Resumen de Estudios

**Ubicación**: Debajo del timeline

**Formato por Estudio**:

**Tarjeta de Estudio**:
- Nombre del estudio (header)
- Tipo de estudio
- Badge de estado (Solicitado/Pendiente/Completado)

**3 Métricas de Tiempo**:
1. **Espera**: Desde solicitud hasta inicio
2. **Proceso**: Desde inicio hasta completado
3. **Revisión**: Desde completado hasta revisión (o "Pendiente")

**Indicador de Alerta**:
- Si hasAlert = true
- Texto: "⚠️ Resultado anormal detectado"
- Color: Rojo/Destructive

**Colores de Tarjeta**:
- Borde rojo + fondo rojo claro: Con alerta
- Borde normal: Sin alerta

---

## Navegación entre Páginas

### Flujo de Navegación

```
Dashboard Principal (/)
    ↓
    ├─→ Vista Kanban (/kanban)
    │       ↓
    │       └─→ Modal Timeline (click en tarjeta)
    │
    ├─→ Control Simulación (/simulation)
    │       ↓
    │       └─→ Dashboard Principal (botón)
    │
    └─→ Modal Timeline (click en "Ver Trazabilidad")
```

### Atajos de Teclado

- **ESC**: Cierra modales abiertos
- **Click fuera del modal**: Cierra el modal

### Actualización Automática

**Todas las páginas se actualizan cada 3 segundos**:
- Dashboard Principal
- Vista Kanban
- Control de Simulación (estadísticas)

**No se actualiza automáticamente**:
- Modal de Timeline (snapshot del momento de apertura)

---

## Consejos de Uso

### Para Visualizar el Flujo Completo

1. Ir a `/simulation`
2. Click en "Reiniciar" (genera 20 pacientes)
3. Activar todas las opciones automáticas
4. Seleccionar velocidad 2x o 5x
5. Click en "Iniciar"
6. Ir a `/kanban` para ver movimiento de tarjetas
7. Observar cómo los pacientes avanzan entre columnas

### Para Análisis Detallado

1. Ir a Dashboard Principal
2. Usar filtros para enfocarse en casos específicos
3. Click en paciente para ver detalles
4. Click en "Ver Trazabilidad Completa"
5. Analizar métricas de tiempo
6. Identificar cuellos de botella

### Para Pruebas Manuales

1. Ir a `/simulation`
2. Click en "Limpiar"
3. Desactivar opciones automáticas
4. Click en "Admitir" para crear pacientes uno por uno
5. En dashboard, usar "Cambiar Estado" en estudios
6. Observar movimiento manual en Kanban

---

**Versión**: 1.0  
**Última actualización**: Diciembre 2024
