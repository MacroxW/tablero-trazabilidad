# Descripción de Pantallas - Tablero de Trazabilidad

## Resumen Ejecutivo

El sistema de Tablero de Trazabilidad es una solución web que permite visualizar y monitorear en tiempo real el flujo de pacientes en un servicio de emergencias hospitalarias. El sistema cuenta con tres vistas principales que permiten diferentes perspectivas del mismo proceso de atención.

---

## 1. Dashboard Principal - Vista de Monitoreo

**Propósito**: Centro de comando para supervisión general del servicio de emergencias

### ¿Qué se ve en esta pantalla?

#### Indicadores Principales (Parte Superior)

La pantalla muestra 6 indicadores clave que resumen el estado actual:

- **Pacientes Activos**: Cuántos pacientes hay en este momento en emergencias
- **Críticos**: Cuántos requieren atención inmediata
- **Alertas**: Cuántos tienen resultados de estudios anormales
- **Estudios Totales**: Cantidad de estudios médicos solicitados
- **Completados**: Cuántos estudios ya tienen resultados
- **Espera Promedio**: Tiempo promedio que esperan los pacientes

#### Eventos Recientes

Una lista de las últimas actividades del servicio:
- Ingresos de nuevos pacientes
- Estudios completados
- Alertas médicas
- Altas de pacientes

Cada evento muestra qué pasó y a qué hora.

#### Gráficos de Análisis

**Gráfico Circular**: Muestra cómo se distribuyen los estudios según su estado (solicitados, en proceso, completados)

**Gráfico de Líneas**: Muestra la evolución durante el día de pacientes y estudios completados

#### Lista de Pacientes

La sección principal muestra todos los pacientes actualmente en emergencias. Para cada paciente se puede ver:

**Vista Resumida** (sin hacer click):
- Nombre del paciente
- Edad, género y cobertura médica
- Diagnóstico
- Cuántos estudios tiene (totales, completados, pendientes)
- Tiempo de espera
- Nivel de urgencia (Crítico/Urgente/Estable)

**Vista Detallada** (haciendo click en el paciente):
- Médico tratante
- Hora de ingreso
- Teléfono de contacto
- Lista completa de estudios con su estado
- Botón para ver la trazabilidad completa

#### Filtros Disponibles

Se puede filtrar la lista para ver solo:
- Todos los pacientes
- Solo los críticos
- Solo los que tienen alertas
- Solo los que tienen estudios pendientes

También se puede ordenar por severidad o por tiempo de espera.

### ¿Para qué sirve esta pantalla?

- Tener una visión general del estado del servicio de emergencias
- Identificar rápidamente pacientes críticos o con alertas
- Monitorear la carga de trabajo (cantidad de pacientes y estudios)
- Ver el detalle de cada paciente y sus estudios
- Acceder a la trazabilidad completa de cualquier paciente

---

## 2. Vista Kanban - Flujo de Atención

**Propósito**: Visualizar el recorrido de los pacientes a través de las diferentes etapas de atención

### ¿Qué se ve en esta pantalla?

La pantalla está dividida en 6 columnas verticales, cada una representa una etapa del proceso de atención:

#### Columna 1: En Admisión (Azul)
**Qué significa**: Pacientes que acaban de llegar y están siendo registrados

**Qué se ve**: 
- Pacientes recién ingresados
- Aún no tienen médico asignado
- No tienen estudios solicitados

#### Columna 2: Esperando Atención Médica (Púrpura)
**Qué significa**: Pacientes que ya tienen médico asignado pero esperan la primera evaluación

**Qué se ve**:
- Pacientes con médico asignado
- Tiempo que llevan esperando
- Aún sin estudios solicitados

#### Columna 3: En Estudios (Amarillo)
**Qué significa**: Pacientes a los que se les solicitaron estudios (análisis, radiografías, etc.)

**Qué se ve**:
- Pacientes con estudios en curso
- Cuántos estudios están pendientes
- Cuántos están en proceso
- Cuántos ya están completados
- Indicador si hay alguna alerta

#### Columna 4: Resultados Listos / Esperando Revisión (Naranja)
**Qué significa**: Pacientes cuyos estudios ya están listos pero el médico aún no los revisó

