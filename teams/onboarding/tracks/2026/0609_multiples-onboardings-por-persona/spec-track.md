# Spec Track: Soportar múltiples onboardings sobre una persona

**Equipo:** Onboarding
**Tablero Jira:** OB
**Jira Card:** OB-356
**Owner:** mjadresic
**Reviewer:** [Por definir — stakeholders de negocio]
**Status:** draft

## Problema

Los procesos de onboarding están amarrados al usuario (`User`) y no a su Ficha Laboral (`Employee`). Esto asume linealidad en el empleo y se quiebra en dos escenarios reales de clientes:

**Pluriempleo / Roles Holding:** Un colaborador con múltiples trabajos simultáneos (ej. director de colegio que también es profesor) solo puede tener un onboarding activo. El cliente no puede operar los procesos de ambos cargos de manera independiente, como sí espera hacerlo — documentado en SAC "Onboarding: multiples fichas, trabajos y procesos" (2026-05-28).

**Transiciones Internas:** Un practicante que pasa a contrato full-time genera una nueva ficha. Para su nuevo rol necesita un nuevo onboarding sin perder el historial del anterior. Hoy el sistema obliga al administrador a cancelar el proceso previo o a ingresar tareas manuales, lo que genera trabajo extra y mezcla datos, arruinando la reportería.

Adicionalmente, mantener el vínculo a nivel de `User` bloquea el desarrollo del futuro Onboarding Compound (tareas conectadas de activos, documentos y capacitaciones), cuyas entidades se linkean directamente a la ficha (`Employee`). Continuar con el modelo actual provocaría asignaciones cruzadas incorrectas.

## Objetivos

- Migrar el vínculo del onboarding desde `User` hacia `Employee`, habilitando N onboardings activos por persona (uno por ficha), manteniendo la regla de 1 activo por ficha.
- Migrar la acción "mostrar" de las tablas de administración de onboarding (`PersonOnboardingResource` y `ProcessResource`) al patrón `render_show` de Fiji, exponiendo los datos de la ficha del colaborador: cargo, área, país, supervisor y historial de onboardings previos.

## No Objetivos

- No se desarrolla el Onboarding Compound en este track.
- No se modifican las reglas de negocio de los procesos de onboarding existentes (tareas, plantillas, etc.).
- No se migran ni transforman datos históricos más allá del remapeo de entidad.

## Impacto en Usuarios

**Administradores RRHH:** Podrán gestionar onboardings independientes por ficha para una misma persona. Se eliminan los bloqueos actuales en escenarios de pluriempleo y transiciones internas, reduciendo trabajo manual y mejorando la calidad de la reportería.

**Colaboradores:** Desde "Mi Onboarding" verán únicamente el onboarding correspondiente a la ficha en la que están activos en ese momento.

## Métricas de Éxito

| Métrica | Línea Base | Objetivo |
|---------|-----------|---------|
| Pérdida de registros históricos en migración | — | 0% |
| Inconsistencias de datos post-remapeo | — | 0 |
| Tickets SAC relacionados con bloqueos de onboarding por doble cargo | Nivel actual (a medir pre-launch) | Reducción del 100% a los 30 días del lanzamiento |

## Restricciones

- **Seguridad / Privacidad:** Los administradores de onboarding podrían no tener acceso a la ficha laboral — requiere validación antes de definir la arquitectura de permisos.
- **Factibilidad técnica UI:** La propuesta de patrón show debe ser validada con el Design System antes de comprometer el diseño.
- **GTM:** Al migrar la entidad, pueden aparecer personas "Sin onboarding" que antes no se veían — requiere comunicación proactiva a clientes y plan de rollout.
- **Cambios internos:** Pendiente evaluar si es factible representar en la UI que se avecina un cambio interno (ej. Workflow de movimiento activo para la ficha actual).

## Misiones a Considerar

- **Onboarding por ficha** (`01_onboarding-por-ficha`) — Extender la restricción de unicidad a `(onboarded_id, employee_id)`, actualizar la tabla de administración al patrón show mostrando una fila por ficha, y adaptar "Mi Onboarding" para listar todos los procesos activos del colaborador.

## Preguntas Abiertas

- ¿Los administradores de onboarding pueden no tener acceso a una ficha determinada? ¿Cómo se resuelven los permisos en ese caso?
- ¿Es factible mostrar en la UI cuando se avecina un cambio interno (WF de movimiento activo sobre la ficha)?
- ¿Cómo se comunica a clientes el nuevo comportamiento de la tabla (aparición de registros "Sin onboarding")?

## Referencias

- SAC "Onboarding: multiples fichas, trabajos y procesos" — 2026-05-28 (Notes by Gemini)
- Jira Epic: OB-356
