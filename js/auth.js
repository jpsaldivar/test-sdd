/**
 * auth.js — GitHub Device Flow
 *
 * Flujo:
 *   1. startDeviceFlow() → POST /login/device/code → muestra código al usuario
 *   2. pollForToken()    → POST /login/oauth/access_token cada 5s hasta aprobación
 *   3. getToken()        → lee token de sessionStorage
 *   4. logout()          → limpia sessionStorage y recarga
 */

const TOKEN_KEY = 'sdd_gh_token';

// Proxy URL — reemplazar con la URL del Cloudflare Worker tras el deploy
// El proxy existe únicamente para resolver CORS; no maneja secrets.
const PROXY_URL = 'https://sdd-oauth-proxy.ghpages.workers.dev';

const DEVICE_CODE_URL  = `${PROXY_URL}/device/code`;
const ACCESS_TOKEN_URL = `${PROXY_URL}/access_token`;
const POLL_INTERVAL_MS = 5000;

export class Auth {
  constructor(clientId) {
    this.clientId = clientId;
  }

  getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    location.reload();
  }

  async startDeviceFlow() {
    const res = await fetch(DEVICE_CODE_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ client_id: this.clientId, scope: 'repo' }),
    });

    if (!res.ok) {
      this._showError('No se pudo iniciar el proceso de login. Intenta de nuevo.');
      return;
    }

    const data = await res.json();
    this._showDeviceCode(data.user_code, data.verification_uri);
    await this._poll(data.device_code, data.interval || 5);
  }

  _showDeviceCode(userCode, verificationUri) {
    document.getElementById('login-btn').classList.add('hidden');
    const flow = document.getElementById('device-flow');
    flow.classList.remove('hidden');
    document.getElementById('device-code').textContent = userCode;
    document.getElementById('device-url').href = verificationUri;
  }

  async _poll(deviceCode, intervalSeconds) {
    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    while (true) {
      await wait(Math.max(intervalSeconds * 1000, POLL_INTERVAL_MS));

      const res = await fetch(ACCESS_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.clientId,
          device_code: deviceCode,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        }),
      });

      const data = await res.json();

      if (data.access_token) {
        sessionStorage.setItem(TOKEN_KEY, data.access_token);
        location.reload();
        return;
      }

      if (data.error === 'expired_token') {
        this._showError('El código expiró. <a href="#" id="retry-link">Intentar de nuevo</a>');
        document.getElementById('retry-link')?.addEventListener('click', (e) => {
          e.preventDefault();
          location.reload();
        });
        return;
      }

      if (data.error === 'access_denied') {
        this._showError('Acceso denegado.');
        return;
      }

      // 'authorization_pending' o 'slow_down' → seguir esperando
      if (data.error === 'slow_down') {
        intervalSeconds += 5;
      }
    }
  }

  _showError(msg) {
    const el = document.getElementById('login-error');
    el.innerHTML = msg;
    el.classList.remove('hidden');
  }
}