**Qué se ve**:
- Pacientes con todos los estudios completados
- Tiempo esperando la revisión médica
- Indicador si hay resultados anormales

#### Columna 5: Atención en Progreso (Cyan)
**Qué significa**: Pacientes que están siendo evaluados o tratados por el médico

**Qué se ve**:
- Pacientes con estudios revisados
- En proceso de tratamiento o decisión médica
- Tiempo en esta etapa

#### Columna 6: Alta / Derivación (Verde)
**Qué significa**: Pacientes que ya fueron dados de alta o derivados

**Qué se ve**:
- Pacientes que completaron su atención
- Tiempo total de estadía
- Estudios realizados

### Tarjetas de Paciente

Cada paciente aparece como una tarjeta que muestra:
- Nombre y edad
- Diagnóstico
- Nivel de urgencia (con color: rojo=crítico, amarillo=urgente, verde=estable)
- Tiempo en la etapa actual
- Estado de sus estudios (si aplica)
- Médico tratante
- Habitación

### Movimiento Automático

Las tarjetas se mueven automáticamente de una columna a otra a medida que el paciente avanza en su atención. Por ejemplo:
- Cuando se le asigna un médico → pasa de "En Admisión" a "Esperando Atención"
- Cuando se solicitan estudios → pasa a "En Estudios"
- Cuando se completan los estudios → pasa a "Resultados Listos"
- Y así sucesivamente

### ¿Para qué sirve esta pantalla?

- Ver de un vistazo en qué etapa está cada paciente
- Identificar cuellos de botella (columnas con muchos pacientes)
- Entender el flujo de trabajo del servicio
- Detectar pacientes que llevan mucho tiempo en una misma etapa
- Visualizar el progreso general del servicio

---

## 3. Control de Simulación

**Propósito**: Administrar la generación automática de datos para demostración y pruebas

### ¿Qué se ve en esta pantalla?

#### Controles Principales

**4 Botones Grandes**:

1. **Iniciar/Pausar**: Activa o detiene la generación automática de eventos
2. **Reiniciar**: Genera un nuevo conjunto de pacientes de prueba
3. **Admitir**: Crea un paciente individual manualmente
4. **Limpiar**: Elimina todos los datos del sistema

#### Configuración de Velocidad

Selector para controlar qué tan rápido ocurren los eventos:
- 0.5x (Lento)
- 1x (Normal)
- 2x (Rápido)
- 5x (Muy rápido)

#### Opciones Automáticas

Tres opciones que se pueden activar/desactivar:
- **Admisión automática**: El sistema genera nuevos pacientes periódicamente
- **Alta automática**: El sistema da de alta pacientes cuando completan su atención
- **Progreso de estudios**: Los estudios avanzan automáticamente entre estados

#### Estadísticas en Tiempo Real

Panel que muestra:
- Pacientes activos
- Estudios totales
- Estudios pendientes
- Estudios completados
- Ciclos de simulación ejecutados

#### Eventos Recientes

Lista de las últimas acciones realizadas por el sistema de simulación

### ¿Para qué sirve esta pantalla?

- Generar datos de prueba para demostrar el sistema
- Controlar la velocidad de la simulación para presentaciones
- Crear escenarios específicos para capacitación
- Probar el comportamiento del sistema con diferentes cargas de trabajo

---

## 4. Timeline de Trazabilidad (Ventana Emergente)

**Propósito**: Ver el recorrido completo y detallado de un paciente específico

### ¿Qué se ve en esta ventana?

#### Métricas de Tiempo (Parte Superior)

5 indicadores que resumen los tiempos del paciente:
- **Tiempo Total**: Cuánto lleva en el hospital
- **Esperando Estudios**: Tiempo esperando que se procesen los estudios
- **Esperando Revisión**: Tiempo esperando que el médico revise resultados
- **Estudios en Proceso**: Tiempo que tomó procesar los estudios
- **Promedio por Estudio**: Tiempo medio de cada estudio

#### Línea de Tiempo Visual

Una línea vertical que muestra cronológicamente todos los eventos del paciente:

