# Spec Misión: SDD Viewer completo

**Track:** SDD Viewer — Vista web de specs
**Epic:** —
**Owner:** JP
**Reviewer:** core-sdd
**Status:** ready
**Dependencias:** none

## Objetivo

Construir el SDD Viewer completo: aplicación web estática en GitHub Pages que permite a cualquier miembro del equipo leer specs del repositorio `sdd-buk-docs` y comentar por sección usando GitHub Issues como backend, autenticándose con su cuenta de GitHub.

## Contexto

El flujo SDD almacena todos los documentos de discovery y diseño técnico como archivos Markdown en GitHub. Esto funciona bien como fuente de verdad, pero la colaboración durante las fases tempranas es difícil: los PMs y stakeholders no tienen una interfaz cómoda para leer y discutir los docs sin contexto de Git. El flujo anterior usaba Google Docs, donde escritura y conversación ocurrían en el mismo espacio — esa capacidad se perdió al migrar a GitHub.

El SDD Viewer recupera esa capacidad sin abandonar GitHub como fuente de verdad: renderiza los `.md` directamente desde la rama del track y usa GitHub Issues como storage de comentarios, organizados por sección del documento.

El repositorio `sdd-buk-docs` es privado. Todos los usuarios que acceden al viewer ya tienen cuentas de GitHub con acceso al repo — el flujo de autenticación es GitHub OAuth directo, sin proxy.

## Criterios de Aceptación

- Un PM puede abrir el link del viewer y leer el spec-track completo sin necesidad de abrir GitHub.
- Un hilo con 3 replies se muestra completo al expandirlo en el sidebar.
- Una sección con 2 hilos muestra el contador "2 hilos" y al hacer click el sidebar filtra correctamente mostrando solo esos hilos.
- Al crear un nuevo track con `/sdd-track`, el output del SDD agent incluye el link al viewer.
- El viewer carga en menos de 2 segundos en una conexión normal.
- El link es compartible directamente entre personas con acceso al repo.

## Fuera de Alcance

- Edición de archivos `.md` desde el viewer.
- Comentar sin cuenta de GitHub — el repo es privado y la autenticación OAuth es obligatoria; no habrá comentarios anónimos ni alias libres.
- Notificaciones por email o Slack al recibir comentarios.
- Aprobaciones formales o firma digital de documentos.
- Historial de versiones del documento en el viewer.
- Vista mobile optimizada (target: desktop).
- Acceso de lectura sin autenticación.

## Dependencias

- Definir el mecanismo de intercambio OAuth (`code → token`) antes de iniciar el desarrollo — el `client_secret` no puede estar en el frontend. Opciones: Cloudflare Worker mínimo (~30 líneas) o GitHub Device Flow. Esta decisión debe tomarse al inicio de la misión.
- Activar GitHub Pages en el repositorio `sdd-buk-docs` (rama `gh-pages`).
- Crear GitHub OAuth App en la organización `bukhr` con el redirect URI del viewer.

## Preguntas Abiertas

- ¿Dominio final del viewer? (`bukhr.github.io/sdd-buk-docs/` vs custom domain como `sdd.buk.internal`). Afecta el redirect URI de la OAuth App y las URLs que el SDD agent genera.
- ¿Mecanismo de intercambio OAuth: Cloudflare Worker o GitHub Device Flow? Cloudflare es transparente para el usuario; Device Flow requiere copiar un código en github.com.
