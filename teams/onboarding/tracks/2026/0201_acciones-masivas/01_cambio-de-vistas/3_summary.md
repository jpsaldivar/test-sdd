# Resumen — Misión 01: Cambio de Vistas

**Status:** done
**Feature Flag:** `ob_cambio_de_vistas`
**Rollout:** 100% el 01/04/2026

## Qué se construyó

Refactorización completa de la vista principal de Onboarding: se migró el resource de `Employee` a `Person` como entidad base, habilitando la operación sobre personas sin ficha activa. Se establece la base visual y estructural que todas las misiones del track heredan.

## Cambio central: Employee → Person

El `PersonOnboardingResource` (Fiji resource) ahora se basa en `Person` en lugar de `Employee`. Esto permite:
- Ver colaboradores con ficha activa (Colaboradores)
- Ver personas sin ficha activa que tienen procesos (Colaboradores sin ficha)
- Operar masivamente sobre ambos grupos

## Estructura de tabs y scopes

```
Onboarding > Procesos
├── Colaboradores (con ficha)
│   ├── En curso        ← scope :with_started_onboarding
│   ├── Sin onboarding  ← scope :without_onboarding      (punto de entrada M02)
│   └── Finalizados     ← scope :with_finalized_onboarding
├── Colaboradores sin ficha
│   ├── Iniciados
│   ├── No iniciados    ← scope :current_pending          (punto de entrada M03)
│   └── Finalizados
└── Tareas
```

## Scopes técnicos (LATERAL JOINs)

Los scopes usan LATERAL JOINs para obtener el proceso más reciente por persona de forma eficiente. Son el contrato de acceso a datos que todas las misiones heredan:

- `:with_started_onboarding` — personas con proceso activo (in_progress, overdue, starting)
- `:without_onboarding` — personas con ficha activa sin proceso iniciado
- `:with_finalized_onboarding` — personas con proceso finalizado o cancelado
- `:current_pending` — procesos en estado `pending` (sin ficha, sin iniciar)

Índice compuesto en `onboarding_processes` para soportar la performance de estos scopes.

## Cambios al modelo `Onboarding::Process`

- Nuevo estado `cancelled(4)` al enum de status
- Formulario de inicio individual refactorizado (contextos: `employee`, `select_employee`, `manual`)

## Limitación conocida: campo `return_to`

El formulario de inicio de proceso usa `return_to` para saber a dónde redirigir al terminar:
- `'person_onboarding'` → `onboarding_processes_path`
- `'process_resource'` → `onboarding_processes_path` con tab sin_onboarded
- `'task_process_tracking'` → path de tracking de proceso
- `nil` (default) → pending → `edit_pending` / activo → `process_tasks`

## Rollout

Rollout gradual por olas: Interno → Pilotos → 25% → 50% → 75% → 100% (01/04/2026).
