# Spec Misión: Gestión Granular de Proveedores de Pruebas

**Track:** Flujo de pruebas en Selección
**Epic:** SEL-6811
**Owner:** Patricio Tabilo
**Reviewer:** Equipo SEL
**Status:** draft
**Dependencias:** none

## Objetivo

Permitir que los administradores de empresa activen y desactiven proveedores de pruebas de selección de forma individual y masiva desde una vista centralizada en Selección, garantizando que el estado de cada proveedor sea respetado en todo el flujo de envío de evaluaciones. Deprecar el switch legacy `General.activar_pruebas_de_seleccion` para dejar una jerarquía de dos niveles (paquete contratado + proveedor activo).

## Contexto

Antes de SEL-6811, `active` existía por proveedor en BD pero no tenía interfaz en Selección. Aunque `Provider.enabled` ya filtraba por `active` en el selector de envío, `integration_enabled?` no consideraba `active`, dejando inconsistencias en otros puntos del flujo y una puerta abierta si algún caller omitía `enabled`.

El paquete de pruebas se contrata desde el Marketplace. Cuando está contratado, `General.habilitar_pruebas_de_seleccion` es `true` — solo lectura desde Selección. Esta misión no modifica ese campo ni la contratación del paquete.

Esta misión resuelve jerarquía de configuración y deprecación del switch legacy. La reportería agregada de consumo/gasto queda para fases posteriores del track.

## Criterios de Aceptación

| ID | Criterio |
|----|----------|
| CA-01 | El admin accede a `Selección > Administración > Proveedores de pruebas` y ve una tabla con proveedores `scope: marketplace`. |
| CA-02 | La vista muestra chip "Contratado" o "No contratado" según `General.habilitar_pruebas_de_seleccion`. |
| CA-03 | Con paquete contratado, el admin puede activar/desactivar proveedores por fila y en masa. |
| CA-04 | Al activar (fila o batch), aparece diálogo de confirmación sobre costo por evaluación; la acción no procede sin confirmar. |
| CA-05 | Al desactivar (fila o batch), no hay diálogo de confirmación. |
| CA-06 | Cada operación muestra alert de resultado con copy acordado (éxito total, parcial o error). |
| CA-07 | Sin paquete contratado, la vista es solo lectura: sin columna Estado ni acciones de activación/desactivación. |
| CA-08 | En el selector de envío, el reclutador no ve proveedores con `active: false`. |
| CA-09 | Evaluaciones ya enviadas siguen vigentes al desactivar un proveedor (la desactivación bloquea nuevos envíos). |
| CA-10 | `General.activar_pruebas_de_seleccion` deja de existir en Generales > Selección y el marketplace deja de depender de ese switch. |
| CA-11 | `Provider#integration_enabled?` retorna `false` cuando `active: false`; con `active: true`, preserva lógica del adapter/FF. |
| CA-12 | Sin paquete contratado (`habilitar_pruebas_de_seleccion: false`), el selector de envío no ofrece proveedores marketplace. |
| CA-13 | La tabla incluye columnas informativas de precio, moneda e hito de cobro en modo solo lectura (catálogo estático). |
| CA-14 | Existe acción para ver detalle de pruebas por proveedor (modal catálogo). |
| CA-15 | El tab "Proveedores de pruebas" es visible solo con FF `sel_configuracion_proveedores` activa y permiso `:settings`. |

## Fuera de Alcance

- Contratar o cancelar el paquete de pruebas (Marketplace de Buk).
- Agregar nuevos proveedores al catálogo (track `0520_nuevos-proveedores-marketplace`).
- Modificar precios, condiciones o costos por evaluación de los proveedores.
- Gestionar proveedores `client_specific`.
