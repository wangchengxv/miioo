const BASE = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

import { authFetch } from './request.js';

// ── Providers ─────────────────────────────────────────────────────────────────

export async function apiListProviders() {
  if (USE_MOCK) {
    console.log('[mock] list providers');
    return [];
  }
  const res = await authFetch(`${BASE}/api/providers`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiCreateProvider({ name, provider_type, base_url, api_key }) {
  if (USE_MOCK) {
    console.log('[mock] create provider', { name, provider_type });
    return { id: `prov-${Date.now()}`, name, provider_type };
  }
  const res = await authFetch(`${BASE}/api/providers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, provider_type, base_url, api_key }),
  });
  return res.json();
}

export async function apiUpdateProvider(providerId, data) {
  if (USE_MOCK) {
    console.log('[mock] update provider', providerId, data);
    return;
  }
  const res = await authFetch(`${BASE}/api/providers/${providerId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiDeleteProvider(providerId) {
  if (USE_MOCK) {
    console.log('[mock] delete provider', providerId);
    return;
  }
  await authFetch(`${BASE}/api/providers/${providerId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiTestConnection(providerId) {
  if (USE_MOCK) {
    console.log('[mock] test connection', providerId);
    return;
  }
  await authFetch(`${BASE}/api/providers/${providerId}/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiOneClickSetup({ api_key }) {
  if (USE_MOCK) {
    console.log('[mock] oneclick setup');
    return { provider: {}, models: [], test_success: true };
  }
  const res = await authFetch(`${BASE}/api/providers/oneclick-setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key }),
  });
  return res.json();
}

export async function apiOneClickCleanup() {
  if (USE_MOCK) {
    console.log('[mock] oneclick cleanup');
    return { removed_count: 0 };
  }
  const res = await authFetch(`${BASE}/api/providers/oneclick-cleanup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

// ── Models ────────────────────────────────────────────────────────────────────

export async function apiListModels({ category } = {}) {
  if (USE_MOCK) {
    console.log('[mock] list models', category);
    return [];
  }
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  const query = params.toString();
  const url = query ? `${BASE}/api/models?${query}` : `${BASE}/api/models`;
  const res = await authFetch(url, { headers: { 'Content-Type': 'application/json' } });
  return res.json();
}

export async function apiCreateModel(data) {
  if (USE_MOCK) {
    console.log('[mock] create model', data);
    return { id: `model-${Date.now()}` };
  }
  const res = await authFetch(`${BASE}/api/models`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiUpdateModel(modelId, data) {
  if (USE_MOCK) {
    console.log('[mock] update model', modelId, data);
    return;
  }
  const res = await authFetch(`${BASE}/api/models/${modelId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiDeleteModel(modelId) {
  if (USE_MOCK) {
    console.log('[mock] delete model', modelId);
    return;
  }
  await authFetch(`${BASE}/api/models/${modelId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiGetDefaultModels() {
  if (USE_MOCK) {
    console.log('[mock] get default models');
    return {};
  }
  const res = await authFetch(`${BASE}/api/models/defaults`, {
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
