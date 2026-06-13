# Resumen — Misión 03: Importador de Procesos (Inicio masivo con pre-ingreso)

**Status:** done
**Feature Flags:** `onboarding_feat_preingreso_masivo` + `onboarding_bulk_actions`
**Champion:** Rodolfo Jaramillo
**Kick Off:** 13/05/2026

## Qué se construyó

Tres flujos que resuelven la fricción del pre-ingreso acoplado a las plantillas de proceso:

1. **Desacople de plantillas**: se elimina el campo "pre-ingreso asociado" del formulario de `ProcessTemplate`. El pre-ingreso pasa a elegirse al momento de ejecutar el proceso, no al configurar la plantilla.
2. **Acción masiva "Enviar pre-ingreso e iniciar"**: desde la vista "Colaboradores sin ficha > No iniciados" (`current_pending`), el admin selecciona N procesos, elige la plantilla de pre-ingreso en un modal, y el sistema inicia todos los procesos con esa plantilla.
3. **Empresa obligatoria en importador**: la columna "empresa" del importador masivo pasa de opcional a obligatoria.

## Decisión clave de arquitectura

**Problema**: `GetPrealtaByRole` (usado en M02) falla cuando existen múltiples plantillas de pre-ingreso aplicables para el mismo área/rol, no puede elegir cuál usar.

**Alternativa A descartada**: extender `StartBulkProcesses` con `workflow_template_id` opcional. Riesgo alto de romper M02 ya en producción.

**Alternativa B elegida**: nuevo servicio independiente `StartBulkProcessesWithPreboarding` que reemplaza `GetPrealtaByRole` por el `workflow_template_id` que el usuario ya eligió. Separación limpia, cero riesgo de regresión.

## Flujo técnico (síncrono, a diferencia de M02)

```
IMPORTANTE: Esta misión es SÍNCRONA (no usa job en background)

Usuario selecciona procesos en current_pending
  → GET start_with_preboarding_modal
  → BulkStartWithPreboardingModalComponent (select2 con plantillas del país filtradas por accessible_by)
  → Usuario elige plantilla + confirma
  → POST start_with_preboarding
  → StartBulkProcessesWithPreboarding.call(processes, template_id, user, request)
    Para cada proceso:
      - Valida: email, manager, has_tasks_or_emails?
      - Si pasa: process.workflow_template_id = template_id → save → AddTasksAndEmailsFromTemplate → StartPrealta → FixStartProcessAndSentMail
      - Si falla: acumula en @processes_with_errors
    Si errors_count > 0 → flash error con detalle + redirect_to_scope
    Si no → flash notice 'éxito' + redirect_back
```

## Componentes clave

| Archivo | Rol |
|---------|-----|
| `packs/onboarding/core/app/services/onboarding/process/start_bulk_processes_with_preboarding.rb` | Servicio principal (síncrono) |
| `packs/onboarding/core/app/controllers/onboarding/bulk/processes_controller.rb` | Acciones `start_with_preboarding_modal` (GET) y `start_with_preboarding` (POST) |
| `packs/onboarding/core/app/components/onboarding/bulk/bulk_start_with_preboarding_modal_component.rb` | Modal con selector de plantilla (select2) |
| `packs/onboarding/core/app/resources/onboarding/processes/process_resource.rb` | Batch action agregada (gateada por `onboarding_feat_preingreso_masivo` + `onboarding_bulk_actions`) |
| `packs/onboarding/core/config/feature_flags.yml` | Flag `onboarding_feat_preingreso_masivo` |
| `packs/onboarding/core/config/routes/onboarding.rb` | Nuevas rutas |

## Sin migraciones de base de datos

No se crean modelos ni columnas nuevas. Se reutilizan `workflow_template_id`, `manager_id`, `manager_kind`, `status` de `Onboarding::Process`.

## Manejo de errores

- 1 solo error: va directo en `flash[:error]`
- Múltiples errores: se almacenan en `Rails.cache` y se ofrece modal con detalle. `build_error_message` construye HTML con lista de procesos fallidos + causa

## Limitaciones conocidas

- **Procesamiento síncrono**: riesgo de timeout en tenants con muchos procesos. Mitigación: activar primero en tenants pequeños. Solución definitiva pendiente: migrar a job asíncrono usando `StartBulkProcessesWithoutFichaJob` como patrón.
- **Una plantilla para todos**: no es posible asignar plantillas distintas por proceso en la misma operación masiva.

## Relación con M02

Esta misión opera sobre `ProcessResource` (procesos `current_pending`, sin ficha) mientras M02 opera sobre `PersonOnboardingResource` (personas `without_onboarding`, con ficha). Son flujos paralelos que convergen en el mismo sistema de inicio de onboarding pero con distinto punto de entrada y mecanismo de ejecución.

## Seguridad

- Acceso: `can? :edit, Onboarding::Process` — solo administradores de onboarding
- Queries pasan por `accessible_by(current_ability)` (límites de área/empresa)
- Plantillas de pre-ingreso también filtradas por `accessible_by(current_ability)`
