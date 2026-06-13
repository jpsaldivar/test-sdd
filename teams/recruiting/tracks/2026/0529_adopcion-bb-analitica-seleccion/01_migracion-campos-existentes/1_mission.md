# Misión: Migración de campos existentes a analytics_field

**Track:** Adopción Building Block People Analytics en Selección
**Epic:** SEL-6810
**Owner:** Rodrigo Contreras
**Reviewer:** Juan Pablo Saldivar
**Status:** ready
**Dependencias:** none

## Objetivo

Migrar al estándar de Analítica Avanzada los campos que ya existen en las categorías de Selección, dejándolos consultables desde el constructor de widgets sin alterar el exportador.

## Contexto

Los reportes de Selección (proceso, postulación, entrevistas) son exportadores clásicos: las categorías definen campos con métodos Ruby y los datos se iteran en memoria. Ninguna declara `analytics_field`, ningún report expone `object`, `relations` ni `ASSOCIATIONS`, y no están registrados en `Analytics::Indicators::Helpers::TemplateRegistry`. Esta misión aplica el contrato de Analítica Avanzada sobre los campos existentes. Es aditiva y transparente: no modifica `fields()` ni `field_types()`, por lo que no afecta los reportes personalizados. Se libera sin feature flag.

## Criterios de Aceptación No Funcionales

| ID CA-NF | RNF de origen | Criterio de aceptación no funcional |
|----------|--------------|--------------------------------------|
| CA-NF-01 | RNF-01 | Las consultas de los campos migrados pasan por `accessible_by(@current_ability)` del `QueryBuilder`; un usuario sin permiso de lectura sobre un dato no lo obtiene en un widget. |
| CA-NF-02 | RNF-02 | La declaración de `analytics_field` no modifica `fields()` ni `field_types()`; los reportes personalizados existentes generan el mismo resultado que antes de la migración. |
| CA-NF-03 | RNF-04 | Cada categoría migrada tiene tests > 80% que cubren el contexto analytics y el contexto reporte, incluyendo los campos exclusivos por país. |
| CA-NF-04 | RNF-05 | Los campos que exponen RUT usan `CI_PARSERS` sobre el valor almacenado; no exponen datos adicionales. |

## Especificación Técnica

> Existe un POC de referencia en la rama `poc/SEL-6810-migracion-analytics-fields` (commit `3969e746`) que ya implementó las 6 categorías y los 3 reports. Las decisiones, gotchas y SQL por campo están en `docs/analytics_recruiting_decisions.md` de esa rama.

Tres cambios por cada report template que se quiera exponer.

**Regla transversal:** todo campo presente en `fields()` debe declararse con `analytics_field`; un campo sin declarar rompe el reporte que lo use. Los campos sin SQL viable se declaran igual, con `sql: nil` y `available_in: [:reports]` (siguen disponibles en reportes vía su `value:`/bloque, pero no aparecen como opción en analytics). No deben quedar campos "excluidos" sin declaración.

### Paso 1: Declarar `analytics_field` en las categorías

Cada campo a exponer se declara con el DSL `analytics_field`, indicando `origin` (tabla que lo provee), `type`, la expresión `sql:` que el `QueryBuilder` inyecta en el SELECT, el `value:` Ruby equivalente y `available_in:` (por defecto `[:reports, :analytics]`). Si el campo es una columna real, `sql:` se infiere como `<origin_pluralizado>.<campo>` y puede omitirse.

```ruby
analytics_field :name,
                origin: [:seleccion],
                type: :string,
                sql: -> { "seleccions.name" },
                value: -> { seleccion&.name }

analytics_field :estado,
                origin: [:seleccion],
                type: :string,
                sql: -> {
                  cases = Seleccion.estados.map do |name, value|
                    label = I18n.t(
                      "activerecord.attributes.seleccion.estado_list.#{name}",
                      default: name.to_s,
                    )
                    "WHEN #{value} THEN '#{label.gsub("'", "''")}'"
                  end
                  "CASE seleccions.estado #{cases.join(' ')} ELSE NULL END"
                }
```

### Paso 2: Implementar el contrato del `QueryBuilder` en el report

Además de `CATEGORIES`, el report declara `ASSOCIATIONS` (mapea cada `origin:` a su asociación ActiveRecord, con hashes anidados donde el path lo requiere) y responde a `object` (país-aware), `relations`, `temporality_filter_logic`, `from_date`, `to_date`, `categories_variable` y `filter_class`, más los metadatos de template (`self.default_entity`, `entity_singular_alias`, `entity_plural_alias`, `ai_description`).

```ruby
CATEGORIES = [
  Exportador::Custom::Categories::SeleccionCategory,
  Exportador::Custom::Categories::EtapaProcesoCategory,
  Exportador::Custom::Categories::PostulacionCategory,
  Exportador::Custom::Categories::PostulanteCategory,
  Exportador::Custom::Categories::RecruitingMovementEventCategory,
].freeze

ASSOCIATIONS = {
  seleccion:                  :seleccion,
  etapa_proceso:              :etapa_procesos,
  postulacion:                :postulacions,
  postulante:                 { postulacions: :postulante },
  recruiting_movement_event:  { etapa_procesos: :to_stage_movement_events },
}.freeze

def object
  "Exportador::Custom::Objects::#{country}::SeleccionObject".safe_constantize || Seleccion
end

def relations
  [
    :etapa_procesos,
    :postulacions,
    { postulacions: :postulante },
    { etapa_procesos: :to_stage_movement_events },
  ]
end

def temporality_filter_logic(resource)
  resource.where("seleccions.created_at" => from_date.beginning_of_day..to_date.end_of_day)
end
```

