# Spec Misión: Gestión Masiva de Procesos

**Track:** Acciones Masivas
**Epic:** OB-258
**Owner:** Martin Jadresic
**Reviewer:** Equipo Onboarding
**Status:** draft
**Dependencias:** 01_cambio-de-vistas, 02_inicio-masivo-de-procesos, 03_importador-procesos

## Objetivo

Habilitar la gestión masiva de procesos de onboarding existentes —edición de campos clave, cancelación, eliminación y término anticipado— permitiendo a administradores del segmento L operar en volumen sin recurrir a acciones individuales.

## Contexto

La misión de inicio masivo (anterior en este track) resolvió el dolor de crear procesos en volumen. Sin embargo, el ciclo de vida del onboarding no termina en la creación: los administradores de clientes grandes (Segmento L) necesitan modificar, cancelar o eliminar procesos en lote ante cambios de última hora, reestructuraciones de áreas o errores de carga masiva. Hoy, cada acción debe ejecutarse proceso por proceso, lo que convierte la gestión post-creación en un bloqueante comercial crítico para este segmento. La plataforma se percibe como insuficiente para la operación diaria de cuentas corporativas si no ofrece estas capacidades de "Día 2".

## Criterios de Aceptación

- El administrador puede seleccionar N procesos simultáneamente y editar en lote los siguientes campos: encargado del proceso, fecha de inicio de onboarding, recordatorio semanal (activar/desactivar/configurar), área y cargo. Al editar el campo encargado, el sistema notifica a cada nuevo encargado usando `NotifyManagerAssignationNotification` agrupada por destinatario; las ediciones de los demás campos no generan notificaciones.
- El administrador puede eliminar múltiples procesos creados por error; el borrado no debe dejar registros huérfanos en las tablas relacionales de tareas y asignaciones.
- El administrador puede cancelar múltiples procesos activos de forma manual y definitiva, interrumpiendo el flujo de manera irreversible.
- El administrador puede cerrar anticipadamente múltiples procesos en curso; el sistema cierra automáticamente todas las tareas pendientes asociadas a dichos procesos.
- Toda acción masiva (edición, cancelación, eliminación o término) queda registrada en el historial de cambios individual de cada proceso afectado, garantizando trazabilidad para auditorías.
- Cuando parte de los procesos seleccionados no puede completar la acción (por estado inválido u otra restricción), el sistema ejecuta la operación sobre los procesos válidos y notifica al usuario un resumen del resultado (ej. "90 procesos actualizados. 10 no pudieron cancelarse porque ya estaban en estado Terminado").
- Las acciones irreversibles (eliminar y cancelar) requieren doble confirmación explícita en la interfaz para prevenir ejecuciones accidentales.
- El procesamiento se ejecuta de forma asíncrona para no degradar la experiencia de la plataforma durante operaciones de alto volumen.
- Cada acción masiva emite un evento de analítica con las propiedades: `action_type` (edit | delete | cancel | terminate), `flow_type: masivo`, `bulk_count: N` (número de procesos afectados).

## Criterios de Éxito

**Corto plazo (1 mes del rollout):** Validación cualitativa con clientes Beta del segmento L. El criterio se cumple si los administradores confirman que las herramientas de gestión masiva eliminan la fricción de mantenimiento y les permiten gobernar sus procesos sin recurrir a soporte técnico.

**Largo plazo (3 meses del rollout):** Reducción a cero de los reclamos, solicitudes de soporte o bloqueos comerciales en el segmento L asociados a la imposibilidad de editar o dar de baja procesos en volumen.

## Fuera de Alcance

- Manipulación masiva de sub-elementos dentro de un proceso (tareas específicas, correos individuales).
- Modificaciones al formulario de pre-ingreso.
- Gestión masiva de procesos de pre-ingreso o alta administrativa.

## Dependencias

- La arquitectura de ejecución asíncrona por lotes implementada en la misión de inicio masivo debe reutilizarse; esta misión no puede diseñarse sin ese fundamento técnico en producción.

## Preguntas Abiertas

- ¿Qué estados bloquean qué acciones? (Ej: ¿Se puede editar el área de un proceso ya cancelado o terminado?)
- Al terminar masivamente N procesos con tareas en cascada, ¿cómo asegurar que el cierre no sature las colas de eventos del sistema?
- ¿La UX de gestión masiva convivirá en el mismo módulo de visualización de procesos o requerirá una vista separada?
- Al terminar masivamente procesos, ¿se envía `NotifyProcessEndingNotification` agrupada por encargado, o se omite la notificación? (pendiente de decisión)
