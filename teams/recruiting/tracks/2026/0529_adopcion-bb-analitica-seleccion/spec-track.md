# Spec Track: Adopción Building Block People Analytics en Selección

**Equipo:** Recruiting
**Tablero Jira:** SEL
**Jira Card:**
**Owner:** Catalina Anguita
**Reviewer:** Juan Pablo Saldivar
**Status:** ready

## Comentario
Este no es un track, sino una misión sin track que se va a llevar a cabo en 3 etapas

## Problema

Los dashboards del módulo de Selección están construidos a mano en `packs/recruiting/statistics` y no usan el building block de Analítica Avanzada (People Analytics) que es el estándar de la plataforma. Como consecuencia, los datos de los procesos de selección, postulaciones y entrevistas no son consultables desde el constructor de widgets de Analítica Avanzada: las categorías del exportador personalizado no declaran `analytics_field`, los reportes no exponen el contrato del `QueryBuilder` y no están registrados en `QueryBuilder::TEMPLATES`. Hoy un cliente no puede construir un dashboard de selección (tiempo de cobertura, tasa de conversión por etapa, postulaciones por período) usando el BB, y la única forma de extraer información sigue siendo el exportador a Excel.

## Objetivos

- Exponer los datos de Selección (proceso, postulación, entrevistas) en el constructor de widgets de Analítica Avanzada, declarando `analytics_field` sobre las categorías existentes y registrando los report templates en el `QueryBuilder`.
- Reemplazar los dashboards manuales de `packs/recruiting/statistics` por dashboards construidos sobre el building block de dashboard de la plataforma, embebidos en la interfaz de Selección.

## No Objetivos

- No se habilitarán dashboards editables por el usuario desde la interfaz de Selección: el BB de dashboard, en su estado actual, sólo soporta dashboards fijos definidos en código.
- No se migrarán a analytics los campos cuya lógica Ruby no tiene contraparte limpia en SQL (relaciones muchos a muchos, URLs generadas en runtime). Quedan disponibles sólo en el exportador.
- No se modifica ni se altera el flujo de exportación existente (reportes personalizados descargables).

## Impacto en Usuarios

**Reclutadores y analistas:** podrán construir indicadores, widgets y dashboards sobre datos de procesos de selección directamente en Analítica Avanzada, y verán dashboards predefinidos embebidos en el módulo de Selección sin tener que navegar a People Analytics.

**Clientes que usan el exportador personalizado:** sin cambios. La migración a `analytics_field` es aditiva y no altera los reportes descargables.

## Métricas de Éxito

| Métrica | Línea Base | Objetivo |
|---------|-----------|---------|
| Categorías de Selección consultables desde el constructor de widgets de AA | 0 | Las 3 (proceso, postulación, entrevistas) operativas en producción |
| Dashboards de Selección sobre el BB de dashboard | 0 (ambos manuales) | Dashboard general y por proceso operativos detrás de feature flag |
| Reportes personalizados afectados por la migración | — | 0 regresiones |

## Restricciones

- El dashboard embebido es **fijo**: widgets, métricas y filtros se definen en código y no son editables por el usuario. Es una limitación estructural del BB de dashboard y debe comunicarse a Producto.
- La migración de campos (Etapa 1) se libera **sin feature flag** por ser un refactor transparente; un error en la migración impacta a todos los clientes. Sólo el dashboard (Etapa 3) va detrás de feature flag.
- La arquitectura de Analítica Avanzada (`analytics_field`, `QueryBuilder`, `TEMPLATES`) es la única vía soportada para exponer datos en el BB — no se altera el patrón existente.

## Misiones a Considerar

- **Migración de campos existentes a analytics_field** — declarar `analytics_field` sobre los campos que ya existen en las categorías de Selección, implementar el contrato del `QueryBuilder` en los reports y registrarlos en `TEMPLATES`. Habilita la consulta de datos de Selección en AA. Sin feature flag.
- **Creación de campos nuevos para analytics** — incorporar los `analytics_field` que hoy no existen y son necesarios para las métricas objetivo del dashboard. Depende de la primera. (Listado de campos pendiente de definir.)
- **Dashboard predeterminado en el módulo de Selección** — reemplazar los dashboards manuales por dashboards sobre el BB de dashboard, embebidos en la UI detrás de feature flag. Depende de las dos anteriores. (Widgets pendientes de definir.)

## Preguntas Abiertas

- ¿Qué métricas concretas debe mostrar cada dashboard (general y por proceso)? Esto define el listado de campos nuevos de la segunda misión.
- ¿Producto acepta la limitación de dashboards fijos (no editables) como estado inicial?
- ¿Se requiere instrumentación de adopción (Amplitude) para medir el uso de los nuevos dashboards?

## Referencias

- Plantilla técnica original de la misión "Adopción BB PA Selección" (v1.2): https://docs.google.com/document/d/13rzWL76t-210T7daPErRiuJvmiqlwGN2oY6vjxsIp3o/edit
- Subpack de estadísticas actual: `packs/recruiting/statistics`
- Building block de Analítica Avanzada: `packs/people_analytics/building_blocks/advanced_analytics`
- Building block de dashboard: `packs/plataforma/building_blocks/dashboard`
