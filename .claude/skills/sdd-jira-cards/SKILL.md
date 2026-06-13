---
name: sdd-jira-cards
version: 1.0.0
description: Crea en Jira las tarjetas definidas en el 2_jira-cards.md de una misión (o de todas las misiones de un track), bajo el epic referenciado, respetando el orden de dependencias y enlazándolas. Actualiza cada 2_jira-cards.md con los links a las tarjetas creadas. Argumentos: <equipo> <track-slug> [<mission-slug>].
model: haiku
---

# sdd-jira-cards

Crea las tarjetas de Jira a partir del `2_jira-cards.md` de una misión, o de todas las misiones de un track. Las tarjetas se crean **bajo el epic** referenciado en la misión, **en orden de dependencias**, y se enlazan entre sí. Al final, escribe en cada `2_jira-cards.md` el link a cada tarjeta creada.

## Herramientas de Jira

**Prioriza las herramientas de Jira disponibles en `buk-webapp`** — el CLI `acli` de Atlassian (ver la skill `atlassian-cli`). Solo si `acli` no está instalado o no está autenticado, **recurre al MCP de Atlassian** (`mcp__claude_ai_Atlassian__*`). Si ninguno de los dos está disponible, detente y avísale al usuario.

A lo largo de estas instrucciones se nombran operaciones por su tool del MCP (`getJiraProjectIssueTypesMetadata`, `createJiraIssue`, `createIssueLink`, etc.); son la **operación a realizar**, no la herramienta obligatoria. Si usas `acli`, ejecuta el comando equivalente (crear issue con `--parent`, crear link de tipo `Bloquea`, listar tipos de issue, etc.).

## Uso

```
/sdd-jira-cards <equipo> <track-slug> [<mission-slug>]
```

- `track-slug` y `mission-slug` pueden ser parciales — la skill los encuentra sola. `mission-slug` puede ser el número (`01`) o parte del nombre.
- Si se omite `mission-slug`, se procesan **todas las misiones del track** en orden ascendente (01, 02, 03…), porque las misiones posteriores suelen depender de las anteriores.

Ejemplos:
- `/sdd-jira-cards recruiting adopcion-bb-analitica 02`
- `/sdd-jira-cards recruiting adopcion-bb-analitica` *(todas las misiones del track)*

## Instrucciones

Los argumentos en `$ARGUMENTS`:
- Primer token: **equipo**
- Segundo token: **track-slug** (puede ser parcial)
- Tercer token (opcional): **mission-slug** (puede ser parcial)

Si falta equipo o track, pregunta antes de continuar.

### 1. Localizar misión(es) y leer contexto

1. Lee `teams/<equipo>/context.md` y extrae el campo **`Jira Board`** (ej. `**Jira Board:** SEL`). **Este es el board que usa el equipo y la fuente de verdad para el `projectKey`** de todas las tarjetas — no lo deduzcas del `2_jira-cards.md`. Si `context.md` no existe o no tiene `Jira Board`, detente y pídelo.
2. Resuelve el track. Si se dio `mission-slug`, resuelve esa misión; si no, lista todas las carpetas `NN_*` del track y procésalas en orden ascendente.
3. Para cada misión, verifica que exista `2_jira-cards.md`. Si no existe, detente y pide que primero se genere con `/sdd-mission-technical`.

> El campo `**Tablero:**` dentro de `2_jira-cards.md` es solo informativo. Si difiere del `Jira Board` de `context.md`, **manda `context.md`** y avísale al usuario de la discrepancia.

### 2. Validar el epic (BLOQUEANTE)

Para **cada** misión a procesar:

- Lee el campo `**Epic:**` en `1_mission.md` **y** en `2_jira-cards.md`.
- El epic es válido solo si ambos archivos referencian la **misma clave real de Jira** (ej. `SEL-6810`).
- Si en cualquiera de los dos el valor es `pendiente`, está vacío, es un `[placeholder]`, o **no coincide** entre archivos:
  - **Detente. No crees ninguna tarjeta.**
  - Pídele al usuario la clave del epic.
  - Cuando la entregue, actualiza el campo `**Epic:**` en `1_mission.md` y en `2_jira-cards.md` con esa clave antes de continuar.

Verifica que el epic exista en Jira con `getJiraIssue`. Si no existe o no es de tipo `Epic`, detente y avísale al usuario.

> Si se procesa un track completo y distintas misiones referencian epics distintos, está bien: cada misión usa el suyo. Solo se exige que dentro de una misma misión `1_mission.md` y `2_jira-cards.md` coincidan.

### 3. Preparar el entorno Jira

