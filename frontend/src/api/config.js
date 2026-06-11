const BASE = import.meta.env.VITE_API_BASE_URL;

import { authFetch } from './request.js';

// ── Providers ─────────────────────────────────────────────────────────────────

export async function apiListProviders() {
  const res = await authFetch(`${BASE}/api/providers`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    let message = `请求失败 (${res.status})`;
    try {
      const err = await res.json();
      if (err?.detail) message = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

export async function apiCreateProvider({ name, provider_type, base_url, api_key }) {
  const res = await authFetch(`${BASE}/api/providers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, provider_type, base_url, api_key }),
  });
  if (!res.ok) {
    let message = `请求失败 (${res.status})`;
    try {
      const err = await res.json();
      if (err?.detail) message = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

export async function apiUpdateProvider(providerId, data) {
  const res = await authFetch(`${BASE}/api/providers/${providerId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let message = `请求失败 (${res.status})`;
    try {
      const err = await res.json();
      if (err?.detail) message = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

export async function apiDeleteProvider(providerId) {
  await authFetch(`${BASE}/api/providers/${providerId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiTestConnection(providerId) {
  const res = await authFetch(`${BASE}/api/providers/${providerId}/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    let message = `请求失败 (${res.status})`;
    try {
      const err = await res.json();
      if (err?.detail) message = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

export async function apiOneClickSetup({ api_key }) {
  const res = await authFetch(`${BASE}/api/providers/oneclick-setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key }),
  });
  if (!res.ok) {
    let message = `请求失败 (${res.status})`;
    try {
      const err = await res.json();
      if (err?.detail) message = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

export async function apiOneClickCleanup() {
  const res = await authFetch(`${BASE}/api/providers/oneclick-cleanup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

// ── Models ────────────────────────────────────────────────────────────────────

export async function apiListModels({ category } = {}) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  const query = params.toString();
  const url = query ? `${BASE}/api/models?${query}` : `${BASE}/api/models`;
  const res = await authFetch(url, { headers: { 'Content-Type': 'application/json' } });
  return res.json();
}

export async function apiCreateModel(data) {
  const res = await authFetch(`${BASE}/api/models`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiUpdateModel(modelId, data) {
  const res = await authFetch(`${BASE}/api/models/${modelId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiDeleteModel(modelId) {
  await authFetch(`${BASE}/api/models/${modelId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiGetDefaultModels() {
  const res = await authFetch(`${BASE}/api/models/defaults`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

// ── Card Visibility ───────────────────────────────────────────────────────────

export async function apiGetCardVisibility() {
  const res = await authFetch(`${BASE}/api/api-config/card-visibility`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : (data.items ?? []);
}

// ── Banner ────────────────────────────────────────────────────────────────────

export async function apiGetBanner() {
  const res = await authFetch(`${BASE}/api/api-config/banner`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

// ── Legacy aliases ────────────────────────────────────────────────────────────

export async function apiGetApiConfig() {
  const [providers, models] = await Promise.all([
    apiListProviders(),
    apiListModels(),
  ]);
  return { providers, models };
}

export async function apiSaveApiConfig({ name, provider_type, base_url, api_key }) {
  return apiCreateProvider({ name, provider_type, base_url, api_key });
}