**Eventos que se muestran**:
1. **Admisión**: Cuándo ingresó al hospital
2. **Asignación de Médico**: Cuándo se le asignó un médico
3. **Solicitud de Estudios**: Qué estudios se pidieron y cuándo
4. **Inicio de Estudios**: Cuándo comenzó cada estudio
5. **Finalización de Estudios**: Cuándo se completó cada estudio
6. **Revisión de Resultados**: Cuándo el médico revisó los resultados
7. **Alta**: Cuándo fue dado de alta (si aplica)

Cada evento muestra:
- Hora exacta
- Descripción de qué pasó
- Tiempo transcurrido desde el evento anterior
- Responsable (médico, área, etc.)

#### Resumen de Estudios (Parte Inferior)

Para cada estudio del paciente se muestra:
- Nombre del estudio
- Tipo de estudio
- Estado actual
- Tres tiempos clave:
  - Tiempo de espera (desde solicitud hasta inicio)
  - Tiempo de proceso (desde inicio hasta completado)
  - Tiempo de revisión (desde completado hasta revisión médica)
- Indicador si hay resultado anormal

### ¿Para qué sirve esta ventana?

- Ver el recorrido completo de un paciente
- Identificar demoras en el proceso
- Analizar tiempos de cada etapa
- Tener un registro detallado para auditoría
- Entender dónde se pueden hacer mejoras en el proceso

---

## Navegación entre Pantallas

### Cómo moverse por el sistema

**Desde el Dashboard Principal**:
- Botón "Vista Kanban" → Va a la vista de flujo por etapas
- Botón "Control de Simulación" → Va a la configuración
- Click en "Ver Trazabilidad" en un paciente → Abre el timeline

**Desde la Vista Kanban**:
- Botón "Volver" → Regresa al Dashboard
- Click en cualquier tarjeta de paciente → Abre el timeline

**Desde Control de Simulación**:
- Botón "Volver" → Regresa al Dashboard
- Botón "Ver Dashboard en Tiempo Real" → Va al Dashboard

**Desde el Timeline**:
- Botón "X" o click fuera → Cierra la ventana

### Actualización Automática

Todas las pantallas se actualizan automáticamente cada 3 segundos para mostrar los cambios en tiempo real.

---

## Casos de Uso Principales

### 1. Monitoreo General del Servicio

**Objetivo**: Supervisar el estado general de emergencias

**Pantalla a usar**: Dashboard Principal

**Qué hacer**:
- Revisar los indicadores superiores para ver la carga de trabajo
- Verificar si hay pacientes críticos o con alertas
- Revisar el feed de eventos para ver la actividad reciente

### 2. Seguimiento del Flujo de Pacientes

**Objetivo**: Ver cómo avanzan los pacientes por el proceso

**Pantalla a usar**: Vista Kanban

**Qué hacer**:
- Observar la distribución de pacientes en las columnas
- Identificar si hay acumulación en alguna etapa
- Ver cuánto tiempo llevan los pacientes en cada etapa

### 3. Análisis Detallado de un Paciente

**Objetivo**: Revisar el recorrido completo de un paciente específico

**Pantalla a usar**: Dashboard Principal → Timeline

**Qué hacer**:
- Buscar el paciente en la lista
- Click en "Ver Trazabilidad Completa"
- Revisar los tiempos y eventos en el timeline
- Analizar si hay demoras o problemas

### 4. Demostración del Sistema

**Objetivo**: Mostrar cómo funciona el sistema con datos de prueba

**Pantalla a usar**: Control de Simulación

**Qué hacer**:
- Click en "Reiniciar" para generar pacientes
- Activar todas las opciones automáticas
- Seleccionar velocidad 2x o 5x
- Click en "Iniciar"
- Ir a Vista Kanban para ver el movimiento

---

## Beneficios del Sistema

### Para el Personal Médico
- Visibilidad inmediata de todos los pacientes
- Identificación rápida de casos críticos
- Seguimiento del estado de estudios
- Reducción de tiempos de espera

### Para la Administración
- Métricas en tiempo real del servicio
- Identificación de cuellos de botella
- Datos para optimización de procesos
- Trazabilidad completa para auditoría

### Para la Gestión de Calidad
- Registro detallado de tiempos
- Identificación de demoras
- Análisis de flujo de trabajo
- Datos para mejora continua

---

**Versión**: 1.0  
