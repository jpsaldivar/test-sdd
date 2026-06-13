/**
 * sidebar.js — Hilos de comentarios por sección
 *
 * Responsabilidades:
 *   - Leer Issues de GitHub agrupados por sección
 *   - Renderizar el sidebar con hilos, expand/collapse y replies
 *   - Crear nuevos Issues (nuevo hilo) y agregar comments (reply)
 *   - Decorar las secciones del documento con contadores y barra de color
 */

const INACTIVE_THRESHOLD_MS = 48 * 60 * 60 * 1000; // 48h

export class Sidebar {
  constructor(api, router) {
    this.api    = api;
    this.router = router;
    this._team  = null;
    this._track = null;
    this._issues = [];          // todos los issues del track
    this._activeSection = null; // slug de sección activa
  }

  /**
   * Carga los issues del track y renderiza el sidebar.
   * @param {string[]} sections - slugs de secciones del documento activo
   */
  async load(team, track, sections) {
    this._team    = team;
    this._track   = track;
    this._sections = sections;

    try {
      this._issues = await this.api.getIssues(team, track);
    } catch (e) {
      this._issues = [];
      console.warn('No se pudieron cargar los issues:', e);
    }

    this._decorateSections();
    this._renderSidebar(sections);

    // Deep link: si hay ?section=X, enfocar esa sección
    const params = this.router.getParams();
    if (params.section) this.focusSection(params.section);
  }

  focusSection(sectionSlug) {
    this._activeSection = sectionSlug;
    this._renderSidebar(this._sections);

    // Scroll del documento a la sección
    const el = document.querySelector(`[data-section-slug="${sectionSlug}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ─── Decoración del documento ────────────────────────────

  _decorateSections() {
    document.querySelectorAll('.sdd-section').forEach(el => {
      const slug   = el.dataset.sectionSlug;
      const issues = this._issuesForSection(slug);

      if (issues.length > 0) {
        el.classList.add('has-threads');
        const h2 = el.querySelector('h2');
        if (h2 && !h2.querySelector('.thread-count')) {
          const badge = document.createElement('span');
          badge.className = 'thread-count';
          badge.textContent = `${issues.length} ${issues.length === 1 ? 'hilo' : 'hilos'}`;
          badge.addEventListener('click', () => this.focusSection(slug));
          h2.appendChild(badge);
        }
      }

      // Click en la barra lateral de la sección también filtra el sidebar
      el.addEventListener('click', (e) => {
        if (e.target.closest('.thread-count')) return;
        this.focusSection(slug);
      });
    });
  }

  // ─── Render del sidebar ──────────────────────────────────

  _renderSidebar(sections) {
    const container = document.getElementById('threads-list');
    const header    = document.getElementById('sidebar-header');

    const filtered = this._activeSection
      ? sections.filter(s => s === this._activeSection)
      : sections;

    header.textContent = this._activeSection
      ? `Sección: ${this._activeSection}`
      : 'Todos los hilos';

    container.innerHTML = '';

    for (const slug of filtered) {
      const issues = this._issuesForSection(slug);
      const group  = document.createElement('div');
      group.className = 'thread-group';

      const groupHeader = document.createElement('div');
      groupHeader.className = 'thread-group-header';
      groupHeader.textContent = `## ${slug}`;
      group.appendChild(groupHeader);

      for (const issue of issues) {
        group.appendChild(this._renderThread(issue, slug));
      }

      // Botón nuevo hilo
      const newBtn = document.createElement('button');
      newBtn.className = 'new-thread-btn';
      newBtn.textContent = '+ Nuevo hilo en esta sección';
      newBtn.addEventListener('click', () => this._openNewThreadModal(slug));
      group.appendChild(newBtn);

      container.appendChild(group);
    }

    // Si no hay secciones con hilos y no hay filtro activo
    if (filtered.length === 0) {
      container.innerHTML = '<div style="padding:20px;color:#aaa;font-size:0.85rem">Sin hilos activos</div>';
    }
  }

  _renderThread(issue, sectionSlug) {
    const isInactive = this._isInactive(issue);
    const item = document.createElement('div');
    item.className = `thread-item${isInactive ? ' thread-inactive' : ''}`;
    item.dataset.issueNumber = issue.number;

    const lastComment = issue.body || '';
    const preview = lastComment.slice(0, 80) + (lastComment.length > 80 ? '…' : '');

    // Solo el header es clickeable para toggle — el área de replies no colapsa el hilo
    const header = document.createElement('div');
    header.className = 'thread-header';
    header.style.cursor = 'pointer';
    header.innerHTML = `
      <div class="thread-title">
        <span class="thread-status-dot ${issue.state}"></span>
        ${escapeHtml(issue.title)}
      </div>
      <div class="thread-preview">${escapeHtml(preview)}</div>
      <div class="thread-meta">
        <span>@${issue.user?.login || '?'}</span>
        <span>${issue.comments} ${issue.comments === 1 ? 'reply' : 'replies'}</span>
        <span>${timeAgo(issue.updated_at)}</span>
      </div>
    `;
    item.appendChild(header);
    header.addEventListener('click', () => this._toggleThread(item, issue, sectionSlug));
    return item;
  }

