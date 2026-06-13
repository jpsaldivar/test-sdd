# ADR: Workspace del agente — buk-webapp como punto único de entrada

**Date:** 2026-05-13
**Status:** superseded

> Superseded by the self-contained cards model (2026-06-02). sdd-buk-docs now produces `2_jira-cards.md` as a fully self-contained artifact. Execution is decoupled — no symlink, no reference back to this repo required. The executor agent and `/sdd-execute` skill have been removed from sdd-buk-docs.

## Context
Al armar misiones, el agente necesita contexto de specs (buk-specs) y del código real (buk-webapp). Se evaluaron dos opciones: symlink inverso (buk-specs → buk-webapp) o correr todo desde buk-webapp con specs via symlink.

## Decision
El agente corre siempre desde buk-webapp. Las specs están disponibles via symlink `specs/` (ya configurado). No se crea symlink inverso en buk-specs.

## Rationale
- buk-specs solo no tiene valor práctico — armar specs siempre requiere ver el código
- Un workspace único elimina fricción de setup y contexto fragmentado
- El `.env.local` de buk-specs ya no es necesario para el flujo diario (solo para `setup.sh`)

## Consequences
- Armar specs y ejecutar misiones ocurre siempre desde buk-webapp
- buk-specs es el repo donde viven las specs, no donde corre el agente
- `setup.sh` en buk-specs sigue siendo necesario para crear el symlink inicial
