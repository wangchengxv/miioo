const BASE = import.meta.env.VITE_API_BASE_URL;

import { authFetch, authFetchForm } from './request.js';

export async function apiGetStoryboards(projectId, { episode_id } = {}) {
  const params = new URLSearchParams();
  if (episode_id) params.append('episode_id', episode_id);
  const query = params.toString();
  const url = query
    ? `${BASE}/api/projects/${projectId}/storyboards?${query}`
    : `${BASE}/api/projects/${projectId}/storyboards`;
  const res = await authFetch(url, { headers: { 'Content-Type': 'application/json' } });
  return res.json();
}

export async function apiCreateStoryboard(projectId, data) {
  const res = await authFetch(`${BASE}/api/projects/${projectId}/storyboards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiUpdateStoryboard(projectId, storyboardId, data) {
  const res = await authFetch(`${BASE}/api/projects/${projectId}/storyboards/${storyboardId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiDeleteStoryboard(projectId, storyboardId) {
  await authFetch(`${BASE}/api/projects/${projectId}/storyboards/${storyboardId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiReorderStoryboards(projectId, ordered_ids) {
  await authFetch(`${BASE}/api/projects/${projectId}/storyboards/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ordered_ids }),
  });
}

// ── 分镜生成 ──────────────────────────────────────────────────────────────────

export async function apiGenerateStoryboardsFromEpisode(projectId, { episode_id, model }) {
  const res = await authFetch(`${BASE}/api/projects/${projectId}/storyboards/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ episode_id, model }),
  });
  return res.json();
}

export async function apiGenerateStoryboardsFromFinalScript(projectId) {
  const res = await authFetch(
    `${BASE}/api/projects/${projectId}/storyboards/generate-from-final-script`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' } }
  );
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.detail || body?.message || '';
    } catch {
      // 非 JSON 响应（如 502 HTML），忽略解析
    }
    const err = new Error(detail || `分镜生成失败（${res.status}）`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// ── 分镜图片/视频生成 ─────────────────────────────────────────────────────────

export async function apiGenerateStoryboardImage(projectId, storyboardId, params) {
  const res = await authFetch(
    `${BASE}/api/projects/${projectId}/storyboards/${storyboardId}/generate-image`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }
  );
  if (!res.ok) {
    let detail = '';
    try { const body = await res.json(); detail = body?.detail || body?.message || ''; } catch {}
    const err = new Error(detail || `生成失败（${res.status}）`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function apiGenerateStoryboardVideo(projectId, storyboardId, params) {
  const res = await authFetch(
    `${BASE}/api/projects/${projectId}/storyboards/${storyboardId}/generate-video`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }
  );
  if (!res.ok) {
    let detail = '';
    try { const body = await res.json(); detail = body?.detail || body?.message || ''; } catch {}
    const err = new Error(detail || `生成失败（${res.status}）`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// ── 分镜文件上传/下载 ─────────────────────────────────────────────────────────

export async function apiUploadStoryboardImage(projectId, storyboardId, file) {
  const form = new FormData();
  form.append('file', file);
  const res = await authFetchForm(
    `${BASE}/api/projects/${projectId}/storyboards/${storyboardId}/upload-image`,
    { method: 'POST', body: form }
  );
  return res.json();
}

export async function apiUploadStoryboardVideo(projectId, storyboardId, file) {
  const form = new FormData();
  form.append('file', file);
  const res = await authFetchForm(
    `${BASE}/api/projects/${projectId}/storyboards/${storyboardId}/upload-video`,
    { method: 'POST', body: form }
  );
  return res.json();
}

export async function apiDownloadStoryboardVideo(projectId, storyboardId) {
  const res = await authFetch(
    `${BASE}/api/projects/${projectId}/storyboards/${storyboardId}/download-video`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  return res.blob();
}

export async function apiBatchDownloadStoryboardImages(projectId, storyboard_ids) {
  const res = await authFetch(`${BASE}/api/projects/${projectId}/storyboards/download/images`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storyboard_ids }),
  });
  return res.blob();
}

export async function apiBatchDownloadStoryboardVideos(projectId, storyboard_ids) {
  const res = await authFetch(`${BASE}/api/projects/${projectId}/storyboards/download/videos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storyboard_ids }),
  });
  return res.blob();
}

// ── 通用文件上传（图片）──────────────────────────────────────────────────────

export async function apiUploadImage(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await authFetchForm(`${BASE}/api/images/upload`, {
    method: 'POST',
    body: form,
  });
  return res.json();
}

// ── Legacy aliases（兼容旧页面调用）────────────────────────────────────────────

export const apiUploadFile = apiUploadImage;
export const apiGetShots = apiGetStoryboards;
export const apiCreateShot = apiCreateStoryboard;
export const apiDeleteShot = apiDeleteStoryboard;

export async function apiUpdateShot(storyboardId, data) {
  console.warn('[api] apiUpdateShot 缺少 projectId，调用方应改用 apiUpdateStoryboard(projectId, storyboardId, data)');
  return { id: storyboardId, ...data };
}

export async function apiUpdateShotFinalized(shotId, finalized) {
  console.warn('[api] apiUpdateShotFinalized: 后端 StoryboardUpdate 无 finalized 字段，此调用为 no-op');
  return { id: shotId, finalized };
}

export async function apiReorderShots(episodeId, orderedIds) {
  console.warn('[api] apiReorderShots 缺少 projectId，调用方应改用 apiReorderStoryboards(projectId, ordered_ids)');
}

export const apiGenerateImage = apiGenerateStoryboardImage;
export const apiGenerateVideo = apiGenerateStoryboardVideo;

// ── 任务轮询 ──────────────────────────────────────────────────────────────────

export async function apiGetTask(taskId) {
  const res = await authFetch(`${BASE}/api/tasks/${taskId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    let detail = '';
    try { const body = await res.json(); detail = body?.detail || body?.message || ''; } catch {}
    const err = new Error(detail || `获取任务状态失败（${res.status}）`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}
