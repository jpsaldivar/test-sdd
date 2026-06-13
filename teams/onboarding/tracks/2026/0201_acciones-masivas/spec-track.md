# Spec Track: Acciones Masivas

**Equipo:** Onboarding
**Tablero Jira:** OB
**Jira Card:** OB-88
**Owner:** Martin Jadresic
**Reviewer:** [Stakeholders / líderes de equipo]
**Status:** active

## Problema

En empresas medianas y grandes, el onboarding no se ejecuta de forma individual, sino como parte de ingresos planificados por grupos. Hoy, la plataforma no acompaña esa lógica: iniciar un onboarding implica completar un formulario persona por persona, lo que en grupos de 200 personas puede traducirse en tres horas de trabajo manual solo para poner el proceso en marcha. Una vez iniciado, la gestión continúa siendo individual —tareas, recordatorios y correos se editan uno por uno, sin capa de grupo— y los responsables que operan por lote reciben cientos de tareas individuales cuando en realidad gestionan una sola responsabilidad. A medida que el volumen crece, este modelo se vuelve frágil: los errores escalan, el seguimiento manual se hace más costoso y las empresas pierden confianza en que los onboardings del grupo estén correctamente iniciados, ejecutados y controlados.

## Objetivos

- Reducir en un 80% el tiempo de gestionar onboardings en volumen respecto a la operación actual.
- Eliminar los bloqueantes comerciales del segmento L asociados a la imposibilidad de operar onboarding de forma masiva.
- Llevar a verde al 80% de clientes L y al 250 de clientes M en uso del módulo (3 meses post-finalización del track).

## No Objetivos

- Gestión masiva de sub-elementos dentro de un proceso (tareas individuales, correos).
- Separación de flujos pre-ingreso / alta / onboarding (queda para un track posterior de empleado futuro).

## Impacto en Usuarios

Los administradores de clientes medianos y grandes (segmento M y L) dejan de operar proceso por proceso. Pueden iniciar, editar, cancelar y cerrar onboardings en lote, reduciendo el tiempo operativo en ventanas críticas (ingresos masivos, campañas estacionales, reestructuraciones). Los responsables que gestionan grupos dejan de recibir cientos de tareas individuales y pueden coordinar actividades transversales desde la plataforma.

## Métricas de Éxito

| Métrica | Línea Base | Objetivo |
|---------|-----------|---------|
| Tiempo de gestionar onboardings en volumen | Referencia actual (manual, proceso a proceso) | Reducción del 80% |
| Conversaciones de Acciones Masivas sobre total de conversaciones | [Valor actual] | < 10% (1 mes post-track) |
| Clientes M verdes en uso del módulo | [Valor actual] | 250 (3 meses post-track) |
| Clientes L verdes en uso del módulo | [Valor actual] | 80% (3 meses post-track) |
| Tickets relacionados a operación masiva | [Valor actual] | 0 (1 mes post-track) |

## Restricciones

- Todas las acciones masivas deben ser asíncronas; no se puede degradar la experiencia de la plataforma durante operaciones de alto volumen.
- Las acciones irreversibles (eliminar, cancelar) deben contar con confirmación explícita del usuario para evitar ejecuciones accidentales.
- Toda modificación masiva debe registrarse en el historial individual de cada proceso afectado para cumplir con requerimientos de auditoría.

## Misiones a Considerar

- 01 — Cambio de Vistas — Migra el resource de Employee a Person como base, habilitando la gestión de personas sin ficha y estableciendo la estructura de tabs/scopes que el track entero hereda.
- 02 — Inicio masivo de procesos — Permite crear e iniciar onboardings para un grupo en una sola acción async, eliminando el trabajo manual de formulario por persona.
- 03 — Importador de procesos — Desacopla el pre-ingreso de las plantillas de proceso y habilita la acción masiva "Enviar pre-ingreso e iniciar" desde la vista sin ficha.
- 04 — Gestión masiva de procesos — Habilita edición, cancelación, eliminación y término anticipado de procesos en lote, completando las capacidades de "Día 2" para el segmento L.

## Preguntas Abiertas

- ¿Cuál es el volumen máximo de procesos que un cliente L opera en un lote típico? (Afecta decisiones de infraestructura y UX de carga asíncrona.)
- ¿Cómo se representa el "grupo" o "batch" en la plataforma para seguimiento? ¿Es una entidad persistida o solo una selección ad-hoc?
- ¿Qué criterio determina que un cliente pasa de amarillo a verde en las métricas de uso?

## Referencias

- Investigación Acciones Masivas (Drive): https://docs.google.com/document/d/16rPnp8UtCfHEHCHBfbm3-fkvYN31aegX10gBhndUp6A/edit?tab=t.0#heading=h.nazb3qicfc4f
- Análisis Onboarding (Drive): [\[Link pendiente\]](https://docs.google.com/document/d/1BErc8n6ljHcL7xtRPNVCmbCEOCP3paAKSLOBPGP3gRA/edit?tab=t.k49eb0eiem54)
