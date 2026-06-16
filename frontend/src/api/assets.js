const BASE = import.meta.env.VITE_API_BASE_URL;

import { authFetch } from './request.js';
import { normalizeImageUrl } from '../utils/imageUrl.js';

/**
 * 资产列表（支持多维过滤）
 * @param {object} filters - { project_id, scope, asset_type, category, is_starred, is_primary, search, include_deleted, deleted_only }
 */
export async function apiGetAssets(filters = {}) {
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
  const res = await authFetch(`${BASE}/api/assets/${assetId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiCreateAsset(data) {
  const res = await authFetch(`${BASE}/api/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiUpdateAsset(assetId, updates) {
  const res = await authFetch(`${BASE}/api/assets/${assetId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function apiDeleteAsset(assetId) {
  await authFetch(`${BASE}/api/assets/${assetId}`, { method: 'DELETE' });
}

export async function apiBatchDeleteAssets(asset_ids) {
  await authFetch(`${BASE}/api/assets/batch-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ asset_ids }),
  });
}

export async function apiBatchRestoreAssets(asset_ids) {
  await authFetch(`${BASE}/api/assets/restore`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ asset_ids }),
  });
}

export async function apiRestoreAsset(assetId) {
  const res = await authFetch(`${BASE}/api/assets/${assetId}/restore`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiExtractAssetFrame(assetId, { position }) {
  const res = await authFetch(`${BASE}/api/assets/${assetId}/extract-frame`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ position }),
  });
  return res.json();
}

export async function apiDownloadAsset(assetId, { prefer_origin } = {}) {
  const params = new URLSearchParams();
  if (prefer_origin !== undefined) params.append('prefer_origin', prefer_origin);
  const query = params.toString();
  const url = query ? `${BASE}/api/assets/${assetId}/download?${query}` : `${BASE}/api/assets/${assetId}/download`;
  const res = await authFetch(url, { headers: { 'Content-Type': 'application/json' } });
  return res.blob();
}

// ── 项目资产（按 tab key 分组） ────────────────────────────────────────────────

const CATEGORY_TO_TAB = {
  character: 'chars',
  scene: 'scenes',
  prop: 'props',
  audio: 'audio',
  film: 'final',
};

function normalizeAsset(item) {
  return {
    id: item.id,
    name: item.name,
    url: normalizeImageUrl(item.thumbnail_url || item.file_url) || null,
    fileUrl: normalizeImageUrl(item.file_url) || null,
    videoUrl: item.asset_type === 'video' ? (item.file_url || null) : null,
    starred: item.is_starred ?? false,
    description: item.description ?? '',
    prompt: item.prompt ?? '',
    model: item.model ?? '',
    size: item.size ?? '',
    created_at: item.created_at ?? '',
  };
}

function groupByCategory(list) {
  const grouped = { chars: [], scenes: [], props: [], storyboard_img: [], storyboard_video: [], audio: [], final: [] };
  list.forEach((item) => {
    const normalized = normalizeAsset(item);
    if (item.category === 'storyboard') {
      const tab = item.asset_type === 'video' ? 'storyboard_video' : 'storyboard_img';
      grouped[tab].push(normalized);
    } else {
      const tab = CATEGORY_TO_TAB[item.category];
      if (tab) grouped[tab].push(normalized);
    }
  });
  return grouped;
}

export async function apiGetProjectAssets(projectId) {
  const data = await apiGetAssets({ project_id: projectId, scope: 'project' });
  return groupByCategory(Array.isArray(data) ? data : []);
}

export async function apiGetShotDetail(shotId) {
  const data = await apiGetAssetDetail(shotId);
  const meta = (data && data.metadata_json) || {};

  // 提取生成结果图片列表（metadata_json.outputs / variants / variations）
  const rawOutputs = meta.outputs || meta.variants || meta.variations;
  let images = [];
  if (Array.isArray(rawOutputs) && rawOutputs.length > 0) {
    images = rawOutputs.map((out, idx) => ({
      id: out.id || out.asset_id || `img_${idx}`,
      src: normalizeImageUrl(out.url || out.file_url || out.image_url || ''),
      finalized: !!(out.is_finalized != null ? out.is_finalized : (out.finalized ?? false)),
      prompt: out.prompt || '',
      model: out.model || '',
      resolution: out.resolution || out.size || '',
      generatedAt: out.created_at || '',
    }));
  } else {
    // 无量产结果时用主文件作为唯一图片
    images = [{
      id: `${data?.id || shotId}_0`,
      src: normalizeImageUrl(data?.file_url || data?.thumbnail_url || ''),
      finalized: true,
      prompt: data?.prompt || '',
      model: data?.model || '',
      resolution: data?.size || '',
      generatedAt: data?.created_at || '',
    }];
  }

  return {
    shotNumber: meta.shot_number ?? meta.shotNumber ?? data?.name ?? '',
    prompt: data?.prompt || '',
    model: data?.model || '',
    resolution: meta.resolution || data?.size || '',
    generatedAt: data?.created_at || '',
    images,
  };
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
