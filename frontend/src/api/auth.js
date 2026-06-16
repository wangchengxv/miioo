const BASE = import.meta.env.VITE_API_BASE_URL;

import { setTokens, clearTokens as _clearTokens, authHeaders, authFetch } from './request.js';
export { clearTokens } from './request.js';

export async function apiSendCode(phone) {
  const res = await fetch(`${BASE}/api/auth/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  return res.json();
}

export async function apiLogin({ phone, password }) {
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
  try {
    await authFetch(`${BASE}/api/auth/logout`, { method: 'POST' });
  } catch {}
  _clearTokens();
}

export async function apiGetCurrentUser() {
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

// ── 微信扫码登录（新版，接口路径待后端确认）────────────────────────────────
// 生成二维码
export async function apiGetWechatQrCode() {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return {
      qrcode_id: 'mock-qr-001',
      expire_seconds: 120,
      qrcode_url: 'https://app.paper.design/file-assets/01KQYRKV5GAPKWF7X9K33912CS/01KR8EAVS6CW9V257SBVP40T1A.png',
    };
  }
  const res = await fetch(`${BASE}/api/auth/wechat/qrcode`);
  return res.json();
}

// 轮询二维码状态
// 响应 status: 'pending' | 'scanned' | 'confirmed' | 'need_bind_mobile' | 'expired'
export async function apiPollWechatQrCodeStatus(qrcodeId) {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return { status: 'pending' };
  }
  const res = await fetch(`${BASE}/api/auth/wechat/qrcode/status?qrcode_id=${encodeURIComponent(qrcodeId)}`);
  const data = await res.json();
  if (data.access_token) setTokens(data.access_token, data.refresh_token);
  return data;
}

// 绑定手机号（微信登录 need_bind_mobile 分支）
export async function apiBindMobileWithBindToken({ bind_token, mobile, sms_code }) {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return { access_token: 'mock-token', refresh_token: 'mock-refresh' };
  }
  const res = await fetch(`${BASE}/api/auth/wechat/bind-mobile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bind_token, mobile, sms_code }),
  });
  const data = await res.json();
  if (data.access_token) setTokens(data.access_token, data.refresh_token);
  return data;
}
