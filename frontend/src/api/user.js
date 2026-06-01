const BASE = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

import { authFetch } from './request.js';

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

export async function apiGetNotifications({ is_read, type } = {}) {
  if (USE_MOCK) {
    console.log('[mock] get notifications');
    return [];
  }
  const params = new URLSearchParams();
  if (is_read !== undefined) params.append('is_read', is_read);
  if (type) params.append('type', type);
  const query = params.toString();
  const url = query ? `${BASE}/api/notifications?${query}` : `${BASE}/api/notifications`;
  const res = await authFetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiGetUnreadCount() {
  if (USE_MOCK) {
    console.log('[mock] get unread count');
    return { count: 0 };
  }
  const res = await authFetch(`${BASE}/api/notifications/unread-count`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiMarkNotificationRead(notificationId) {
  if (USE_MOCK) {
    console.log('[mock] mark notification read', notificationId);
    return;
  }
  await authFetch(`${BASE}/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiMarkAllNotificationsRead() {
  if (USE_MOCK) {
    console.log('[mock] mark all notifications read');
    return;
  }
  await authFetch(`${BASE}/api/notifications/read-all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiDeleteNotification(notificationId) {
  if (USE_MOCK) {
    console.log('[mock] delete notification', notificationId);
    return;
  }
  await authFetch(`${BASE}/api/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiUpdateUser(data) {
  return apiUpdateProfile(data);
}

// ── 后端无对应接口的功能（暂保留 mock，待后端确认是否规划）─────────────────
// 以下接口后端均未提供：微信账号绑定/解绑、手机换绑

export async function apiUploadAvatar(file) {
  if (USE_MOCK) {
    console.log('[mock] upload avatar', file?.name);
    return { avatarUrl: URL.createObjectURL(file) };
  }
  // 后端仅有 /api/images/upload（通用图片上传），无专属头像接口
  // 此处调用通用上传后，需配合 apiUpdateProfile({ avatar_url }) 更新
  const form = new FormData();
  form.append('file', file);
  const res = await authFetch(`${BASE}/api/images/upload`, {
    method: 'POST',
    body: form,
  });
  const data = await res.json();
  return { avatarUrl: data.url || data.file_url };
}

export async function apiGetWechatQrCode() {
  if (USE_MOCK) {
    console.log('[mock] get wechat qrcode (bind)');
    return { qrCodeUrl: null, ticket: 'mock_ticket' };
  }
  // 后端无 /api/users/me/wechat/qrcode，暂返回空
  return { qrCodeUrl: null, ticket: null };
}

export async function apiPollWechatBind(ticket) {
  if (USE_MOCK) {
    console.log('[mock] poll wechat bind', ticket);
    return { status: 'pending', wechatNickname: null };
  }
  return { status: 'pending', wechatNickname: null };
}

export async function apiUnbindWechat() {
  if (USE_MOCK) {
    console.log('[mock] unbind wechat');
    return;
  }
  // 后端无此接口
}

export async function apiSendPhoneCode(phone) {
  if (USE_MOCK) {
    console.log('[mock] send phone code', phone);
    return;
  }
  // 后端无换绑手机独立接口，可复用登录验证码（但语义不同）
  const res = await authFetch(`${BASE}/api/auth/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  return res.json();
}

export async function apiVerifyPhoneCode(phone, code) {
  if (USE_MOCK) {
    console.log('[mock] verify phone code', phone, code);
    return { valid: true };
  }
  // 后端无独立验证接口，暂返回 mock
  return { valid: true };
}

export async function apiRebindPhone(newPhone, code) {
  if (USE_MOCK) {
    console.log('[mock] rebind phone', newPhone, code);
    return;
  }
  // 后端无此接口
}
