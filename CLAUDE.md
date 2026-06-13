# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This repo stores product specs for engineering teams at Buk. Specs are Markdown files organized by team and track, used to drive AI-assisted development in `buk-webapp`.

## Structure

```
_templates/             # Global templates — no per-team overrides
  context.md            # Team context template (required: Jira Board, buk-webapp Pack)
  spec-track.md         # Business doc template for a track (PM-owned)
  track.md              # Technical doc template for a track (Arquitecto-owned)
  spec-mission.md       # Business doc template for a mission (PM-owned)
  1_mission.md          # Technical doc template for a mission (Champion-owned)
  2_jira-cards.md       # Jira card proposals for a mission
  3_summary.md          # Living summary of a mission
  track-summary.md      # Consolidated summary when track closes
  adr.md                # Architecture Decision Record template

teams/
  <team>/
    context.md          # Team identity: Jira board, buk-webapp pack path, conventions
    tracks/
      YYYY/
        MMDD_<track>/
          spec-track.md   # Business doc — Owner: PM, Reviewer: Stakeholders
          track.md        # Technical doc — Owner: Arquitecto, Reviewer: EM
          ADR/            # Track-level architecture decisions
            NN_<slug>.md
          NN_<mission>/         # NN = zero-padded sequence within the track (01, 02, …)
            spec-mission.md   # Business doc — Owner: PM, Reviewer: Team
            1_mission.md      # Technical doc — Owner: Champion, Reviewer: EM + Arquitecto
            2_jira-cards.md   # Jira card proposals
            3_summary.md      # Living summary — Owner: Champion, Reviewer: EM
            ADR/              # Mission-level architecture decisions
              NN_<slug>.md
          track-summary.md    # Created when track closes
```

## Concepts

- **Track** — a business problem and its constraints. Lives in `teams/<team>/tracks/`.
- **Mission** — a concrete deliverable scoped to one track. Lives inside the track's subdirectory.
- **Context** (`context.md`) — team-level metadata: Jira board key, `buk-webapp` pack path, and optionally a pointer to the pack's `CLAUDE.md` in buk-webapp. If the pack has a `CLAUDE.md`, all technical conventions live there — `context.md` is a lightweight pointer.
- **spec-track / spec-mission** — business-facing docs owned by the PM. Describe goals, user impact, success metrics, and fuera de scope. No contienen historias de usuario — esas son responsabilidad de `1_mission.md`. Cada spec pasa por revisión de PR antes de que se genere el documento técnico correspondiente.
- **track.md / 1_mission.md** — technical docs owned by the Arquitecto/Champion. Reference the spec but focus on implementation constraints, domain entities, acceptance scenarios (Given/When/Then), and open questions. Las historias de usuario viven aquí, no en los specs.
- **ADR** — Architecture Decision Record. Documents a specific technical decision with context, alternatives, and consequences. A finalized ADR must be reflected in the parent `track.md` or `1_mission.md`.

## Adding a New Team

1. Create `teams/<team>/context.md` from `_templates/context.md`. Required fields: `Jira Board`, `buk-webapp Pack`.
2. Create `teams/<team>/tracks/` directory.

## Adding a Track or Mission

Copy the relevant templates from `_templates/` and fill every bracketed field. Leave no `[placeholder]` text in committed files.

Prefix **track** folders with `MMDD_` inside a `YYYY/` directory (e.g. `tracks/2026/0513_prueba-speckit`).

Prefix **mission** folders with a zero-padded sequential number within the track: `01_mission-name`, `02_mission-name`, etc. The number reflects creation order, not priority.

**New track checklist:**
1. Create `spec-track.md` from `_templates/spec-track.md` (PM fills this first)
2. Create `track.md` from `_templates/track.md` (Arquitecto fills after spec is reviewed)
3. Create `ADR/01_alternativas-solucion.md` from `_templates/adr.md` (required before track.md is finalized)

