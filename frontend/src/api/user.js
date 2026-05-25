const BASE = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

import { authFetch, authFetchForm } from './request.js';

export async function apiUpdateProfile({ nickname, avatar_url }) {
  if (USE_MOCK) {
    console.log('[mock] update profile', { nickname, avatar_url });
    return {};
  }
  const res = await authFetch(`${BASE}/api/users/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname, avatar_url }),
  });
  return res.json();
}

export async function apiDeleteAccount() {
  if (USE_MOCK) {
    console.log('[mock] delete account');
    return;
  }
  await authFetch(`${BASE}/api/users/me`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

// ── functions without a spec mapping — kept as mock-only ─────────────────────

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

export async function apiGetNotifications() {
  if (USE_MOCK) {
    console.log('[mock] get notifications');
    return [];
  }
  const res = await authFetch(`${BASE}/api/notifications`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiUpdateUser(data) {
  return apiUpdateProfile(data);
}

export async function apiUploadAvatar(file) {
  if (USE_MOCK) {
    console.log('[mock] upload avatar', file?.name);
    return { avatarUrl: null };
  }
  const form = new FormData();
  form.append('file', file);
  const res = await authFetchForm(`${BASE}/api/upload`, {
    method: 'POST',
    body: form,
  });
  const data = await res.json();
  return { avatarUrl: data.url };
}

export async function apiGetWechatQrCode() {
  if (USE_MOCK) {
    console.log('[mock] get wechat qrcode');
    return { qrCodeUrl: null, ticket: 'mock_ticket' };
  }
  const res = await authFetch(`${BASE}/api/users/me/wechat/qrcode`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiPollWechatBind(ticket) {
  if (USE_MOCK) {
    console.log('[mock] poll wechat bind', ticket);
    return { status: 'pending', wechatNickname: null };
  }
  const res = await authFetch(`${BASE}/api/users/me/wechat/status?ticket=${encodeURIComponent(ticket)}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiUnbindWechat() {
  if (USE_MOCK) {
    console.log('[mock] unbind wechat');
    return;
  }
  await authFetch(`${BASE}/api/users/me/wechat`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiSendPhoneCode(phone) {
  if (USE_MOCK) {
    console.log('[mock] send phone code', phone);
    return;
  }
  await authFetch(`${BASE}/api/users/me/phone/code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
}

export async function apiVerifyPhoneCode(phone, code) {
  if (USE_MOCK) {
    console.log('[mock] verify phone code', phone, code);
    return { valid: true };
  }
  const res = await authFetch(`${BASE}/api/users/me/phone/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code }),
  });
  return res.json();
}

export async function apiRebindPhone(newPhone, code) {
  if (USE_MOCK) {
    console.log('[mock] rebind phone', newPhone, code);
    return;
  }
  await authFetch(`${BASE}/api/users/me/phone/rebind`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: newPhone, code }),
  });
}
