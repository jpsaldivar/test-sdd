/**
 * github-api.js — Wrapper para GitHub Contents API + Issues API
 *
 * Cache: sessionStorage, TTL 60s por clave.
 * Escrituras (createIssue, addComment) invalidan el cache de issues del track.
 */

const CACHE_TTL_MS = 60_000;
const API_BASE = 'https://api.github.com';

export class GitHubApi {
  constructor(owner, repo, auth) {
    this.owner = owner;
    this.repo  = repo;
    this.auth  = auth;
  }

  // ─── User ───────────────────────────────────────────────────

  async getCurrentUser() {
    return this._cachedGet('current-user', `${API_BASE}/user`);
  }

  // ─── Branches ──────────────────────────────────────────────

  /**
   * Retorna la lista de ramas del repo.
   */
  async getBranches() {
    const url = `${API_BASE}/repos/${this.owner}/${this.repo}/branches?per_page=100`;
    return this._cachedGet('branches', url);
  }

  // ─── Contents ──────────────────────────────────────────────

  /**
   * Devuelve la estructura completa del track:
   * archivos .md en la raíz y misiones (subdirectorios NN_*) con sus archivos.
   * @returns {{ files: string[], missions: { name: string, files: string[] }[] }}
   */
  async getTrackStructure(team, track, branch = null) {
    const year = await this._resolveTrackYear(team, track, branch);
    const ref  = branch ? `?ref=${encodeURIComponent(branch)}` : '';
    const url  = `${API_BASE}/repos/${this.owner}/${this.repo}/contents/teams/${team}/tracks/${year}/${track}${ref}`;
    const items = await this._cachedGet(`structure:${team}/${track}:${branch}`, url);

    const files    = items.filter(i => i.type === 'file' && i.name.endsWith('.md')).map(i => i.name).sort(fileOrder);
    const missionDirs = items.filter(i => i.type === 'dir' && /^\d{2}_/.test(i.name)).sort((a, b) => a.name.localeCompare(b.name));

    const missions = await Promise.all(missionDirs.map(async dir => {
      const mUrl  = `${API_BASE}/repos/${this.owner}/${this.repo}/contents/teams/${team}/tracks/${year}/${track}/${dir.name}${ref}`;
      const mItems = await this._cachedGet(`structure:${team}/${track}/${dir.name}:${branch}`, mUrl);
      const mFiles = mItems.filter(i => i.type === 'file' && i.name.endsWith('.md')).map(i => i.name).sort(fileOrder);
      return { name: dir.name, files: mFiles };
    }));

    return { files, missions };
  }

  /**
   * Lista los archivos .md de un track (o misión) en orden de fase.
   * @param {string|null} branch - rama a leer; null = rama por defecto del repo
   */
  async listTrackFiles(team, track, mission = null, branch = null) {
    const path = mission
      ? `teams/${team}/tracks/${await this._resolveTrackYear(team, track, branch)}/${track}/${mission}`
      : `teams/${team}/tracks/${await this._resolveTrackYear(team, track, branch)}/${track}`;

    const ref = branch ? `?ref=${encodeURIComponent(branch)}` : '';
    const items = await this._cachedGet(`contents:${path}:${branch}`,
      `${API_BASE}/repos/${this.owner}/${this.repo}/contents/${path}${ref}`);

    return items
      .filter(f => f.type === 'file' && f.name.endsWith('.md'))
      .map(f => f.name)
      .sort(fileOrder);
  }

  /**
   * Lee el contenido de un archivo .md (decodifica base64).
   * @param {string|null} branch - rama a leer; null = rama por defecto del repo
   */
  async getFileContent(team, track, filename, mission = null, branch = null) {
    const year = await this._resolveTrackYear(team, track, branch);
    const dir  = mission
      ? `teams/${team}/tracks/${year}/${track}/${mission}`
      : `teams/${team}/tracks/${year}/${track}`;
    const path = `${dir}/${filename}`;
    const ref  = branch ? `?ref=${encodeURIComponent(branch)}` : '';

    const data = await this._cachedGet(`file:${path}:${branch}`,
      `${API_BASE}/repos/${this.owner}/${this.repo}/contents/${path}${ref}`);

    return atob(data.content.replace(/\n/g, ''));
  }

  // ─── Issues ────────────────────────────────────────────────

  /**
   * Retorna todos los Issues etiquetados con sdd:{team}/{track}/*.
   * Incluye abiertos y cerrados.
   */
  async getIssues(team, track) {
    const labelPrefix = `sdd:${team}/${track}`;
    const url = `${API_BASE}/repos/${this.owner}/${this.repo}/issues?labels=${encodeURIComponent(labelPrefix)}&state=all&per_page=100`;
    return this._cachedGet(`issues:${team}/${track}`, url);
  }

