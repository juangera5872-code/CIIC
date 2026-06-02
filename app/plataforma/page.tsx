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
  Menu,
  Bell,
  MessageSquare,
  Calendar,
  Home,
  FileSignature,
  PlayCircle,
  Pencil,
  GripVertical,
  Save,
  Globe,
  DollarSign,
  Link,
  Info,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/* ============================================================
   TYPES
============================================================ */
type ViewType = "login" | "dashboard" | "curso-detalle" | "leccion" | "simulador-5s" | "admin-panel" | "aula-virtual"
type SimulatorTab = "seiri" | "seiton" | "seiso"
type AdminTab = "dashboard" | "cursos" | "alumnos" | "config"
type AdminEditorTab = "info" | "temario" | "precio"

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
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)

  // ---- Login State ----
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")

  // ---- Admin State ----
  const [adminTab, setAdminTab] = useState<AdminTab>("dashboard")
  const [adminEditorTab, setAdminEditorTab] = useState<AdminEditorTab>("info")
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null)
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null)
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
    setCurrentView("aula-virtual")
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
     RENDER: AULA VIRTUAL (Moodle-style LMS)
  ============================================================ */
  if (currentView === "aula-virtual" && selectedCourse) {
    const totalLessons = selectedCourse.modules.reduce((acc, m) => acc + m.lessons.length, 0)
    const completedLessons = selectedCourse.modules.reduce((acc, m) => acc + m.lessons.filter((l) => l.completed).length, 0)
    const progressPercent = Math.round((completedLessons / totalLessons) * 100)

    return (
      <div className="flex min-h-screen flex-col bg-[#f5f5f5]">
        {/* Top Navbar */}
        <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-[#0A1F3F] px-4 shadow-md">
          {/* Left: Logo + Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Image src="/images/ciic-logo-full.png" alt="CIIC Logo" width={100} height={40} className="h-8 w-auto object-contain" />
          </div>

          {/* Center: Breadcrumbs */}
          <nav className="hidden items-center gap-2 text-sm text-white/70 md:flex">
            <a href="#" className="hover:text-white" onClick={() => setCurrentView("dashboard")}>Mis Cursos</a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white/50">Capacitaciones</span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-white">{selectedCourse.title}</span>
          </nav>

          {/* Right: Icons + User */}
          <div className="flex items-center gap-2">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#E8651A]"></span>
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white">
              <MessageSquare className="h-5 w-5" />
            </button>
            <div className="ml-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8651A] text-sm font-medium text-white">
                JP
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1">
          {/* Left Sidebar - Course Navigation */}
          <aside className={`${sidebarOpen ? "w-64" : "w-0"} shrink-0 overflow-hidden border-r bg-white transition-all duration-300 lg:block`}>
            <div className="flex h-full w-64 flex-col">
              {/* Course Quick Links */}
              <div className="border-b p-4">
                <nav className="space-y-1">
                  <button className="flex w-full items-center gap-3 rounded-lg bg-[#E8651A]/10 px-3 py-2 text-sm font-medium text-[#E8651A]">
                    <Home className="h-4 w-4" />
                    Inicio del Curso
                  </button>
                  <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
                    <Users className="h-4 w-4" />
                    Participantes
                  </button>
                  <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
                    <Award className="h-4 w-4" />
                    Calificaciones
                  </button>
                </nav>
              </div>

              {/* Modules Index */}
              <div className="flex-1 overflow-y-auto p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Contenido del Curso</p>
                <div className="space-y-1">
                  {selectedCourse.modules.map((module, index) => {
                    const isExpanded = expandedModules.includes(module.id)
                    const moduleCompleted = module.lessons.filter((l) => l.completed).length
                    const moduleTotal = module.lessons.length
                    const isModuleComplete = moduleCompleted === moduleTotal

                    return (
                      <div key={module.id}>
                        <button
                          onClick={() => toggleModule(module.id)}
                          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                            isExpanded ? "bg-[#0A1F3F]/5 font-medium text-[#0A1F3F]" : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {isExpanded ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                          <span className="flex-1 truncate">Módulo {index + 1}</span>
                          {isModuleComplete && <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />}
                        </button>
                        {isExpanded && (
                          <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-200 pl-3">
                            {module.lessons.map((lesson) => (
                              <button
                                key={lesson.id}
                                onClick={() => handleOpenLesson(lesson)}
                                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                              >
                                {lesson.completed ? (
                                  <CheckCircle2 className="h-3 w-3 shrink-0 text-green-500" />
                                ) : (
                                  <div className="h-3 w-3 shrink-0 rounded-full border border-gray-300" />
                                )}
                                <span className="truncate">{lesson.title.replace(/^(Video:|Lectura:|Práctica:)\s*/, "")}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-4xl p-6">
              {/* Course Header Banner */}
              <div className="mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-[#0A1F3F] to-[#1A4A8F] p-6 text-white shadow-lg">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h1 className="text-xl font-bold lg:text-2xl">{selectedCourse.title}</h1>
                    <p className="mt-1 text-sm text-white/70">Nivel Intermedio</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-white/60">Tu progreso</p>
                      <p className="text-2xl font-bold">{progressPercent}%</p>
                    </div>
                    <div className="h-12 w-12">
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.5"
                          fill="none"
                          stroke="#E8651A"
                          strokeWidth="3"
                          strokeDasharray={`${progressPercent} 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modules Accordion */}
              <div className="space-y-4">
                {selectedCourse.modules.map((module, moduleIndex) => {
                  const isExpanded = expandedModules.includes(module.id)
                  const moduleCompleted = module.lessons.filter((l) => l.completed).length
                  const moduleTotal = module.lessons.length

                  return (
                    <div key={module.id} className="overflow-hidden rounded-xl border bg-white shadow-sm">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E8651A]/10 font-bold text-[#E8651A]">
                            {moduleIndex + 1}
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#0A1F3F]">{module.title}</h3>
                            <p className="mt-0.5 text-sm text-gray-500">{module.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="hidden rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 sm:inline-flex">
                            {moduleCompleted}/{moduleTotal} completadas
                          </span>
                          {isExpanded ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t bg-gray-50/50 p-4">
                          <div className="space-y-2">
                            {module.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                onClick={() => handleOpenLesson(lesson)}
                                className="flex cursor-pointer items-center justify-between rounded-lg bg-white p-3 shadow-sm transition-all hover:shadow-md"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                                    lesson.completed ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                                  }`}>
                                    {lesson.type === "video" && <PlayCircle className="h-5 w-5" />}
                                    {lesson.type === "reading" && <FileText className="h-5 w-5" />}
                                    {lesson.type === "practice" && <FileSignature className="h-5 w-5" />}
                                  </div>
                                  <div>
                                    <p className={`text-sm font-medium ${lesson.completed ? "text-gray-500" : "text-[#0A1F3F]"}`}>
                                      {lesson.title}
                                    </p>
                                    <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                                      <Clock className="h-3 w-3" />
                                      {lesson.duration}
                                      {lesson.completed && (
                                        <span className="flex items-center gap-1 text-green-600">
                                          <CheckCircle2 className="h-3 w-3" />
                                          Completado
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </main>

          {/* Right Sidebar - Info Blocks */}
          <aside className={`${rightSidebarOpen ? "w-72" : "w-0"} hidden shrink-0 overflow-hidden border-l bg-white transition-all duration-300 xl:block`}>
            <div className="flex h-full w-72 flex-col p-4">
              {/* Announcements */}
              <div className="mb-6">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0A1F3F]">
                  <Bell className="h-4 w-4 text-[#E8651A]" />
                  Avisos Recientes
                </h3>
                <div className="space-y-2">
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                    <p className="text-xs font-medium text-blue-800">El instructor ha subido un nuevo material</p>
                    <p className="mt-1 text-xs text-blue-600">Hace 2 horas</p>
                  </div>
                  <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                    <p className="text-xs font-medium text-amber-800">Recordatorio: Completa el Módulo 2</p>
                    <p className="mt-1 text-xs text-amber-600">Hace 1 día</p>
                  </div>
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="mb-6">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0A1F3F]">
                  <Calendar className="h-4 w-4 text-[#E8651A]" />
                  Eventos Próximos
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 rounded-lg border p-3">
                    <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-[#E8651A]/10 text-[#E8651A]">
                      <span className="text-xs font-bold">VIE</span>
                      <span className="text-sm font-bold">15</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#0A1F3F]">Cierre de cuestionario</p>
                      <p className="text-xs text-gray-500">23:59 hrs</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border p-3">
                    <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <span className="text-xs font-bold">LUN</span>
                      <span className="text-sm font-bold">18</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#0A1F3F]">Sesión en vivo</p>
                      <p className="text-xs text-gray-500">10:00 hrs</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mini Calendar */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0A1F3F]">
                  <Calendar className="h-4 w-4 text-[#E8651A]" />
                  Junio 2026
                </h3>
                <div className="rounded-lg border p-3">
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {["D", "L", "M", "M", "J", "V", "S"].map((day) => (
                      <div key={day} className="py-1 font-semibold text-gray-400">{day}</div>
                    ))}
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                      <div
                        key={day}
                        className={`rounded py-1 ${
                          day === 2 ? "bg-[#E8651A] font-bold text-white" : 
                          day === 15 ? "bg-amber-100 font-medium text-amber-700" :
                          day === 18 ? "bg-blue-100 font-medium text-blue-700" :
                          "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Back to Dashboard */}
              <div className="mt-auto pt-4">
                <Button
                  onClick={() => setCurrentView("dashboard")}
                  variant="outline"
                  className="w-full border-[#0A1F3F] text-[#0A1F3F] hover:bg-[#0A1F3F] hover:text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al Dashboard
                </Button>
              </div>
            </div>
          </aside>
        </div>
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
     RENDER: ADMIN PANEL - Course Builder CMS
  ============================================================ */
  if (currentView === "admin-panel") {
    const editingCourse = editingCourseId ? courses.find((c) => c.id === editingCourseId) : null

    return (
      <div className="flex min-h-screen bg-[#f8f9fa]">
        {/* Admin Sidebar */}
        <aside className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col bg-[#0A1F3F]">
          <div className="flex h-16 items-center justify-center border-b border-white/10 px-4">
            <Image src="/images/ciic-logo-full.png" alt="CIIC Logo" width={140} height={56} className="h-10 w-auto object-contain" />
          </div>
          <nav className="flex-1 space-y-1 p-4">
            <button
              onClick={() => { setAdminTab("dashboard"); setEditingCourseId(null) }}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                adminTab === "dashboard" ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </button>
            <button
              onClick={() => { setAdminTab("cursos"); setEditingCourseId(null) }}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                adminTab === "cursos" ? "bg-[#E8651A] text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <BookOpen className="h-5 w-5" />
              Gestion de Cursos
            </button>
            <button
              onClick={() => { setAdminTab("alumnos"); setEditingCourseId(null) }}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                adminTab === "alumnos" ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Users className="h-5 w-5" />
              Usuarios / Agremiados
            </button>
            <button
              onClick={() => { setAdminTab("config"); setEditingCourseId(null) }}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                adminTab === "config" ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Settings className="h-5 w-5" />
              Configuracion
            </button>
          </nav>
          <div className="border-t border-white/10 p-4">
            <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-white/60 hover:bg-white/5 hover:text-white">
              <LogOut className="mr-3 h-5 w-5" />
              Cerrar Sesion
            </Button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="ml-64 flex-1">
          {/* Course Editor View */}
          {editingCourseId && editingCourse ? (
            <div className="min-h-screen">
              {/* Editor Header */}
              <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setEditingCourseId(null)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0A1F3F]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a todos los cursos
                  </button>
                </div>
                <h1 className="text-lg font-semibold text-[#0A1F3F]">
                  Editando: <span className="text-[#E8651A]">&quot;{editingCourse.title}&quot;</span>
                </h1>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="border-gray-300 text-gray-600 hover:bg-gray-100">
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Borrador
                  </Button>
                  <Button className="bg-green-600 text-white hover:bg-green-700">
                    <Globe className="mr-2 h-4 w-4" />
                    Publicar Curso
                  </Button>
                </div>
              </header>

              {/* Editor Tabs */}
              <div className="border-b bg-white px-6">
                <nav className="flex gap-1">
                  {[
                    { id: "info" as AdminEditorTab, label: "Informacion Basica", icon: Info },
                    { id: "temario" as AdminEditorTab, label: "Constructor de Temario", icon: Layers },
                    { id: "precio" as AdminEditorTab, label: "Ajustes de Precio", icon: DollarSign },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setAdminEditorTab(tab.id)}
                      className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                        adminEditorTab === tab.id
                          ? "border-[#E8651A] text-[#E8651A]"
                          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Informacion Basica Tab */}
                {adminEditorTab === "info" && (
                  <div className="mx-auto max-w-3xl space-y-6">
                    <Card className="border-0 shadow-md">
                      <CardContent className="space-y-6 p-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Titulo del Curso</label>
                          <Input
                            value={editingCourse.title}
                            className="h-12 text-lg"
                            placeholder="Ej: Lean Manufacturing y Mejora Continua"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Subtitulo</label>
                          <Input
                            placeholder="Un resumen breve del curso (opcional)"
                            className="h-11"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Duracion Total</label>
                            <Input
                              value={editingCourse.duration}
                              placeholder="Ej: 40 horas"
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nivel</label>
                            <select className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm">
                              <option>Principiante</option>
                              <option>Intermedio</option>
                              <option>Avanzado</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Descripcion del Curso</label>
                          <div className="rounded-lg border bg-white">
                            <div className="flex items-center gap-1 border-b px-3 py-2">
                              <button className="rounded p-1.5 hover:bg-gray-100"><strong>B</strong></button>
                              <button className="rounded p-1.5 hover:bg-gray-100"><em>I</em></button>
                              <button className="rounded p-1.5 hover:bg-gray-100"><u>U</u></button>
                              <span className="mx-2 h-4 w-px bg-gray-300" />
                              <button className="rounded p-1.5 hover:bg-gray-100">
                                <Link className="h-4 w-4" />
                              </button>
                            </div>
                            <textarea
                              value={editingCourse.description}
                              className="min-h-[150px] w-full resize-none border-0 p-3 text-sm focus:outline-none"
                              placeholder="Describe los objetivos y contenido del curso..."
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Imagen de Portada</label>
                          <div className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-all hover:border-[#E8651A] hover:bg-orange-50/50">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-600">Arrastra una imagen aqui</p>
                            <p className="mt-1 text-xs text-gray-400">o haz clic para seleccionar (PNG, JPG hasta 5MB)</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Constructor de Temario Tab */}
                {adminEditorTab === "temario" && (
                  <div className="mx-auto max-w-4xl space-y-4">
                    {/* Add Module Button */}
                    <Button
                      className="h-14 w-full border-2 border-dashed border-gray-300 bg-white text-gray-600 hover:border-[#E8651A] hover:bg-orange-50 hover:text-[#E8651A]"
                      variant="ghost"
                    >
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Agregar Nuevo Modulo
                    </Button>

                    {/* Modules List */}
                    <div className="space-y-3">
                      {editingCourse.modules.map((module, moduleIndex) => {
                        const isExpanded = expandedModules.includes(module.id) || editingModuleId === module.id

                        return (
                          <Card key={module.id} className="overflow-hidden border-0 shadow-md">
                            {/* Module Header */}
                            <div
                              className="flex cursor-pointer items-center justify-between bg-white p-4 transition-colors hover:bg-gray-50"
                              onClick={() => toggleModule(module.id)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="cursor-grab text-gray-400 hover:text-gray-600">
                                  <GripVertical className="h-5 w-5" />
                                </div>
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0A1F3F] text-sm font-bold text-white">
                                  {moduleIndex + 1}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-[#0A1F3F]">{module.title}</h3>
                                  <p className="mt-0.5 text-xs text-gray-500">{module.lessons.length} lecciones</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-[#0A1F3F]">
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                                {isExpanded ? (
                                  <ChevronDown className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                            </div>

                            {/* Module Content - Lessons */}
                            {isExpanded && (
                              <div className="border-t bg-gray-50 p-4">
                                {module.lessons.length === 0 ? (
                                  <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                                      <FileText className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-500">Aun no hay lecciones en este modulo.</p>
                                    <p className="mt-1 text-xs text-gray-400">Haz clic en agregar para empezar.</p>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {module.lessons.map((lesson, lessonIndex) => (
                                      <div
                                        key={lesson.id}
                                        className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm"
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="cursor-grab text-gray-300 hover:text-gray-500">
                                            <GripVertical className="h-4 w-4" />
                                          </div>
                                          <span className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-xs font-medium text-gray-500">
                                            {lessonIndex + 1}
                                          </span>
                                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                            lesson.type === "video" ? "bg-red-100 text-red-600" :
                                            lesson.type === "reading" ? "bg-blue-100 text-blue-600" :
                                            "bg-green-100 text-green-600"
                                          }`}>
                                            {lesson.type === "video" && <Video className="h-4 w-4" />}
                                            {lesson.type === "reading" && <FileText className="h-4 w-4" />}
                                            {lesson.type === "practice" && <Monitor className="h-4 w-4" />}
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium text-[#0A1F3F]">{lesson.title}</p>
                                            <p className="text-xs text-gray-400">{lesson.duration}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600">
                                            <Upload className="h-4 w-4" />
                                          </button>
                                          <button className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-[#0A1F3F]">
                                            <Pencil className="h-4 w-4" />
                                          </button>
                                          <button className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Add Lesson Button */}
                                <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white py-3 text-sm text-gray-500 transition-colors hover:border-[#E8651A] hover:text-[#E8651A]">
                                  <PlusCircle className="h-4 w-4" />
                                  Agregar Leccion
                                </button>
                              </div>
                            )}
                          </Card>
                        )
                      })}
                    </div>

                    {editingCourse.modules.length === 0 && (
                      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white py-16 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                          <Layers className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700">Sin modulos aun</h3>
                        <p className="mt-1 text-sm text-gray-500">Comienza agregando el primer modulo de tu curso</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Ajustes de Precio Tab */}
                {adminEditorTab === "precio" && (
                  <div className="mx-auto max-w-2xl space-y-6">
                    <Card className="border-0 shadow-md">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <DollarSign className="h-5 w-5 text-[#E8651A]" />
                          Configuracion de Precio
                        </CardTitle>
                        <CardDescription>Define el precio y opciones de pago para este curso</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Precio del Curso (MXN)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <Input
                              type="number"
                              placeholder="2000"
                              className="h-12 pl-8 text-lg"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">Precio con Descuento (Opcional)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <Input
                              type="number"
                              placeholder="1500"
                              className="h-12 pl-8"
                            />
                          </div>
                          <p className="text-xs text-gray-400">Deja vacio si no hay descuento activo</p>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border bg-gray-50 p-4">
                          <div>
                            <p className="font-medium text-[#0A1F3F]">Descuento para Agremiados</p>
                            <p className="text-sm text-gray-500">Miembros del CIIC obtienen precio especial</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="20"
                              className="h-10 w-20 text-center"
                            />
                            <span className="text-sm text-gray-500">%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Courses List View */
            <div className="p-8">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-[#0A1F3F]">Gestion de Cursos</h1>
                  <p className="mt-1 text-gray-500">Administra el catalogo de cursos de la plataforma</p>
                </div>
                <Button className="bg-[#E8651A] text-white hover:bg-[#E8651A]/90">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Crear Nuevo Curso
                </Button>
              </div>

              {/* Courses Grid */}
              <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {courses.map((course) => (
                  <Card key={course.id} className="group overflow-hidden border-0 shadow-md transition-all hover:shadow-lg">
                    <div className="relative h-40 bg-gradient-to-br from-[#0A1F3F] to-[#1A4A8F]">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-white/20" />
                      </div>
                      <div className="absolute right-3 top-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          course.status === "publicado" ? "bg-green-500 text-white" : "bg-yellow-500 text-white"
                        }`}>
                          {course.status === "publicado" ? "Publicado" : "Borrador"}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-[#0A1F3F] line-clamp-1">{course.title}</h3>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{course.description}</p>
                      <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5" />
                          {course.modules.length} modulos
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {course.duration}
                        </span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          onClick={() => { setEditingCourseId(course.id); setAdminEditorTab("info"); setExpandedModules([]) }}
                          variant="outline"
                          size="sm"
                          className="flex-1 border-[#0A1F3F] text-[#0A1F3F] hover:bg-[#0A1F3F] hover:text-white"
                        >
                          <Pencil className="mr-1.5 h-4 w-4" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" className="text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add Course Card */}
                <Card className="flex min-h-[280px] cursor-pointer flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 transition-all hover:border-[#E8651A] hover:bg-orange-50/50">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-200">
                    <PlusCircle className="h-7 w-7 text-gray-400" />
                  </div>
                  <p className="font-medium text-gray-600">Crear Nuevo Curso</p>
                  <p className="mt-1 text-sm text-gray-400">Haz clic para empezar</p>
                </Card>
              </div>
            </div>
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
