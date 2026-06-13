---
name: create-buk-spec-pr
version: 2.0.0
description: Crea un pull request para cambios en buk-specs. Lee el diff de la rama actual, identifica misiones/tracks afectados y completa el template de PR automáticamente.
---

# create-buk-spec-pr

Lee el diff de la rama actual, identifica qué cambió (misiones, tracks, plantillas, agentes, decisiones) y crea un PR contra la rama base con el template completo.

## Pasos

1. Detectar la rama base del repo: `git remote show origin | grep 'HEAD branch' | awk '{print $NF}'`
2. Ejecutar `git diff <rama-base>...HEAD --name-only` para identificar los archivos modificados
3. Leer los archivos cambiados para entender qué se agregó o modificó
4. Clasificar los cambios según la tabla de abajo
5. Completar el template de PR en `.github/PULL_REQUEST_TEMPLATE.md`
6. Crear el PR con `gh pr create` apuntando a la rama base detectada
7. Asignar el PR al usuario git actual: `gh pr edit <número> --add-assignee $(gh api user --jq '.login')`

## Clasificación de cambios

| Archivo cambiado | Tipo | Descripción |
|-----------------|------|-------------|
| `teams/.../spec-track.md` | `spec-track` | Doc de negocio del track (PM) — goals, métricas, alcance |
| `teams/.../track.md` | `track` | Doc técnico del track (Arquitecto) — entidades, restricciones, Mission Map |
| `teams/.../track-summary.md` | `summary` | Track cerrado — resumen consolidado de todas las misiones |
| `teams/.../ADR/NN_*.md` | `adr` | Decisión arquitectónica de track |
| `teams/.../NN_mission/spec-mission.md` | `spec-mission` | Doc de negocio de misión (PM) — user stories, criterios negocio |
| `teams/.../NN_mission/1_mission.md` | `mission` | Doc técnico de misión (Champion) — escenarios Given/When/Then, scope |
| `teams/.../NN_mission/2_jira-cards.md` | `jira-cards` | Cards Jira propuestas con Execution Map |
| `teams/.../NN_mission/3_summary.md` | `summary` | Resumen vivo de misión actualizado o misión cerrada |
| `teams/.../NN_mission/ADR/NN_*.md` | `adr` | Decisión arquitectónica de misión |
| `teams/.../decisions/NN_*.md` | `adr` | Decisión arquitectónica de equipo |
| `decisions/NN_*.md` | `adr` | Decisión arquitectónica global |
| `_templates/` | `template` | Plantilla global modificada o agregada |
| `agents/` | `agent` | Prompt de agente modificado o agregado |
| `CLAUDE.md` o `README.md` | `docs` | Convención o documentación del repo actualizada |
| `teams/.../context.md` | `docs` | Metadata del equipo actualizada (board Jira, pack, convenciones) |

Si hay múltiples tipos afectados, usar el de mayor impacto según este orden de prioridad:
`spec-track` > `track` > `spec-mission` > `mission` > `jira-cards` > `summary` > `adr` > `template` > `agent` > `docs`

## Formato del título del PR

`[equipo] <tipo>: <descripción corta en español>`

- `equipo`: nombre del equipo en `teams/` (ej. `recruiting`). Usar `global` para cambios en `_templates/`, `agents/`, `decisions/` o archivos raíz.
- `tipo`: uno de los tipos de la tabla de arriba
- `descripción`: qué se hizo, en minúsculas, sin punto final

**Ejemplos:**

- `[recruiting] spec-track: agregar track portal-candidatos con goals y métricas`
- `[recruiting] mission: definir escenarios aceptación para api-estado-postulacion`
- `[recruiting] adr: documentar decisión REST vs GraphQL para endpoint postulaciones`
- `[recruiting] summary: cerrar misión 01 api-estado-postulacion`
- `[global] agent: agregar prompt orquestador`
- `[global] template: agregar Execution Map al template de jira-cards`
- `[global] docs: actualizar convenciones de naming en CLAUDE.md`

## Checklist según tipo de cambio

Al completar el template de PR, marcar solo los ítems relevantes al tipo de cambio detectado:

- **spec-track o track nuevos** → verificar que Mission Map esté en `track.md` con diagrama Mermaid
- **spec-mission o 1_mission nuevos** → verificar que `Status` sea `draft` y que `Dependencies` coincida con el Mission Map
- **1_mission listo para ejecutar** → verificar que `Status` sea `ready` y que `2_jira-cards.md` exista
- **3_summary.md actualizado** → verificar que refleje el estado actual de la misión
- **Misión cerrada** → verificar `Status: done` en `1_mission.md` y `spec-mission.md`; `3_summary.md` completo
- **Track cerrado** → verificar `track-summary.md` creado y `Status: closed` en `track.md`
- **ADR aceptado** → verificar que esté reflejado en el `track.md` o `1_mission.md` correspondiente
- **Cualquier archivo nuevo** → verificar que no queden campos `[placeholder]` sin completar
