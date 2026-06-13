# Pruebas — [Nombre de la Misión]

Cada caso de prueba referencia el CA o CA-NF que valida. Un mismo CA puede originar más de un caso cuando hay condiciones borde relevantes. Los casos deben cubrir al menos: seguridad y permisos, correctitud de cálculos, performance bajo carga real, y módulos posiblemente afectados por regresión — si hay un requisito que los respalde.

> **Mallas de seguridad:** si la misión modifica datos críticos o introduce lógica de alto riesgo, definir qué mallas son necesarias, si se pueden reutilizar las existentes, y en qué momento se ejecutan. Idealmente, la activación del feature flag debe estar condicionada a que la malla se ejecute correctamente.

## Casos de Prueba

| ID | CA que valida | Entrada | Salida esperada | Nivel de riesgo | Tipo |
|----|--------------|---------|-----------------|-----------------|------|
| CP-01 | CA-01 | [estado del sistema antes] | [qué debe ser verdad después] | Alto / Medio / Bajo | Nuevo / Regresión |
| CP-02 | CA-NF-01 | [estado del sistema antes] | [qué debe ser verdad después] | Alto / Medio / Bajo | Nuevo / Regresión |

Los casos funcionales referencian los CA de `spec-mission.md`. Los no funcionales referencian los CA-NF de `1_mission.md`.
