# Pruebas — Migración de campos existentes a analytics_field

Cada caso referencia el CA (de `spec-mission.md`) o CA-NF (de `1_mission.md`) que valida. El foco está en correctitud de los datos consultables, no-regresión del exportador y respeto de permisos.

> **Mallas de seguridad:** esta misión no introduce un feature flag ni modifica datos persistidos (sólo agrega expresiones de lectura). No requiere malla de seguridad dedicada. El control de riesgo principal es la suite de regresión sobre exportador y categorías, que debe pasar antes del deploy.

## Casos de Prueba

| ID | CA que valida | Entrada | Salida esperada | Nivel de riesgo | Tipo |
|----|--------------|---------|-----------------|-----------------|------|
| CP-01 | CA (template visible) | Reportes de proceso, postulación y entrevistas registrados en `TEMPLATES` | Los tres aparecen como opción en el constructor de widgets de AA | Medio | Nuevo |
| CP-02 | CA (widget de proceso) | Un widget que agrupa procesos por `estado` y cuenta | El widget devuelve los conteos correctos por estado, equivalentes a los del exportador | Alto | Nuevo |
| CP-03 | CA-NF-02 | Reporte personalizado de proceso generado antes y después de la migración | El Excel resultante es idéntico; `fields()` y `field_types()` sin cambios | Alto | Regresión |
| CP-04 | CA-NF-01 | Usuario sin permiso de lectura de rango salarial construye un widget con ese campo | El campo no se expone / el widget no devuelve el dato | Alto | Nuevo |
| CP-05 | CA (campos calculados) | Widget sobre `nombre_completo` y `substitute_full_name` (supervisor) | El valor SQL coincide con el `value:` Ruby salvo diferencias documentadas (ej. RUT sin `humanize`) | Medio | Nuevo |
| CP-06 | CA (campos por país) | Tenant de Brasil, widget sobre campos con traducción `I18n` (`regimen_laboral`, `tipo_jornada`, etc.) | El `CASE WHEN` SQL devuelve el mismo label que el `value:` Ruby | Medio | Nuevo |
| CP-07 | CA (campos por país) | Tenant de Chile, widget sobre campos exclusivos de Chile | Los campos país-específicos sólo aparecen cuando el `country` corresponde | Medio | Nuevo |
| CP-08 | CA (excluidos) | Construcción de widget buscando `recruiter`, `cv_url`, `interviewer_names` | Esos campos no están disponibles en analytics; siguen disponibles en el exportador | Bajo | Regresión |

Los casos funcionales referencian los CA de `spec-mission.md`. Los no funcionales referencian los CA-NF de `1_mission.md`.
