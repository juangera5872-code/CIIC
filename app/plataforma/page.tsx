"use client"

import { useState } from "react"
import Image from "next/image"
import {
  LogOut,
  User,
  BookOpen,
  Settings,
  Users,
  PlusCircle,
  Upload,
  CheckCircle2,
  Trash2,
  Archive,
  FolderOpen,
  Mail,
  Reply,
  Forward,
  FileText,
  Image as ImageIcon,
  Video,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Clock,
  Award,
  Play,
  Monitor,
  Tag,
  Inbox,
  X,
  GraduationCap,
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  Youtube,
  FileCheck,
  Eye,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/* ============================================================
   TYPES
============================================================ */
type ViewType = "login" | "dashboard" | "curso-detalle" | "leccion" | "simulador-5s" | "admin-panel"
type SimulatorTab = "seiri" | "seiton" | "seiso"
type AdminTab = "cursos" | "alumnos" | "config"

interface Lesson {
  id: string
  title: string
  type: "video" | "reading" | "practice"
  duration: string
  completed: boolean
  youtubeUrl?: string
  content?: string
}

interface Module {
  id: string
  title: string
  description: string
  lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  description: string
  duration: string
  progress: number
  modules: Module[]
  status: "publicado" | "borrador"
}

interface FileItem {
  id: string
  name: string
  type: "necesario" | "innecesario" | "dudoso"
  status: "pendiente" | "mantener" | "cuarentena" | "eliminar"
}

interface EmailItem {
  id: string
  from: string
  subject: string
  preview: string
  status: "pendiente" | "procesado"
}

/* ============================================================
   COURSE DATA - 5S COMPLETO
============================================================ */
const COURSE_5S: Course = {
  id: "5s-digital",
  title: "5S en el Entorno Administrativo y Digital",
  description: "Aprende a aplicar la metodología 5S japonesa en tu espacio de trabajo físico y digital para aumentar la productividad, reducir el estrés y optimizar procesos.",
  duration: "16 horas",
  progress: 40,
  status: "publicado",
  modules: [
    {
      id: "m1",
      title: "Módulo 1: Introducción y Sensibilización",
      description: "Comprende la metodología 5S como estrategia integral de mejora",
      lessons: [
        {
          id: "l1-1",
          title: "Video: ¿Qué son las 5S? - Introducción",
          type: "video",
          duration: "12 min",
          completed: true,
          youtubeUrl: "https://www.youtube.com/embed/G0fICPJQbao",
        },
        {
          id: "l1-2",
          title: "Lectura: El Caos en la Oficina Moderna",
          type: "reading",
          duration: "15 min",
          completed: true,
          content: `# El Caos en la Oficina Moderna

## Contexto Actual
Hoy en día, el trabajo de oficina no solo es físico, sino también digital. Esto ha generado un nuevo tipo de desorden:

- **Escritorios saturados** de documentos
- **Escritorios digitales (desktop)** llenos de archivos
- **Bandejas de entrada** con cientos o miles de correos
- **Múltiples versiones** del mismo archivo
- **Falta de criterios claros** para nombrar y guardar información

> **Idea clave:** El desorden no siempre se ve, pero siempre se siente.

## Los "Ladrones de Tiempo"

### 1. Búsqueda de información
- Tiempo promedio perdido buscando archivos: **10-20% de la jornada**
- Ejemplo: "¿Dónde guardé el reporte final? ¿Versión final_v3 o final_definitivo?"

### 2. Duplicidad de información
- Múltiples versiones de documentos
- Correos reenviados innecesariamente
- Archivos guardados en diferentes ubicaciones

### 3. Saturación visual
- Demasiados estímulos en el entorno
- Dificultad para priorizar
- Sensación constante de "tener demasiado pendiente"

## Impacto
- Estrés
- Fatiga mental
- Errores
- Baja productividad

## ¿Qué son las 5S?

| S | Japonés | Español | Significado |
|---|---------|---------|-------------|
| 1 | Seiri | Clasificar | Separar lo necesario de lo innecesario |
| 2 | Seiton | Ordenar | Un lugar para cada cosa |
| 3 | Seiso | Limpiar | Detectar problemas |
| 4 | Seiketsu | Estandarizar | Mantener el orden |
| 5 | Shitsuke | Disciplina | Crear hábito |

**Mensaje clave:** Ordenar no es acomodar... es diseñar cómo trabajamos.`,
        },
        {
          id: "l1-3",
          title: "Video: Filosofía Lean Office",
          type: "video",
          duration: "10 min",
          completed: false,
          youtubeUrl: "https://www.youtube.com/embed/wfsRAZUnonI",
        },
      ],
    },
    {
      id: "m2",
      title: "Módulo 2: Seiri (Clasificar)",
      description: "Aprende a identificar y eliminar lo innecesario",
      lessons: [
        {
          id: "l2-1",
          title: "Video: La Primera S - Seiri Explicado",
          type: "video",
          duration: "15 min",
          completed: false,
          youtubeUrl: "https://www.youtube.com/embed/6DMNwHP5Ubo",
        },
        {
          id: "l2-2",
          title: "Lectura: Técnica del Semáforo y Tarjetas Rojas",
          type: "reading",
          duration: "20 min",
          completed: false,
          content: `# Seiri - Clasificar y Descartar

## Objetivo
Aprender a identificar y eliminar lo innecesario para liberar espacio físico, mental y digital, mejorando la eficiencia y reduciendo el estrés.

## ¿Por qué acumulamos?
- "Por si acaso"
- Falta de criterios claros
- Miedo a perder información
- Cultura organizacional ("guarda todo")

> **Problema:** Todo lo que guardas sin criterio te cuesta tiempo después.

## Principio Clave de Seiri
"No todo lo que tienes lo necesitas, y no todo lo que necesitas debe estar cerca."

## Técnica del Semáforo

### 🟢 Verde (Uso frecuente)
- Uso diario o semanal
- Debe estar accesible
- **Ejemplos:** Archivos activos, herramientas de uso constante

### 🟡 Amarillo (Uso ocasional)
- Uso mensual o eventual
- Puede almacenarse, pero organizado
- **Ejemplos:** Reportes históricos, documentos de consulta

### 🔴 Rojo (Innecesario)
- No se usa
- Duplicado
- Obsoleto
- **Ejemplos:** Versiones viejas, archivos descargados sin uso

> **Regla clave:** Si dudas demasiado... probablemente es amarillo o rojo.

## Tarjetas Rojas Digitales

Las Tarjetas Rojas sirven para marcar lo que debe eliminarse o revisarse. No se elimina inmediatamente → primero se cuestiona.

### Criterios para aplicar Tarjeta Roja:
- No se han usado en 3-6 meses
- Están duplicados
- Tienen nombres confusos
- No sabes qué contienen
- No aportan valor

## Cuarentena Digital
Es un espacio temporal donde se colocan archivos dudosos antes de eliminarlos.

- **Carpeta específica:** \`_CUARENTENA\`
- **Tiempo límite:** 30 días
- **Regla:** Si no se usa → se elimina

**Ventaja:** Reduce el miedo a borrar.

## Mensaje Clave
El desorden no es acumulación... es falta de decisión.`,
        },
        {
          id: "l2-3",
          title: "Práctica: Simulador de Tarjetas Rojas",
          type: "practice",
          duration: "30 min",
          completed: false,
        },
      ],
    },
    {
      id: "m3",
      title: "Módulo 3: Seiton (Ordenar)",
      description: "Establece un sistema lógico de organización",
      lessons: [
        {
          id: "l3-1",
          title: "Video: Seiton - Orden Inteligente",
          type: "video",
          duration: "14 min",
          completed: false,
          youtubeUrl: "https://www.youtube.com/embed/HQCP65CWYzs",
        },
        {
          id: "l3-2",
          title: "Lectura: Ergonomía y Arquitectura de Información",
          type: "reading",
          duration: "25 min",
          completed: false,
          content: `# Seiton - Orden Inteligente

## Objetivo
Establecer un sistema lógico de organización física y digital que permita encontrar cualquier archivo o herramienta en menos de 30 segundos.

## Principio Clave
"Un lugar para cada cosa... y cada cosa en su lugar."

Pero con un enfoque funcional: No se trata de ordenar bonito, sino de ordenar para trabajar mejor.

## Ergonomía: Zonas de Alcance

### Zona Primaria (alcance inmediato)
- Lo que usas constantemente (diario)
- Debe estar a la altura de las manos, sin esfuerzo
- **Ejemplos:** Teclado, mouse, agenda activa, teléfono

### Zona Secundaria (alcance medio)
- Uso frecuente pero no constante
- **Ejemplos:** Carpetas de consulta, calculadora, material de apoyo

### Zona Terciaria (alcance lejano)
- Uso ocasional
- **Ejemplos:** Archivos históricos, papelería extra

> **Regla de oro:** Entre más usas algo, más cerca debe estar.

## Arquitectura de Información Digital

### Problema común
- Carpetas sin estructura
- Archivos perdidos
- Nombres inconsistentes

**Resultado:** Dependencia de la memoria, no del sistema.

### Principio clave
"Si necesitas pensar dónde está un archivo... el sistema falló."

## Estructura de Carpetas Recomendada

\`\`\`
EMPRESA/
├── 01_RRHH/
│   ├── Reclutamiento/
│   ├── Expedientes/
│   └── Nómina/
├── 02_Finanzas/
│   ├── Facturación/
│   └── Presupuestos/
├── 03_Operaciones/
└── 04_Proyectos/
\`\`\`

### Reglas clave:
- Máximo 3-4 niveles de profundidad
- Nombres claros y consistentes
- Orden numérico para jerarquía

## Protocolos de Nomenclatura

### Problema típico:
- \`archivo_final.doc\`
- \`reporte_v2_final_ahora_si.xlsx\`

### Estándar recomendado:
**Formato:** \`AAAA-MM-DD_Tema_Versión_Responsable\`

**Ejemplo:** \`2026-04-22_ReporteVentas_V1_JP.xlsx\`

### Reglas:
- Usar fechas (orden automático)
- Evitar espacios (usar guiones bajos)
- Versiones claras (V1, V2...)
- **No usar "final"**

> **Regla clave:** El nombre debe explicar el archivo sin abrirlo.

## Mensaje Final
El orden no es acomodar... es eliminar la necesidad de buscar.`,
        },
        {
          id: "l3-3",
          title: "Práctica: Simulador de Nomenclatura",
          type: "practice",
          duration: "20 min",
          completed: false,
        },
      ],
    },
    {
      id: "m4",
      title: "Módulo 4: Seiso (Limpiar)",
      description: "Integra la limpieza como proceso de inspección",
      lessons: [
        {
          id: "l4-1",
          title: "Video: Seiso - Más que Limpiar",
          type: "video",
          duration: "12 min",
          completed: false,
          youtubeUrl: "https://www.youtube.com/embed/sZgEfSivwss",
        },
        {
          id: "l4-2",
          title: "Lectura: Higiene de Datos e Inbox Zero",
          type: "reading",
          duration: "20 min",
          completed: false,
          content: `# Seiso - Limpieza e Inspección

## Objetivo
Integrar la limpieza como un proceso sistemático de inspección para detectar problemas, prevenir fallas y mantener la eficiencia operativa.

## Cambio de Mentalidad
"Limpiar no es estética... es inspección."

La limpieza permite:
- Detectar fallas tempranas
- Prevenir daños
- Extender la vida útil del equipo

> **Dato clave:** El polvo es enemigo silencioso de la productividad.

## Mantenimiento Básico de Hardware

### Teclado
- Sacudir suavemente
- Uso de aire comprimido
- Limpieza con paño seco o ligeramente húmedo

### Monitor
- Apagar antes de limpiar
- Usar paño de microfibra
- Evitar líquidos directos

### Laptop
- No bloquear rejillas
- Limpiar salidas de aire
- Evitar superficies blandas (camas, cojines)

### Señales de alerta:
- Ruido excesivo
- Calentamiento
- Lentitud

## Técnica Inbox Zero

### Objetivo
Mantener la bandeja de entrada vacía o bajo control.

### Reglas básicas
Cada correo debe tener una acción inmediata:

1. **Eliminar** → No aporta valor
2. **Responder** → Si toma menos de 2 minutos
3. **Delegar** → Asignar responsable
4. **Archivar** → Si es información útil
5. **Convertir en tarea** → Si requiere seguimiento

### Estructura recomendada de carpetas:
- 📁 Acción
- 📁 En espera
- 📁 Archivo

### Errores comunes:
- Usar inbox como lista de tareas
- No cerrar ciclos
- Guardar todo "por si acaso"

## Limpieza de Bases de Datos

### Problemas comunes:
- Registros duplicados
- Información incompleta
- Datos obsoletos

### Criterios de limpieza:
- Eliminar duplicados
- Completar campos clave
- Actualizar información relevante

> **Regla clave:** Mejor pocos datos correctos que muchos incorrectos.

## Rutinas de Cierre - Checklist de 5 Minutos

### 1. Escritorio físico
- Ordenar documentos
- Tirar basura
- Preparar lo necesario para mañana

### 2. Escritorio digital
- Cerrar archivos abiertos
- Guardar en su lugar correcto
- Limpiar descargas

### 3. Correo
- Inbox en cero o controlado
- Pendientes identificados

### 4. Planeación
- Lista de tareas del día siguiente
- Prioridades claras

**Tiempo total:** 5-10 minutos

## Mensaje Final
Limpiar no es quitar suciedad... es hacer visibles los problemas.`,
        },
        {
          id: "l4-3",
          title: "Práctica: Simulador Inbox Zero",
          type: "practice",
          duration: "25 min",
          completed: false,
        },
      ],
    },
    {
      id: "m5",
      title: "Módulo 5: Gestión Visual",
      description: "Utiliza elementos visuales para facilitar decisiones",
      lessons: [
        {
          id: "l5-1",
          title: "Video: Gestión Visual en la Oficina",
          type: "video",
          duration: "11 min",
          completed: false,
          youtubeUrl: "https://www.youtube.com/embed/xyR_M7DY4LI",
        },
        {
          id: "l5-2",
          title: "Lectura: Códigos de Colores y Tableros",
          type: "reading",
          duration: "18 min",
          completed: false,
          content: `# Gestión Visual y Apoyo

## Objetivo
Utilizar elementos visuales para facilitar la toma de decisiones, reducir errores y permitir que cualquier persona entienda el sistema sin necesidad de explicaciones.

## Principio Clave
"Lo que no se ve, no se gestiona."

La gestión visual permite:
- Entender información en segundos
- Reducir dependencia de la memoria
- Detectar errores rápidamente

## Tipos de Controles Visuales
- Colores
- Etiquetas
- Señales
- Indicadores
- Formatos estandarizados

**Objetivo:** Que el sistema "hable por sí solo"

## Uso de Códigos de Colores

### En expedientes físicos
| Color | Significado |
|-------|-------------|
| 🔵 Azul | Empleados activos |
| 🔴 Rojo | Bajas |
| 🟡 Amarillo | Procesos en curso |
| 🟢 Verde | Expedientes completos |

### En entorno digital
- Carpetas con prefijos o emojis
- Etiquetas en correos (Outlook/Gmail)
- Estados en archivos: "EN PROCESO", "APROBADO", "PENDIENTE"

> **Regla clave:** El color debe tener un significado único y consistente.

## Tableros de Gestión (Dashboards)

### Tipos de tableros:

**Informativos**
- Comunicación general
- Avisos importantes

**De seguimiento**
- Indicadores (KPIs)
- Avances

**Operativos**
- Tareas
- Pendientes
- Vacantes

### Secciones sugeridas para RRHH:
1. **Vacantes abiertas** - Puesto, Estatus, Responsable
2. **Indicadores clave** - Rotación, Tiempo de contratación, Ausentismo
3. **Calendario** - Eventos, Capacitaciones
4. **Comunicados** - Avisos internos

### Reglas de diseño:
- Simple
- Visual (gráficos, colores)
- Actualizado
- Visible para todos

## Oficina Transparente

### Concepto clave
"Una oficina transparente no necesita explicaciones."

Cualquier persona debe:
- Saber dónde están las cosas
- Entender procesos
- Actuar sin preguntar

### Señalética interna
- 📍 Ubicación (archivos, áreas)
- ⚠️ Advertencia
- ℹ️ Instrucciones
- ➡️ Flujo de procesos

## Mensaje Final
Un buen sistema visual elimina la necesidad de pensar... y reduce errores.`,
        },
      ],
    },
    {
      id: "m6",
      title: "Módulo 6: Seiketsu (Estandarizar)",
      description: "Crea reglas claras y compartidas",
      lessons: [
        {
          id: "l6-1",
          title: "Video: La Importancia de Estandarizar",
          type: "video",
          duration: "13 min",
          completed: false,
          youtubeUrl: "https://www.youtube.com/embed/gN89z5jcCrA",
        },
        {
          id: "l6-2",
          title: "Lectura: SOPs y Memoria Institucional",
          type: "reading",
          duration: "22 min",
          completed: false,
          content: `# Seiketsu - Estandarización

## Objetivo
Crear reglas claras, visibles y compartidas que aseguren que el orden, la limpieza y la organización se mantengan de forma constante en toda la organización.

## Cambio de Mentalidad
"Sin estándar, toda mejora es temporal."

Un estándar:
- Define la mejor forma de hacer algo
- Permite consistencia
- Reduce errores
- Facilita la capacitación

## "Mi orden" vs "El orden del departamento"

| Mi orden | Orden del departamento |
|----------|------------------------|
| Funciona solo para mí | Es común |
| Depende de mi memoria | Es lógico |
| Nadie más lo entiende | Es accesible |
| | Funciona sin la persona |

> **Mensaje clave:** El orden no es personal... es organizacional.

## ¿Qué es un SOP?

**SOP = Procedimiento Operativo Estándar**

Es una guía clara que explica cómo hacer una tarea paso a paso.

### Principio clave
"Si no está documentado, no existe."

### Características de un buen SOP:
- Máximo 1 página
- Visual (diagramas, listas)
- Lenguaje simple
- Paso a paso
- Responsable definido

## Estructura de SOP

### Plantilla recomendada:

1. **Nombre del proceso**
   Ej: Armado de expediente de nuevo ingreso

2. **Objetivo**
   Garantizar que todos los expedientes estén completos

3. **Alcance**
   Aplica a RRHH

4. **Responsable**
   Ej: Analista de RRHH

5. **Pasos:**
   1. Recibir documentación
   2. Verificar checklist
   3. Digitalizar
   4. Guardar en carpeta correspondiente
   5. Validar integridad

6. **Checklist visual:**
   - ☑️ INE
   - ☑️ CURP
   - ☑️ Contrato
   - ☑️ Comprobante domicilio

## Gestión de la Memoria Institucional

### Problema crítico
Cuando alguien se va:
- Se pierde información
- Se detienen procesos
- Se generan errores

Esto es dependencia de **personas**, no de **sistemas**.

### Principio clave
"El conocimiento debe quedarse en la organización, no en las personas."

### Riesgos comunes:
- Archivos en computadoras personales
- Procesos no documentados
- Contraseñas no compartidas
- Información en correos personales

### Estrategias de solución:

**Centralización**
- Todo en carpetas compartidas
- No guardar en local

**Documentación**
- SOPs actualizados
- Manuales simples

**Accesos controlados**
- Permisos definidos
- No dependientes de una persona

**Transferencia de conocimiento**
- Procesos de entrega (handover)
- Capacitación cruzada

## Mensaje Final
Estandarizar no es limitar... es liberar tiempo y reducir errores.`,
        },
      ],
    },
    {
      id: "m7",
      title: "Módulo 7: Shitsuke (Disciplina)",
      description: "Crea el hábito de mantener las mejoras",
      lessons: [
        {
          id: "l7-1",
          title: "Video: Shitsuke - La S más difícil",
          type: "video",
          duration: "10 min",
          completed: false,
          youtubeUrl: "https://www.youtube.com/embed/La-HU1VdyoM",
        },
        {
          id: "l7-2",
          title: "Lectura: Creando Hábitos Sostenibles",
          type: "reading",
          duration: "15 min",
          completed: false,
          content: `# Shitsuke - Disciplina

## Objetivo
Crear el hábito de mantener las mejoras logradas y convertir las 5S en parte de la cultura organizacional.

## ¿Por qué es la S más difícil?

Shitsuke es diferente a las otras 4S:
- **Seiri, Seiton, Seiso, Seiketsu** = Acciones puntuales
- **Shitsuke** = Comportamiento continuo

> Es la diferencia entre "hacer algo" y "ser algo".

## El Rol de RRHH como Ejemplo

RRHH tiene una posición privilegiada:
- Interactúa con toda la organización
- Es referente de cultura
- Puede modelar comportamientos

### Pregunta clave:
¿Qué imagen da RRHH cuando su espacio está desordenado?

## Cómo Crear el Hábito

### 1. Empezar pequeño
- Una rutina de 5 minutos al día
- Un área a la vez
- Un cambio a la vez

### 2. Vincular a rutinas existentes
- Al llegar: revisar escritorio
- Antes de comer: organizar pendientes
- Al salir: checklist de cierre

### 3. Hacerlo visible
- Checklists impresos
- Recordatorios visuales
- Tableros de seguimiento

### 4. Celebrar logros
- Reconocer avances
- Compartir mejoras
- Documentar antes/después

## Errores Comunes

❌ Esperar motivación para empezar
❌ Intentar cambiar todo a la vez
❌ No involucrar al equipo
❌ Abandonar después del primer tropiezo

## Estrategias de Sostenimiento

### Auditorías amigables
- No punitivas
- Enfocadas en mejora
- Frecuentes y cortas

### Gamificación
- Puntos por orden
- Reconocimientos
- Competencias sanas

### Integración en evaluaciones
- Incluir 5S en objetivos
- Medir avances
- Vincular a desarrollo

## El Ciclo de Mejora Continua

1. **Planear** - Definir qué mejorar
2. **Hacer** - Implementar el cambio
3. **Verificar** - Medir resultados
4. **Actuar** - Ajustar y estandarizar

> **Mensaje Final:** La disciplina no es restricción... es libertad a través del orden.`,
        },
      ],
    },
    {
      id: "m8",
      title: "Módulo 8: Auditorías de Oficina",
      description: "Evalúa el progreso de forma constructiva",
      lessons: [
        {
          id: "l8-1",
          title: "Video: Auditorías 5S Efectivas",
          type: "video",
          duration: "11 min",
          completed: false,
          youtubeUrl: "https://www.youtube.com/embed/hKdYLbtqKGA",
        },
        {
          id: "l8-2",
          title: "Lectura: Checklists y Evaluación",
          type: "reading",
          duration: "18 min",
          completed: false,
          content: `# Auditorías de Oficina

## Objetivo
Aprender a evaluar el progreso de las 5S sin que parezca una "inspección punitiva", sino una herramienta de mejora continua.

## Cambio de Mentalidad

### Lo que NO es una auditoría 5S:
- Una inspección para "cachar" errores
- Una calificación para juzgar
- Un evento estresante

### Lo que SÍ es:
- Una fotografía del estado actual
- Una oportunidad de mejora
- Un momento de reflexión

> **Principio clave:** "La auditoría no es para señalar... es para ayudar."

## Tipos de Auditorías

### Por frecuencia:
- **Diaria:** Autoauditoría personal (2 min)
- **Semanal:** Revisión de equipo (15 min)
- **Mensual:** Auditoría formal (30 min)

### Por nivel:
- **Nivel 1:** Autoevaluación
- **Nivel 2:** Evaluación entre pares
- **Nivel 3:** Evaluación por supervisor
- **Nivel 4:** Auditoría externa

## Checklist de Auditoría 5S

### Seiri (Clasificar)
- ☐ No hay elementos innecesarios en el área
- ☐ Los archivos obsoletos están eliminados
- ☐ La cuarentena digital se revisa regularmente

### Seiton (Ordenar)
- ☐ Cada cosa tiene un lugar definido
- ☐ Los archivos siguen la nomenclatura estándar
- ☐ Las carpetas están organizadas lógicamente

### Seiso (Limpiar)
- ☐ El escritorio está limpio al final del día
- ☐ El equipo está en buen estado
- ☐ El inbox está controlado

### Seiketsu (Estandarizar)
- ☐ Existen SOPs documentados
- ☐ Los estándares son conocidos por todos
- ☐ Los formatos son consistentes

### Shitsuke (Disciplina)
- ☐ Se realizan rutinas de cierre
- ☐ Se respetan los estándares
- ☐ Hay mejora visible vs. auditoría anterior

## Sistema de Puntuación

| Nivel | Descripción | Puntos |
|-------|-------------|--------|
| 0 | No implementado | 0 |
| 1 | Iniciando | 1 |
| 2 | En desarrollo | 2 |
| 3 | Implementado | 3 |
| 4 | Optimizado | 4 |
| 5 | Excelencia | 5 |

**Puntuación máxima:** 25 puntos (5 criterios × 5 puntos)

## Cómo Dar Retroalimentación

### Estructura recomendada:
1. **Reconocer** lo que está bien
2. **Identificar** áreas de oportunidad
3. **Acordar** acciones de mejora
4. **Programar** siguiente revisión

### Frases útiles:
- "He notado una mejora en..."
- "¿Qué podríamos hacer para mejorar...?"
- "¿Qué apoyo necesitas para...?"

## Mensaje Final
La auditoría es un espejo, no un martillo.`,
        },
      ],
    },
    {
      id: "m9",
      title: "Módulo 9: Lean Office",
      description: "Conceptos básicos de eliminación de desperdicios",
      lessons: [
        {
          id: "l9-1",
          title: "Video: Introducción a Lean Office",
          type: "video",
          duration: "14 min",
          completed: false,
          youtubeUrl: "https://www.youtube.com/embed/Oz2AOKfT41M",
        },
        {
          id: "l9-2",
          title: "Lectura: Los 8 Desperdicios en Oficina",
          type: "reading",
          duration: "20 min",
          completed: false,
          content: `# Lean Office - Conceptos Básicos

## Objetivo
Comprender los conceptos fundamentales de Lean aplicados al entorno administrativo para eliminar "desperdicios" y mejorar el flujo de trabajo.

## ¿Qué es Lean Office?

Lean Office adapta los principios de eficiencia industrial al entorno administrativo.

**Objetivo:** Eliminar desperdicios y mejorar el flujo de trabajo.

## Los 3 Enemigos de la Eficiencia

### 1. Muda (Desperdicio)
Actividades que no agregan valor.

**Ejemplos en oficina:**
- Buscar archivos
- Esperar respuestas
- Rehacer documentos

### 2. Mura (Variabilidad)
Falta de estandarización.

**Ejemplos:**
- Cada persona guarda archivos de forma distinta
- Diferentes formatos para el mismo reporte

### 3. Muri (Sobrecarga)
Exceso de trabajo o complejidad.

**Ejemplos:**
- Sistemas complicados
- Procesos innecesarios
- Multitarea excesiva

> **Conclusión:** Cuando hay Muda, Mura y Muri, el sistema genera caos, no las personas.

## Los 8 Desperdicios en Oficina

### 1. Sobreproducción
- Informes que nadie lee
- Copias innecesarias
- Correos masivos

### 2. Esperas
- Esperar aprobaciones
- Esperar información
- Juntas que no empiezan a tiempo

### 3. Transporte
- Mover documentos sin necesidad
- Múltiples revisiones
- Firmas innecesarias

### 4. Sobreprocesamiento
- Formatos excesivamente elaborados
- Revisiones redundantes
- Procesos burocráticos

### 5. Inventario
- Acumulación de correos
- Documentos pendientes
- Tareas sin cerrar

### 6. Movimiento
- Buscar información
- Ir a la impresora constantemente
- Cambiar entre muchas aplicaciones

### 7. Defectos
- Errores en datos
- Documentos incompletos
- Información incorrecta

### 8. Talento no utilizado
- Ideas ignoradas
- Habilidades desperdiciadas
- Falta de capacitación

## Herramientas Lean para Oficina

### Value Stream Mapping (VSM)
Mapear el flujo de un proceso para identificar desperdicios.

### Kaizen
Mejora continua a través de pequeños cambios constantes.

### 5 Por Qués
Técnica para llegar a la causa raíz de un problema.

### Kanban
Sistema visual para gestionar el flujo de trabajo.

## Relación entre 5S y Lean

Las 5S son la **base** de Lean:
- Sin orden, no hay flujo
- Sin limpieza, no hay visibilidad
- Sin estandarización, no hay mejora

> **Mensaje Final:** Lean no es hacer más con menos... es hacer mejor con lo necesario.`,
        },
      ],
    },
    {
      id: "m10",
      title: "Módulo 10: Proyecto Final y Cierre",
      description: "Plan de acción personal y evaluación",
      lessons: [
        {
          id: "l10-1",
          title: "Video: Cómo Crear tu Plan de Acción 5S",
          type: "video",
          duration: "8 min",
          completed: false,
          youtubeUrl: "https://www.youtube.com/embed/jt9b7b2Y_b8",
        },
        {
          id: "l10-2",
          title: "Lectura: Plantilla de Plan de Acción",
          type: "reading",
          duration: "15 min",
          completed: false,
          content: `# Proyecto Final: Plan de Acción Personal

## Objetivo
Crear un plan de acción concreto y medible para implementar las 5S en tu puesto de trabajo.

## Tu Plan de Acción 5S

### Paso 1: Diagnóstico Actual

Evalúa tu situación actual (1-5):

| Área | Puntuación | Observaciones |
|------|------------|---------------|
| Escritorio físico | ___ | |
| Escritorio digital | ___ | |
| Correo electrónico | ___ | |
| Archivos/Carpetas | ___ | |
| Documentación | ___ | |

### Paso 2: Define 3 Prioridades

Basándote en tu diagnóstico, identifica las 3 áreas más críticas:

1. ________________________________
2. ________________________________
3. ________________________________

### Paso 3: Acciones Específicas

Para cada prioridad, define:

**Prioridad 1:**
- Qué: _______________
- Cuándo: _______________
- Cómo mediré el éxito: _______________

**Prioridad 2:**
- Qué: _______________
- Cuándo: _______________
- Cómo mediré el éxito: _______________

**Prioridad 3:**
- Qué: _______________
- Cuándo: _______________
- Cómo mediré el éxito: _______________

### Paso 4: Rutina Diaria

Define tu checklist de cierre (5 minutos):

**Al final de cada día:**
- ☐ _______________
- ☐ _______________
- ☐ _______________
- ☐ _______________
- ☐ _______________

### Paso 5: Seguimiento

- **Fecha de revisión 1:** _______________
- **Fecha de revisión 2:** _______________
- **Fecha de evaluación final:** _______________

## Compromisos

Al completar este curso, me comprometo a:

1. Implementar las 5S en mi espacio de trabajo
2. Mantener mi rutina de cierre diaria
3. Revisar mi progreso mensualmente
4. Compartir lo aprendido con mi equipo

## Reflexión Final

- ¿Qué aprendí que no sabía?
- ¿Qué cambiaré inmediatamente?
- ¿Cómo impactará esto en mi trabajo?
- ¿Qué apoyo necesito para mantener los cambios?

## Resumen del Curso

| S | Concepto | Lo más importante |
|---|----------|-------------------|
| Seiri | Clasificar | Decidir qué conservar |
| Seiton | Ordenar | Un lugar para cada cosa |
| Seiso | Limpiar | Inspeccionar al limpiar |
| Seiketsu | Estandarizar | Documentar la mejor forma |
| Shitsuke | Disciplina | Convertir en hábito |

## Certificación

Al completar todas las lecciones y el plan de acción, recibirás tu certificado de:

**"5S en el Entorno Administrativo y Digital"**
Colegio de Ingenieros Industriales de Celaya

> **Mensaje Final:** El cambio no ocurre cuando entiendes... ocurre cuando actúas.`,
        },
      ],
    },
  ],
}

const COURSES_DATA: Course[] = [
  COURSE_5S,
  {
    id: "lean-basico",
    title: "Lean Manufacturing Básico",
    description: "Introducción a los principios de manufactura esbelta y eliminación de desperdicios.",
    duration: "40 horas",
    progress: 15,
    status: "publicado",
    modules: [
      {
        id: "lean-m1",
        title: "Introducción a Lean",
        description: "Fundamentos del pensamiento Lean",
        lessons: [
          { id: "lean-l1", title: "Video: ¿Qué es Lean?", type: "video", duration: "15 min", completed: true, youtubeUrl: "https://www.youtube.com/embed/wfsRAZUnonI" },
          { id: "lean-l2", title: "Lectura: Historia de Toyota", type: "reading", duration: "20 min", completed: false, content: "# Historia del Sistema de Producción Toyota\n\nContenido del módulo..." },
        ],
      },
    ],
  },
]

/* ============================================================
   MAIN COMPONENT
============================================================ */
export default function PlataformaPage() {
  // ---- View State ----
  const [currentView, setCurrentView] = useState<ViewType>("login")
  const [userRole, setUserRole] = useState<"alumno" | "admin">("alumno")
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [expandedModules, setExpandedModules] = useState<string[]>([])

  // ---- Login State ----
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")

  // ---- Admin State ----
  const [adminTab, setAdminTab] = useState<AdminTab>("cursos")
  const [courses, setCourses] = useState<Course[]>(COURSES_DATA)
  const [newCourse, setNewCourse] = useState({ title: "", description: "" })
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  // ---- Simulator State ----
  const [simulatorTab, setSimulatorTab] = useState<SimulatorTab>("seiri")
  const [seiriFiles, setSeiriFiles] = useState<FileItem[]>([
    { id: "1", name: "reporte_viejo_v2.xlsx", type: "innecesario", status: "pendiente" },
    { id: "2", name: "foto_perro.jpg", type: "innecesario", status: "pendiente" },
    { id: "3", name: "backup_2019.zip", type: "innecesario", status: "pendiente" },
    { id: "4", name: "proyecto_activo.docx", type: "necesario", status: "pendiente" },
    { id: "5", name: "notas_reunion_vieja.txt", type: "dudoso", status: "pendiente" },
  ])
  const [seitonInput, setSeitonInput] = useState("")
  const [seitonValidated, setSeitonValidated] = useState(false)
  const [seitonError, setSeitonError] = useState("")
  const [emails, setEmails] = useState<EmailItem[]>([
    { id: "1", from: "marketing@spam.com", subject: "¡Oferta increíble!", preview: "No te pierdas esta oportunidad...", status: "pendiente" },
    { id: "2", from: "jefe@empresa.com", subject: "Reunión mañana", preview: "Confirma tu asistencia para...", status: "pendiente" },
    { id: "3", from: "rrhh@empresa.com", subject: "Actualización de datos", preview: "Por favor completa el formulario...", status: "pendiente" },
    { id: "4", from: "newsletter@random.com", subject: "Novedades de la semana", preview: "Esta semana tenemos...", status: "pendiente" },
  ])

  // ---- Derived State ----
  const selectedCourse = courses.find((c) => c.id === selectedCourseId)
  const selectedLesson = selectedCourse?.modules.flatMap((m) => m.lessons).find((l) => l.id === selectedLessonId)

  // ---- Handlers ----
  const handleLogin = (role: "alumno" | "admin") => {
    if (!email || !password) {
      setLoginError("Por favor completa todos los campos")
      return
    }
    setLoginError("")
    setUserRole(role)
    setCurrentView(role === "admin" ? "admin-panel" : "dashboard")
  }

  const handleLogout = () => {
    setCurrentView("login")
    setEmail("")
    setPassword("")
    setUserRole("alumno")
    setSelectedCourseId(null)
    setSelectedLessonId(null)
  }

  const handlePublishCourse = () => {
    if (!newCourse.title || !newCourse.description) {
      showToastMessage("Por favor completa todos los campos")
      return
    }
    const course: Course = {
      id: Date.now().toString(),
      title: newCourse.title,
      description: newCourse.description,
      duration: "Por definir",
      progress: 0,
      modules: [],
      status: "publicado",
    }
    setCourses([course, ...courses])
    setNewCourse({ title: "", description: "" })
    setUploadedFiles([])
    showToastMessage("Curso publicado en el catálogo exitosamente")
  }

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleOpenCourse = (courseId: string) => {
    setSelectedCourseId(courseId)
    setCurrentView("curso-detalle")
    // Expand first module
    const course = courses.find((c) => c.id === courseId)
    if (course && course.modules.length > 0) {
      setExpandedModules([course.modules[0].id])
    }
  }

  const handleOpenLesson = (lesson: Lesson) => {
    if (lesson.type === "practice") {
      setCurrentView("simulador-5s")
    } else {
      setSelectedLessonId(lesson.id)
      setCurrentView("leccion")
    }
  }

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    )
  }

  const handleFileAction = (fileId: string, action: "mantener" | "cuarentena" | "eliminar") => {
    setSeiriFiles((files) => files.map((f) => (f.id === fileId ? { ...f, status: action } : f)))
    const file = seiriFiles.find((f) => f.id === fileId)
    if (file && action === "eliminar" && file.type === "innecesario") {
      showToastMessage("¡Espacio liberado! Archivo obsoleto eliminado.")
    }
  }

  const validateSeiton = () => {
    const pattern = /^\d{4}-\d{2}-\d{2}_[A-Za-z]+_V\d+_[A-Z]{2,}$/
    if (pattern.test(seitonInput)) {
      setSeitonValidated(true)
      setSeitonError("")
      showToastMessage("¡Estandarización correcta! Nombre de archivo válido.")
    } else {
      setSeitonError("Formato incorrecto. Usa: AAAA-MM-DD_Tema_Version_Responsable (ej: 2026-04-22_Reporte_V1_JP)")
    }
  }

  const handleEmailAction = (emailId: string) => {
    setEmails((items) => items.filter((e) => e.id !== emailId))
    if (emails.length === 1) {
      showToastMessage("¡Inbox Zero Alcanzado! Tu bandeja está limpia.")
    }
  }

  const pendingSeiriFiles = seiriFiles.filter((f) => f.status === "pendiente")
  const pendingEmails = emails.filter((e) => e.status === "pendiente")

  /* ============================================================
     RENDER: LOGIN
  ============================================================ */
  if (currentView === "login") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0A1F3F] via-[#1A3A6F] to-[#0A1F3F] p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex justify-center">
              <Image src="/images/ciic-logo.png" alt="CIIC Logo" width={180} height={72} className="h-16 w-auto object-contain" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-[#0A1F3F]">Plataforma de Aprendizaje</CardTitle>
              <CardDescription className="mt-2">Accede a tus cursos y certificaciones</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Correo electrónico</label>
              <Input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Contraseña</label>
              <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" />
            </div>
            {loginError && <p className="text-sm text-red-500">{loginError}</p>}
            <div className="space-y-3 pt-2">
              <Button onClick={() => handleLogin("alumno")} className="h-12 w-full bg-[#E8651A] text-white hover:bg-[#E8651A]/90">
                <GraduationCap className="mr-2 h-5 w-5" />
                Acceder como Alumno
              </Button>
              <Button onClick={() => handleLogin("admin")} variant="outline" className="h-12 w-full border-[#0A1F3F] text-[#0A1F3F] hover:bg-[#0A1F3F] hover:text-white">
                <Settings className="mr-2 h-5 w-5" />
                Acceder como Administrador
              </Button>
            </div>
            <p className="pt-4 text-center text-xs text-gray-500">
              ¿No tienes cuenta?{" "}
              <a href="#" className="text-[#E8651A] hover:underline">
                Regístrate aquí
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  /* ============================================================
     RENDER: LESSON VIEW
  ============================================================ */
  if (currentView === "leccion" && selectedLesson) {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <Button variant="ghost" onClick={() => setCurrentView("curso-detalle")} className="text-gray-600">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Volver al curso
            </Button>
            <Image src="/images/ciic-logo.png" alt="CIIC Logo" width={100} height={40} className="h-8 w-auto object-contain" />
          </div>
        </header>

        <main className="mx-auto max-w-5xl p-4 lg:p-8">
          {/* Lesson Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{selectedCourse?.title}</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-[#E8651A]">{selectedLesson.title}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-[#0A1F3F] lg:text-3xl">{selectedLesson.title}</h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
              {selectedLesson.type === "video" && <Youtube className="h-5 w-5 text-red-500" />}
              {selectedLesson.type === "reading" && <FileText className="h-5 w-5 text-blue-500" />}
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {selectedLesson.duration}
              </span>
            </div>
          </div>

          {/* Content */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 lg:p-8">
              {selectedLesson.type === "video" && selectedLesson.youtubeUrl && (
                <div className="aspect-video overflow-hidden rounded-xl bg-black">
                  <iframe
                    src={selectedLesson.youtubeUrl}
                    title={selectedLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              )}

              {selectedLesson.type === "reading" && selectedLesson.content && (
                <article className="prose prose-lg max-w-none prose-headings:text-[#0A1F3F] prose-h1:text-2xl prose-h2:text-xl prose-h2:border-b prose-h2:pb-2 prose-h3:text-lg prose-a:text-[#E8651A] prose-strong:text-[#0A1F3F] prose-code:rounded prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:text-[#E8651A] prose-pre:bg-gray-900">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectedLesson.content
                        .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
                        .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-8 mb-4 border-b pb-2">$1</h2>')
                        .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>')
                        .replace(/^\*\*(.+?)\*\*/gm, "<strong>$1</strong>")
                        .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-[#E8651A] pl-4 italic text-gray-600 my-4">$1</blockquote>')
                        .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
                        .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
                        .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-[#E8651A]">$1</code>')
                        .replace(/\n\n/g, "</p><p class='mb-4'>")
                        .replace(/\|(.+)\|/g, (match) => {
                          const cells = match.split("|").filter(Boolean)
                          return `<tr>${cells.map((c) => `<td class="border px-3 py-2">${c.trim()}</td>`).join("")}</tr>`
                        }),
                    }}
                  />
                </article>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline" onClick={() => setCurrentView("curso-detalle")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al índice
            </Button>
            <Button className="bg-[#E8651A] text-white hover:bg-[#E8651A]/90">
              Marcar como completado
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </main>
      </div>
    )
  }

  /* ============================================================
     RENDER: COURSE DETAIL
  ============================================================ */
  if (currentView === "curso-detalle" && selectedCourse) {
    const totalLessons = selectedCourse.modules.reduce((acc, m) => acc + m.lessons.length, 0)
    const completedLessons = selectedCourse.modules.reduce((acc, m) => acc + m.lessons.filter((l) => l.completed).length, 0)

    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <Button variant="ghost" onClick={() => setCurrentView("dashboard")} className="text-gray-600">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Volver al Dashboard
            </Button>
            <Image src="/images/ciic-logo.png" alt="CIIC Logo" width={100} height={40} className="h-8 w-auto object-contain" />
          </div>
        </header>

        <main className="mx-auto max-w-5xl p-4 lg:p-8">
          {/* Course Header */}
          <Card className="mb-6 border-0 bg-gradient-to-r from-[#0A1F3F] to-[#1A3A6F] text-white shadow-xl">
            <CardContent className="p-6 lg:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#E8651A]" />
                    <span className="text-sm font-medium text-white/80">Curso Certificado</span>
                  </div>
                  <h1 className="text-2xl font-bold lg:text-3xl">{selectedCourse.title}</h1>
                  <p className="mt-2 text-white/80">{selectedCourse.description}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {selectedCourse.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {selectedCourse.modules.length} módulos
                    </span>
                    <span className="flex items-center gap-1">
                      <Video className="h-4 w-4" />
                      {totalLessons} lecciones
                    </span>
                  </div>
                </div>
                <div className="w-full lg:w-48">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>Progreso</span>
                    <span className="font-bold">{Math.round((completedLessons / totalLessons) * 100)}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full rounded-full bg-[#E8651A]" style={{ width: `${(completedLessons / totalLessons) * 100}%` }} />
                  </div>
                  <p className="mt-2 text-center text-xs text-white/60">
                    {completedLessons} de {totalLessons} completadas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modules Accordion */}
          <div className="space-y-4">
            {selectedCourse.modules.map((module, moduleIndex) => {
              const isExpanded = expandedModules.includes(module.id)
              const moduleCompleted = module.lessons.filter((l) => l.completed).length
              const moduleTotal = module.lessons.length

              return (
                <Card key={module.id} className="border-0 shadow-md">
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50 lg:p-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8651A]/10 text-[#E8651A]">
                        <span className="font-bold">{moduleIndex + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#0A1F3F]">{module.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">{module.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="hidden text-sm text-gray-500 sm:block">
                        {moduleCompleted}/{moduleTotal} lecciones
                      </span>
                      {isExpanded ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t bg-gray-50 p-4 lg:p-6">
                      <div className="space-y-3">
                        {module.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm transition-all hover:shadow-md"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                  lesson.completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {lesson.type === "video" && <Youtube className="h-5 w-5" />}
                                {lesson.type === "reading" && <FileText className="h-5 w-5" />}
                                {lesson.type === "practice" && <Monitor className="h-5 w-5" />}
                              </div>
                              <div>
                                <p className={`font-medium ${lesson.completed ? "text-gray-500" : "text-[#0A1F3F]"}`}>
                                  {lesson.title}
                                </p>
                                <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {lesson.duration}
                                  </span>
                                  {lesson.completed && (
                                    <span className="flex items-center gap-1 text-green-600">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Completado
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleOpenLesson(lesson)}
                              className={
                                lesson.type === "practice"
                                  ? "bg-[#E8651A] text-white hover:bg-[#E8651A]/90"
                                  : "border-[#0A1F3F] text-[#0A1F3F] hover:bg-[#0A1F3F] hover:text-white"
                              }
                              variant={lesson.type === "practice" ? "default" : "outline"}
                            >
                              {lesson.type === "practice" ? (
                                <>
                                  <Play className="mr-1 h-4 w-4" />
                                  Iniciar Práctica
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-1 h-4 w-4" />
                                  {lesson.completed ? "Revisar" : "Ver"}
                                </>
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </main>
      </div>
    )
  }

  /* ============================================================
     RENDER: ADMIN PANEL
  ============================================================ */
  if (currentView === "admin-panel") {
    return (
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-gray-200 bg-[#0A1F3F]">
          <div className="flex h-16 items-center justify-center border-b border-white/10 px-4">
            <Image src="/images/ciic-logo.png" alt="CIIC Logo" width={120} height={48} className="h-10 w-auto object-contain" />
          </div>
          <nav className="flex-1 space-y-1 p-4">
            <button
              onClick={() => setAdminTab("cursos")}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                adminTab === "cursos" ? "bg-[#E8651A] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <BookOpen className="h-5 w-5" />
              Catálogo de Cursos
            </button>
            <button
              onClick={() => setAdminTab("alumnos")}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                adminTab === "alumnos" ? "bg-[#E8651A] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Users className="h-5 w-5" />
              Alumnos
            </button>
            <button
              onClick={() => setAdminTab("config")}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                adminTab === "config" ? "bg-[#E8651A] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Settings className="h-5 w-5" />
              Configuración
            </button>
          </nav>
          <div className="border-t border-white/10 p-4">
            <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white">
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar Sesión
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0A1F3F]">Panel de Administración</h1>
            <p className="mt-1 text-gray-600">Gestiona los cursos y contenido de la plataforma</p>
          </div>

          {adminTab === "cursos" && (
            <div className="space-y-8">
              {/* Add Course Form */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <PlusCircle className="h-6 w-6 text-[#E8651A]" />
                    Agregar Nuevo Curso
                  </CardTitle>
                  <CardDescription>Completa la información para publicar un nuevo curso en el catálogo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Título del Curso</label>
                    <Input
                      placeholder="Ej: Introducción a Lean Manufacturing"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descripción</label>
                    <textarea
                      placeholder="Describe el contenido y objetivos del curso..."
                      value={newCourse.description}
                      onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                      className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Archivos del Curso</label>
                    <div
                      className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:border-[#E8651A] hover:bg-orange-50"
                      onClick={() => {
                        const fileName = `archivo_${Date.now()}.pdf`
                        setUploadedFiles([...uploadedFiles, fileName])
                      }}
                    >
                      <Upload className="mb-3 h-10 w-10 text-gray-400" />
                      <p className="text-sm font-medium text-gray-600">Arrastra archivos aquí o haz clic para subir</p>
                      <p className="mt-1 text-xs text-gray-400">PDF, Videos, Imágenes (Max. 50MB)</p>
                    </div>
                    {uploadedFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm">
                            <FileText className="h-4 w-4 text-[#E8651A]" />
                            {file}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
                              }}
                              className="ml-auto text-gray-400 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button onClick={handlePublishCourse} className="h-12 w-full bg-[#E8651A] text-white hover:bg-[#E8651A]/90">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Publicar Curso
                  </Button>
                </CardContent>
              </Card>

              {/* Courses Table */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Cursos Activos</CardTitle>
                  <CardDescription>{courses.length} cursos publicados en el catálogo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-3 text-sm font-semibold text-gray-600">Curso</th>
                          <th className="pb-3 text-sm font-semibold text-gray-600">Módulos</th>
                          <th className="pb-3 text-sm font-semibold text-gray-600">Duración</th>
                          <th className="pb-3 text-sm font-semibold text-gray-600">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {courses.map((course) => (
                          <tr key={course.id} className="hover:bg-gray-50">
                            <td className="py-4">
                              <p className="font-medium text-[#0A1F3F]">{course.title}</p>
                              <p className="mt-1 text-sm text-gray-500 line-clamp-1">{course.description}</p>
                            </td>
                            <td className="py-4">
                              <span className="text-sm text-gray-600">{course.modules.length} módulo(s)</span>
                            </td>
                            <td className="py-4">
                              <span className="text-sm text-gray-600">{course.duration}</span>
                            </td>
                            <td className="py-4">
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                Publicado
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {adminTab === "alumnos" && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Gestión de Alumnos</CardTitle>
                <CardDescription>Administra los usuarios de la plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="mb-4 h-16 w-16 text-gray-300" />
                  <p className="text-lg font-medium text-gray-600">Módulo en desarrollo</p>
                  <p className="mt-2 text-sm text-gray-400">Próximamente podrás gestionar alumnos, ver progreso y generar reportes.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {adminTab === "config" && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Configuración</CardTitle>
                <CardDescription>Ajustes generales de la plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Settings className="mb-4 h-16 w-16 text-gray-300" />
                  <p className="text-lg font-medium text-gray-600">Módulo en desarrollo</p>
                  <p className="mt-2 text-sm text-gray-400">Próximamente podrás personalizar la plataforma y sus ajustes.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </main>

        {/* Toast */}
        {showToast && (
          <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-3 rounded-lg bg-[#0A1F3F] px-4 py-3 text-white shadow-lg">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <span className="text-sm font-medium">{toastMessage}</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  /* ============================================================
     RENDER: STUDENT DASHBOARD
  ============================================================ */
  if (currentView === "dashboard") {
    return (
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-gray-200 bg-white">
          <div className="flex h-16 items-center justify-center border-b px-4">
            <Image src="/images/ciic-logo.png" alt="CIIC Logo" width={120} height={48} className="h-10 w-auto object-contain" />
          </div>
          <div className="border-b p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8651A] text-white">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0A1F3F]">Juan Pérez</p>
                <p className="text-xs text-gray-500">Alumno</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            <button className="flex w-full items-center gap-3 rounded-lg bg-[#E8651A]/10 px-4 py-3 text-sm font-medium text-[#E8651A]">
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100">
              <BookOpen className="h-5 w-5" />
              Mis Cursos
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100">
              <Award className="h-5 w-5" />
              Certificados
            </button>
          </nav>
          <div className="border-t p-4">
            <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-gray-600 hover:bg-gray-100">
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar Sesión
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#0A1F3F]">¡Bienvenido, Juan!</h1>
            <p className="mt-1 text-gray-600">Continúa tu aprendizaje donde lo dejaste</p>
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border-0 shadow-md">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0A1F3F]">{courses.length}</p>
                  <p className="text-sm text-gray-500">Cursos Activos</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0A1F3F]">1</p>
                  <p className="text-sm text-gray-500">Completados</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0A1F3F]">12h</p>
                  <p className="text-sm text-gray-500">Tiempo de Estudio</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Courses */}
          <h2 className="mb-4 text-xl font-semibold text-[#0A1F3F]">Mis Cursos Activos</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {courses.map((course, index) => (
              <Card key={course.id} className={`relative overflow-hidden border-0 shadow-lg ${index === 0 ? "ring-2 ring-[#E8651A]" : ""}`}>
                {index === 0 && (
                  <div className="absolute right-0 top-0 rounded-bl-xl bg-[#E8651A] px-3 py-1 text-xs font-semibold text-white">EN PROGRESO</div>
                )}
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${index === 0 ? "bg-[#E8651A]/10" : "bg-blue-100"}`}>
                      <Monitor className={`h-7 w-7 ${index === 0 ? "text-[#E8651A]" : "text-blue-600"}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg text-[#0A1F3F]">{course.title}</CardTitle>
                      <CardDescription className="mt-1">{course.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progreso del curso</span>
                      <span className={`font-semibold ${index === 0 ? "text-[#E8651A]" : "text-blue-600"}`}>{course.progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div className={`h-full rounded-full ${index === 0 ? "bg-[#E8651A]" : "bg-blue-600"}`} style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4" />
                      {course.modules.length} módulos
                    </span>
                  </div>
                  <Button
                    onClick={() => handleOpenCourse(course.id)}
                    className={`h-12 w-full ${
                      index === 0 ? "bg-[#E8651A] text-white hover:bg-[#E8651A]/90" : "border-[#0A1F3F] text-[#0A1F3F] hover:bg-[#0A1F3F] hover:text-white"
                    }`}
                    variant={index === 0 ? "default" : "outline"}
                  >
                    <Play className="mr-2 h-5 w-5" />
                    {index === 0 ? "Continuar Curso" : "Ver Contenido"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    )
  }

  /* ============================================================
     RENDER: 5S SIMULATOR
  ============================================================ */
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={() => setCurrentView("curso-detalle")} variant="ghost" className="text-white hover:bg-white/10">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Volver al Curso
          </Button>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2">
          <Monitor className="h-5 w-5 text-[#E8651A]" />
          <span className="text-sm font-medium text-white">Simulador 5S - Escritorio Digital</span>
        </div>
      </div>

      {/* Simulator Screen */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 overflow-hidden rounded-2xl border-4 border-gray-700 bg-white shadow-2xl">
        {/* Simulator Sidebar */}
        <div className="w-56 border-r bg-[#0A1F3F] p-4">
          <div className="mb-6 flex items-center gap-2">
            <Image src="/images/ciic-logo.png" alt="CIIC Logo" width={100} height={40} className="h-8 w-auto object-contain" />
          </div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/50">Metodología 5S</p>
          <nav className="space-y-2">
            <button
              onClick={() => setSimulatorTab("seiri")}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                simulatorTab === "seiri" ? "bg-[#E8651A] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Tag className="h-4 w-4" />
              <span>Seiri (Clasificar)</span>
            </button>
            <button
              onClick={() => setSimulatorTab("seiton")}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                simulatorTab === "seiton" ? "bg-[#E8651A] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <FolderOpen className="h-4 w-4" />
              <span>Seiton (Ordenar)</span>
            </button>
            <button
              onClick={() => setSimulatorTab("seiso")}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                simulatorTab === "seiso" ? "bg-[#E8651A] text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Inbox className="h-4 w-4" />
              <span>Seiso (Limpiar)</span>
            </button>
          </nav>
          <div className="mt-8 rounded-lg bg-white/5 p-3">
            <p className="mb-1 text-xs font-semibold text-white/80">Tu Progreso</p>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-[33%] rounded-full bg-[#E8651A]" />
            </div>
            <p className="mt-2 text-xs text-white/50">1 de 3 secciones</p>
          </div>
        </div>

        {/* Simulator Main Area */}
        <div className="flex-1 overflow-auto bg-gray-50 p-6">
          {/* SEIRI - Classify */}
          {simulatorTab === "seiri" && (
            <div className="h-full">
              <div className="mb-6">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-[#0A1F3F]">
                  <Tag className="h-6 w-6 text-[#E8651A]" />
                  Seiri - Clasificar (Tarjetas Rojas)
                </h2>
                <p className="mt-2 text-gray-600">
                  Identifica los archivos innecesarios y clasifícalos. Decide qué mantener, poner en cuarentena o eliminar.
                </p>
              </div>

              {pendingSeiriFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl bg-green-50 py-12">
                  <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
                  <p className="text-xl font-semibold text-green-700">¡Clasificación Completada!</p>
                  <p className="mt-2 text-green-600">Has organizado todos los archivos correctamente.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingSeiriFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                          {file.name.endsWith(".xlsx") && <FileText className="h-5 w-5 text-green-600" />}
                          {file.name.endsWith(".jpg") && <ImageIcon className="h-5 w-5 text-blue-600" />}
                          {file.name.endsWith(".zip") && <Archive className="h-5 w-5 text-purple-600" />}
                          {file.name.endsWith(".docx") && <FileText className="h-5 w-5 text-blue-600" />}
                          {file.name.endsWith(".txt") && <FileText className="h-5 w-5 text-gray-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-[#0A1F3F]">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {file.type === "innecesario" && <span className="text-red-500">Posiblemente innecesario</span>}
                            {file.type === "necesario" && <span className="text-green-500">Archivo de trabajo activo</span>}
                            {file.type === "dudoso" && <span className="text-amber-500">Revisar antes de decidir</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50" onClick={() => handleFileAction(file.id, "mantener")}>
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          Mantener
                        </Button>
                        <Button size="sm" variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50" onClick={() => handleFileAction(file.id, "cuarentena")}>
                          <AlertTriangle className="mr-1 h-4 w-4" />
                          Cuarentena
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-500 text-red-600 hover:bg-red-50" onClick={() => handleFileAction(file.id, "eliminar")}>
                          <Trash2 className="mr-1 h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SEITON - Organize */}
          {simulatorTab === "seiton" && (
            <div className="h-full">
              <div className="mb-6">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-[#0A1F3F]">
                  <FolderOpen className="h-6 w-6 text-[#E8651A]" />
                  Seiton - Ordenar (Nomenclatura)
                </h2>
                <p className="mt-2 text-gray-600">Aprende a nombrar archivos de forma estandarizada para facilitar su búsqueda y organización.</p>
              </div>

              {seitonValidated ? (
                <div className="flex flex-col items-center justify-center rounded-xl bg-green-50 py-12">
                  <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
                  <p className="text-xl font-semibold text-green-700">¡Estandarización Correcta!</p>
                  <p className="mt-2 text-green-600">Has aprendido el formato correcto de nomenclatura.</p>
                </div>
              ) : (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="mb-6 rounded-lg bg-red-50 p-4">
                      <p className="mb-2 text-sm font-semibold text-red-700">Archivo con nombre incorrecto:</p>
                      <code className="rounded bg-red-100 px-2 py-1 text-red-800">reporte_final_final_ahora_si.docx</code>
                    </div>

                    <div className="mb-4">
                      <p className="mb-2 text-sm font-medium text-gray-700">Estándar recomendado:</p>
                      <code className="rounded bg-blue-100 px-2 py-1 text-blue-800">AAAA-MM-DD_Tema_Versión_Responsable</code>
                    </div>

                    <div className="mb-4">
                      <p className="mb-2 text-sm font-medium text-gray-700">Ejemplo correcto:</p>
                      <code className="rounded bg-green-100 px-2 py-1 text-green-800">2026-04-22_Reporte_V1_JP</code>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Renombra el archivo correctamente:</label>
                        <Input value={seitonInput} onChange={(e) => setSeitonInput(e.target.value)} placeholder="Escribe el nuevo nombre..." className="h-12" />
                        {seitonError && <p className="mt-2 text-sm text-red-500">{seitonError}</p>}
                      </div>
                      <Button onClick={validateSeiton} className="h-12 w-full bg-[#E8651A] text-white hover:bg-[#E8651A]/90">
                        <FileCheck className="mr-2 h-5 w-5" />
                        Validar Nomenclatura
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* SEISO - Clean */}
          {simulatorTab === "seiso" && (
            <div className="h-full">
              <div className="mb-6">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-[#0A1F3F]">
                  <Inbox className="h-6 w-6 text-[#E8651A]" />
                  Seiso - Limpiar (Inbox Zero)
                </h2>
                <p className="mt-2 text-gray-600">Practica la técnica Inbox Zero procesando rápidamente los correos de tu bandeja de entrada.</p>
              </div>

              {pendingEmails.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl bg-green-50 py-12">
                  <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
                  <p className="text-xl font-semibold text-green-700">¡Inbox Zero Alcanzado!</p>
                  <p className="mt-2 text-green-600">Tu bandeja de entrada está limpia y bajo control.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingEmails.map((email) => (
                    <div key={email.id} className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                          <Mail className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-[#0A1F3F]">{email.subject}</p>
                          <p className="text-xs text-gray-500">
                            De: {email.from} • {email.preview}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50" onClick={() => handleEmailAction(email.id)}>
                          <Reply className="mr-1 h-4 w-4" />
                          Responder
                        </Button>
                        <Button size="sm" variant="outline" className="border-purple-500 text-purple-600 hover:bg-purple-50" onClick={() => handleEmailAction(email.id)}>
                          <Forward className="mr-1 h-4 w-4" />
                          Delegar
                        </Button>
                        <Button size="sm" variant="outline" className="border-gray-500 text-gray-600 hover:bg-gray-50" onClick={() => handleEmailAction(email.id)}>
                          <Archive className="mr-1 h-4 w-4" />
                          Archivar
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-500 text-red-600 hover:bg-red-50" onClick={() => handleEmailAction(email.id)}>
                          <Trash2 className="mr-1 h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 rounded-lg bg-[#0A1F3F] px-4 py-3 text-white shadow-lg">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
}
