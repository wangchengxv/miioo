const BASE = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiSendCode(phone) {
  if (USE_MOCK) {
    console.log('[mock] send-code to', phone);
    return { message: 'ok' };
  }
  const res = await fetch(`${BASE}/api/auth/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  return res.json();
}

export async function apiLogin({ phone, password }) {
  if (USE_MOCK) {
    console.log('[mock] login', phone);
    const token = 'mock-token';
    localStorage.setItem('token', token);
    return { access_token: token, refresh_token: 'mock-refresh', token_type: 'bearer' };
  }
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  const data = await res.json();
  if (data.access_token) localStorage.setItem('token', data.access_token);
  return data;
}

export async function apiVerifyCodeLogin({ phone, code }) {
  if (USE_MOCK) {
    console.log('[mock] verify-code-login', phone, code);
    const token = 'mock-token';
    localStorage.setItem('token', token);
    return { access_token: token, refresh_token: 'mock-refresh', token_type: 'bearer' };
  }
  const res = await fetch(`${BASE}/api/auth/verify-code-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code }),
  });
  const data = await res.json();
  if (data.access_token) localStorage.setItem('token', data.access_token);
  return data;
}

export async function apiRegister({ phone, password, nickname }) {
  if (USE_MOCK) {
    console.log('[mock] register', phone);
    return { access_token: 'mock-token', refresh_token: 'mock-refresh', token_type: 'bearer' };
  }
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password, nickname }),
  });
  return res.json();
}

export async function apiLogout() {
  if (USE_MOCK) {
    console.log('[mock] logout');
    return;
  }
  await fetch(`${BASE}/api/auth/logout`, {
    method: 'POST',
    headers: authHeaders(),
  });
}

export async function apiGetCurrentUser() {
  if (USE_MOCK) {
    console.log('[mock] get current user');
    return {};
  }
  const res = await fetch(`${BASE}/api/auth/me`, {
    headers: authHeaders(),
  });
  return res.json();
}

// ── legacy aliases kept for existing callers ──────────────────────────────────

export async function sendVerificationCode(phone) {
  return apiSendCode(phone);
}

export async function loginWithPhone(phone, code) {
  return apiVerifyCodeLogin({ phone, code });
}

export async function bindPhone(wechatToken, phone, code) {
  if (USE_MOCK) {
    console.log('[mock] bind-phone', phone, code);
    return { token: 'mock-token', user: { id: 'mock-id', name: 'mock-user' } };
  }
  const res = await fetch(`${BASE}/api/auth/bind-phone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wechatToken, phone, code }),
  });
  return res.json();
}