**New mission checklist:**
1. Create `spec-mission.md` from `_templates/spec-mission.md` (PM fills this first)
2. Create `1_mission.md` from `_templates/1_mission.md` (Champion fills after spec is reviewed)
3. Create `2_jira-cards.md` from `_templates/2_jira-cards.md`
4. Create `pruebas.md` from `_templates/pruebas.md`
5. Create `ADR/` folder (empty until decisions arise)

Files inside missions use a numeric prefix to enforce reading order:

- `1_mission.md`
- `2_jira-cards.md`
- `3_summary.md`

`pruebas.md` no lleva prefijo numérico — es un artefacto de planificación, no parte de la cadena de lectura del agente.

Use a Mermaid `graph LR` diagram in `track.md` under `## Mission Map` to show dependencies and parallelism between missions.

Use a Mermaid `graph LR` diagram in `2_jira-cards.md` under `## Execution Map` to show which cards can run in parallel and which are sequential. Maximize parallelism — cards with no dependency between them should always run concurrently.

**All diagrams in this repo must use Mermaid.** Never use ASCII art for flows, sequences, or architecture diagrams. Use the appropriate Mermaid diagram type: `graph LR` for flows and dependencies, `sequenceDiagram` for interactions, `flowchart TD` for decision trees.

When closing a track (all missions `done`), create `track-summary.md` at the track root. This consolidates learnings across all missions and serves as compressed context for related future tracks.

## Workflow

El flujo tiene fases separadas por revisión de PR. Cada documento de negocio (spec) se aprueba antes de crear el técnico correspondiente.

```
[FASE 1 — Spec del track]
  /sdd-track → spec-track.md (PM: problema, objetivos, métricas, misiones a considerar)
    → PR review (owner: PM, reviewer: stakeholders)
      → aprobado

[FASE 2 — Track técnico]
  /sdd-track-technical → track.md (Arquitecto: entidades, reglas, decisiones abiertas)
    → discusión → /sdd-adr si hay decisiones que documentar
    → PR review (owner: arquitecto, reviewer: EM)
      → aprobado

[FASE 3 — Spec de misión] (se repite por misión)
  /sdd-mission → spec-mission.md (PM: objetivo, contexto, criterios de aceptación)
    → PR review (owner: PM, reviewer: equipo)
      → aprobado

[FASE 4 — Misión técnica]
  /sdd-mission-technical → 1_mission.md + 2_jira-cards.md (Champion: historias, escenarios, cards)
    → discusión → /sdd-adr si hay decisiones que documentar
    → PR review (owner: champion, reviewer: EM + arquitecto)
      → aprobado → Status: ready

[FASE 5 — Cierre] (después de que las cards se ejecutan externamente)
  Actualizar Status: ready → done en 1_mission.md
  Crear 3_summary.md con: qué se construyó, decisiones clave, descubrimientos, cambios de scope
  Si todas las misiones del track están done: crear track-summary.md y marcar Status: closed en track.md
```

La ejecución de las cards ocurre fuera de este repo (buk-webapp u otro contexto). `2_jira-cards.md` es el artefacto de entrega — autocontenido, sin referencia a sdd-buk-docs. El cierre (Fase 5) vuelve aquí para actualizar el estado y preservar aprendizajes.

El Orquestador (subagente `orquestador`) detecta automáticamente la fase actual y propone el siguiente paso.

## Agent Reading Order

When acting on a mission, always read in this order:

1. `teams/<team>/context.md` (if it references a Pack CLAUDE.md, read that too for technical conventions)
2. `teams/<team>/tracks/<track>/spec-track.md` (business goals and constraints)
3. `teams/<team>/tracks/<track>/track.md` (technical context)
4. Any ADRs in `teams/<team>/tracks/<track>/ADR/`
5. `3_summary.md` of prior missions in the same track (compressed context)
6. `teams/<team>/tracks/<track>/<mission>/spec-mission.md` (business scope)
7. `teams/<team>/tracks/<track>/<mission>/1_mission.md` (technical spec)

When starting a new mission, skip steps 6–7 and use steps 1–5 as context window.

## Agents

Subagents live in `.claude/agents/`. All agents run from **buk-webapp** (see `decisions/20260513_workspace-agente.md`).

### Skills (invocadas directamente por el usuario)

