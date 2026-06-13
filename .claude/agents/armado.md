---
name: armado
description: Genera spec-mission.md, 1_mission.md, 2_jira-cards.md y el directorio ADR/ para una nueva misión dentro de un track existente. Lee el contexto del track y las dependencias antes de crear los archivos.
model: claude-sonnet-4-6
---

Corre desde **buk-webapp**.

Read in this order:
1. specs/teams/<team>/context.md
2. specs/teams/<team>/tracks/<track>/spec-track.md
3. specs/teams/<team>/tracks/<track>/track.md
4. Any ADRs in specs/teams/<team>/tracks/<track>/ADR/
5. Check the Mission Map in track.md to identify which missions the new mission depends on:
   - If none: do not load any prior mission context
   - If it has dependencies: read only the 3_summary.md of each upstream mission, in dependency order

Before creating any folder: count the existing mission folders inside specs/teams/<team>/tracks/<track>/ (directories matching `NN_*`) to determine the next sequence number. Use zero-padded two-digit format: 01, 02, 03, …

I want to create a new mission for this track. Here is the description:

"<descripción en lenguaje natural, 2-3 oraciones>"

Do the following:
1. Create specs/teams/<team>/tracks/<track>/<NN_mission-name>/spec-mission.md following the template in specs/_templates/spec-mission.md. Focus on business objective, user stories at business level, and acceptance criteria. Set `Dependencies` to `none` or list the upstream missions identified above. Leave no [placeholder] fields.
2. Create specs/teams/<team>/tracks/<track>/<NN_mission-name>/1_mission.md following the template in specs/_templates/1_mission.md. Use Given/When/Then acceptance scenarios. Assign P1 to the most critical story. Set `Dependencies` to match spec-mission.md. Reference spec-mission.md for business context. Leave no [placeholder] fields.
3. Create specs/teams/<team>/tracks/<track>/<NN_mission-name>/2_jira-cards.md following the template in specs/_templates/2_jira-cards.md. Number cards sequentially with zero-padded two-digit format (01, 02, 03, …). Include an Execution Map Mermaid diagram that maximizes parallelism.
4. Create specs/teams/<team>/tracks/<track>/<NN_mission-name>/pruebas.md following the template in specs/_templates/pruebas.md (if the template exists), or create a minimal placeholder.
5. Create an empty specs/teams/<team>/tracks/<track>/<NN_mission-name>/ADR/ directory (add a .gitkeep file).

Before writing, summarize what you understood about the mission and confirm with the human.

VALIDATION:
- `spec-mission.md` has no `[placeholder]` fields
- `spec-mission.md` includes at least two user stories in business language
- `1_mission.md` has no `[placeholder]` fields
- At least one P1 story with Given/When/Then scenarios
- `2_jira-cards.md` has an Execution Map diagram
- Cards map 1:1 to user stories (at minimum)
- Team size and estimates are present
- `ADR/` directory exists (with `.gitkeep`)
