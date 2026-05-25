const BASE = import.meta.env.VITE_API_BASE_URL;

export function getToken() {
  return localStorage.getItem('token');
}

export function getRefreshToken() {
  return localStorage.getItem('refresh_token');
}

export function setTokens(accessToken, refreshToken) {
  localStorage.setItem('token', accessToken);
  if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
}

function withAuth(options = {}) {
  const token = getToken();
  const headers = options.headers || {};
  return {
    ...options,
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
}

// 防止并发请求同时触发多次刷新
let refreshPromise = null;

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data.access_token) {
        setTokens(data.access_token, data.refresh_token);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// 带自动刷新的 fetch，供所有需要鉴权的 API 使用
export async function authFetch(url, options = {}) {
  const res = await fetch(url, withAuth(options));
  if (res.status === 401) {
    const ok = await refreshAccessToken();
    if (ok) return fetch(url, withAuth(options));
    clearTokens();
    window.dispatchEvent(new CustomEvent('auth:logout'));
    throw new Error('Unauthorized');
  }
  return res;
}

// 不带 Content-Type 的 authFetch，用于 FormData 上传
export async function authFetchForm(url, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    const ok = await refreshAccessToken();
    if (ok) {
      const newToken = getToken();
      return fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
        },
      });
    }
    clearTokens();
    window.dispatchEvent(new CustomEvent('auth:logout'));
    throw new Error('Unauthorized');
  }
  return res;
}

export function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
