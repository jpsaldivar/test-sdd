# Pruebas — Creación de campos nuevos para analytics

> **Estado:** misión en `draft`. Los casos de prueba dependen del listado de campos nuevos, aún pendiente. Lo siguiente son los casos genéricos que aplicarán a cada campo una vez definido.

> **Mallas de seguridad:** igual que la misión 01, no introduce feature flag ni modifica datos persistidos. El control de riesgo es la suite de regresión sobre los campos ya migrados y el exportador.

## Casos de Prueba

| ID | CA que valida | Entrada | Salida esperada | Nivel de riesgo | Tipo |
|----|--------------|---------|-----------------|-----------------|------|
| CP-01 | CA (campo disponible) | Por cada campo nuevo, un widget que lo use | El campo aparece en el constructor y el widget devuelve el dato correcto | Medio | Nuevo |
| CP-02 | CA-NF-01 | Campos migrados en la misión 01 y exportador | Sin cambios respecto a antes de agregar los campos nuevos | Alto | Regresión |
| CP-03 | CA-NF-02 | Widget sobre un campo nuevo con subquery correlacionado, colección grande | Tiempo de respuesta dentro de lo aceptable; `LIMIT` aplicado si corresponde | Medio | Nuevo |
| CP-04 | CA (por país) | Campos nuevos exclusivos por país en el tenant correspondiente | El campo sólo aparece cuando el `country` corresponde | Medio | Nuevo |

Los casos funcionales referencian los CA de `spec-mission.md`. Los no funcionales referencian los CA-NF de `1_mission.md`.
