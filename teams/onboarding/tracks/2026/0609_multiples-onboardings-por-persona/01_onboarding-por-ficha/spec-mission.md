# Spec Misión: Onboarding por ficha

**Track:** Soportar múltiples onboardings por persona
**Epic:** OB-356
**Owner:** PabloSSilvaS
**Reviewer:** EM
**Status:** ready
**Dependencias:** none

## Objetivo

Agregar el vínculo del onboarding a `Employee`, habilitando N procesos `in_progress` independientes por persona (uno por ficha), y actualizar la tabla de administración y la vista "Mi Onboarding" para reflejar la nueva cardinalidad.

## Contexto

Hoy la validación en `Onboarding::Process#onboarded_unique_active_process` impide más de 1 proceso `in_progress` por `User`, sin distinción de ficha. El campo `employee_id` ya existe en `onboarding_processes` con backfill completo (migración 20260603135130). No existe UNIQUE index en BD — la restricción es solo código Ruby, con race condition potencial bajo escritura concurrente.

Los scopes de `PersonOnboardingResource` (`with_started_onboarding`, `without_onboarding`, `with_finalized_onboarding`) asumen cardinalidad 1:1 Person:Process — incluyen `LIMIT 1` en el LATERAL JOIN y aplanan los datos del proceso como columnas del `Person`. Con la nueva regla de unicidad por `(onboarded_id, employee_id)`, la tabla debe mostrar N filas (una por ficha) en lugar de ocultar los procesos adicionales.

## Criterios de Aceptación

### Unicidad y modelo

- Se puede crear un proceso `in_progress` para cada combinación `(onboarded_id, employee_id)` distinta de la misma persona.
- No se puede crear un segundo proceso `in_progress` para la misma combinación `(onboarded_id, employee_id)`.
- Existe un UNIQUE index parcial en BD sobre `(onboarded_id, employee_id)` para procesos `in_progress` no descartados.
- La validación Ruby en `Process` valida por `(onboarded_id, employee_id)` y emite el error en el campo correcto.
- Un proceso nuevo al que se le asigno usuario siempre debe tener `employee_id` seteado; la creación falla con error explícito si `employee_id` es nil.
- 0% de pérdida de registros históricos verificado pre/post deploy.

### Tabla de administración

- La tabla muestra una fila por cada `Employee` perteneciente al `Person`. Una persona con dos fichas activas aparece en dos filas.
- El scope `without_onboarding` muestra fichas sin proceso activo — una persona con una ficha con onboarding y otra sin puede aparecer en ambos tabs.
- El scope `with_finalized_onboarding` muestra procesos finalizados por ficha, sin colapsar.
- Los filtros y ordenamientos de la tabla (área, cargo, estado, manager, avance) funcionan correctamente sobre la nueva cardinalidad.
- El patrón show del DS está validado con el equipo de Design System antes del lanzamiento.

### Mi Onboarding

- La vista "Mi Onboarding" del colaborador lista todos los procesos activos del `current_user`, uno por ficha.
- Un colaborador con una sola ficha activa no percibe cambio de comportamiento en "Mi Onboarding".
- Los scopes `for_employee_user` y `exists_for_employee_user?` mantienen su comportamiento para "ver todos mis procesos" (filtran solo por `onboarded_id`).

## Dependencias

- Validación del modelo de permisos: confirmar que crear un proceso vinculado a un `employee_id` específico no requiere un ability distinto sobre `Employee` para administradores de onboarding.
- Validación del patrón show.

## Preguntas Abiertas

- ¿Los administradores de onboarding tienen acceso a `Employee` via Ability existente, o se necesita una ability nueva para que el controller pueda asignar `employee_id`?
- ¿El patrón show para la tabla principal ya está definido en el DS o requiere diseño nuevo?
- ¿Cómo se comunica a los administradores que una persona ahora puede aparecer en múltiples filas?
