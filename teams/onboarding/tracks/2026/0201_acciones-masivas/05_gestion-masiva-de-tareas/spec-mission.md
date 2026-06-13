# Spec Misión: Gestión Masiva de Tareas

**Track:** Acciones Masivas
**Epic:** [Pendiente — asignar epic Jira]
**Owner:** Martin Jadresic
**Reviewer:** Equipo Onboarding
**Status:** draft
**Dependencias:** 04_gestion-masiva-de-procesos

## Objetivo

Permitir gestionar tareas instanciadas de onboarding de forma masiva —creación, edición, cancelación, eliminación y término— para que los administradores puedan operar cambios comunes sobre múltiples tareas sin entrar proceso por proceso.

## Contexto

Los clientes pueden iniciar procesos en volumen gracias a las misiones anteriores del track, pero la gestión posterior de las tareas de esos procesos sigue siendo individual. Cuando hay un error común —una descripción incorrecta, un plazo equivocado, una sala cambiada— el administrador debe repetir la misma acción tarea por tarea. En ingresos masivos esto se vuelve inviable: cientos de tareas idénticas que requieren la misma corrección no pueden gestionarse de forma individual sin consumir tiempo operativo desproporcionado. Esta misión resuelve ese dolor puntual actuando sobre tareas ya instanciadas dentro de procesos activos, sin tocar plantillas ni lógica de propagación.

## Criterios de Aceptación

- El administrador puede seleccionar múltiples procesos activos y crear una misma tarea instanciada en todos ellos a la vez; la tarea se crea como instancia dentro de cada proceso sin modificar ninguna plantilla.
- El administrador puede seleccionar múltiples tareas instanciadas y editar en lote los campos comunes: nombre, descripción, plazo, prioridad y visibilidad para el colaborador. El sistema aplica solo los campos que el administrador elige modificar, sin sobrescribir los demás.
- El administrador puede cancelar múltiples tareas pendientes en una sola acción cuando ya no aplican.
- El administrador puede eliminar múltiples tareas instanciadas creadas por error; la acción requiere confirmación explícita por ser irreversible.
- El administrador puede terminar múltiples tareas a la vez, siempre que cuente con los permisos requeridos según la lógica actual del módulo.
- Las notificaciones existentes se adaptan al contexto masivo: en lugar de un correo por tarea, se envía un correo agrupado por responsable con el resumen de las tareas afectadas (creación, edición, término según corresponda).
- Cuando parte de las tareas seleccionadas no puede completar la acción por estado inválido u otra restricción, el sistema ejecuta la operación sobre las válidas y muestra al usuario un resumen del resultado (ej. "80 tareas editadas. 5 no pudieron modificarse porque están en estado Terminado").

## Fuera de Alcance

- Edición masiva del tipo de tarea (distintos tipos tienen configuraciones específicas que pueden romperse al cambiar el tipo).
- Edición masiva del responsable de tarea (algunos tipos —ej. capacitación— no permiten cambiar responsable; se evaluará en misión futura).
- Adjuntos en edición masiva (no todos los tipos de tarea soportan archivos adjuntos hoy).
- Edición masiva de plantillas de tarea o plantillas de proceso.
- Propagación de cambios desde plantillas hacia tareas ya instanciadas.
- Reabrir tareas canceladas.
- Agrupación visual de tareas por responsable.
- Tareas tipo reunión con integración de calendario.
- Tareas conectadas a otros módulos.

## Dependencias

- La arquitectura de ejecución asíncrona por lotes implementada en `04_gestion-masiva-de-procesos` debe estar en producción; esta misión reutilizará ese fundamento técnico para las operaciones de alto volumen.

## Preguntas Abiertas

- ¿En qué posición se inserta la tarea creada masivamente dentro del orden del proceso? (Relevante para la decisión de ordenamiento de onboarding pendiente.)
- ¿La edición de "pública / privada" aplica a instancias de tarea o solo a plantillas? Si aplica solo a plantillas, queda fuera de esta misión.
- ¿Al terminar masivamente tareas y completarse la última pendiente de uno o varios procesos, se gatilla la notificación de fin de proceso? ¿Cómo se agrupa si afecta múltiples procesos simultáneamente?
- ¿Qué criterio de permisos aplica para "terminar tarea" en contexto masivo — el mismo que para término individual?
