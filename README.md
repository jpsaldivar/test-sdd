# SDD buk docs

Especificaciones de producto para los equipos de ingeniería en Buk. Cada spec es un archivo Markdown legible por personas y agentes de IA.

## ¿Qué hay aquí?

- **Tracks** — un problema de negocio con sus restricciones, dueño de un equipo
- **Misiones** — un entregable concreto dentro de un track, con criterios de aceptación
- **Jira cards** — tareas autocontenidas generadas desde una misión, listas para ejecutar sin referencia a este repo
- **Agentes** — subagentes de Claude Code que generan specs, documentan decisiones y orquestan el flujo

## Estructura

```bash
_templates/           # Templates globales para tracks, misiones y context
.claude/agents/       # Subagentes de Claude Code (orquestador, arquitecto, cloud-architect, armado, investigacion)
decisions/            # ADRs globales
teams/
  <equipo>/
    context.md        # Metadata del equipo: tablero Jira, pack de buk-webapp, Pack CLAUDE.md
    decisions/        # ADRs del equipo
    tracks/
      YYYY/
        MMDD_<track>/
          spec-track.md     # Doc de negocio — PM
          track.md          # Doc técnico — Arquitecto
          ADR/
          NN_<misión>/
            spec-mission.md   # Doc de negocio — PM
            1_mission.md      # Doc técnico — Champion
            2_jira-cards.md   # Cards autocontenidas ← artefacto final
            pruebas.md
            3_summary.md      # Se crea después de la ejecución
            ADR/
```

## Flujo de trabajo

Cada documento de negocio (spec) se aprueba vía PR antes de crear el técnico correspondiente. El flujo termina cuando `2_jira-cards.md` está listo — las cards son el artefacto de entrega.

```
Fase 1 — Spec del track     /sdd-track              → spec-track.md
                             └─ PR review (PM + stakeholders)
Fase 2 — Track técnico      /sdd-track-technical    → track.md
                             └─ PR review (Arquitecto + EM)
Fase 3 — Spec de misión     /sdd-mission            → spec-mission.md
                             └─ PR review (PM + equipo)
Fase 4 — Misión técnica     /sdd-mission-technical  → 1_mission.md + 2_jira-cards.md
                             └─ PR review (Champion + EM + Arquitecto)
──────────────────────────────────────────────────────────────
  Ejecución externa — buk-webapp u otro contexto
  (las cards de 2_jira-cards.md son autocontenidas, no necesitan este repo)
──────────────────────────────────────────────────────────────
Fase 5 — Cierre             Status: done + 3_summary.md
                             └─ Si track completo: track-summary.md + Status: closed
```

## Skills disponibles

| Comando | Qué hace |
|---------|----------|
| `/sdd-track <equipo> "<problema>"` | Fase 1 — Crea spec-track.md con discovery interactivo |
| `/sdd-track-technical <equipo> <track>` | Fase 2 — Crea track.md con análisis técnico |
| `/sdd-mission <equipo> <track> "<objetivo>"` | Fase 3 — Crea spec-mission.md con discovery interactivo |
| `/sdd-mission-technical <equipo> <track> <misión>` | Fase 4 — Crea 1_mission.md + 2_jira-cards.md |
| `/sdd-adr <equipo> [<track>] [<misión>] "<decisión>"` | Cualquier fase — Documenta o analiza ADRs |
| `/create-buk-spec-pr` | Crea un PR con el template de cambios completado |

---

## Guía paso a paso

### Paso 1 — Crear un track

**Cuándo usarlo:** no existe ningún track para tu problema todavía.

**Forma rápida** (recomendada):

```
/sdd-track recruiting "Los candidatos no pueden ver el estado de su postulación en tiempo real. El equipo de RRHH recibe consultas repetitivas por correo. Queremos exponer un portal de seguimiento que reduzca las consultas en un 60%."
```

La skill hace discovery interactivo: explora el codebase, propone el scope y confirma antes de crear los archivos.

**Forma manual:**

```
Lee teams/<equipo>/context.md. Si tiene Pack CLAUDE.md, léelo también.

Quiero crear un nuevo track para este equipo:
"<Describe el problema en 3-4 oraciones. Qué duele hoy, quién lo sufre, qué queremos lograr.>"

Crea teams/<equipo>/tracks/<YYYY>/<MMDD_nombre-track>/spec-track.md
usando _templates/spec-track.md como base. No dejes campos [placeholder] sin completar.
```

**Resultado:**
```
teams/recruiting/tracks/2026/0519_portal-candidatos/
  spec-track.md   ← PM revisa y aprueba vía PR
```

**Después del PR aprobado** — crear el doc técnico:

```
/sdd-track-technical recruiting portal-candidatos
```

La skill explora el codebase, propone entidades y restricciones, y puede proponer ADRs antes de generar `track.md`.

