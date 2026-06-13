# Misión: Dashboard predeterminado en el módulo de Selección

**Track:** Adopción Building Block People Analytics en Selección
**Epic:** SEL-6810
**Owner:**
**Reviewer:**
**Status:** ready
**Dependencias:** 01_migracion-campos-existentes, 02_campos-nuevos-analytics

## Objetivo

Construir los dashboards general y por proceso de Selección sobre el BB de dashboard, embebidos en la UI detrás de feature flag, y eliminar los dashboards manuales antiguos.

## Contexto

Los dashboards actuales viven en `packs/recruiting/statistics`: el general en `/seleccions?active_tab=estadisticas` (agrega datos de todos los procesos del tenant) y el de proceso en `/seleccions/:id/etapas?type_tab=statistics` (filtrado a un proceso). Esta misión los reemplaza por clases sobre `Dashboards::BaseDashboard` que consumen los report templates migrados en las misiones 01 y 02. Es el único entregable con cambio visible, por lo que va detrás de `sel_feat_advanced_analytics_dashboard`.

## Criterios de Aceptación No Funcionales

| ID CA-NF | RNF de origen | Criterio de aceptación no funcional |
|----------|--------------|--------------------------------------|
| CA-NF-01 | RNF-01 | El dashboard hereda los permisos del `QueryBuilder` (`accessible_by`); no expone datos que el usuario no puede ver. El acceso a los tabs se controla con `current_ability.can? :show, :recruiting_analytics`. |
| CA-NF-02 | RNF-03 | El dashboard fijo ejecuta sus widgets al cargar; si algún widget es lento bloquea la carga. Evaluar carga asíncrona por widget si el tiempo de respuesta lo requiere. |

## Especificación Técnica

### Dashboard Resource

Dos clases que heredan de `Dashboards::BaseDashboard` en `packs/recruiting/statistics`:

- **`Recruiting::GeneralStatisticsDashboardResource`**: dashboard general, sin filtro de proceso.
- **`Recruiting::ProcessStatisticsDashboardResource`**: dashboard por proceso. Recibe el ID del proceso vía `request_params[:seleccion_id]` y lo inyecta como filtro en todos sus indicadores. El ID llega desde `params` del controller sin configuración adicional.

Ambas incluyen `Analytics::Widgets::Builders::Factory` para usar el DSL de widgets de AA y definen sus indicadores sobre los templates migrados en las misiones 01 y 02.

### Controller

`Recruiting::StatisticsController` (ya existe) se reemplaza, con `authorize_resource` simbólico + `include ::Dashboards::RenderDashboard`.

```ruby
class Recruiting::StatisticsController < ApplicationController
  authorize_resource :recruiting_analytics, class: false
  include ::Dashboards::RenderDashboard

  def general_statistics
    render_dashboard(Recruiting::GeneralStatisticsDashboardResource)
  end

  def statistics
    render_dashboard(Recruiting::ProcessStatisticsDashboardResource)
  end
end
```

### Rutas

Reemplazo en `packs/recruiting/statistics/config/routes/recruiting_statistics.rb`. Singular resource para el general; ruta anidada bajo el proceso para el de proceso.

```ruby
resource :general_statistics, only: [:show], controller: 'statistics', action: :general_statistics
resources :seleccions, only: [] do
  resource :statistics, only: [:show], controller: 'statistics', action: :statistics
end
```

### Integración con el Fiji resource

Cada dashboard se expone como un tab en el resource correspondiente, con guardia de feature flag y permiso.

```ruby
# En el resource del listado de selecciones (tab general)
tab title: I18n.t('...tabs.analytics'),
    path: -> { general_statistics_path },
    visible: -> { Buk::Feature.enabled?(:sel_feat_advanced_analytics_dashboard) },
    can: -> { current_ability.can? :show, :recruiting_analytics }

# En el resource de detalle del proceso (tab por proceso)
tab title: I18n.t('...tabs.analytics'),
    path: -> { seleccion_statistics_path(seleccion_id: model.id) },
    visible: -> { Buk::Feature.enabled?(:sel_feat_advanced_analytics_dashboard) },
    can: -> { current_ability.can? :show, :recruiting_analytics }
```

