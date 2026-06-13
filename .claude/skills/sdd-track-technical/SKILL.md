---
name: sdd-track-technical
version: 2.0.0
description: Crea track.md para un track que ya tiene spec-track.md aprobado. Parte con análisis de alto nivel, expone puntos abiertos, enforce ADR de alternativas antes de generar el documento. Argumentos: <equipo> <track-slug>.
---

# sdd-track-technical

Crea `track.md` para un track cuyo `spec-track.md` ya fue aprobado. El proceso comienza con un análisis técnico de alto nivel, identifica decisiones abiertas, y **requiere que exista `ADR/01_alternativas-solucion.md` antes de producir el documento definitivo**.

## Uso

```
/sdd-track-technical <equipo> <track-slug>
```

El `track-slug` puede ser parcial — la skill lo encuentra sola.

Ejemplos:
- `/sdd-track-technical recruiting eliminar-sti`
- `/sdd-track-technical payroll finiquitos`

## Instrucciones

Los argumentos están en `$ARGUMENTS`:
- Primer token: **equipo**
- Segundo token: **track-slug** (puede ser parcial)

Si falta alguno, pregunta antes de continuar.

### 1. Verificar precondición

Busca el track en `specs/teams/<equipo>/tracks/`. Si no existe `spec-track.md`, detente y pide al usuario que primero cree el spec con `/sdd-track`.

Si ya existe `track.md`, avisa al usuario y pregunta si quiere sobrescribirlo.

Lee en este orden:
1. `specs/teams/<equipo>/context.md`
2. `specs/teams/<equipo>/tracks/<YYYY>/<MMDD_track>/spec-track.md`
3. ADRs existentes en `specs/teams/<equipo>/tracks/<YYYY>/<MMDD_track>/ADR/`

### 2. Exploración técnica profunda

Explora el pack de buk-webapp relevante para:
- Modelos y entidades de dominio relacionados al problema
- Patrones de código existentes en el equipo
- Restricciones técnicas (dependencias de packs, tablas compartidas, servicios externos)
- Tests existentes que documenten el comportamiento actual

### 3. Análisis de alto nivel — antes de generar

Presenta al usuario un análisis estructurado:

**Entidades de dominio encontradas:** lista con descripción de cada una y referencia al archivo.

**Reglas de negocio identificadas:** lo que el código ya impone como invariante.

**Requisitos No Funcionales detectados:** restricciones de calidad específicas de este track que superan el estándar general (Performance, Seguridad, Auditoría, Escalabilidad, Mantenibilidad, Compatibilidad, Privacidad). Solo las que aplican.

**Decisiones técnicas abiertas:** aspectos donde hay más de una opción razonable. Para cada una:
  - Describe brevemente el trade-off
  - Indica si amerita un ADR antes de avanzar

**Mapa de misiones tentativo:** una secuencia rough derivada de la sección "Misiones a Considerar" del spec-track.md, sin comprometerse aún.

Pregunta: "¿Hay decisiones que quieras resolver con un ADR antes de continuar? ¿Algún punto técnico que no esté bien entendido?"

Espera respuesta. Si el usuario quiere un ADR, indícale que corra `/sdd-adr <equipo> <track-slug> "<decisión>"` y que luego vuelva aquí para continuar. Repite este ciclo hasta que el usuario indique que está listo.

### 4. Verificar ADR de alternativas (obligatorio)

Antes de generar `track.md`, verifica si existe `specs/teams/<equipo>/tracks/<YYYY>/<MMDD_track>/ADR/01_alternativas-solucion.md`.

**Si no existe:** informa al usuario que el ADR de alternativas es obligatorio en todo track:

```
⚠️  ADR de alternativas no encontrado.

Las alternativas de solución son obligatorias antes de generar track.md.
Crea el ADR con:

  /sdd-adr <equipo> <track-slug> "alternativas de solución"

Una vez creado y aceptado, vuelve a correr /sdd-track-technical para generar track.md.
```

Detente aquí. No generes `track.md` hasta que el ADR exista.

**Si existe:** continúa al paso 5.

### 5. Generar track.md

Una vez alineados y con el ADR de alternativas en su lugar, crea `track.md` usando `specs/_templates/track.md` como base:
- Entidades de dominio derivadas del código real, con referencias a archivos
- Reglas de negocio con evidencia del codebase
- RNF identificados en el análisis, solo los específicos del track
- Especificación de la solución: descripción + diagramas Mermaid (erDiagram, graph LR, sequenceDiagram según aplique)
- Sección "Alternativas de Solución" apuntando a `ADR/01_alternativas-solucion.md`
- Riesgos con tabla probabilidad/impacto/mitigación
- Instrumentación para métricas
- Mapa de misiones con grafo Mermaid (si hay claridad suficiente) + Estrategia de desarrollo con criterio de slicing, tabla de misiones y rollout técnico
- Puntos abiertos documentados explícitamente en "Preguntas Abiertas" — no inventar respuestas
- ADRs aceptados reflejados en "Notas de Arquitectura"
- Sin `[placeholder]`

### 6. Resultado

Al terminar, muestra:
```
track.md creado: specs/teams/<equipo>/tracks/YYYY/MMDD_<slug>/
  track.md  ✓

Próximos pasos:
  1. Revisa track.md — ajusta RNF, entidades, riesgos y preguntas abiertas
  2. Abre PR para revisión técnica (owner: arquitecto, reviewer: EM)
  3. Una vez aprobado el PR: /sdd-mission <equipo> <slug> "<descripción de la primera misión>"
```
