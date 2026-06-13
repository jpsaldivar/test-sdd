# SDD Viewer — Spec

**Estado:** draft  
**Autor:** JP  
**Fecha:** 2026-06-11  
**Repositorio target:** `bukhr/sdd-buk-docs`

---

## Contexto

El flujo SDD (Spec-Driven Development) de Buk almacena los documentos de discovery y diseño técnico como archivos Markdown en GitHub. Esto funciona bien como fuente de verdad, pero rompe la colaboración durante las fases tempranas: PMs, stakeholders y personas no técnicas no tienen una interfaz cómoda para leer los docs y discutir ideas en tiempo real.

El flujo anterior usaba Google Docs, donde la escritura y la conversación ocurrían en el mismo espacio. Con GitHub esa capacidad se perdió: los PR comments llegan tarde, requieren entender Git, y no son accesibles para perfiles no técnicos.

El SDD Viewer resuelve esto con una aplicación web ligera que lee los archivos de una rama de GitHub y los presenta en una interfaz legible por cualquier persona, con comentarios por sección organizados como hilos independientes.

---

## Problema

1. Los PMs y stakeholders no técnicos no pueden colaborar fluidamente sobre los specs en GitHub.
2. Los comentarios en PRs llegan cuando el documento ya está avanzado, no durante el discovery.
3. No hay una vista que muestre el estado actual de un track/misión de forma legible sin abrir el repositorio.
4. Compartir un doc para revisión requiere que el receptor tenga acceso y contexto de GitHub.

---

## Objetivo

Construir un viewer web que:

- Renderice los archivos `.md` de un track o misión desde una rama de GitHub.
- Permita comentar por sección, con múltiples hilos independientes por sección.
- Sea accesible sin login mediante un link directo.
- Se integre con el SDD agent para que el link se genere automáticamente al abrir un track o misión.

---

## Usuarios

| Perfil | Necesidad principal |
|--------|-------------------|
| PM / Producto | Leer el spec, comentar en secciones, ver hilos abiertos |
| Stakeholder de negocio | Leer en lenguaje claro, dejar feedback sin tocar GitHub |
| Engineer / Champion | Ver estado del track, responder hilos técnicos |
| EM / Arquitecto | Revisión general, aprobar o pedir cambios por hilo |

---

## Alcance del MVP

### Incluido

- Render de Markdown de los archivos del track/misión desde la rama correspondiente.
- Sidebar lateral con hilos por sección (un hilo = un Issue de GitHub).
- Cada sección puede tener N hilos independientes.
- Replies dentro de un hilo (comments del Issue).
- Indicador visual en cada sección con hilos activos.
- Botón "nuevo hilo" que abre un Issue en GitHub con label y título pre-cargados.
- Navegación entre documentos del track/misión (spec-track, track, spec-mission, 1_mission).
- Estado del track visible (fase actual, rama).
- Acceso sin login — cualquiera con el link puede leer y comentar (comentar requiere nombre/alias libre, sin autenticación).
- El SDD agent genera el link al viewer al crear un track o misión.

### Fuera de scope (MVP)

- Edición de los archivos `.md` desde el viewer.
- Autenticación propia o SSO.
- Notificaciones por email o Slack al recibir comentarios.
- Aprobaciones formales o firma de docs.
- Historial de versiones del documento en el viewer.
- Vista mobile optimizada (se apunta a desktop en MVP).

---

## Diseño

### Layout general

```
┌──────────────┬────────────────────────┬───────────────────┐
│   Nav (200px) │   Contenido (flex)     │  Sidebar (280px)  │
│              │                        │                   │
│  Documentos  │  Render del .md        │  Hilos por        │
│  del track   │  con secciones         │  sección activa   │
│              │  identificadas         │                   │
│  Estado      │                        │  + botón nuevo    │
│  del track   │                        │    hilo           │
└──────────────┴────────────────────────┴───────────────────┘
```

### Nav lateral izquierda

- Lista los archivos del track/misión en orden de fase.
- Badge numérico con hilos abiertos por archivo.
- Badge en amarillo si hay hilos sin respuesta reciente (> 48h).
- Sección de estado: fase actual, nombre de la rama.

### Área de contenido

- Renderiza el Markdown con estilos limpios.
- Cada heading `##` es una sección identificable.
- Barra vertical izquierda a cada sección: gris por defecto, violeta si tiene hilos activos.
- Al hacer click en la barra o en el contador de hilos, el sidebar se enfoca en esa sección.
- El contador de hilos se muestra inline junto al título de la sección.

### Sidebar derecho

- Por defecto muestra todos los hilos del documento actual.
- Al seleccionar una sección, filtra los hilos de esa sección.
- Label de sección visible como encabezado del grupo.
- Cada hilo muestra:
  - Título del Issue (primer mensaje).
  - Preview del último comentario.
  - Avatares de participantes (iniciales).
  - Conteo de replies.
  - Estado: abierto (punto verde) / cerrado (punto gris).
