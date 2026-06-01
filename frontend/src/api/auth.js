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
  const data = await res.json();
  if (data.access_token) setTokens(data.access_token, data.refresh_token);
  return data;
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

// ── Legacy alias（兼容 LoginModal 中微信扫码后绑定手机流程）─────────────────
// 后端无 /api/auth/bind-phone，此处映射到微信登录确认接口
export async function bindPhone(_wechatToken, phone, code) {
  console.warn('[api] bindPhone 为 legacy alias，后端无 /api/auth/bind-phone，改用 apiConfirmWechatLogin');
  return apiConfirmWechatLogin({ session_id: _wechatToken, phone, nickname: undefined });
}

// ── 微信登录（扫码）──────────────────────────────────────────────────────────

export async function apiGetWechatLoginQrCode() {
  if (USE_MOCK) {
    console.log('[mock] get wechat login qrcode');
    return { session_id: 'mock-session', qr_code_value: 'mock-qr', expires_in: 300 };
  }
  const res = await authFetch(`${BASE}/api/auth/wechat/qrcode`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiPollWechatLogin(sessionId) {
  if (USE_MOCK) {
    console.log('[mock] poll wechat login', sessionId);
    return { status: 'pending', access_token: null, refresh_token: null };
  }
  const res = await authFetch(`${BASE}/api/auth/wechat/poll/${encodeURIComponent(sessionId)}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (data.access_token) setTokens(data.access_token, data.refresh_token);
  return data;
}

export async function apiConfirmWechatLogin({ session_id, phone, nickname }) {
  if (USE_MOCK) {
    console.log('[mock] confirm wechat login', session_id);
    return { status: 'confirmed', access_token: 'mock-token', refresh_token: 'mock-refresh' };
  }
  const res = await fetch(`${BASE}/api/auth/wechat/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id, phone, nickname }),
  });
  const data = await res.json();
  if (data.access_token) setTokens(data.access_token, data.refresh_token);
  return data;
}
