const BASE = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

import { setTokens, clearTokens as _clearTokens, authHeaders, authFetch } from './request.js';
export { clearTokens } from './request.js';

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
    setTokens('mock-token', 'mock-refresh');
    return { access_token: 'mock-token', refresh_token: 'mock-refresh', token_type: 'bearer' };
  }
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  const data = await res.json();
  if (data.access_token) setTokens(data.access_token, data.refresh_token);
  return data;
}

export async function apiVerifyCodeLogin({ phone, code }) {
  if (USE_MOCK) {
    console.log('[mock] verify-code-login', phone, code);
    setTokens('mock-token', 'mock-refresh');
    return { access_token: 'mock-token', refresh_token: 'mock-refresh', token_type: 'bearer' };
  }
  const res = await fetch(`${BASE}/api/auth/verify-code-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code }),
  });
  const data = await res.json();
  if (data.access_token) setTokens(data.access_token, data.refresh_token);
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
  await authFetch(`${BASE}/api/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiGetCurrentUser() {
  if (USE_MOCK) {
    console.log('[mock] get current user');
    return {};
  }
  const res = await authFetch(`${BASE}/api/auth/me`, {
    headers: { 'Content-Type': 'application/json' },
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