1. Obtén el `cloudId` con `getAccessibleAtlassianResources` (o usa el hostname `buk.atlassian.net` directamente).
2. Obtén los tipos de issue del proyecto con `getJiraProjectIssueTypesMetadata` (proyecto = el `Jira Board` de `context.md`, paso 1).
3. **Determina el tipo de issue de cada card.** Si la card especifica `Tipo:`, usa ese tipo. **Si no lo especifica (campo ausente, vacío o placeholder), usa `Historia`.**
4. Obtén los tipos de link con `getIssueLinkTypes` y localiza el tipo de bloqueo. **En los tableros Buk en español se llama `Bloquea`** (outward: `Bloquea`, inward: `Bloqueada por`), no `Blocks`. Usa el `name` exacto que devuelva la API.

### 4. Idempotencia — no duplicar

Antes de crear, revisa si las tarjetas ya existen:
- Si `2_jira-cards.md` ya tiene una línea `**Jira:** [KEY](...)` en una card, esa card ya fue creada — sáltala.
- Como respaldo, puedes buscar con `searchJiraIssuesUsingJql` por `parent = <epic> AND summary ~ "<título>"`.

Solo crea las tarjetas que falten.

### 5. Construir el grafo de dependencias

Por cada misión, arma el DAG de dependencias a partir de:
- El campo `**Depende de:**` de cada card (ej. `T02, T03` o `—`).
- El `## Mapa de Ejecución` (diagrama Mermaid `graph LR`): cada flecha `T0X --> T0Y` significa "X bloquea a Y".

Ambas fuentes deben ser consistentes; si difieren, prioriza el `Mapa de Ejecución` y avisa de la discrepancia.

**Dependencias entre misiones (al procesar un track):** si una card referencia explícitamente una card de otra misión (ej. "se basa en la categoría de la misión 02, card 03"), enlázala también. Si solo hay una dependencia a nivel de misión sin card concreta, no inventes un link card-a-card: menciónalo en el resumen final.

### 6. Crear las tarjetas en orden topológico

Ordena las cards de modo que toda card se cree **después** de las que la bloquean. Para cada card, usa `createJiraIssue` con:
- `projectKey`: el `Jira Board` de `context.md` (paso 1).
- `issueTypeName`: el tipo mapeado en el paso 3.
- `parent`: la clave del epic.
- `summary`: prefijado con una etiqueta corta de la misión entre corchetes para distinguir el origen, ej. `[<Etiqueta misión>] <Título de la card>`. Deriva la etiqueta del nombre de la misión (corta y legible).
- `contentFormat: "markdown"`.
- `description`: el contenido de la card (Resumen, Contexto técnico, Archivos a modificar, Patrón de referencia, Criterios de Aceptación). Incluye también `Misión:` y `Estimación:` como primera línea.

Guarda el mapeo `card local (T0X) → clave Jira (KEY)` a medida que las creas.

### 7. Enlazar dependencias

Una vez creadas todas, crea un link por cada arista del DAG con `createIssueLink`:
- `type`: el nombre del tipo de bloqueo del paso 3 (ej. `Bloquea`).
- `inwardIssue`: la card **bloqueante** (la de la que sale la flecha).
- `outwardIssue`: la card **bloqueada** (a la que apunta la flecha).

Crea los links de las distintas aristas en paralelo cuando no dependan entre sí.

### 8. Actualizar 2_jira-cards.md

Para cada misión procesada, edita su `2_jira-cards.md`:
- Bajo cada encabezado de card (`## NN — Título`), agrega una línea `**Jira:** [KEY](https://buk.atlassian.net/browse/KEY)` justo antes de `**Tipo:**`.
- Si el campo `**Epic:**` se completó en el paso 2, asegúrate de que quede con la clave (no `pendiente`).

No toques las cards que ya tenían su link (idempotencia).

### 9. Resultado

Muestra un resumen:

```
Tarjetas creadas en Jira (epic <EPIC>, tablero <BOARD>):

Misión <NN_slug>:
  T01  →  SEL-XXXX  <título>
  T02  →  SEL-XXXX  <título>
  ...

Dependencias enlazadas (Bloquea):
  SEL-AAAA → SEL-BBBB
  ...

2_jira-cards.md actualizado con los links.
```

Si hubo dependencias a nivel de misión que no se pudieron enlazar a una card concreta, indícalo aquí. Recuerda al usuario que las tarjetas quedan sin asignar; los cambios en `2_jira-cards.md` están en el working tree sin commit.

## Reglas

- **Nunca** crear tarjetas si el epic no está validado en ambos archivos (paso 2).
- **Nunca** crear tarjetas sueltas fuera del epic.
- **Siempre** crear en orden de dependencias y enlazar después.
- **Siempre** dejar `2_jira-cards.md` con los links a las tarjetas creadas.
- No duplicar tarjetas ya creadas.
