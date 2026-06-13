# Spec Misión: Creación de campos nuevos para analytics

**Track:** Adopción Building Block People Analytics en Selección
**Epic:** SEL-6810
**Owner:** Catalina Anguita
**Reviewer:** Juan Pablo Saldivar
**Status:** ready
**Dependencias:** 01_migracion-campos-existentes

## Objetivo

Incorporar los `analytics_field` que hoy no existen en las categorías de Selección y que son necesarios para construir las métricas objetivo de los dashboards.

## Contexto

Una vez migrados los campos existentes (misión 01), faltan campos que las métricas objetivo del dashboard requieren y que hoy no están en ninguna categoría del exportador. Esta misión los crea siguiendo el mismo contrato técnico de la misión 01 (declaración de `analytics_field`, mapeo en `ASSOCIATIONS`, registro implícito vía el template ya registrado). Sigue siendo un refactor aditivo, sin feature flag. El listado concreto de campos depende de qué métricas decida mostrar cada dashboard, lo que aún está pendiente de definir.

## Criterios de Aceptación

- Los campos nuevos definidos están disponibles en el constructor de widgets de Analítica Avanzada.
- Cada campo nuevo respeta los permisos del usuario y, si aplica, su disponibilidad por país.
- Los reportes personalizados y los campos ya migrados en la misión 01 no se ven afectados.

## Fuera de Alcance

- Construcción de dashboards o cambios de UI (misión 03).
- Re-migración de los campos ya cubiertos en la misión 01.

## Dependencias

- Misión `01_migracion-campos-existentes`: el contrato del `QueryBuilder` y el registro de templates deben estar en su lugar.

## Preguntas Abiertas

- **[PENDIENTE — bloqueante]** Definir el listado de campos nuevos a crear. Depende de las métricas objetivo de cada dashboard (ver misión 03 y Preguntas Abiertas del track).
- ¿Alguno de los campos nuevos requiere subqueries correlacionados (conteos, fechas calculadas) con impacto en performance? Identificarlos al definir el listado.
