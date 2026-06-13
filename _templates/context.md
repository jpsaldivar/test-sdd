# Team Context: [Nombre del equipo]

**Jira Board:** [KEY]
**buk-webapp Pack:** `app/packs/<pack>/`
**Pack CLAUDE.md:** `app/packs/<pack>/CLAUDE.md` *(omitir si no existe)*

<!--
  Pack CLAUDE.md — ventajas y desventajas de tenerlo en buk-webapp:

  Ventajas:
  - Fuente única de verdad: patterns, entidades y convenciones viven donde está el código
  - Se mantiene actualizado en el mismo PR que cambia el código
  - Elimina duplicación con context.md — este archivo se reduce a puntero
  - El agente ejecutor lee solo el pack CLAUDE.md sin necesitar sdd-buk-docs

  Desventajas:
  - context.md ya no es standalone — requiere acceso a buk-webapp para el contexto técnico
  - Si el pack no tiene CLAUDE.md, todo el contexto técnico debe estar aquí

  Regla: si el pack tiene CLAUDE.md, este archivo solo contiene Jira Board, Pack path,
  Pack CLAUDE.md path, y recursos externos (links, dashboards). Todo lo técnico va al pack.
-->

## Recursos compartidos

- [Nombre] — [URL o path]