  async _toggleThread(itemEl, issue, sectionSlug) {
    const isExpanded = itemEl.classList.toggle('expanded');
    itemEl.querySelectorAll('.thread-replies, .reply-form').forEach(e => e.remove());
    if (!isExpanded) return;

    const repliesEl = document.createElement('div');
    repliesEl.className = 'thread-replies';
    repliesEl.innerHTML = '<div style="color:#aaa;font-size:0.8rem">Cargando…</div>';
    itemEl.appendChild(repliesEl);
    itemEl.appendChild(this._buildReplyForm(issue.number, repliesEl));

    try {
      const comments = await this.api.getIssueComments(issue.number);
      repliesEl.innerHTML = '';
      if (issue.body) {
        repliesEl.appendChild(this._renderReply({
          user: issue.user,
          body: issue.body,
          created_at: issue.created_at,
        }));
      }
      for (const c of comments) {
        repliesEl.appendChild(this._renderReply(c));
      }
    } catch (e) {
      repliesEl.innerHTML = '<div style="color:#c00;font-size:0.8rem">Error al cargar replies</div>';
    }
  }

  _renderReply(comment) {
    const el = document.createElement('div');
    el.className = 'reply-item';
    el.innerHTML = `
      <span class="reply-author">@${comment.user?.login || '?'}</span>
      <span class="reply-time">${timeAgo(comment.created_at)}</span>
      <div class="reply-body">${escapeHtml(comment.body)}</div>
    `;
    return el;
  }

  _buildReplyForm(issueNumber, repliesEl) {
    const form = document.createElement('div');
    form.className = 'reply-form';
    form.innerHTML = `
      <textarea placeholder="Escribe una respuesta…"></textarea>
      <button class="btn-sm btn-primary send-reply-btn">Responder</button>
    `;

    form.querySelector('.send-reply-btn').addEventListener('click', async () => {
      const textarea = form.querySelector('textarea');
      const body = textarea.value.trim();
      if (!body) return;

      const btn = form.querySelector('.send-reply-btn');
      btn.disabled = true;
      btn.textContent = 'Enviando…';

      try {
        const comment = await this.api.addComment(issueNumber, body);
        textarea.value = '';
        repliesEl.appendChild(this._renderReply(comment));
      } catch (e) {
        alert('Error al enviar reply. Intenta de nuevo.');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Responder';
      }
    });

    return form;
  }

  // ─── Nuevo hilo (modal) ──────────────────────────────────

  _openNewThreadModal(sectionSlug) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <h3>Nuevo hilo — <em>${sectionSlug}</em></h3>
        <label>Título</label>
        <input type="text" id="thread-title" placeholder="¿Qué quieres discutir?" />
        <div class="field-error hidden" id="title-error">El título es obligatorio</div>
        <label>Comentario inicial</label>
        <textarea id="thread-body" placeholder="Descripción del tema (opcional)"></textarea>
        <div class="modal-actions">
          <button class="btn-sm btn-secondary" id="modal-cancel">Cancelar</button>
          <button class="btn-sm btn-primary" id="modal-create">Crear hilo</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#modal-cancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('#modal-create').addEventListener('click', async () => {
      const title = overlay.querySelector('#thread-title').value.trim();
      const body  = overlay.querySelector('#thread-body').value.trim();
      const titleError = overlay.querySelector('#title-error');

      if (!title) {
        titleError.classList.remove('hidden');
        return;
      }
      titleError.classList.add('hidden');

      const btn = overlay.querySelector('#modal-create');
      btn.disabled = true;
      btn.textContent = 'Creando…';

      try {
        const issue = await this.api.createIssue(this._team, this._track, sectionSlug, title, body);
        // Optimistic update: recargar sidebar
        this._issues.unshift(issue);
        this._renderSidebar(this._sections);
        this._decorateSections();
        overlay.remove();
      } catch (e) {
        alert('Error al crear el hilo. Intenta de nuevo.');
        btn.disabled = false;
        btn.textContent = 'Crear hilo';
      }
    });
  }

  // ─── Helpers ─────────────────────────────────────────────

  _issuesForSection(sectionSlug) {
    const labelSuffix = `/${sectionSlug}`;
    return this._issues.filter(issue =>
      issue.labels?.some(l => l.name?.endsWith(labelSuffix))
    );
  }

  _isInactive(issue) {
    const lastActivity = new Date(issue.updated_at).getTime();
    return Date.now() - lastActivity > INACTIVE_THRESHOLD_MS;
  }
}

// ─── Utils ───────────────────────────────────────────────────

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function timeAgo(isoDate) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)   return 'ahora';
  if (m < 60)  return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}