| Skill | When to use |
|-------|-------------|
| `/sdd-track` | Fase 1 — Crear spec-track.md con discovery interactivo |
| `/sdd-track-technical` | Fase 2 — Crear track.md con análisis técnico + propuesta de ADRs |
| `/sdd-mission` | Fase 3 — Crear spec-mission.md con discovery interactivo |
| `/sdd-mission-technical` | Fase 4 — Crear 1_mission.md + 2_jira-cards.md con análisis técnico |
| `/sdd-adr` | Cualquier fase — Crear o analizar ADRs en el scope correspondiente |
| `/sdd-jira-cards` | Después de Fase 4 — Crear en Jira las cards de 2_jira-cards.md bajo el epic, en orden de dependencias, y actualizar los links |
| `/create-buk-spec-pr` | Crear PR para cambios en specs |

### Subagentes (invocados por el Orquestador o directamente via `/agents`)

| Subagente | Modelo | When to use |
|-----------|--------|-------------|
| `orquestador` | Haiku | Punto de entrada por defecto — detecta la fase actual y despacha al subagente correcto sin confirmación |
| `investigacion` | Sonnet | Crear spec-track.md + track.md para un nuevo track |
| `armado` | Sonnet | Crear spec-mission.md + 1_mission.md + 2_jira-cards.md para una nueva misión |
| `architect` | Opus | Analizar ADRs, definiciones técnicas, proponer decisiones de arquitectura |
| `cloud-architect` | Opus | Infraestructura AWS/GCP, IaC, ADRs de arquitectura cloud |

El Orquestador (Haiku) es el punto de entrada por defecto — detecta la fase y despacha a los demás subagentes via Agent tool sin pedir confirmación al usuario. Los subagentes especializados pueden invocarse directamente desde `/agents` cuando el usuario ya sabe qué necesita.

**Regla de dispatch:** El orquestador detecta la fase, muestra un resumen breve, y despacha inmediatamente al subagente correcto via Agent tool. No pregunta "¿Ejecuto?" ni espera confirmación — el flujo es autónomo. La única excepción es ambigüedad genuina (ej. múltiples misiones en el mismo estado con prioridad incierta), donde puede hacer una sola pregunta aclaratoria antes de despachar.

## Architecture Decisions

ADRs use `YYYYMMDD_<slug>.md` format and are created from `_templates/adr.md`. Four levels:

- `decisions/` — global, affects all teams (e.g., agent workspace, naming conventions)
- `teams/<team>/decisions/` — team-scoped, affects only that team
- `teams/<team>/tracks/<track>/ADR/` — track-scoped, affects all missions in the track
- `teams/<team>/tracks/<track>/<mission>/ADR/` — mission-scoped, specific to one deliverable

A finalized ADR (status: `accepted`) must be reflected in the parent `track.md` or `1_mission.md` Architecture Notes. Read relevant ADRs before proposing architectural changes.

## Local Overrides

`CLAUDE.local.md` is gitignored. Use it for local paths, personal notes, or environment-specific config.

## Key Fields

| Field | Where | Meaning |
|-------|-------|---------|
| `Status` | spec-mission / 1_mission | `draft` → `ready` → `in-progress` → `done` |
| `Epic` | spec-mission / 1_mission | Jira epic key (e.g. `BUK-1234`) |
| `Jira Board` | spec-track / track.md / context.md | Board key (e.g. `SEL` for Recruiting) |
| `buk-webapp Pack` | context.md | Code path in `buk-webapp` this team owns |
| `Owner` | spec-*, track.md, 1_mission | Who is responsible for writing and maintaining this doc |
| `Reviewer` | spec-*, track.md, 1_mission, ADR | Who must approve before the doc is considered final |
| `Dependencies` | spec-mission / 1_mission | `none` or list of upstream mission folder names (e.g. `01_setup-base`). Agents use this to load only the summaries they need — no dependencies means no prior context loaded. Must match the Mission Map arrows in `track.md`. |

## Recruiting Team

- Jira board: `SEL`
- buk-webapp pack: `app/packs/recruiting/`
- Context file: `teams/recruiting/context.md`
