const BASE = import.meta.env.VITE_API_BASE_URL;

import { authFetch } from './request.js';
import { normalizeImageUrl } from '../utils/imageUrl.js';
import { apiGetStoryboards } from './storyboard.js';
import { cached, invalidate } from '../utils/cache.js';
import { K, TTL, MEDIUM } from '../utils/cacheKeys.js';

function invalidateProjectAssetDependents(projectId) {
  if (!projectId) return;
  invalidate(K.subjectsPrefix(projectId));
  invalidate(K.storyboardsPrefix(projectId));
  invalidate(K.projectOverview(projectId));
  invalidate(K.projectAssets(projectId), MEDIUM.CONTENT);
}

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

export async function apiDeleteAsset(assetId, { projectId } = {}) {
  await authFetch(`${BASE}/api/assets/${assetId}`, { method: 'DELETE' });
  invalidateProjectAssetDependents(projectId);
}

export async function apiBatchDeleteAssets(asset_ids, { projectId } = {}) {
  await authFetch(`${BASE}/api/assets/batch-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ asset_ids }),
  });
  invalidateProjectAssetDependents(projectId);
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
  const meta = (item.metadata_json) || {};
  return {
    id: item.id,
    name: item.name,
    // 视频资产：url 只用缩略图，不 fallback 到视频地址（避免图片标签加载视频）
    url: item.asset_type === 'video'
      ? (normalizeImageUrl(item.thumbnail_url || meta.thumbnail_url) || null)
      : (normalizeImageUrl(item.thumbnail_url || item.file_url) || null),
    fileUrl: normalizeImageUrl(item.file_url) || null,
    videoUrl: item.asset_type === 'video' ? (normalizeImageUrl(item.file_url) || null) : null,
    starred: item.is_starred ?? false,
    description: item.description ?? '',
    prompt: item.prompt ?? '',
    model: item.model ?? '',
    ratio: item.ratio || meta.ratio || '',
    resolution: item.resolution ?? meta.resolution ?? item.size ?? '',
    size: item.size ?? '',
    created_at: item.created_at ?? '',
    is_primary: item.is_primary ?? false,
    subject_id: item.subject_id ?? null,
    // 分镜专用字段
    shot_number: meta.shot_number ?? null,
    storyboard_id: meta.storyboard_id ?? null,
    episode_number: meta.episode_number ?? null,
    duration: meta.duration ?? item.duration ?? null,
    refImages: (Array.isArray(item.ref_images) ? item.ref_images : []).map(img => ({
      url: normalizeImageUrl(img.url || img.file_url || ''),
      title: img.title || img.name || '',
    })).filter(img => img.url),
  };
}

/**
 * 按主体(subject_id 或 name)分组，生成聚合卡片
 */
function groupBySubject(normalized) {
  const subjectMap = {};

  normalized.forEach((asset) => {
    const key = asset.subject_id || asset.name;
    if (!subjectMap[key]) subjectMap[key] = [];
    subjectMap[key].push(asset);
  });

  return Object.entries(subjectMap).map(([key, images]) => {
    const primaryIdx = images.findIndex((img) => img.is_primary);
    const primaryImage = primaryIdx >= 0 ? images[primaryIdx] : images[0];
    const sorted = [
      ...images.filter((img) => img.is_primary),
      ...images.filter((img) => !img.is_primary),
    ];

    return {
      id: primaryImage.id,
      subject_id: primaryImage.subject_id ?? (key !== primaryImage.name ? key : null),
      name: primaryImage.name,
      description: primaryImage.description,
      url: primaryImage.url,
      fileUrl: primaryImage.fileUrl,
      videoUrl: primaryImage.videoUrl ?? null,
      images: sorted,
      imageCount: images.length,
      prompt: primaryImage.prompt,
      model: primaryImage.model,
      ratio: primaryImage.ratio,
      resolution: primaryImage.resolution,
      created_at: primaryImage.created_at,
    };
  });
}

/**
 * 按分镜编号(shot_number + storyboard_id)分组，用于分镜图/视频
 */
function groupByShot(normalized) {
  const shotMap = {};

  normalized.forEach((asset) => {
    // 优先用 shot_number+storyboard_id 作为 key，保证同一镜头多个版本归一组
    // 无 shot_number 时退回 name（用户自定义上传）
    const key = asset.shot_number != null
      ? `${asset.storyboard_id ?? 'local'}_shot_${asset.shot_number}`
      : asset.name;
    if (!shotMap[key]) shotMap[key] = [];
    shotMap[key].push(asset);
  });

  return Object.entries(shotMap).map(([key, images]) => {
    const primaryIdx = images.findIndex((img) => img.is_primary);
    const primaryImage = primaryIdx >= 0 ? images[primaryIdx] : images[0];
    const sorted = [
      ...images.filter((img) => img.is_primary),
      ...images.filter((img) => !img.is_primary),
    ];

    // 显示名称：有 shot_number 则用"分镜-N"，否则用原 name
    const displayName = primaryImage.shot_number != null
      ? `分镜-${primaryImage.shot_number}`
      : primaryImage.name;

    return {
      id: primaryImage.id,
      name: displayName,
      description: primaryImage.description,
      url: primaryImage.url,
      fileUrl: primaryImage.fileUrl,
      videoUrl: primaryImage.videoUrl ?? null,
      images: sorted,
      imageCount: images.length,
      prompt: primaryImage.prompt,
      model: primaryImage.model,
      ratio: primaryImage.ratio || sorted.find(i => i.ratio)?.ratio || '',
      resolution: primaryImage.resolution,
      duration: primaryImage.duration,
      created_at: primaryImage.created_at,
      shot_number: primaryImage.shot_number,
      storyboard_id: primaryImage.storyboard_id,
    };
  }).sort((a, b) => {
    // 按 shot_number 排序，无编号的排最后
    if (a.shot_number == null) return 1;
    if (b.shot_number == null) return -1;
    return a.shot_number - b.shot_number;
  });
}

function groupByCategory(list) {
  const grouped = { chars: [], scenes: [], props: [], storyboard_img: [], storyboard_video: [], audio: [], final: [] };

  // 先按 category 初步分类
  const byCategory = {};
  list.forEach((item) => {
    if (item.category === 'storyboard') {
      const tab = item.asset_type === 'video' ? 'storyboard_video' : 'storyboard_img';
      if (!byCategory[tab]) byCategory[tab] = [];
      byCategory[tab].push(item);
    } else {
      const tab = CATEGORY_TO_TAB[item.category];
      if (tab) {
        if (!byCategory[tab]) byCategory[tab] = [];
        byCategory[tab].push(item);
      }
    }
  });

  // 对 chars/scenes/props 进行主体分组，对 storyboard_img/storyboard_video 按镜头编号分组
  const SUBJECT_CATEGORIES = new Set(['chars', 'scenes', 'props']);
  const STORYBOARD_CATEGORIES = new Set(['storyboard_img', 'storyboard_video']);

  Object.entries(byCategory).forEach(([tab, items]) => {
    if (SUBJECT_CATEGORIES.has(tab)) {
      // 主体分组逻辑
      const normalized = items.map(normalizeAsset);
      grouped[tab] = groupBySubject(normalized);
    } else if (STORYBOARD_CATEGORIES.has(tab)) {
      // 分镜分组逻辑：按 shot_number 分组
      const normalized = items.map(normalizeAsset);
      grouped[tab] = groupByShot(normalized);
    } else {
      // 其他分类直接 normalize
      grouped[tab] = items.map(normalizeAsset);
    }
  });

  return grouped;
}

export async function apiGetProjectAssets(projectId) {
  return cached(
    K.projectAssets(projectId),
    async () => {
      // 并行拉取资产列表和分镜列表
      const [data, storyboardsRaw] = await Promise.all([
        apiGetAssets({ project_id: projectId, scope: 'project' }),
        apiGetStoryboards(projectId).catch(() => []),
      ]);

      const storyboards = Array.isArray(storyboardsRaw) ? storyboardsRaw : [];

      const primaryImageUrls = new Set();
      const primaryVideoAssetIds = new Set();
      const primaryVideoUrls = new Set();
      // ratio 补全：storyboard → 资产，用于视频/图片资产 ratio 字段缺失时回填
      const videoAssetIdRatio = {};   // asset_id → ratio
      const videoUrlRatio = {};       // normalized url → ratio
      const imageUrlRatio = {};       // normalized url → ratio

      storyboards.forEach((sb) => {
        const ratio = sb.ratio || sb.aspect_ratio || '';
        if (sb.image_url) {
          primaryImageUrls.add(normalizeImageUrl(sb.image_url));
          if (ratio) imageUrlRatio[normalizeImageUrl(sb.image_url)] = ratio;
        }
        if (sb.video_asset_id) {
          primaryVideoAssetIds.add(sb.video_asset_id);
          if (ratio) videoAssetIdRatio[sb.video_asset_id] = ratio;
        } else if (sb.video_url) {
          primaryVideoUrls.add(normalizeImageUrl(sb.video_url));
          if (ratio) videoUrlRatio[normalizeImageUrl(sb.video_url)] = ratio;
        }
      });

      const assets = (Array.isArray(data) ? data : []).map((item) => {
        if (item.category !== 'storyboard') return item;
        let is_primary = item.is_primary ?? false;
        let ratio = item.ratio || '';
        if (item.asset_type === 'video') {
          is_primary = primaryVideoAssetIds.has(item.id)
            || primaryVideoUrls.has(normalizeImageUrl(item.file_url));
          if (!ratio) ratio = videoAssetIdRatio[item.id] || videoUrlRatio[normalizeImageUrl(item.file_url)] || '';
        } else {
          is_primary = primaryImageUrls.has(normalizeImageUrl(item.file_url))
            || primaryImageUrls.has(normalizeImageUrl(item.thumbnail_url));
          if (!ratio) ratio = imageUrlRatio[normalizeImageUrl(item.file_url)] || imageUrlRatio[normalizeImageUrl(item.thumbnail_url)] || '';
        }
        return { ...item, is_primary, ...(ratio ? { ratio } : {}) };
      });

      return groupByCategory(assets);
    },
    { medium: MEDIUM.CONTENT, ttl: TTL.CONTENT },
  );
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