- El hilo activo se expande mostrando todos los comments en orden cronológico.
- Botón "nuevo hilo en esta sección" al final de cada grupo.

### Nuevo hilo

Al hacer click en "nuevo hilo":
1. El viewer abre un modal con un campo de título y campo de comentario inicial.
2. Al confirmar, crea un Issue en GitHub via API con:
   - Título: el texto ingresado.
   - Label: `sdd:<equipo>/<track>/<seccion>` (pre-generado automáticamente).
   - Body: el comentario inicial + metadata de sección y documento.
3. El Issue aparece inmediatamente en el sidebar.

Para comentar sin cuenta de GitHub, el autor ingresa un alias libre. El comentario se guarda como reply del Issue con el formato `**[Alias]:** texto`.

---

## Modelo de datos

### Convención de labels en GitHub Issues

```
sdd:<equipo>/<track>/<seccion-slug>
```

Ejemplos:
```
sdd:recruiting/portal-candidatos/problema
sdd:recruiting/portal-candidatos/restricciones
sdd:onboarding/gestion-masiva/criterios-aceptacion
```

### Slug de sección

El slug se genera desde el heading `##`:

```
## Métricas de éxito  →  metricas-de-exito
## Fuera de scope     →  fuera-de-scope
```

### Estructura de un Issue

```
title:  "¿Reducción realista en 60%?"
labels: ["sdd:recruiting/portal-candidatos/problema"]
body:
  > Sección: Problema
  > Documento: spec-track.md
  > Rama: track/portal-candidatos

  [comentario inicial del autor]
```

### Relaciones

```
Documento .md
  └── Sección (## heading)
        └── Issue de GitHub [1..N por sección]
              └── Comments del Issue (hilo de replies)
```

---

## URL y routing

```
/<equipo>/<track>/                          → vista del track (spec-track + track.md)
/<equipo>/<track>/mision/<N>/               → vista de la misión
/<equipo>/<track>?doc=spec-track            → documento específico
/<equipo>/<track>?doc=spec-track&section=problema  → sección específica (deep link)
```

El SDD agent genera y comparte la URL base al crear el track o misión.

---

## Integración con SDD agent

Al ejecutar `/sdd-track <equipo> "<problema>"`, además de crear la rama y los archivos, el agent:

1. Crea la rama `track/<nombre>`.
2. Genera el link al viewer: `https://<dominio>/<equipo>/<track>`.
3. Imprime al final de su output:

```
Viewer listo para compartir:
https://sdd.buk.internal/recruiting/portal-candidatos

Comparte este link con el equipo para revisión y comentarios.
```

Lo mismo aplica para `/sdd-mission`.

---

## Stack técnico propuesto

| Capa | Tecnología | Justificación |
|------|-----------|--------------|
| Hosting | GitHub Pages (rama `gh-pages` de `sdd-buk-docs`) | Gratis, sin infra extra, dentro del mismo repo |
| Frontend | HTML + JS vanilla o React sin build step (via esm.sh) | Sin toolchain complejo, fácil de mantener |
| Render Markdown | `marked.js` (CDN) | Liviano, bien mantenido |
| Datos de docs | GitHub Contents API (lectura pública si el repo es público, token si es privado) | Sin backend |
| Comentarios/hilos | GitHub Issues API | Los Issues ya son el storage, sin DB extra |
| Autenticación para comentar | GitHub Personal Access Token del SDD agent (server-side proxy) o GitHub App | Los comentarios anónimos se postean via proxy con alias en el body |

### Consideración sobre repo privado

Si `sdd-buk-docs` es privado, las llamadas a la GitHub API requieren un token. Opciones:

- **Opción A:** Un GitHub App con permisos de lectura de contenido y lectura/escritura de Issues. El viewer llama a un proxy serverless (Cloudflare Worker o Vercel Edge Function) que agrega el token. Costo: mínimo.
- **Opción B:** Un token de solo lectura para contenidos + un token de escritura para Issues, configurados como variables de entorno en el proxy.

Para el MVP se recomienda Opción B por simplicidad.

---

## Tareas de construcción

### Fase 0 — Setup (1 día)

- [ ] Definir si el repo es público o privado y elegir estrategia de token.
- [ ] Crear rama `gh-pages` en `sdd-buk-docs` con un `index.html` placeholder.
- [ ] Configurar GitHub Pages apuntando a esa rama.
- [ ] Configurar proxy serverless si el repo es privado (Cloudflare Worker recomendado).
- [ ] Crear GitHub App o Personal Access Token con los permisos necesarios.

### Fase 1 — Render de documentos (2 días)