`relations` debe incluir **toda** asociación cuyas categorías referencien una tabla distinta a la base del report; si falta, las categorías secundarias fallan con `missing FROM-clause entry`.

### Paso 3: Registrar el template en `TemplateRegistry`

El registro es en `Analytics::Indicators::Helpers::TemplateRegistry` con el DSL `template`, no en una constante `QueryBuilder::TEMPLATES`.

```ruby
template :seleccion_report,   klass: Exportador::Custom::Reports::SeleccionReport
template :postulacion_report, klass: Exportador::Custom::Reports::PostulacionReport
template :interview_report,   klass: Exportador::Custom::Reports::InterviewReport
```

Además se agregan los locales `advanced_analytics.templates.<report>.{entity_singular_alias, entity_plural_alias, ai_description}` y las descripciones de campos en `field_information_service`. Completado esto, el template aparece en el constructor de widgets de AA. Se repite para cada reporte (proceso, postulación, entrevistas).

### Campos con complicaciones que se migran

Requieren analizar la lógica Ruby antes de generar el SQL equivalente.

| Campo | Motivo | Solución aplicada |
|-------|--------|-------------------|
| `apellidos_nombre_rut` / `substitute_full_name` (supervisor) | Método Ruby de `Person`, no columna en `people` | `CONCAT(p.last_name, ' ', p.segundo_apellido, ', ', p.first_name)` para nombre; agrega `' (', p.rut, ')'` para `substitute_full_name` |
| `nombre_completo` (supervisor, solicitado_por) | Método Ruby de `Person`, no columna en `people` | `CONCAT(p.last_name, ' ', p.segundo_apellido, ', ', p.first_name)` |
| `short_name` (location en `SeleccionCategory`) | Método Ruby de `Location` que trunca el nombre | Usar la columna `locations.name` |
| `dias_transcurridos` | Método Ruby `[(hoy - created_at), 0].max` | `GREATEST(CURRENT_DATE - seleccions.created_at::date, 0)` |
| `work_day_description` | Columna string libre exclusiva de Brasil | Columna directa `seleccions.work_day_description` con `country: :brasil` |
| `duracion_dias_continuos` / `stage_continuous_days` / `continuous_time` | `EXTRACT(DAY FROM date - date)` falla en PostgreSQL (la resta de fechas da `integer`) | Resta directa; `CASE WHEN MIN IS NOT NULL AND MAX IS NOT NULL THEN (resta) ELSE NULL END` |
| `duracion_dias_habiles` / `stage_working_days` / `working_days_time` | Días hábiles excluyendo feriados | `generate_series` con `NOT EXISTS` sobre `holidays`/`holidays_locations` por `location_id`, materializando el rango en un subquery previo |

### Campos sin SQL viable

No se excluyen: se declaran con `analytics_field` usando `sql: nil` y `available_in: [:reports]`, conservando su `value:`/bloque para que sigan en reportes sin aparecer en analytics.

| Campo | Motivo |
|-------|--------|
| `recruiter` | Lista de múltiples recruiters separada por coma, no filtrable de forma útil en analytics |
| `notes_by_process_stage` | Concatenación de notas por etapa con lógica Ruby muy específica, no replicable limpiamente en SQL |
| `cv_url` | URL generada en runtime por CarrierWave + route helper de Rails, no existe como columna |
| `interviewer_names` | `STRING_AGG` de entrevistadores, innecesario para analytics |
| `interviewer_document_number` | Mismo motivo que `interviewer_names` |

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Divergencia entre `value:` Ruby y resultado SQL en campos calculados | Media | Medio | Comparar `value:` Ruby vs SQL por cada campo calculado antes de desplegar; documentar diferencias aceptadas (ej. RUT sin `humanize`) |
| Regresión en reportes existentes por compartir `*_category.rb` / `*_report.rb` | Alta | Alto | Suite completa de tests de categorías y reportes antes del deploy; verificar reportes del tenant demo |
| Campo de `fields()` sin `analytics_field` rompe el reporte que lo use | Media | Alto | Verificar paridad `fields() ⊆ analytics_fields` por categoría; declarar los no-SQL con `sql: nil` + `available_in: [:reports]` |
| `relations` incompleto: categorías secundarias fallan con `missing FROM-clause entry` | Media | Alto | Por cada categoría cuyo `origin` no sea la tabla base, agregar su asociación a `relations` |
| Subclases STI por país (Chile/Colombia/Brasil) con falla silenciosa: la query no lanza error pero retorna datos incorrectos | Alta | Alto | Probar con tenants de Chile, Colombia y Brasil; verificar que los campos `country:` retornen `nil` donde no aplican |

## Documentación

- [ ] README del pack `packs/recruiting/core` actualizado con el contrato analytics de las categorías migradas
- [ ] Release notes con el listado de campos sin SQL (solo en reportes) y su razón
- [ ] `analytics_field` y `ASSOCIATIONS` documentados en el código de cada categoría/report migrado

## Fuera de Alcance

- Creación de campos `analytics_field` nuevos y categorías nuevas (`PostulanteTimeLineCategory`, `RecruiterCategory`) (misión 02).
- Dashboards o cambios de UI (misión 03).
- Exposición en analytics de los campos sin SQL viable (quedan solo en reportes con `available_in: [:reports]`).
- Cambios al flujo de exportación a Excel.

## Preguntas Abiertas

- Ninguna que bloquee la implementación.
