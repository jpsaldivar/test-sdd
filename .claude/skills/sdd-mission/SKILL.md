---
name: sdd-mission
version: 2.0.0
description: Crea el spec de una nueva misión (spec-mission.md) mediante discovery interactivo. Solo genera el documento de negocio — el técnico (1_mission.md + 2_jira-cards.md) se crea después con /sdd-mission-technical una vez aprobado el PR. Argumentos: <equipo> <track-slug> "<descripción de la misión>".
---

# sdd-mission

Crea `spec-mission.md` para una nueva misión mediante un proceso de discovery interactivo. No genera `1_mission.md` ni `2_jira-cards.md` — esos documentos son responsabilidad del champion y tienen su propio flujo.

## Uso

```
/sdd-mission <equipo> <track-slug> "<descripción de la misión>"
```

El `track-slug` puede ser parcial — la skill lo encuentra sola.

Ejemplos:
- `/sdd-mission recruiting eliminar-sti "Auditoría completa de modelos STI y propuesta de patrón de reemplazo"`
- `/sdd-mission payroll finiquitos "Implementar el formulario de inicio de finiquito"`

## Instrucciones

Los argumentos están en `$ARGUMENTS`. Parsea así:
- Primer token: **equipo**
- Segundo token: **track-slug** (puede ser parcial)
- Resto: **descripción de la misión**

Si alguno falta, pregunta antes de continuar.

### 1. Encontrar el track

Busca dentro de `specs/teams/<equipo>/tracks/` un directorio cuyo nombre contenga el track-slug. Si hay más de uno, muéstralos y pide que el usuario elija. Si no hay ninguno, avisa y detente.

### 2. Leer contexto completo

Lee en este orden:
1. `specs/teams/<equipo>/context.md`
2. `specs/teams/<equipo>/tracks/<YYYY>/<MMDD_track>/spec-track.md`
3. `specs/teams/<equipo>/tracks/<YYYY>/<MMDD_track>/track.md` (si existe)
4. ADRs del track
5. Status de misiones existentes — para detectar dependencias

### 3. Determinar número de secuencia

Cuenta los directorios `NN_*` existentes dentro del track. La nueva misión es el siguiente número con cero-padding de dos dígitos.

### 4. Discovery — preguntas antes de generar

Presenta al usuario el objetivo que entendiste (2 líneas) y haz **hasta 3 preguntas** para completar el spec:
- **Objetivo concreto:** ¿qué entrega exactamente esta misión y qué valor de negocio crea al terminar?
- **Criterios de aceptación:** ¿cómo sabremos que está terminada desde el punto de vista del negocio?
- **Fuera de alcance:** ¿qué queda explícitamente fuera de esta misión para no inflar el scope?

Espera la respuesta. Si el usuario quiere profundizar, sigue dialogando hasta que indique que está listo.

### 5. Confirmar

Muestra:
- Path propuesto (`NN_<slug>`)
- Dependencias detectadas del Mission Map (o "ninguna")
- Resumen de 2 líneas del objetivo

Pregunta: "¿Procedo? (s/n)"

### 6. Crear archivos

Solo si confirma:

1. Crea `specs/teams/<equipo>/tracks/<YYYY>/<MMDD_track>/NN_<slug>/spec-mission.md` usando `specs/_templates/spec-mission.md`. Incorpora las respuestas del discovery. Sin historias de usuario — las historias son responsabilidad de `1_mission.md`. Sin `[placeholder]`.
2. Crea `ADR/.gitkeep` dentro de la carpeta de la misión.

**No crear `1_mission.md` ni `2_jira-cards.md`** — esos documentos se crean con `/sdd-mission-technical` después de que el PR del spec sea aprobado.

### 7. Resultado

Al terminar, muestra:
```
Spec creado: specs/teams/<equipo>/tracks/YYYY/MMDD_<track>/NN_<slug>/
  spec-mission.md  ✓
  ADR/             ✓

Próximos pasos:
  1. Revisa spec-mission.md — ajusta objetivo, contexto y criterios de aceptación
  2. Abre PR para revisión (owner: PM, reviewer: equipo)
  3. Una vez aprobado el PR: /sdd-mission-technical <equipo> <track-slug> <NN_slug>
```