- [ ] Implementar routing por URL: `/<equipo>/<track>` y `/<equipo>/<track>/mision/<N>`.
- [ ] Leer lista de archivos del track desde GitHub Contents API usando la rama correspondiente.
- [ ] Renderizar Markdown con `marked.js`.
- [ ] Construir nav lateral con lista de documentos y estado del track.
- [ ] Identificar y marcar secciones `##` en el DOM con `data-section-slug`.
- [ ] Estilo limpio, legible en desktop.

### Fase 2 — Hilos y comentarios (3 días)

- [ ] Leer Issues de GitHub filtrados por label `sdd:<equipo>/<track>/*`.
- [ ] Agrupar Issues por sección (parsear el label).
- [ ] Construir sidebar con hilos por sección.
- [ ] Implementar expand/collapse de hilos.
- [ ] Indicador visual en secciones con hilos activos (barra lateral violeta).
- [ ] Click en sección → sidebar filtra por esa sección.
- [ ] Mostrar comments de cada Issue como replies del hilo.

### Fase 3 — Crear hilos y comentar (2 días)

- [ ] Modal "nuevo hilo": campos de alias, título y comentario inicial.
- [ ] Crear Issue via API con label y body formateado.
- [ ] Agregar reply a Issue existente via API.
- [ ] Actualizar sidebar inmediatamente tras crear hilo o reply (optimistic update).
- [ ] Validación básica de inputs (alias no vacío, título no vacío).

### Fase 4 — Integración con SDD agent (1 día)

- [ ] Modificar output de `/sdd-track` para incluir el link al viewer.
- [ ] Modificar output de `/sdd-mission` para incluir el link al viewer.
- [ ] Documentar la convención de URL en el README de `sdd-buk-docs`.

### Fase 5 — Pulido y piloto (2 días)

- [ ] Deep link a sección específica (`?section=<slug>`): el sidebar se abre en esa sección automáticamente.
- [ ] Estado visual de hilo cerrado vs abierto.
- [ ] Badge de hilos sin respuesta reciente (> 48h) en el nav.
- [ ] Probar con un track real con el equipo piloto.
- [ ] Recoger feedback y ajustar.

**Estimación total: ~11 días de desarrollo** (1 engineer, puede paralelizarse Fase 1 y 2 parcialmente).

---

## Criterios de aceptación

- [ ] Un PM puede abrir el link del viewer y leer el spec-track sin tocar GitHub.
- [ ] Un stakeholder sin cuenta de GitHub puede dejar un comentario con su nombre en una sección.
- [ ] Un hilo con 3 replies se muestra completo al expandirlo.
- [ ] Una sección con 2 hilos muestra el contador "2 hilos" y al hacer click el sidebar filtra correctamente.
- [ ] Al crear un nuevo track con el SDD agent, el output incluye el link al viewer.
- [ ] El viewer carga en menos de 2 segundos en una conexión normal.
- [ ] El link es compartible directamente (no requiere VPN ni login para leer).

---

## Riesgos y mitigaciones

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|-----------|
| GitHub API rate limit (60 req/h sin token) | Alta si hay muchos usuarios simultáneos | Usar token de lectura; cachear respuestas 60s en el cliente |
| Repo privado complica acceso sin login | Media | Proxy serverless con token de solo lectura para contenidos |
| Comentarios anónimos abusivos | Baja (uso interno) | Alias libre es suficiente para MVP; se puede agregar moderación después |
| SDD no prende y el esfuerzo fue en vano | Media | El viewer es útil independientemente del SDD; sirve para cualquier repo de docs |
| Secciones sin `##` no se identifican | Baja | Documentar la convención en el template de specs; el viewer muestra el doc completo igual |

---

## Decisiones tomadas

| Decisión | Alternativa descartada | Razón |
|----------|----------------------|-------|
| GitHub Issues como storage de comentarios | Supabase / Firebase | Sin infra extra para MVP; Issues ya están en el ecosistema del equipo |
| Una sección = N Issues (1 Issue por hilo) | Un Issue por documento con etiquetas de sección | Permite hilos completamente independientes por tema dentro de la misma sección |
| Sidebar fijo lateral | Comentarios inline / al inicio de sección | Más cercano a Figma/Notion; no interrumpe la lectura del doc |
| Acceso sin login para leer y comentar | Solo usuarios GitHub autenticados | Los stakeholders no técnicos son un usuario clave; no pueden tener fricción de login |
| GitHub Pages como hosting | Vercel / Railway / app separada | Sin infra extra; vive en el mismo repo |

---

## Referencias

- Diseño de referencia: mockup interactivo generado en sesión de diseño (2026-06-11)
- Diagrama de arquitectura: sesión de diseño (2026-06-11)
- Modelo de datos: sesión de diseño (2026-06-11)
- SDD README: `bukhr/sdd-buk-docs/README.md`
- GitHub Issues API: https://docs.github.com/en/rest/issues
- GitHub Contents API: https://docs.github.com/en/rest/repos/contents