### Widgets

DSL de referencia (ver `packs/onboarding/core/app/dashboard_resources/onboarding/analytics/procesos_dashboard_resource.rb`):
`card Analytics::Widgets::Cards::Types::Simple` (KPI), `chart Analytics::Widgets::Charts::Types::{Doughnut,Line,Bar,Treemap,Funnel}`, indicador con `template`, `selected_variables` (`function: :count_distinct | :avg`), `group_by` (`date_trunc: :month | :week`), `filters` y `transform_keys`. Los KPI de ratio (aceptadas/emitidas) se implementan como card propia con `Analytics::Metrics::Dsl::MetricDsl` (dos `indicator` + `formula`, `format :percentage`), patrón `Analytics::Widgets::Cards::Resources::AbsenteeismRate`.

Cada variable referencia `categoria.campo`. Los campos provienen de las misiones 01 (M1) y 02 (M2).

**Dashboard general** (`Recruiting::GeneralStatisticsDashboardResource`, sin filtro de proceso):

| # | Widget | Tipo | Template | Variable(s) / group_by / filtro |
|---|--------|------|----------|----------------------------------|
| 1 | Vacantes abiertas | Card | `seleccion_report` | `count_distinct(seleccion.id)`; filtro `seleccion.estado in [pendiente, iniciado]` |
| 2 | Candidatos por proceso | Card | `seleccion_report` | `avg(seleccion.numero_postulantes)` |
| 3 | Time to hire promedio | Card | `postulacion_report` | `avg(postulacion.time_to_hire)` (M2) |
| 4 | Cartas aceptadas / emitidas | Card % (ratio) | `postulacion_report` | `count_distinct(carta_oferta.oferta_id)` filtro `oferta_aceptada='Si'` / idem filtro `oferta_emitida='Si'` * 100 (M2) |
| 5 | Pasaron 1ª etapa por mes | Línea | `seleccion_report` | `count_distinct(postulante_time_line.qualified_postulante_id)`; group_by `postulante_time_line.fecha_ingreso_etapa` `date_trunc: :month`; filtro `etapa_proceso.posicion` = primera (M2) |
| 6 | Distribución estado de proceso | Dona | `seleccion_report` | `count_distinct(seleccion.id)`; group_by `seleccion.estado` |
| 7 | Carga de candidatos por reclutador | Treemap | `postulacion_report` | `count_distinct(postulante.postulante_id)`; group_by `recruiter.recruiter_name` (POC) |
| 8 | Time to hire por reclutador | Barra | `postulacion_report` | `avg(postulacion.time_to_hire)`; group_by `recruiter.recruiter_name` (M2+POC) |
| 9 | Postulantes por fuente | Barra | `postulacion_report` | `count_distinct(postulante.postulante_id)`; group_by `postulacion.referrer` |
| 10 | Tasa de aceptación mes a mes | Línea | `postulacion_report` | aceptadas/emitidas por mes; group_by `carta_oferta.sent_date` `date_trunc: :month` (M2) |
| 11 | Género de contratados | Dona | `postulacion_report` | `count_distinct(postulante.postulante_id)`; group_by `postulante.sexo`; filtro contratado |
| 12 | Rango etario de contratados | Barra | `postulacion_report` | `count_distinct(postulante.postulante_id)`; group_by `postulante.rango_etario`; filtro contratado (M2) |

**Dashboard por proceso** (`Recruiting::ProcessStatisticsDashboardResource`, todos los indicadores filtran por `seleccion.id = request_params[:seleccion_id]`):

