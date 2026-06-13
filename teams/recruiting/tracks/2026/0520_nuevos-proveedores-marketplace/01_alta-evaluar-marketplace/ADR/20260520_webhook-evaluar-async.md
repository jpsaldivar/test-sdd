# ADR: Procesamiento asíncrono del webhook de Evaluar

**Fecha:** 2026-05-20
**Status:** proposed
**Owner:**
**Reviewer:**

## Contexto

El webhook de Evaluar notifica a Buk cuando un candidato completa una evaluación.
Al recibirlo, el sistema debe: buscar el assessment por `external_application_id`,
almacenar `raw_result`, parsear `EvaluationResult`, llamar a la API de Evaluar para
obtener el detalle (`GET /evaluation-web/composedcap/{id}/detail`) y generar el PDF
vía mutación GraphQL (`POST /v2/graphql`). Son al menos 3 llamadas HTTP externas en
el camino de respuesta.

Los webhooks de Hirint y EB Metrics se procesan de forma síncrona dentro del
controller action (`packs/recruiting/evaluations/app/controllers/evaluations/webhooks/`).
Hirint hace una llamada HTTP adicional al obtener el PDF; EB Metrics hace una llamada
extra para obtener los resultados. Ambos responden cuando ese procesamiento termina.

Evaluar añade una llamada HTTP más que Hirint (GraphQL para el PDF), y el contexto
de uso puede incluir procesos de selección masivos donde muchas evaluaciones finalizan
simultáneamente.

## Decisión

Procesar el webhook de Evaluar de forma **asíncrona**: el controller valida el
Bearer token, encola `ProcessEvaluarWebhookJob` (Sidekiq, `queue: :default`) y
responde HTTP 200 de inmediato. Todo el procesamiento real ocurre en background.

## Alternativas Consideradas

| Opción | Ventajas | Desventajas |
|--------|----------|-------------|
| **Síncrono** (patrón Hirint/EB Metrics) | Consistente con los dos providers existentes. Sin nueva capa de Jobs. Más simple de testear end-to-end. | Respuesta al proveedor bloqueada hasta completar 3+ llamadas HTTP externas. Bajo volumen simultáneo puede generar timeouts en el lado de Evaluar. |
| **Asíncrono (Job Sidekiq)** ← elegida | Controller responde HTTP 200 en <10 ms, independientemente de la carga. Previene timeouts en el proveedor bajo volumen alto. Patrón ya presente en el pack (`RevokeTestAccessLinksJob`, `ApplicationJob`). | Introduce una capa extra (Job). El fallo del job no se reporta en la respuesta HTTP. Requiere monitoreo en Sentry para detectar jobs fallidos. |

## Consecuencias

- **Positivas:** El endpoint es resiliente a picos de volumen (procesos masivos). Evaluar
  nunca experimenta timeouts por parte de Buk. Los reintentos de Sidekiq absorben
  fallos transitorios de la API de Evaluar.
- **Negativas:** Los errores de procesamiento (assessment no encontrado, PDF no disponible)
  no se reportan en la respuesta HTTP — solo via Sentry. El procesamiento real puede
  ocurrir segundos después de que el candidato complete la prueba.
- **Neutrales:** Si en el futuro Hirint o EB Metrics requieren el mismo tratamiento,
  la arquitectura queda demostrada como patrón a seguir en este pack.

## Actualización requerida

- [x] Reflejado en `1_mission.md` — Contexto
