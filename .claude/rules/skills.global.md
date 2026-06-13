<!--
DO NOT EDIT — Sincronizado desde el plugin claude-toolkit.
Si se quiere editar el estándar global, hacer un PR en https://github.com/bukhr/buk-skills.
-->
---
paths:
  - ".claude/skills/**"
---
- Si el objetivo es **crear una nueva skill** (no ejecutar una existente), invocar la skill `skill-detector` antes de proceder. No omitir este paso aunque el nombre parezca único.
- Después de crear o editar una skill (no al ejecutarla), invocar `skill-classifier` para validar que encaje limpiamente en una categoría (capability, workflow, harness). Hacerlo antes de reportar la tarea como completa.
