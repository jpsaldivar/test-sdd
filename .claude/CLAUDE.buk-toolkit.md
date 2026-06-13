<!--
DO NOT EDIT — Sincronizado desde el plugin claude-toolkit.
Si se quiere editar el estándar global, hacer un PR en https://github.com/bukhr/buk-skills.
-->
# claude-toolkit — Convenciones para repos target

Estás en un repositorio target de claude-toolkit, plugin organizacional de bukhr para claude-code.
Estas son las reglas a seguir:

## Skill extensions

Antes de ejecutar un skill, verifica si existe `.claude/skill-extensions/<nombre-skill>.md` en el repo actual. Si existe, léelo antes de continuar — contiene reglas específicas que complementan o sobreescriben las del skill base.

## Binstub command mapping rule

Protocolo: Antes de ejecutar comandos, verifica si existe `.claude/agent-commands.yaml`. Es un archivo que declara la ubicación de binarios y reglas de entorno para ejecutar las herramientas con su configuración indicada. Contiene `commands` y `rules`.

### Commands

1. **Lookup**: compara el comando global estándar con las claves definidas en `commands:`.
2. **Rules**: si el comando tiene `rules:`, evalúa cada rule antes de ejecutar (ver sección siguiente).
3. **Argument Injection**: si el `run:` contiene `{args}`, añade todos los parámetros dinámicos (rutas, líneas, flags).
4. **Execution**: Ejecuta el run con las reglas e inyecciones apĺicadas.
5. **Fallback**: si el archivo no existe o falta la clave, usar los binstubs del proyecto en `bin/`.

### Rules

Cada rule define una condición de entorno y un prefijo a aplicar cuando se cumple, cuando no se detecta utiliza el `run` del command.

1. Correr el `detect` de cada rule listada en el comando.
2. Si el `detect` retorna exit 0: prefijar el `run:` con `run_prefix + " "` y continuar con Argument Injection, Execution y Fallback.
3. Si retorna exit non-0: dejar el `run:` tal cual y continuar con Argument Injection, Execution y Fallback.
4. Correr el `detect` una sola vez por sesión y reutilizar el resultado para los comandos siguientes.

Comandos sin `rules:` se ejecutan siempre con su `run:` literal, sin detección.

Si el comando falla en ejecución, reportar el error al usuario y detenerse.

### Ejemplo de configuración

```yaml
# .claude/agent-commands.yaml
rules:
  - name: devcontainer
    detect: "docker inspect --format '{{.State.Running}}' buk-devcontainer 2>/dev/null | grep -q true"
    run_prefix: "docker exec -i -w /usr/src/app buk-devcontainer"

commands:
  test:
    run: bin/rails test {args}
    rules: [devcontainer]
    desc: Ejecuta tests de minitest. Acepta paths (test/path/file.rb) o líneas (test/path/file.rb:123)
  rubocop:
    run: bin/rubocop {args}
    rules: [devcontainer]
    desc: Linter y formatter de Ruby. Acepta paths y flags como --autocorrect
  server:
    run: bin/rails server
    desc: Levanta el servidor. Sin rules — siempre se ejecuta directo.
```

Con devcontainer activo, `test` se ejecuta como `docker exec -i -w /usr/src/app buk-devcontainer bin/rails test {args}`. Sin devcontainer, se ejecuta como `bin/rails test {args}`.

## Lessons Learned

Usa la skill lessons-learned cuando el usuario corrija tu enfoque o al finalizar
una tarea, para guardar lecciones reutilizables. No la invoques al inicio de una
tarea — esta skill solo escribe lecciones; no hace recall (no carga lecciones
previas al contexto para guiar tu trabajo).
