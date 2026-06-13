# Pruebas — Dashboard predeterminado en el módulo de Selección

> **Estado:** misión en `draft`. Los casos de prueba de widgets dependen del set de widgets, aún pendiente. Lo siguiente son los casos estructurales (FF, permisos, clean-up) más los genéricos por widget.

> **Mallas de seguridad:** esta misión introduce el feature flag `sel_feat_advanced_analytics_dashboard` y reemplaza la UI de dashboards. Evaluar una malla de regresión visual/funcional sobre el módulo de Selección antes de activar el flag. Idealmente, la activación del FF se condiciona a que la malla se ejecute correctamente.

## Casos de Prueba

| ID | CA que valida | Entrada | Salida esperada | Nivel de riesgo | Tipo |
|----|--------------|---------|-----------------|-----------------|------|
| CP-01 | CA (FF) | FF `sel_feat_advanced_analytics_dashboard` desactivado | Los tabs de dashboard no son visibles; el comportamiento previo se mantiene | Alto | Nuevo |
| CP-02 | CA (FF) | FF activo + usuario con permiso `recruiting_analytics` | Los tabs son visibles y renderizan los dashboards | Alto | Nuevo |
| CP-03 | CA-NF-01 | Usuario sin permiso `recruiting_analytics`, FF activo | No accede a los tabs ni a las rutas de dashboard | Alto | Nuevo |
| CP-04 | CA (dashboard por proceso) | Dashboard por proceso con `seleccion_id` dado | Todos los indicadores quedan filtrados al proceso indicado | Alto | Nuevo |
| CP-05 | CA-NF-02 | Dashboard con todos los widgets, tenant con muchos procesos | Tiempo de carga aceptable; widgets lentos identificados | Medio | Nuevo |
| CP-06 | CA (clean-up) | Codebase tras el clean-up | `grep` sin referencias a las cells/servicios eliminados; suite de tests verde | Alto | Regresión |
| CP-07 | CA (widgets) | Por cada widget definido | El widget muestra la métrica correcta, equivalente al dato de origen | Medio | Nuevo |

Los casos funcionales referencian los CA de `spec-mission.md`. Los no funcionales referencian los CA-NF de `1_mission.md`.
