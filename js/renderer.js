/**
 * renderer.js — Renderiza Markdown con marked.js e identifica secciones ##
 *
 * Soporta bloques ```mermaid``` — los transforma en <div class="mermaid">
 * para que mermaid.js los procese con mermaid.run().
 */

export class Renderer {
  /**
   * Renderiza el contenido Markdown.
   * @returns {{ html: string, sections: string[] }}
   */
  render(markdown) {
    if (typeof marked === 'undefined') throw new Error('marked.js no está cargado');

    const sections = [];

    marked.use({
      walkTokens(token) {
        if (token.type === 'heading' && token.depth === 2) {
          sections.push(slugify(token.text));
        }
      },
    });

    const rawHtml = marked.parse(markdown);

    // Envuelve cada ## en .sdd-section con data-section-slug
    const withSections = rawHtml
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, (_, content) => {
        const slug = slugify(stripTags(content));
        return `</div><div class="sdd-section" data-section-slug="${slug}"><h2>${content}</h2>`;
      })
      .replace(/^<\/div>/, '') + '</div>';

    // Transforma bloques <pre><code class="language-mermaid">…</code></pre>
    // en <div class="mermaid">…</div> para que mermaid.js los renderice
    const html = withSections.replace(
      /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/gi,
      (_, code) => `<div class="mermaid">${unescapeHtml(code)}</div>`
    );

    return { html, sections };
  }

  /**
   * Inicializa mermaid y renderiza los diagramas en el DOM.
   * Llamar después de setear innerHTML del área de contenido.
   */
  async renderMermaid() {
    if (typeof mermaid === 'undefined') return;
    try {
      await mermaid.run({ querySelector: '.mermaid' });
    } catch (e) {
      console.warn('mermaid.run error:', e);
    }
  }
}

/**
 * Convierte texto de heading a slug de sección.
 * Fuente de verdad para todo el proyecto — no duplicar.
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function stripTags(html) {
  return html.replace(/<[^>]*>/g, '');
}

function unescapeHtml(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
}
