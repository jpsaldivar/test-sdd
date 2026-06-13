# Spec Track: Screening Inteligente

**Equipo:** Recruiting
**Tablero Jira:** SEL
**Jira Card:** SEL-6885
**Owner:** Catalina Anguita
**Reviewer:** Stakeholders / líderes de equipo
**Status:** draft

## Problema

El screening es la tarea que más tiempo consume al recruiter y donde más se pierden buenos candidatos. Con 200 o más postulaciones por vacante, los recruiters pasan entre 5 y 15 horas por proceso revisando CVs uno a uno — tiempo que no es proporcional al volumen, y que en procesos masivos simplemente no alcanza. El resultado no es solo ineficiencia: es pérdida de talento. Procesos se cierran antes de tiempo, candidatos con perfil no convencional quedan invisibles, y candidatos ideales que llegaron tarde nunca son revisados.

El módulo tiene hoy un scoring de IA (BukAI) que en teoría debería ayudar, pero no genera suficiente confianza para delegar en él ninguna decisión real. Los recruiters lo describen como una caja negra: no saben por qué un candidato tiene 3 estrellas y no 4, no pueden configurarlo con sus criterios reales, y han visto candidatos claramente calificados con nota baja. WOM lo desactivó para cargos masivos. Copec reportó confusión frente a líderes de área. Internamente en Buk, los recruiters lo usan "de apoyo" pero igual revisan todos los CVs.

El problema de fondo es que hoy no existe ninguna herramienta dentro del módulo que le diga al recruiter cuáles candidatos merecen atención prioritaria, con un razonamiento que pueda entender, cuestionar y calibrar.

## Objetivos

- Reducir el tiempo promedio de screening en la primera etapa sin que el recruiter pierda el control sobre qué candidatos avanzan
- Lograr que los recruiters tomen decisiones basadas en las recomendaciones del agente, sin necesidad de leer cada CV
- Reemplazar la percepción de "caja negra" del scoring actual por un sistema con razonamiento visible y configurable

## No Objetivos

- El agente no contacta candidatos directamente (línea roja identificada en todas las entrevistas de discovery)
- No se reemplaza el flujo de etapas del ATS ni el pipeline existente
- No se construye un sistema de evaluación psicométrica ni pruebas técnicas automatizadas
- No se aborda la publicación de vacantes ni la atracción de candidatos

## Impacto en Usuarios

**Recruiter:** Puede completar el screening de todos los candidatos de un proceso sin leer cada CV. Ve qué candidatos priorizar y por qué. Aprueba o revierte las recomendaciones del agente individualmente o en batch. Si el hiring manager ajusta los requisitos a mitad del proceso, puede re-evaluar a todos los candidatos con los nuevos criterios sin partir de cero.

**Administrador del proceso:** Puede habilitar y deshabilitar el agente por proceso, configurar los criterios de búsqueda antes de que lleguen candidatos, y ajustar qué información toma en cuenta el agente (descripción del cargo, criterios propios, campo abierto).

## Métricas de Éxito

| Métrica | Línea Base | Objetivo |
|---------|-----------|---------|
| Tiempo promedio de screening en etapa 1 | 5–15 horas por proceso (revisión 100% manual) | Reducción medible vía `time_in_stage` antes vs. después |
| % de procesos activos donde el recruiter ejecuta al menos una acción desde el agente | 0% | ≥ 15% a los 60 días del lanzamiento |
| Tasa de reversión de acciones del agente | — | < 30% |
| Coherencia del scoring (evaluador en Langfuse) | — | ≥ 90% sobre set de validación |
| Tenants que contratan el agente (corto plazo) | 0 | A definir con Rapanui |

## Restricciones

- El agente opera bajo el modelo estándar de la industria: la IA sugiere, el recruiter decide. Ninguna acción sobre candidatos se ejecuta sin aprobación explícita.
- La explicabilidad del razonamiento es un requisito no negociable: cada recomendación debe ir acompañada de un razonamiento legible para el recruiter.
- La funcionalidad se construirá como add-on con modelo de precios a definir (por tenant, por acción, u otro).
- El agente debe convivir con el scoring BukAI existente sin generar confusión al recruiter.

## Misiones a Considerar

- **Ranking explicable** — el recruiter ve cuáles candidatos priorizar y por qué, sin leer cada CV. Primer valor entregado: visibilidad inmediata sobre el pool de candidatos.
- **Acciones sobre candidatos** — el recruiter puede avanzar, descartar o marcar para revisión desde el agente, individualmente o en batch. Convierte el ranking en decisiones reales dentro del pipeline.
- **Configuración de criterios** — el administrador define qué busca el agente antes de que lleguen candidatos. Permite adaptar el agente a cada proceso y tipo de cargo.
- **Re-evaluación de candidatos** — cuando el hiring manager ajusta el perfil a mitad del proceso, los candidatos ya evaluados se re-rankean automáticamente con los nuevos criterios.

## Preguntas Abiertas

- ¿El agente actúa solo sobre candidatos nuevos desde la activación, o también re-evalúa candidatos existentes en etapa 1 al activarse por primera vez?
- ¿Cuál es el modelo de precios del add-on? (por tenant / por colaborador / por acción / trial gratuito)
- ¿Qué pasa cuando la confianza del agente es baja o los datos del candidato son insuficientes para emitir una recomendación?
- ¿Cómo se presenta al recruiter la relación entre la recomendación del agente y el scoring BukAI existente, sin generar confusión?
- ¿Las acciones del agente quedan registradas con autoría "IA" en el historial del candidato, diferenciadas de las acciones manuales?

## Referencias

- PDF de discovery interno: "Plantilla Negocio: Track Screening Inteligente"
- Benchmarks: Gem (AI Recruiter), Ashby, Greenhouse + Gemini, Screenloop
- Entrevistas de discovery: Josefina Peña (buk.buk), Copec, WOM, Buk MX-CH, Buk PE-CO, Triple Alianza, Blumar
