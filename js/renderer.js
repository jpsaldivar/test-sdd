/**
 * renderer.js — Renderiza Markdown con marked.js e identifica secciones ##
 *
 * Cada heading ## se convierte en una .sdd-section con data-section-slug.
 * El slug es determinístico: lowercase, sin acentos, espacios → guiones.
 */

export class Renderer {
  /**
   * Renderiza el contenido Markdown.
   * @returns {{ html: string, sections: string[] }} HTML y lista de slugs de sección
   */
  render(markdown) {
    if (typeof marked === 'undefined') {
      throw new Error('marked.js no está cargado');
    }

    const sections = [];

    // Override del renderer de marked para headings ##
    const walkTokens = (token) => {
      if (token.type === 'heading' && token.depth === 2) {
        const slug = slugify(token.text);
        sections.push(slug);
      }
    };

    marked.use({ walkTokens });

    const rawHtml = marked.parse(markdown);

    // Envuelve cada ## en un .sdd-section con data-section-slug
    const html = rawHtml.replace(
      /<h2[^>]*>(.*?)<\/h2>/gi,
      (match, content) => {
        const slug = slugify(stripTags(content));
        return `</div><div class="sdd-section" data-section-slug="${slug}"><h2>${content}</h2>`;
      }
    ).replace(/^<\/div>/, '') + '</div>';
    // Nota: el primer </div> inicial es artefacto del replace; lo eliminamos.

    return { html, sections };
  }
}

/**
 * Convierte un texto de heading a slug de sección.
 * Fuente de verdad para todo el proyecto — no duplicar esta lógica.
 *
 * "## Métricas de éxito"  → "metricas-de-exito"
 * "## Fuera de scope"     → "fuera-de-scope"
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // strip diacritics
    .replace(/[^a-z0-9\s-]/g, '')      // solo alfanumérico, espacios y guiones
    .trim()
    .replace(/\s+/g, '-');             // espacios → guiones
}

function stripTags(html) {
  return html.replace(/<[^>]*>/g, '');
}
