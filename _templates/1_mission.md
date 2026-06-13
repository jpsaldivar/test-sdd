# Misión: [Nombre]

**Track:** [Nombre del track]
**Epic:** [Clave del epic en Jira, ej. SEL-1234]
**Owner:** [Champion]
**Reviewer:** [EM + Arquitecto del track]
**Status:** draft | ready | in-progress | done
**Dependencias:** none | [01-nombre-mision, ...]

## Objetivo

[Una oración. Qué entrega esta misión y por qué importa.]

## Contexto

[Qué necesita saber el agente o desarrollador que no está en track.md. Evitar repetir contexto del track.]

## Criterios de Aceptación No Funcionales (opcional)

Detallan cómo se satisface cada RNF del track en el contexto específico de esta misión. No crean RNF nuevos — si aparece uno no declarado en el track, debe registrarse allí primero.

| ID CA-NF | RNF de origen | Criterio de aceptación no funcional |
|----------|--------------|--------------------------------------|
| CA-NF-01 | RNF-01 | [cómo se satisface esta restricción en el contexto de esta misión] |

## Especificación Técnica

### Diagramas

[Diagramas Mermaid necesarios para esta misión. Usar `erDiagram` para modelo de datos, `graph LR` para flujos, `sequenceDiagram` para interacciones. Solo los relevantes para entender la solución.]

### APIs (opcional)

[Si la misión modifica endpoints existentes o agrega nuevos. Qué cambia, quién lo consume, implicancias de frecuencia o volumen.]

### Infraestructura (opcional)

[¿Requiere apoyo de SRE o cambios en infraestructura? ¿Ya fueron informados y validaron?]

## Alternativas de Solución (opcional)

Solo cuando la misión enfrenta una decisión técnica no resuelta en el track y con alternativas reales de implementación. Documentadas en [`ADR/NN_[descripcion].md`](ADR/).

## Riesgos (opcional)

Solo si hay riesgos específicos de esta misión no cubiertos en el track.

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| [descripción del riesgo] | Alta / Media / Baja | Alto / Medio / Bajo | [estrategia] |

## Instrumentación para Métricas (opcional)

Solo si esta misión introduce instrumentación específica no cubierta en el track, o si implementa lo ya declarado en él.

## Documentación

Identificar qué documentación queda desactualizada con estos cambios:

- [ ] README del pack `[pack-path]` actualizado
- [ ] Documentación adicional del pack o proyecto: [enlace]
- [ ] Clases, servicios y métodos importantes documentados en el código

## Fuera de Alcance

- [Exclusiones explícitas para evitar scope creep]

## Preguntas Abiertas

- [Decisiones no resueltas que bloquean o afectan la implementación]
