# Spec Track: Flujo de pruebas en Selección

**Equipo:** Recruiting
**Tablero Jira:** SEL
**Jira Card:** pendiente (track)
**Owner:** (PM)
**Reviewer:** Stakeholders / EM / Product Design
**Status:** draft

## Problema

Hoy Buk pierde uso, ventas y engagement del módulo de Selección porque no resuelve bien el flujo de pruebas.

Tras el trabajo de tracks previos de recruiting (incorporación de proveedores marketplace y flujo de envíos), los principales dolores no resueltos son:

**No hay una visión 360° real del postulante.** La información clave para tomar decisiones de selección está fragmentada, desordenada o fuera de la plataforma. Las principales fricciones sobre el postulante son:

- **Mezcla de conceptos en la ficha del postulante:** en la vista del postulante, pruebas y formularios se muestran juntos, sin separación clara. Esto saca al reclutador del contexto y dificulta entender qué información corresponde a evaluación vs. recolección de datos.
- **Resultados de pruebas externas no pueden integrarse:** si una evaluación se realiza fuera de Buk, no existe una forma nativa de subir y visualizar resultados dentro de la ficha o modal del candidato. Esto obliga a usar PDFs, links o plataformas externas.
- **No existe historial de evaluaciones por candidato:** cuando un reclutador vuelve a evaluar a un candidato en otro proceso o cargo, solo puede ver sus evaluaciones anteriores si entra al proceso antiguo, sin visibilidad de que esa información existe en su contexto actual. Esto genera repetición innecesaria de pruebas, pérdida de información valiosa y decisiones de menor calidad.
- **Dificultad para comparar candidatos:** hoy el reclutador debe elegir entre ver pruebas en una vista o ver el resto de la información del candidato en otra (tabla/listado). No hay una forma clara y rápida de entender quién es mejor candidato considerando toda la información disponible.
- **No existe control de costos:** el cliente no tiene visibilidad de cuántas pruebas tiene, cuánto ha gastado, etc.
- **Configuración inconsistente del módulo:** los administradores no controlan de forma autónoma qué proveedores están activos; los reclutadores ven opciones que la empresa no utiliza; y la jerarquía entre paquete contratado y proveedor individual genera “switches que no funcionan” e incidencias de soporte.

Esto genera fuga hacia plataformas externas, menor adopción del módulo y desventaja competitiva frente a ATS con pruebas integradas.

## Objetivos

Convertir las pruebas de Selección en una herramienta **auto-gestionable** y **financieramente segura**, donde:

- El cliente tenga control total sobre lo que gasta.
- El reclutador no encuentre trabas lógicas al configurar y operar el proceso de envío de pruebas.
- Envíos y resultados sean visibles, trazables y reutilizables por postulante.
- La gestión del flujo sea simple y centralizada para el reclutador.

## Scope del track

### Problemas que aborda

| Área | Problema |
|------|----------|
| Trazabilidad | Resultados no reutilizables ni centralizados |
| Historial | Sin historial de envíos o resultados por candidato |
| Costos | No hay forma de controlar ni visibilizar el gasto en pruebas |
| Configuración | Proveedores y paquete sin jerarquía clara ni ownership en Selección |
| Experiencia reclutador | Ficha fragmentada; comparación de candidatos difícil |

### Alcance actual vs discovery

- **Alcance actual (SEL-6811):** configuración granular de proveedores, consistencia de activación y deprecación de `activar_pruebas_de_seleccion`.
- **Pendiente discovery:** historial cross-proceso, resultados externos, comparación de candidatos y reportería agregada de costos/consumo.

## No Objetivos

- Contratar o cancelar el paquete de pruebas en el Marketplace global de Buk.
- Agregar nuevos proveedores al catálogo (tracks de integración / marketplace).
- Modificar precios, condiciones comerciales o costos unitarios por evaluación de cada proveedor.
- Implementar reportería agregada de consumo, presupuestos o límites de gasto en esta fase.
- Rediseñar la ficha completa del postulante más allá del área de evaluaciones y lo que discovery valide.

## Impacto en Usuarios

**Reclutadores (alcance actual):** operan envíos con proveedores realmente habilitados por configuración de empresa, sin switches redundantes.

**Administradores de empresa (alcance actual):** configuran proveedores desde Selección y entienden si el paquete está contratado.

**Impacto esperado post-discovery:** historial reutilizable, comparación de candidatos y visibilidad de consumo/gasto.

**Candidatos:** menos pruebas repetidas innecesarias cuando ya existen resultados previos.

**Buk:** mayor adopción del módulo, menos fuga a herramientas externas y mejor posicionamiento frente a ATS con evaluaciones integradas.

## Métricas de Éxito

| Horizonte | Métrica | Línea base | Objetivo |
|-----------|---------|------------|----------|
| Roll-out | Adopción en pilotos | 0 pilotos activos | Al menos **5 pilotos** usando configuración granular en flujo real |
| Corto plazo | Interés comercial | Por medir | Al menos **20 empresas** interesadas en activar el módulo |
| Mediano plazo | Adopción de configuración granular | 0% tenants con gestión post-lanzamiento | ≥30% de tenants con paquete contratado y al menos un evento de gestión (`provider_activated` o `provider_deactivated`) en 60 días post GA |
| Operación | Incidencias “switches que no funcionan” | Baseline por medir en soporte (90 días pre-GA) | Reducción ≥80% vs baseline en 60 días post GA y 0 incidentes P1 |
| Mediano plazo | Evaluaciones duplicadas por candidato | Por medir en discovery | Reducción medible tras historial unificado |

> Las métricas de historial, comparación y costos se detallan al cierre del discovery.

## Restricciones

- Evaluaciones ya enviadas deben seguir vigentes al desactivar un proveedor o cambiar configuración.
- Cualquier cambio de scope durante discovery debe documentarse de forma explícita.
- Las soluciones esquemáticas deben validarse con clientes antes de entrar al detalle técnico.

## Fases

### Fase 1 — entrega actual (SEL-6811)

- Configuración granular de proveedores en Selección.
- Deprecación de `General.activar_pruebas_de_seleccion`.
- Validación operativa con eventos de adopción e incidencias de soporte.

### Fase 2 — discovery

Definir el plan de discovery (checkpoints, metodologías, acuerdo con PD). Si el scope cambia en discovery, actualizar este spec-track explícitamente.

**Sugerencias de plan discovery:**

- Interrogantes que hay que resolver.
- Next steps con fechas deseadas.
- Roadmap de trabajo.
- Plan conjunto con PD para información cualitativa y cuantitativa.
- Plan de validación de hipótesis.
- Validación con clientes de soluciones esquemáticas **antes** del detalle de implementación.

### Fase 3 — roll-out

- Pilotos con acompañamiento cercano.
- Objetivo: al menos 5 pilotos usando el flujo con configuración granular sin incidencias críticas.
