# Spec Misión: Dashboard predeterminado en el módulo de Selección

**Track:** Adopción Building Block People Analytics en Selección
**Epic:** SEL-6810
**Owner:** Catalina Anguita
**Reviewer:** Juan Pablo Saldivar
**Status:** ready
**Dependencias:** 01_migracion-campos-existentes, 02_campos-nuevos-analytics

## Objetivo

Reemplazar los dashboards manuales del módulo de Selección por dashboards construidos sobre el building block de dashboard de la plataforma, embebidos en la interfaz y habilitados detrás de feature flag.

## Contexto

Hoy existen dos dashboards en Selección construidos a mano en `packs/recruiting/statistics`: uno general (en el listado de procesos) y otro por proceso (en el detalle del proceso). Esta misión los reemplaza por dashboards sobre el BB de dashboard, que consumen los `analytics_field` migrados en las misiones 01 y 02. Es el único entregable del track que altera la experiencia visible del usuario, por lo que va detrás del feature flag `sel_feat_advanced_analytics_dashboard`. Al cerrar, se elimina el código de los dashboards antiguos. El dashboard resultante es **fijo**: sus widgets no son editables por el usuario.

## Criterios de Aceptación

- El módulo de Selección muestra un dashboard general (datos de todos los procesos del tenant) y un dashboard por proceso (filtrado a un proceso), ambos construidos sobre el BB de dashboard.
- Los dashboards son visibles sólo cuando el feature flag está activo y el usuario tiene el permiso correspondiente.
- Los dashboards muestran las métricas clave definidas sobre procesos, postulaciones y etapas.
- Al cerrar la misión, los dashboards manuales antiguos y su código asociado quedan eliminados.

## Fuera de Alcance

- Dashboards editables por el usuario (limitación estructural del BB; ver track).
- Creación de campos analytics (misiones 01 y 02).

## Dependencias

- Misión `01_migracion-campos-existentes` y misión `02_campos-nuevos-analytics`: los dashboards se construyen sobre los campos que esas misiones exponen.

## Preguntas Abiertas

- **[PENDIENTE — bloqueante]** Definir los widgets concretos de cada dashboard (general y por proceso): qué métricas, agrupaciones y filtros muestra cada uno.
- **[PENDIENTE]** ¿Se añade instrumentación de Amplitude para medir adopción? ¿Qué eventos?
- **[PENDIENTE]** Documentación de código y README del cambio.
- ¿Producto confirma la aceptación de dashboards fijos (no editables) como estado inicial?
