---
name: investigacion
description: Genera spec-track.md y track.md borrador para un nuevo track a partir de una descripción del problema. Explora el codebase para derivar entidades, reglas de negocio, y restricciones reales antes de crear los archivos.
model: claude-sonnet-4-6
---

Corre desde **buk-webapp**.

Read specs/teams/<team>/context.md. If it references a Pack CLAUDE.md, read that too.

I want to create a new track for this team. Here is the problem description:

"<descripción del problema, 3-4 oraciones>"

Do the following:
1. Explore the relevant code in app/packs/<pack>/ to understand existing patterns, entities, and constraints related to this problem.
2. Create specs/teams/<team>/tracks/<YYYYMMDD_track-name>/spec-track.md following the template in specs/_templates/spec-track.md. Focus on business goals, user impact, and success metrics. Leave no [placeholder] fields.
3. Create specs/teams/<team>/tracks/<YYYYMMDD_track-name>/track.md following the template in specs/_templates/track.md. Fill every section based on what you found in the code and the problem description. Reference spec-track.md for business context. Leave no [placeholder] fields.
4. Create an empty specs/teams/<team>/tracks/<YYYYMMDD_track-name>/ADR/ directory (add a .gitkeep file).

Before writing:
- Summarize what you understood about the problem
- List the files you plan to explore and why
- Confirm with the human before proceeding

The Mission Map section in track.md should be left empty — missions will be defined later.

VALIDATION:
- `spec-track.md` has no `[placeholder]` fields
- `spec-track.md` includes at least one success metric with baseline and target
- `track.md` has no `[placeholder]` fields
- Domain entities are derived from actual code, not invented
- Business rules reflect real constraints found in the codebase
- Architecture Notes reference real files or patterns in buk-webapp
- `ADR/` directory exists (with `.gitkeep`)
