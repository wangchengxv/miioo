const BASE = import.meta.env.VITE_API_BASE_URL;

import { authFetch, authFetchForm } from './request.js';

export async function apiGetSubjects(projectId, { type, episode_id } = {}) {
  const params = new URLSearchParams();
  if (type) params.append('type', type);
  if (episode_id) params.append('episode_id', episode_id);
  const query = params.toString();
  const url = query ? `${BASE}/api/projects/${projectId}/subjects?${query}` : `${BASE}/api/projects/${projectId}/subjects`;
  const res = await authFetch(url, { headers: { 'Content-Type': 'application/json' } });
  return res.json();
}

export async function apiGetSubjectDetail(projectId, subjectId) {
  const res = await authFetch(`${BASE}/api/projects/${projectId}/subjects/${subjectId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiCreateSubject(projectId, data) {
  const res = await authFetch(`${BASE}/api/projects/${projectId}/subjects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiUpdateSubject(projectId, subjectId, data) {
  const res = await authFetch(`${BASE}/api/projects/${projectId}/subjects/${subjectId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiDeleteSubject(projectId, subjectId) {
  await authFetch(`${BASE}/api/projects/${projectId}/subjects/${subjectId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiDuplicateSubject(projectId, subjectId, { target_episode_id, as_global } = {}) {
  const res = await authFetch(`${BASE}/api/projects/${projectId}/subjects/${subjectId}/duplicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_episode_id, as_global }),
  });
  return res.json();
}

export async function apiExtractSubjectsFromEpisode(projectId, episodeId) {
  const res = await authFetch(
    `${BASE}/api/projects/${projectId}/subjects/extract?episode_id=${encodeURIComponent(episodeId)}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' } }
  );
  return res.json();
}

// ── 主体图片 ──────────────────────────────────────────────────────────────────

export async function apiGetSubjectImages(projectId, subjectId) {
  const res = await authFetch(`${BASE}/api/projects/${projectId}/subjects/${subjectId}/images`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiGenerateSubjectImage(projectId, subjectId, params) {
  const res = await authFetch(`${BASE}/api/projects/${projectId}/subjects/${subjectId}/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function apiDeleteSubjectImage(projectId, subjectId, imageId) {
  await authFetch(`${BASE}/api/projects/${projectId}/subjects/${subjectId}/images/${imageId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiSetPrimarySubjectImage(projectId, subjectId, imageId) {
  const res = await authFetch(
    `${BASE}/api/projects/${projectId}/subjects/${subjectId}/images/${imageId}/set-primary`,
    { method: 'PATCH', headers: { 'Content-Type': 'application/json' } }
  );
  return res.json();
}

export async function apiUploadSubjectReferenceImage(projectId, subjectId, file) {
  const form = new FormData();
  form.append('file', file);
  const res = await authFetchForm(
    `${BASE}/api/projects/${projectId}/subjects/${subjectId}/reference-images/upload`,
    { method: 'POST', body: form }
  );
  return res.json();
}

export async function apiBindSubjectReferenceImages(projectId, subjectId, { asset_ids, primary_asset_id }) {
  const res = await authFetch(
    `${BASE}/api/projects/${projectId}/subjects/${subjectId}/reference-images/bind`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asset_ids, primary_asset_id }),
    }
  );
  return res.json();
}

export async function apiDownloadSubjectImage(projectId, subjectId, imageId) {
  const res = await authFetch(
    `${BASE}/api/projects/${projectId}/subjects/${subjectId}/images/${imageId}/download`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  return res.blob();
}

// ── 批量生成 ──────────────────────────────────────────────────────────────────

export async function apiBatchGenerate(projectIdOrParams, maybeParams) {
  let projectId, params;
  if (maybeParams !== undefined) {
    projectId = projectIdOrParams;
    params = maybeParams;
  } else {
    console.warn('[api] apiBatchGenerate 需要 projectId 作为第一个参数，当前调用将在真实接口下失败');
    projectId = undefined;
    params = projectIdOrParams;
  }
  const res = await authFetch(`${BASE}/api/projects/${projectId}/subjects/batch-generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function apiUpdateSubjectCompat(subjectId, data) {
  console.warn('[api] apiUpdateSubject 缺少 projectId，调用方应改用 apiUpdateSubject(projectId, subjectId, data)');
  return { id: subjectId, ...data };
}

// ── 剧集 ──────────────────────────────────────────────────────────────────────

export async function apiGetEpisodes(projectId) {
  // TODO: 后端需要在 episodes 接口返回中添加 status 字段
  // 期望字段：status（可选值：pending/generated/edited）
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    // Mock 数据：返回带状态的剧集列表
    return [
      { id: 1, title: '第一集', episode_number: 1, status: 'generated' },
      { id: 2, title: '第二集', episode_number: 2, status: 'pending' },
      { id: 3, title: '第三集', episode_number: 3, status: 'pending' },
    ];
  }
  const res = await authFetch(`${BASE}/api/projects/${projectId}/episodes`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiCreateEpisode(projectId, { title, episode_number, content, summary }) {
  const res = await authFetch(`${BASE}/api/projects/${projectId}/episodes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, episode_number, content, summary }),
  });
  return res.json();
}

export async function apiUpdateEpisode(projectId, episodeId, data) {
  const res = await authFetch(`${BASE}/api/projects/${projectId}/episodes/${episodeId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiDeleteEpisode(projectId, episodeId) {
  await authFetch(`${BASE}/api/projects/${projectId}/episodes/${episodeId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiGenerateEpisodeScript(projectId, episodeId, { prompt, model }) {
  const res = await authFetch(
    `${BASE}/api/projects/${projectId}/episodes/${episodeId}/generate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model }),
    }
  );
  return res.json();
}

export async function apiUploadEpisodeScript(projectId, episodeId, file) {
  const form = new FormData();
  form.append('file', file);
  const res = await authFetchForm(
    `${BASE}/api/projects/${projectId}/episodes/${episodeId}/upload`,
    { method: 'POST', body: form }
  );
  return res.json();
}

// ── 剧本工作区 ────────────────────────────────────────────────────────────────

export async function apiGetScriptWorkspace(projectId) {
  const res = await authFetch(
    `${BASE}/api/projects/${projectId}/script-workspace`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  return res.json();
}

export async function apiSaveScriptWorkspace(projectId, data) {
  const res = await authFetch(
    `${BASE}/api/projects/${projectId}/script-workspace`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
  return res.json();
}

export async function apiChatScriptWorkspace(projectId, { message, model } = {}) {
  const body = { message, apply_to_script: true };
  if (model) body.model = model;
  const res = await authFetch(`${BASE}/api/projects/${projectId}/script-workspace/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function apiUploadScriptWorkspace(projectId, file) {
  const form = new FormData();
  form.append('file', file);
  const res = await authFetchForm(
    `${BASE}/api/projects/${projectId}/script-workspace/upload`,
    { method: 'POST', body: form }
  );
  return res.json();
}

export async function apiFinalizeScriptWorkspace(projectId, { episode_count, model } = {}) {
  const res = await authFetch(
    `${BASE}/api/projects/${projectId}/script-workspace/finalize`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        episode_count: episode_count ?? null,
        model: model ?? null,
        split_mode: 'rule_first',
      }),
    }
  );
  return res.json();
}
