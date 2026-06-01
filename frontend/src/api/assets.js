const BASE = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

import { authFetch } from './request.js';

/**
 * 资产列表（支持多维过滤）
 * @param {object} filters - { project_id, scope, asset_type, category, is_starred, is_primary, search, include_deleted, deleted_only }
 */
export async function apiGetAssets(filters = {}) {
  if (USE_MOCK) {
    console.log('[mock] get assets', filters);
    return [];
  }
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, v);
  });
  const query = params.toString();
  const url = query ? `${BASE}/api/assets?${query}` : `${BASE}/api/assets`;
  const res = await authFetch(url, { headers: { 'Content-Type': 'application/json' } });
  return res.json();
}

export async function apiGetAssetDetail(assetId) {
  if (USE_MOCK) {
    console.log('[mock] get asset detail', assetId);
    return {};
  }
  const res = await authFetch(`${BASE}/api/assets/${assetId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiCreateAsset(data) {
  if (USE_MOCK) {
    console.log('[mock] create asset', data);
    return { id: `asset-${Date.now()}` };
  }
  const res = await authFetch(`${BASE}/api/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiUpdateAsset(assetId, updates) {
  if (USE_MOCK) {
    console.log('[mock] update asset', assetId, updates);
    return { id: assetId, ...updates };
  }
  const res = await authFetch(`${BASE}/api/assets/${assetId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function apiDeleteAsset(assetId) {
  if (USE_MOCK) {
    console.log('[mock] delete asset', assetId);
    return { success: true };
  }
  await authFetch(`${BASE}/api/assets/${assetId}`, { method: 'DELETE' });
}

export async function apiBatchDeleteAssets(asset_ids) {
  if (USE_MOCK) {
    console.log('[mock] batch delete assets', asset_ids);
    return { success: true };
  }
  await authFetch(`${BASE}/api/assets/batch-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ asset_ids }),
  });
}

export async function apiBatchRestoreAssets(asset_ids) {
  if (USE_MOCK) {
    console.log('[mock] batch restore assets', asset_ids);
    return;
  }
  await authFetch(`${BASE}/api/assets/restore`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ asset_ids }),
  });
}

export async function apiRestoreAsset(assetId) {
  if (USE_MOCK) {
    console.log('[mock] restore asset', assetId);
    return {};
  }
  const res = await authFetch(`${BASE}/api/assets/${assetId}/restore`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiExtractAssetFrame(assetId, { position }) {
  if (USE_MOCK) {
    console.log('[mock] extract asset frame', assetId, position);
    return {};
  }
  const res = await authFetch(`${BASE}/api/assets/${assetId}/extract-frame`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ position }),
  });
  return res.json();
}

export async function apiDownloadAsset(assetId, { prefer_origin } = {}) {
  if (USE_MOCK) {
    console.log('[mock] download asset', assetId);
    return new Blob();
  }
  const params = new URLSearchParams();
  if (prefer_origin !== undefined) params.append('prefer_origin', prefer_origin);
  const query = params.toString();
  const url = query ? `${BASE}/api/assets/${assetId}/download?${query}` : `${BASE}/api/assets/${assetId}/download`;
  const res = await authFetch(url, { headers: { 'Content-Type': 'application/json' } });
  return res.blob();
}

// ── 兼容旧调用 ────────────────────────────────────────────────────────────────

export async function apiGetProjectAssets(projectId, { scope, asset_type, category, search } = {}) {
  return apiGetAssets({ project_id: projectId, scope, asset_type, category, search });
}

export async function apiGetShotDetail(shotId) {
  return apiGetAssetDetail(shotId);
}

export async function apiGetShotVideoDetail(shotId) {
  const data = await apiGetAssetDetail(shotId);
  return {
    shotNumber: data.shot_number ?? '',
    prompt: data.prompt ?? '',
    model: data.model ?? '',
    resolution: data.resolution ?? '',
    generatedAt: data.created_at ?? '',
    videoSrc: data.file_url ?? '',
    duration: data.duration ?? '',
    ratio: data.ratio ?? '',
    frames: [],
    ...data,
  };
}
