# Spec Track: Nuevos Proveedores Marketplace de Evaluaciones

**Equipo:** Recruiting
**Tablero Jira:** SEL
**Jira Card:** 
**Owner:** 
**Reviewer:**
**Status:** ready

## Problema

El módulo de evaluaciones de Buk soporta un catálogo de proveedores `marketplace` (pruebas estándar disponibles para todos los clientes), pero hoy ese catálogo es limitado. Los reclutadores no tienen acceso a Evaluar ni a TestGorilla como opciones de pruebas marketplace, lo que obliga a buscar alternativas fuera de la plataforma y rompe el flujo centralizado de selección. Este track incorpora ambos proveedores al catálogo marketplace para que el flujo completo — asignación, envío al candidato, respuesta y recepción de resultados vía webhook — ocurra íntegramente dentro de Buk.

## Objetivos

- Incorporar Evaluar como proveedor marketplace: los reclutadores pueden asignar evaluaciones de Evaluar a candidatos y los resultados llegan a Buk vía webhook.
- Incorporar TestGorilla como proveedor marketplace: los reclutadores pueden asignar evaluaciones de TestGorilla (scope marketplace) a candidatos y los resultados llegan a Buk vía webhook.

## No Objetivos

- No se agregarán nuevas funcionalidades al flujo existente de evaluaciones (más allá de los dos proveedores nuevos).
- No se migrará el código de integración individual (client_specific) de TestGorilla al nuevo scope marketplace; ambas integraciones coexistirán de forma independiente.
- No se incluye reportería ni analytics de resultados de los nuevos proveedores dentro de Buk.
- No se contempla configuración avanzada por cliente para estos proveedores.

## Impacto en Usuarios

**Reclutadores:** podrán seleccionar evaluaciones de Evaluar y TestGorilla (marketplace) desde el flujo de asignación de pruebas en un proceso de selección, sin salir de la plataforma.

**Candidatos:** recibirán un enlace o acceso a la evaluación del proveedor correspondiente, responderán en la plataforma del proveedor y sus resultados quedarán disponibles en Buk automáticamente.

**Administradores de Buk:** no requieren configuración adicional por cliente para estos proveedores — al ser marketplace, están disponibles globalmente cuando la integración está habilitada.

## Métricas de Éxito

| Métrica | Línea Base | Objetivo |
|---------|-----------|---------|
| Flujo completo Evaluar (asignación → candidato recibe → responde → resultado visible en Buk) | No disponible | Operativo en producción |
| Flujo completo TestGorilla marketplace (asignación → candidato recibe → responde → resultado visible en Buk) | No disponible | Operativo en producción |

## Restricciones

- TestGorilla ya existe como proveedor `client_specific`; la nueva integración marketplace debe coexistir sin afectar ese flujo.
- La arquitectura de estrategias (`MarketplaceProviderStrategy`) es la única vía para agregar proveedores marketplace — no se alterará el patrón existente.

## Misiones a Considerar

- **Alta de Evaluar como proveedor marketplace** — implementa backend (strategy, webhook, sincronización de catálogo) y expone Evaluar como opción seleccionable en el flujo de asignación de evaluaciones en la UI.
- **Alta de TestGorilla como proveedor marketplace** — implementa backend (strategy marketplace, webhook, sincronización de catálogo) y expone TestGorilla marketplace como opción seleccionable en el flujo de asignación de evaluaciones en la UI, sin afectar la integración client_specific existente.

## Preguntas Abiertas

- ¿Se requiere un feature flag por proveedor para controlar el rollout, o el flag global `sel_evaluacion_marketplace` es suficiente?
- ¿Evaluar tiene documentación de API pública disponible? ¿Quién es el contacto técnico del proveedor?
- ¿TestGorilla marketplace usa las mismas credenciales de API que la integración client_specific actual, o son cuentas separadas?

## Referencias

- Subpack de evaluaciones: `packs/recruiting/evaluations/`
- Proveedores existentes: `packs/recruiting/evaluations/app/services/evaluations/ensure_providers.rb`
- Patrón de estrategias: `packs/recruiting/evaluations/app/lib/evaluations/marketplace_provider_strategy.rb`