| # | Widget | Tipo | Template | Variable(s) / group_by |
|---|--------|------|----------|------------------------|
| 1 | Total postulantes | Card | `seleccion_report` | `count_distinct(postulacion.id)` o `max(seleccion.numero_postulantes)` |
| 2 | Time to hire del proceso | Card | `postulacion_report` | `avg(postulacion.time_to_hire)` (M2) |
| 3 | Time to fill del proceso | Card | `seleccion_report` | `max(seleccion.time_to_fill)` (M2) |
| 4 | Cartas aceptadas / emitidas | Card % (ratio) | `postulacion_report` | aceptadas / emitidas * 100 (M2) |
| 5 | Funnel de conversión por etapa | Funnel | `seleccion_report` | `count_distinct(postulante_time_line.qualified_postulante_id)`; group_by `etapa_proceso.nombre` ordenado por `etapa_proceso.posicion` (M2) |
| 6 | Duración de cada etapa | Barra | `seleccion_report` | `avg(etapa_proceso.stage_continuous_days)`; group_by `etapa_proceso.nombre` |
| 7 | Volumen de postulaciones por semana | Línea | `postulacion_report` | `count_distinct(postulacion.id)`; group_by `postulacion.fecha_postulacion` `date_trunc: :week` (M2) |

**Confirmables:**
- Filtro "contratado" (#11, #12 general): por `postulacion.status = 'Contratado'` (campo calculado) o por `etapa_proceso.final_step`.
- Distribución de estado (#6 general): mostrar los 4 estados del enum o colapsar `pendiente + iniciado` en "Abierto" vía `transform_keys`.
- "Primera etapa" (#5 general): filtro por `posicion` mínima del proceso.
- Tasa de aceptación mes a mes (#10 general): un ratio sobre una serie temporal puede requerir post-proceso (dos series por mes y división en `transform_keys`); validar el soporte del builder de línea.

### Clean-up

Al completar la misión, limpiar `packs/recruiting/statistics`:
- Eliminar cells: `ContentGeneralStatisticsCell`, `GeneralStatisticsCell`, `StatisticsCell`, `ChartCell`.
- Eliminar servicios: `Chart::Generate`, `Indicator::Generate`, `Helper`.
- Antes, eliminar `Recruiting::SelectionProcess::GenerateIndicators` en `packs/recruiting/core` (consume `Indicator::Generate` y tiene un TODO explícito de remoción; ningún otro archivo lo referencia).
- Eliminar tests y locales asociados.
- Verificar con `grep` que no queden referencias vivas en el codebase.

### Feature Flag

`sel_feat_advanced_analytics_dashboard` habilita los tabs de dashboard en los resources de Selección. Requiere rollout controlado por ser el único cambio visible para el usuario.

### Infraestructura

Entrada en `package_todo.yml` de `packs/recruiting/core` para la referencia a `packs/plataforma/building_blocks/dashboard` (requerida por el dashboard fijo). Sin cambios en `package.yml`.

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Un widget lento bloquea la carga completa del dashboard | Media | Medio | Evaluar carga asíncrona por widget; aplicar `LIMIT` en indicadores de tipo listado |
| Clean-up incompleto deja referencias muertas o rompe vistas | Media | Medio | `grep` exhaustivo de referencias antes de eliminar; eliminar `GenerateIndicators` primero |

## Instrumentación para Métricas

**[PENDIENTE]** Se propone conversar con el equipo de People Analytics para añadir marcas de Amplitude sobre el uso de los dashboards.

## Documentación

- [ ] **[PENDIENTE]** README del pack `packs/recruiting/statistics` actualizado
- [ ] **[PENDIENTE]** Documentar la limitación de dashboard fijo para Producto

## Fuera de Alcance

- Dashboards editables por el usuario.
- Creación de campos analytics (misiones 01 y 02).

## Preguntas Abiertas

- Confirmables de widgets (ver final de la sección Widgets): filtro "contratado", colapso de estados en la dona, identificación de la primera etapa, y el ratio mes a mes (#10) que puede requerir post-proceso.
- **[PENDIENTE]** Eventos de Amplitude, si se instrumenta.
- **[PENDIENTE]** Documentación de código y README.
- Confirmación de Producto sobre dashboards fijos.
