# Resumen — Misión 01: Inicio Masivo de Procesos

**Status:** done
**Epic:** OB-159
**Feature Flag:** `ob_inicio_masivo`
**Champion:** Felipe Sateler | **Responsable:** Santiago Lira
**Revisado por:** Juan Pablo Saldivar (09/04/2026)

## Qué se construyó

Flujo completo de inicio masivo de procesos de onboarding para personas con ficha activa. El usuario selecciona N personas desde el scope `without_onboarding` de `PersonOnboardingResource`, configura encargado y fecha de inicio en un modal, y el sistema crea los procesos síncronamente y completa la configuración en background.

## Componentes clave

| Archivo | Rol |
|---------|-----|
| `app/services/onboarding/process/bulk_start_for_employees.rb` | Fase 1 síncrona: validar personas + crear `Onboarding::Process` en estado `starting` |
| `app/jobs/onboarding/bulk_start_for_employees_job.rb` | Fase 2 async: resolver plantillas, crear tareas, asignar, notificar |
| `app/cells/onboarding/processes/bulk_start_modal_cell.rb` | Modal de configuración inicial (encargado + fecha de inicio) |

## Cambios al modelo `Onboarding::Process`

- Nuevo estado `starting(5)` al enum (estado transitorio durante construcción)
- Nueva columna `processing` (boolean, default: false) — bloquea acciones UI mientras el job lo construye
- Batchable desde `PersonOnboardingResource`: `batch_action :bulk_start`

## Patrón de dos fases (heredar en misión 04)

```
FASE 1 — síncrona (dentro del request):
  Para cada persona válida:
    → crear Onboarding::Process (status: starting, processing: true)
  Crear ExecutableLog (status: queued)
  Encolar BulkStartForEmployeesJob(process_ids, user_id)
  Retornar flash inmediato

FASE 2 — asíncrona (job en background):
  Por cada proceso en estado starting:
    TRANSACTION:
      → precargar templates según área/cargo
      → crear tareas y correos
      → asignar responsables
      → validar y ajustar notificaciones
    Éxito → status: in_progress, processing: false
    Error → rollback completo, eliminar proceso, registrar en ExecutableLog
  ExecutableLog → status: finished/failed, message: {started_count, errors[]}
```

## Concurrencia y advisory lock

- Llave: `"onboarding_massive_start"` — solo 1 job masivo activo por tenant
- Segunda acción se encola y ejecuta automáticamente al terminar la anterior
- Al inicio de cada ejecución: limpieza de procesos stuck en `starting` del job anterior

## Contrato ExecutableLog.message

```json
{
  "started_count": 95,
  "errors": [
    { "person_id": 123, "name": "Juan Pérez", "reason": "Se requiere un cargo" }
  ]
}
```

Misión 04 debe respetar este esquema al persistir resultados parciales.

## Notificaciones consolidadas

`NotifyManagerAssignationNotification` y `NotifyTasksAssigneeAssignationNotification` fueron extendidas para aceptar `processes:` (array). Envían 1 correo consolidado por receptor en vez de N correos individuales. El cambio es aditivo — la invocación individual sigue funcionando.

## UI: WorkerStatus + Notify + Alert

- **WorkerStatus** polea cada 3s mientras el job corre
- **Notify** (widget persistente) muestra "Estamos [Acción] los [Elemento] seleccionados" con estado en cola / en progreso / finalizado
- **Alert** post-ejecución tiene 4 variantes según `ExecutableLog.message`:
  - Éxito Total: "Procesamos con éxito los X elementos seleccionados"
  - Éxito Parcial < 3 errores: lista inline de usuarios y motivo
  - Éxito Parcial ≥ 3 errores: "Revisar reporte de errores" (modal detalle)
  - Error Total: "Vuelve a intentarlo en unos minutos"

## Errores de validación (Fase 1)

| Causa | Mensaje |
|-------|---------|
| Sin usuario | "Se requiere un usuario" |
| Sin empleado activo | "Se requiere un empleado" |
| Sin cargo (Job) | "Se requiere un cargo" |
| Sin encargado resolvable | "Se requiere un encargado" |
| Usuario desactivado | "Usuario no activado" |
| Ya tiene proceso activo | "Ya tiene un proceso activo" |
| Sin plantilla compatible | "Se requiere al menos una plantilla de proceso" |

## Limitaciones conocidas

- No hay auto-refresh al terminar el job; el usuario debe hacer clic en "Revisar cambios"
- WorkerStatus invisible en lotes pequeños (job termina en < 3s)
- Fecha de ingreso vs. fecha de inicio del onboarding no resuelta estructuralmente (regla provisional: fecha del último cargo)

## Prerequisito: Cambio de Vistas (CdV)

Esta misión requería `ob_cambio_de_vistas` activa (100% desde 01/04/2026). CdV entregó:
- `PersonOnboardingResource` basado en `Person` (no `Employee`)
- Scopes con LATERAL JOINs: `:with_started_onboarding`, `:without_onboarding`, `:with_finalized_onboarding`
- Estructura de tabs: Colaboradores | Colaboradores sin ficha | Tareas
- Sub-scopes Colaboradores: En curso | Sin onboarding | Finalizados
- Sub-scopes sin ficha: Iniciados | No iniciados | Finalizados
- Estado `cancelled(4)` en `Onboarding::Process`
- Formulario de inicio refactorizado (contextos: `employee`, `select_employee`, `manual`)

## Rollout

| Fase | Fecha |
|------|-------|
| Interno (Buk.buk + Demos) | 18/03/2026 |
| Clientes beta (pumachile, atentochile, salfa, aiep, italco, leangroup) | 23/03/2026 |
| 25% | 25/03/2026 |
| 50% | 27/03/2026 |
| 75% | 30/03/2026 |
| 100% | 01/04/2026 |
