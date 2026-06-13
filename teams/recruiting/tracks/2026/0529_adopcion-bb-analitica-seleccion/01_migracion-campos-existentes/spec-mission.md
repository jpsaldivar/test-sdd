# Spec Misión: Migración de campos existentes a analytics_field

**Track:** Adopción Building Block People Analytics en Selección
**Epic:** SEL-6810
**Owner:** Catalina Anguita
**Reviewer:** Juan Pablo Saldivar
**Status:** ready
**Dependencias:** none

## Objetivo

Exponer en el constructor de widgets de Analítica Avanzada los campos que ya existen en las categorías de Selección (proceso, postulación, entrevistas), declarándolos como `analytics_field` y registrando sus reportes en el `QueryBuilder`.

## Contexto

Hoy las categorías del exportador de Selección definen sus campos con métodos Ruby y no declaran `analytics_field`; los reportes no exponen el contrato del `QueryBuilder` ni están en `QueryBuilder::TEMPLATES`. Por eso ningún dato de Selección es consultable desde Analítica Avanzada. Esta misión migra al estándar de AA únicamente los campos que ya existen, sin agregar campos nuevos (eso es la misión 02) ni construir dashboards (misión 03). Es un refactor transparente que se libera sin feature flag: si la migración es correcta, el usuario no percibe ningún cambio y los reportes personalizados siguen funcionando igual.

## Criterios de Aceptación

- Los reportes de proceso, postulación y entrevistas de Selección aparecen como opciones en el constructor de widgets de Analítica Avanzada.
- Un usuario puede crear un widget que agrupe, filtre y agregue datos de procesos de selección sobre los campos migrados.
- Los reportes personalizados descargables existentes siguen generándose correctamente, sin cambios para el usuario.
- Los campos consultables respetan los permisos del usuario (no expone datos que el usuario no puede ver).
- Los campos exclusivos por país (Chile, Brasil) sólo están disponibles cuando corresponde.

## Fuera de Alcance

- Creación de campos `analytics_field` que hoy no existen (misión 02).
- Construcción de dashboards o cambios de UI (misión 03).
- Migración de campos no viables: `recruiter`, `notes_by_process_stage`, `cv_url`, `interviewer_names`, `interviewer_document_number`.
- Cualquier cambio al flujo de exportación a Excel.

## Dependencias

- Ninguna. Es la primera misión del track y no depende de otras.

## Preguntas Abiertas

- Ninguna que bloquee la implementación. Las diferencias conocidas entre el valor Ruby y el SQL en campos calculados se documentan y aceptan durante la ejecución.
