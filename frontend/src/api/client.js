const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('pt_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('pt_token', token);
  } else {
    localStorage.removeItem('pt_token');
  }
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = json?.error?.message || `Request failed (${res.status})`;
    const code = json?.error?.code || 'UNKNOWN';
    const err = new Error(message);
    err.status = res.status;
    err.code = code;
    err.details = json?.error?.details || null;
    throw err;
  }

  return json.data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),
};