  /**
   * Retorna los comments de un Issue.
   */
  async getIssueComments(issueNumber) {
    const url = `${API_BASE}/repos/${this.owner}/${this.repo}/issues/${issueNumber}/comments`;
    return this._cachedGet(`comments:${issueNumber}`, url);
  }

  /**
   * Crea un Issue con el label de sección correcto.
   */
  async createIssue(team, track, sectionSlug, title, body) {
    // Dos labels: track (para buscar todos los issues del track) +
    // sección (para filtrar por sección en el sidebar)
    const trackLabel   = `sdd:${team}/${track}`;
    const sectionLabel = `sdd:${team}/${track}/${sectionSlug}`;
    await this._ensureLabelExists(trackLabel);
    await this._ensureLabelExists(sectionLabel);

    const url = `${API_BASE}/repos/${this.owner}/${this.repo}/issues`;
    const res = await this._fetch(url, {
      method: 'POST',
      body: JSON.stringify({ title, body, labels: [trackLabel, sectionLabel] }),
    });

    this._invalidateCache(`issues:${team}/${track}`);
    return res;
  }

  async _ensureLabelExists(labelName) {
    // Siempre intenta crear — si el label ya existe GitHub retorna 422,
    // que ignoramos. Así evitamos el GET previo que falla con labels que
    // tienen slashes en el path URL.
    try {
      const url = `${API_BASE}/repos/${this.owner}/${this.repo}/labels`;
      await this._fetch(url, {
        method: 'POST',
        body: JSON.stringify({ name: labelName, color: '6f42c1' }),
      });
    } catch {
      // 422 = ya existe, cualquier otro error = no crítico
    }
  }

  /**
   * Agrega un comment a un Issue existente.
   */
  async addComment(issueNumber, body) {
    const url = `${API_BASE}/repos/${this.owner}/${this.repo}/issues/${issueNumber}/comments`;

    const res = await this._fetch(url, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });

    this._invalidateCache(`comments:${issueNumber}`);
    return res;
  }

  // ─── Internals ─────────────────────────────────────────────

  async _resolveTrackYear(team, track, branch = null) {
    const ref = branch ? `?ref=${encodeURIComponent(branch)}` : '';
    const url = `${API_BASE}/repos/${this.owner}/${this.repo}/contents/teams/${team}/tracks${ref}`;
    const years = await this._cachedGet(`years:${team}:${branch}`, url);

    for (const yearDir of years.filter(d => d.type === 'dir')) {
      const tracksUrl = `${API_BASE}/repos/${this.owner}/${this.repo}/contents/teams/${team}/tracks/${yearDir.name}${ref}`;
      const tracks = await this._cachedGet(`tracks:${team}:${yearDir.name}:${branch}`, tracksUrl);
      if (tracks.some(t => t.name === track)) return yearDir.name;
    }

    throw new Error(`Track "${track}" no encontrado en teams/${team}/tracks/`);
  }

  async _cachedGet(cacheKey, url) {
    const cached = this._readCache(cacheKey);
    if (cached) return cached;
    const data = await this._fetch(url);
    this._writeCache(cacheKey, data);
    return data;
  }

  async _fetch(url, options = {}) {
    const token = this.auth.getToken();
    const res = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (res.status === 401) {
      this.auth.logout();
      throw new Error('Token inválido — redirigiendo a login');
    }

    if (!res.ok) {
      throw new Error(`GitHub API error ${res.status}: ${url}`);
    }

    return res.json();
  }

  _readCache(key) {
    const raw = sessionStorage.getItem(`sdd_cache:${key}`);
    if (!raw) return null;
    try {
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts > CACHE_TTL_MS) return null;
      return data;
    } catch {
      return null;
    }
  }

  _writeCache(key, data) {
    sessionStorage.setItem(`sdd_cache:${key}`, JSON.stringify({ ts: Date.now(), data }));
  }

  _invalidateCache(key) {
    sessionStorage.removeItem(`sdd_cache:${key}`);
  }
}

// Orden canónico de documentos por fase SDD
const FILE_ORDER = ['spec-track.md', 'track.md', 'spec-mission.md', '1_mission.md', '2_jira-cards.md', 'pruebas.md', '3_summary.md'];

function fileOrder(a, b) {
  const ia = FILE_ORDER.indexOf(a);
  const ib = FILE_ORDER.indexOf(b);
  if (ia === -1 && ib === -1) return a.localeCompare(b);
  if (ia === -1) return 1;
  if (ib === -1) return -1;
  return ia - ib;
}
