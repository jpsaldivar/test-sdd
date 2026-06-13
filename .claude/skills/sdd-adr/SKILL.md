---
name: sdd-adr
version: 1.0.0
description: Crea o analiza ADRs en sdd-buk-docs. Argumentos: <equipo> [<track-slug> [<mission-slug>]] "<decisión o pregunta>". Auto-determina el scope correcto y verifica conflictos con ADRs existentes.
---

# sdd-adr

Documenta una decisión arquitectónica o analiza el stack de ADRs existente. Opera en dos modos según los argumentos.

## Uso

**Modo crear** — documentar una decisión concreta:
```
/sdd-adr <equipo> "<decisión a documentar>"
/sdd-adr <equipo> <track-slug> "<decisión a documentar>"
/sdd-adr <equipo> <track-slug> <mission-slug> "<decisión a documentar>"
```

**Modo analizar** — revisar ADRs existentes (sin descripción de decisión):
```
/sdd-adr <equipo>
/sdd-adr <equipo> <track-slug>
/sdd-adr <equipo> <track-slug> <mission-slug>
```

Ejemplos:
- `/sdd-adr recruiting portal-candidatos "Usar REST en vez de GraphQL para el endpoint de estado de postulación"`
- `/sdd-adr recruiting portal-candidatos` ← analiza todos los ADRs del track
- `/sdd-adr recruiting "Los agentes siempre deben leer context.md antes de actuar"` ← scope equipo

## Instrucciones

Los argumentos están en `$ARGUMENTS`. Parsea:
- Primer token sin comillas: **equipo**
- Tokens intermedios sin comillas: **track-slug** y/o **mission-slug** (opcionales)
- Texto entre comillas o al final: **descripción de la decisión** (si está presente → Modo crear; si no → Modo analizar)

---

### Modo analizar

Lee todos los ADRs en el scope indicado (y sus padres) en este orden:
1. `specs/decisions/` (siempre)
2. `specs/teams/<equipo>/decisions/` (si existe)
3. `specs/teams/<equipo>/tracks/<YYYY>/<MMDD_track>/ADR/` (si se dio track)
4. `specs/teams/<equipo>/tracks/<YYYY>/<MMDD_track>/<NN_mission>/ADR/` (si se dio misión)

También lee las secciones "Architecture Notes" de `track.md` y/o `1_mission.md` del scope.

Produce un análisis estructurado:

#### Inventario de ADRs
Lista cada ADR con: path, status, decisión en una línea, fecha.

#### Mapa de dependencias
ADRs que se referencian o restringen entre sí. Señala:
- Decisiones de misión que contradicen un ADR de track o global
- ADRs `accepted` no reflejados en Architecture Notes
- ADRs `proposed` que bloquean avance

#### Gaps
Decisiones que parecen haberse tomado (evidentes en el código o en track.md/1_mission.md) pero sin ADR correspondiente.

#### Recomendaciones
Para cada gap o conflicto: crear nuevo ADR / actualizar existente / superseder.

No escribe ningún archivo. Espera instrucciones.

---

### Modo crear

#### 1. Determinar scope

El scope es el más específico que corresponda según los argumentos dados:
- Solo equipo → scope equipo: `specs/teams/<equipo>/decisions/`
- Equipo + track → scope track: `specs/teams/<equipo>/tracks/<YYYY>/<MMDD_track>/ADR/`
- Equipo + track + misión → scope misión: `specs/teams/<equipo>/tracks/<YYYY>/<MMDD_track>/<NN_mission>/ADR/`

#### 2. Leer ADRs existentes en el scope y padres

Lee todos los ADRs en el scope target y todos los scopes superiores. Verifica:
- ¿Ya existe un ADR que cubre esta decisión?
- ¿Algún ADR existente entra en conflicto con la decisión propuesta?

Si hay duplicado o conflicto, informa antes de continuar.

#### 3. Explorar el codebase

Busca en `app/packs/<pack>/` evidencia técnica relevante a la decisión. Las alternativas del ADR deben basarse en la realidad del código, no en opciones inventadas.

#### 4. Generar el borrador

Crea un borrador de ADR siguiendo `specs/_templates/adr.md`. Reglas:
- Status: `proposed`
- Al menos **dos alternativas reales** en la tabla de Alternatives Considered
- Toda afirmación técnica referencia un archivo concreto del codebase
- El slug es kebab-case descriptivo, máximo 4 palabras
- El nombre de archivo: `YYYYMMDD_<slug>.md` con la fecha de hoy

#### 5. Mostrar borrador y pedir aprobación

Muestra:
- El borrador completo del ADR
- El path donde se escribiría
- Los archivos (`track.md` o `1_mission.md`) que necesitan actualizar sus Architecture Notes una vez aceptado

Pregunta: "¿Escribo el archivo? (s/n)"

Si confirma: escribe el ADR con status `proposed`.
Recuerda al usuario: el status pasa a `accepted` solo cuando hay aprobación explícita, y en ese momento hay que actualizar Architecture Notes en el doc padre.