**Resultado:**
```
teams/recruiting/tracks/2026/0519_portal-candidatos/
  spec-track.md
  track.md        ← Arquitecto revisa y aprueba vía PR
  ADR/
```

---

### Paso 2 — Crear una misión

**Cuándo usarlo:** el track está aprobado y quieres definir el primer trabajo concreto.

**Forma rápida:**

```
/sdd-mission recruiting portal-candidatos "Crear el endpoint y modelo de datos que expone el estado de postulación de un candidato, incluyendo etapa actual, fecha de último cambio y próximo paso esperado."
```

La skill detecta el número de secuencia correcto y lee las dependencias automáticamente.

**Forma manual:**

```
Lee en este orden:
1. teams/<equipo>/context.md (y su Pack CLAUDE.md si existe)
2. teams/<equipo>/tracks/<YYYY>/<MMDD_track>/spec-track.md
3. teams/<equipo>/tracks/<YYYY>/<MMDD_track>/track.md

Quiero crear la misión 01 para este track. Objetivo:
"<Describe qué se va a construir en esta misión, en 2-3 oraciones.>"

Crea teams/<equipo>/tracks/<YYYY>/<MMDD_track>/01_<nombre-mision>/spec-mission.md
usando _templates/spec-mission.md como base. Status: draft. Sin [placeholder].
```

**Resultado:**
```
teams/recruiting/tracks/2026/0519_portal-candidatos/
  01_api-estado-postulacion/
    spec-mission.md   ← PM revisa y aprueba vía PR
```

**Después del PR aprobado** — crear los docs técnicos y las cards:

```
/sdd-mission-technical recruiting portal-candidatos 01
```

La skill explora el codebase, analiza el scope técnico, expone puntos abiertos, puede proponer ADRs, y genera los tres artefactos.

**Resultado:**
```
teams/recruiting/tracks/2026/0519_portal-candidatos/
  01_api-estado-postulacion/
    spec-mission.md
    1_mission.md          ← Champion + EM + Arquitecto revisan vía PR
    2_jira-cards.md       ← cards autocontenidas, listas para Jira
    pruebas.md
    ADR/
```

**Antes de continuar:**
1. Revisa `2_jira-cards.md` — verifica que el Contexto de Implementación esté completo
2. Crea las cards en Jira a partir de `2_jira-cards.md`
3. Cambia el Status en `1_mission.md` de `draft` a `ready`

---

### Paso 3 — Cerrar la misión

**Cuándo usarlo:** las cards ya fueron ejecutadas (en buk-webapp u otro contexto).

1. Cambia `Status` en `1_mission.md`: `ready` → `done`
2. Crea `3_summary.md` usando `_templates/3_summary.md`:
   - Qué se construyó
   - Decisiones clave tomadas durante la ejecución
   - Descubrimientos inesperados
   - Cambios de scope respecto al plan original

Si **todas las misiones del track están `done`**:
1. Crea `track-summary.md` usando `_templates/track-summary.md`
2. Cambia `Status` en `track.md` a `closed`

---

### Documentar una decisión técnica (ADR)

**Cuándo usarlo:** estás evaluando una opción de arquitectura y quieres documentarla antes de implementar.

```
/sdd-adr recruiting portal-candidatos 01_api-estado-postulacion "Usar REST en vez de GraphQL para el endpoint de estado de postulación"
```

La skill lee los ADRs existentes en ese scope y sus padres, busca evidencia en el codebase, genera el borrador con alternativas concretas y espera tu aprobación antes de escribir.

**Revisar todos los ADRs de un track:**

```
/sdd-adr recruiting portal-candidatos
```

Produce un inventario, detecta conflictos o gaps, y sugiere acciones.

---

### ¿No sabes qué hacer a continuación?

El Orquestador lee el estado del track y propone el siguiente paso exacto. Invócalo desde `/agents` seleccionando **orquestador**, o directamente:

```
Usa el subagente orquestador para el track teams/recruiting/tracks/2026/0519_portal-candidatos
```

El Orquestador detecta la fase actual, muestra un resumen y pregunta `¿Ejecuto? (s/n)` antes de lanzar el siguiente subagente.

---

### Referencia rápida

| Situación | Skill rápida | Subagente (`/agents`) |
|-----------|-------------|----------------------|
| Crear un track nuevo | `/sdd-track <equipo> "<problema>"` | `investigacion` |
| Crear doc técnico del track | `/sdd-track-technical <equipo> <track>` | `investigacion` |
| Crear una misión | `/sdd-mission <equipo> <track> "<objetivo>"` | `armado` |
| Crear docs técnicos de misión | `/sdd-mission-technical <equipo> <track> <misión>` | `armado` |
| Documentar o revisar ADRs | `/sdd-adr <equipo> [<track>] "<decisión>"` | `architect` |
| No sé qué hacer a continuación | — | `orquestador` |
| Decisión de arquitectura AWS/GCP | — | `cloud-architect` |
