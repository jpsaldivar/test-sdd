---
name: sdd-mission-technical
version: 2.0.0
description: Crea 1_mission.md, 2_jira-cards.md y pruebas.md para una misión que ya tiene spec-mission.md aprobado. Parte con análisis técnico de alto nivel, expone puntos abiertos, puede proponer ADRs. Argumentos: <equipo> <track-slug> <mission-slug>.
---

# sdd-mission-technical

Crea `1_mission.md`, `2_jira-cards.md` y `pruebas.md` para una misión cuyo `spec-mission.md` ya fue aprobado. El proceso comienza con un análisis técnico de alto nivel e identifica decisiones que pueden necesitar un ADR.

## Uso

```
/sdd-mission-technical <equipo> <track-slug> <mission-slug>
```

El `track-slug` y `mission-slug` pueden ser parciales — la skill los encuentra sola. El `mission-slug` puede ser el número (`01`) o parte del nombre.

Ejemplos:
- `/sdd-mission-technical recruiting eliminar-sti 01`
- `/sdd-mission-technical payroll finiquitos formulario-inicio`

## Instrucciones

Los argumentos en `$ARGUMENTS`:
- Primer token: **equipo**
- Segundo token: **track-slug** (puede ser parcial)
- Tercer token: **mission-slug** (puede ser parcial)

Si falta alguno, pregunta antes de continuar.

### 1. Verificar precondición

Busca la misión. Si no existe `spec-mission.md`, detente y pide que primero se cree con `/sdd-mission`.

Si ya existe `1_mission.md`, avisa al usuario y pregunta si quiere sobrescribirlo.

Lee en este orden:
1. `specs/teams/<equipo>/context.md`
2. `specs/teams/<equipo>/tracks/<YYYY>/<MMDD_track>/spec-track.md`
3. `specs/teams/<equipo>/tracks/<YYYY>/<MMDD_track>/track.md`
4. ADRs del track
5. `3_summary.md` de misiones upstream (según dependencias en spec-mission.md)
6. `specs/teams/<equipo>/tracks/<YYYY>/<MMDD_track>/<NN_mission>/spec-mission.md`

### 2. Exploración técnica

Busca en el codebase el código relevante para esta misión específica:
- Archivos que se deberán modificar o crear
- Tests existentes que cubren el área
- Patrones que se deben seguir o extender
- Casos edge identificables desde el código actual

### 3. Análisis de alto nivel — antes de generar

Presenta al usuario:

**Scope técnico:** qué archivos/módulos están involucrados y por qué.

**CA-NF propuestos:** cómo se aplican los RNF del track en el contexto de esta misión. Solo los RNF que esta misión aborda. Si no aplica ninguno, indicarlo explícitamente.

**Decisiones técnicas abiertas:** para cada una, indica si amerita un ADR. Si el usuario quiere resolverlo primero, dile que corra `/sdd-adr <equipo> <track-slug> "<decisión>"` y que vuelva aquí.

Pregunta: "¿El scope técnico cubre el objetivo del spec? ¿Hay CA-NF que ajustar o decisiones que resolver antes de generar?"

Espera respuesta. Si el usuario ajusta algo o resuelve decisiones, incorpora los cambios y vuelve a confirmar antes de generar.

### 4. Generar 1_mission.md

Una vez alineados, crea `1_mission.md` usando `specs/_templates/1_mission.md`:
- CA-NF derivados del análisis, vinculados a los RNF del track (si aplica)
- Especificación técnica: diagramas Mermaid (erDiagram, graph LR, sequenceDiagram según aplique), APIs si hay cambios de contrato, infraestructura si aplica
- Sección "Alternativas de Solución" solo si hay una decisión técnica no resuelta en el track — apuntar al ADR correspondiente
- Riesgos solo si hay riesgos específicos de esta misión no cubiertos en el track
- Instrumentación solo si esta misión introduce algo no cubierto en el track
- Sección "Documentación" con checklist de lo que queda desactualizado
- Dependencies igual a lo que dice spec-mission.md
- Puntos abiertos en "Preguntas Abiertas" — no inventar respuestas
- ADRs aceptados reflejados en "Contexto"
- Status: `draft`
- Sin `[placeholder]`

### 5. Generar 2_jira-cards.md

Crea `2_jira-cards.md` usando `specs/_templates/2_jira-cards.md`. El objetivo es que cada card sea autocontenida: un dev o agente puede implementarla sin leer el spec.

**Sección `Contexto de Implementación`** (al inicio, antes del mapa):
- `Pack path`: ruta exacta dentro de buk-webapp
- `Entidades clave`: modelos y servicios involucrados con su path en el pack
- `Patrones de referencia`: clases existentes que marcan el patrón a seguir
- `Decisiones de ADR vigentes`: decisiones aceptadas que afectan la implementación

**Por card:**
- Numeradas con cero-padding (01, 02, 03…)
- `Depende de`: lista las cards upstream o `—` si no tiene
- `Archivos a modificar`: paths concretos dentro del pack (omitir si la card crea archivos nuevos desde cero)
- `Patrón de referencia`: clase o archivo a seguir como modelo (omitir si no aplica)
- Criterios de aceptación concretos y verificables — sin referencias implícitas al spec
- Diagrama Mermaid `graph LR` maximizando paralelismo
- Estimaciones realistas
- Sin `[placeholder]`

### 6. Generar pruebas.md

Crea `pruebas.md` usando `specs/_templates/pruebas.md`:
- Casos de prueba de alto nivel para flujos completos de punta a punta
- Cada caso referencia el CA (de spec-mission.md) o CA-NF (de 1_mission.md) que valida
- Cubrir al menos: seguridad y permisos, correctitud, performance, regresión — solo si tienen un requisito que los respalde
- Identificar si la misión requiere mallas de seguridad y cuándo se ejecutan
- Sin `[placeholder]`

### 7. Resultado

Al terminar, muestra:
```
Misión técnica creada: specs/teams/<equipo>/tracks/YYYY/MMDD_<track>/NN_<slug>/
  1_mission.md   ✓  (Status: draft)
  2_jira-cards.md  ✓
  pruebas.md   ✓

Próximos pasos:
  1. Revisa 1_mission.md — ajusta CA-NF, especificación técnica y documentación
  2. Revisa pruebas.md — verifica cobertura de casos críticos y mallas de seguridad
  3. Abre PR para revisión técnica (owner: champion, reviewer: EM + arquitecto)
  4. Revisa 2_jira-cards.md y crea las cards en Jira (tablero: <Jira board>)
  5. Una vez aprobado el PR: cambia Status a "ready"
  6. Ejecuta: /sdd-execute <equipo> <track-slug> <NN_slug>
```
