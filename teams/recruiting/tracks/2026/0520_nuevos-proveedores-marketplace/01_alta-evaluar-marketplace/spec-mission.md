# Spec Misión: Alta de Evaluar como Proveedor Marketplace

**Track:** Nuevos Proveedores Marketplace de Evaluaciones
**Epic:**
**Owner:**
**Reviewer:**
**Status:** draft
**Dependencias:** none

## Objetivo

Integrar Evaluar al catálogo marketplace de Buk para que el reclutador pueda asignar una prueba, el candidato la reciba y la complete, y el resultado quede visible en la plataforma.

## Contexto

El módulo de evaluaciones de Buk tiene un patrón establecido para proveedores marketplace: sincronización de catálogo vía API, envío de petición al proveedor con callback URL, y recepción de resultados por webhook. Hirint y EB Metrics ya siguen este patrón. Evaluar no está integrado aún — no existe en la tabla `evaluation_providers` ni tiene adapter, webhook ni ruta en el sistema. Esta misión conecta Evaluar a ese patrón existente sin modificar el flujo de evaluaciones.

## Criterios de Aceptación

- Un reclutador puede seleccionar una prueba de Evaluar desde el flujo de asignación de evaluaciones en un proceso de selección.
- Al asignar la prueba, el candidato recibe el enlace para realizarla.
- Una vez que el candidato completa la prueba, el resultado queda visible en Buk (vía webhook).
- El flujo no afecta la operación de los proveedores marketplace existentes (Hirint, EB Metrics).

## Fuera de Alcance

- Parser de resultados estructurado para Evaluar (se usa el `DefaultParser` genérico; un parser específico se puede agregar en una misión futura).
- Configuración de credenciales de Evaluar desde la UI de administración.
- Soporte de Evaluar en la API pública de Buk.

## Dependencias

- Documentación de la API de Evaluar (autenticación, endpoints de catálogo, formato de petición y webhook). Debe estar disponible antes de comenzar la implementación — se validará en el documento técnico de la misión.

## Preguntas Abiertas

- ¿Cuál es el mecanismo de autenticación del webhook de Evaluar (JWT, HMAC, token fijo)?
- ¿Evaluar requiere feature flag propio (`sel_evaluar_integration`) para controlar el rollout, o se habilita solo con el flag global de marketplace?
- ¿Hay un ambiente de sandbox en Evaluar para validar el flujo antes de producción?
