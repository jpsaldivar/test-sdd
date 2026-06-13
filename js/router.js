/**
 * router.js — Routing basado en query params
 *
 * URLs:
 *   /?team=T&track=S                           → track, doc por defecto
 *   /?team=T&track=S&mission=01                → misión
 *   /?team=T&track=S&doc=spec-track            → documento específico
 *   /?team=T&track=S&doc=spec-track&section=X  → deep link a sección
 */

export class Router {
  getParams() {
    const p = new URLSearchParams(location.search);
    return {
      team:    p.get('team')    || null,
      track:   p.get('track')   || null,
      mission: p.get('mission') || null,
      doc:     p.get('doc')     || null,
      section: p.get('section') || null,
    };
  }

  setParam(key, value) {
    const p = new URLSearchParams(location.search);
    if (value === null || value === undefined) {
      p.delete(key);
    } else {
      p.set(key, value);
    }
    history.pushState({}, '', `?${p.toString()}`);
  }

  /**
   * Genera el link al viewer para un track.
   * Usado por el SDD agent output.
   */
  static buildTrackUrl(baseUrl, team, track) {
    return `${baseUrl}?team=${team}&track=${track}`;
  }

  static buildMissionUrl(baseUrl, team, track, missionN) {
    return `${baseUrl}?team=${team}&track=${track}&mission=${missionN}`;
  }

  static buildSectionUrl(baseUrl, team, track, doc, section) {
    return `${baseUrl}?team=${team}&track=${track}&doc=${doc}&section=${section}`;
  }
}
