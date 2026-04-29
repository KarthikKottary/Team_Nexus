/**
 * Thin API client. Reads the JWT from localStorage and attaches it
 * as a Bearer token on every protected request.
 */

const BASE_URL = '/api';

const getToken = () => localStorage.getItem('hms_token');

const headers = (auth = false) => ({
  'Content-Type': 'application/json',
  ...(auth && getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const handleResponse = async (res: Response) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (data.errors && data.errors.length > 0) {
      throw new Error(data.errors.map((e: any) => e.msg).join(', '));
    }
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

// ─── Auth ────────────────────────────────────────────────────────────────────
export const apiRegister = (body: object) =>
  fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: headers(), body: JSON.stringify(body) })
    .then(handleResponse);

export const apiLogin = (body: object) =>
  fetch(`${BASE_URL}/auth/login`, { method: 'POST', headers: headers(), body: JSON.stringify(body) })
    .then(handleResponse);

export const apiGetMe = () =>
  fetch(`${BASE_URL}/auth/me`, { headers: headers(true) }).then(handleResponse);

// ─── Teams ───────────────────────────────────────────────────────────────────
export const apiGetTeams = () =>
  fetch(`${BASE_URL}/teams`, { headers: headers() }).then(handleResponse);

export const apiGetTeamStats = () =>
  fetch(`${BASE_URL}/teams/stats`, { headers: headers(true) }).then(handleResponse);

export const apiGetTeam = (id: string) =>
  fetch(`${BASE_URL}/teams/${id}`, { headers: headers() }).then(handleResponse);

export const apiGetMyTeamDetails = () =>
  fetch(`${BASE_URL}/teams/details`, { headers: headers(true) }).then(handleResponse);

export const apiCreateMyTeam = (body: object) =>
  fetch(`${BASE_URL}/teams/create`, { method: 'POST', headers: headers(true), body: JSON.stringify(body) }).then(handleResponse);

export const apiJoinTeam = (body: { code: string }) =>
  fetch(`${BASE_URL}/teams/join/${body.code}`, { method: 'POST', headers: headers(true) }).then(handleResponse);

export const apiCreateTeam = (body: object) =>
  fetch(`${BASE_URL}/teams`, { method: 'POST', headers: headers(true), body: JSON.stringify(body) })
    .then(handleResponse);

export const apiUpdateTeam = (id: string, body: object) =>
  fetch(`${BASE_URL}/teams/${id}`, { method: 'PATCH', headers: headers(true), body: JSON.stringify(body) })
    .then(handleResponse);

// ─── Alerts ──────────────────────────────────────────────────────────────────
export const apiGetAlerts = (activeOnly?: boolean) => {
  const qs = activeOnly !== undefined ? `?active=${activeOnly}` : '';
  return fetch(`${BASE_URL}/alerts${qs}`, { headers: headers(true) }).then(handleResponse);
};

export const apiCreateAlert = (body: object) =>
  fetch(`${BASE_URL}/alerts`, { method: 'POST', headers: headers(true), body: JSON.stringify(body) })
    .then(handleResponse);

export const apiResolveAlert = (id: string) =>
  fetch(`${BASE_URL}/alerts/${id}/resolve`, { method: 'PATCH', headers: headers(true) })
    .then(handleResponse);

export const apiGetNotifications = () =>
  fetch(`${BASE_URL}/admin/notifications`, { headers: headers(true) }).then(handleResponse);

export const apiExportReport = () => {
  return fetch(`${BASE_URL}/admin/export-report`, { headers: headers(true) })
    .then((res) => {
      if (!res.ok) throw new Error('Export failed');
      return res.blob();
    });
};

export const apiFetchGithub = (body: { repoUrl: string; teamId: string }) =>
  fetch(`${BASE_URL}/github/fetch`, { method: 'POST', headers: headers(true), body: JSON.stringify(body) })
    .then(handleResponse);

// ─── Notices ─────────────────────────────────────────────────────────────────
export const apiGetNotices = () =>
  fetch(`${BASE_URL}/notices`, { headers: headers(true) }).then(handleResponse);

export const apiCreateNotice = (body: object) =>
  fetch(`${BASE_URL}/notices`, { method: 'POST', headers: headers(true), body: JSON.stringify(body) })
    .then(handleResponse);

// ─── Leaderboard ─────────────────────────────────────────────────────────────
export const apiGetLeaderboard = () =>
  fetch(`${BASE_URL}/leaderboard`, { headers: headers(true) }).then(handleResponse);

export const apiGetPredictions = () =>
  fetch(`${BASE_URL}/leaderboard/predictions`, { headers: headers(true) }).then(handleResponse);
