---
name: sdd-track
version: 2.0.0
description: Crea el spec de un nuevo track (spec-track.md) mediante discovery interactivo. Solo genera el documento de negocio — el técnico (track.md) se crea después con /sdd-track-technical una vez aprobado el PR. Argumentos: <equipo> "<descripción del problema>".
---

# sdd-track

Crea `spec-track.md` para un nuevo track mediante un proceso de discovery interactivo. No genera `track.md` — ese documento es responsabilidad del arquitecto y tiene su propio flujo.

## Uso

```
/sdd-track <equipo> "<descripción del problema>"
```

Ejemplos:
- `/sdd-track recruiting "Los candidatos no pueden ver el estado de su postulación en tiempo real"`
- `/sdd-track payroll "El cálculo de finiquitos falla cuando hay más de un contrato activo en el mes"`

## Instrucciones

Los argumentos están en `$ARGUMENTS`. Parsea así:
- El primer token (sin comillas) es el **equipo**
- Todo lo que sigue es la **descripción del problema**

Si alguno falta, pregunta antes de continuar.

### 1. Leer contexto del equipo

Lee `specs/teams/<equipo>/context.md`. Extrae: Jira board, pack path en buk-webapp, convenciones.

### 2. Verificar tracks existentes

Lista `specs/teams/<equipo>/tracks/` y verifica si existe algún track con nombre o temática similar. Si hay uno relevante, avísalo antes de continuar.

### 3. Exploración inicial del codebase

Busca en el pack de buk-webapp las entidades y patrones relacionados al problema. El objetivo no es un análisis técnico profundo sino entender:
- Qué existe hoy relacionado al problema
- Quién se ve afectado (tipos de usuario)
- Si hay restricciones que el PM deba conocer al definir el scope

### 4. Discovery — preguntas antes de generar

Presenta al usuario lo que entendiste del problema (2-3 líneas) y haz **hasta 4 preguntas** para completar los vacíos del spec. Prioriza:
- **Métricas de éxito:** ¿cómo sabremos que el track está terminado? ¿hay una línea base medible?
- **Fuera de scope:** ¿qué quedará explícitamente fuera para acotar expectativas?
- **Misiones tentativas:** ¿qué entregas intermedias se anticipan? (nombres rough)
- **Restricciones:** ¿hay plazos, dependencias externas o decisiones ya tomadas que limiten lo posible?

Espera la respuesta. Si el usuario quiere profundizar en algún punto, investiga más y vuelve a preguntar. Continúa el diálogo hasta que el usuario indique que está listo para generar.

### 5. Determinar path

- Formato: `specs/teams/<equipo>/tracks/YYYY/MMDD_<slug>/`
- Slug: kebab-case, descriptivo, máximo 4 palabras
- La fecha de hoy determina el prefijo

Muestra el path propuesto. Pregunta: "¿Procedo? (s/n)"

### 6. Crear los archivos

Solo si el usuario confirma:

1. Crea `specs/teams/<equipo>/tracks/YYYY/MMDD_<slug>/spec-track.md` usando `specs/_templates/spec-track.md` como base. Incorpora las respuestas del discovery. La sección "Misiones a Considerar" lista las entregas que el usuario mencionó, sin detalle técnico. Sin `[placeholder]`.
2. Crea `specs/teams/<equipo>/tracks/YYYY/MMDD_<slug>/ADR/.gitkeep`

**No crear `track.md`** — ese documento se crea con `/sdd-track-technical` después de que el PR del spec sea aprobado.

### 7. Resultado

Al terminar, muestra:
```
Spec creado: specs/teams/<equipo>/tracks/YYYY/MMDD_<slug>/
  spec-track.md  ✓
  ADR/           ✓

Próximos pasos:
  1. Revisa spec-track.md — ajusta métricas, fuera de scope y misiones a considerar
  2. Abre PR para revisión (owner: PM, reviewer: stakeholders)
  3. Una vez aprobado el PR: /sdd-track-technical <equipo> <MMDD_slug>
```
