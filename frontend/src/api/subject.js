const BASE = import.meta.env.VITE_API_BASE_URL;

import { authFetch, authFetchForm, authFetchStream } from './request.js';

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
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.detail || body?.message || '';
    } catch {
      // 502 等返回 HTML，无法解析 JSON
    }
    const statusMessages = {
      502: 'AI 绘图服务暂时不可用，请稍后重试',
      504: 'AI 绘图服务响应超时，请简化提示词后重试',
      500: '服务器内部错误，请稍后重试',
    };
    const msg = detail || statusMessages[res.status] || `图片生成失败（${res.status}）`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
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
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.detail || body?.message || '';
      // FastAPI 422 返回 detail 为数组 [{msg, loc, ...}]
      if (Array.isArray(detail)) {
        detail = detail.map(d => d.msg || JSON.stringify(d)).join('; ');
      }
    } catch {
      // 非 JSON 响应
    }
    const err = new Error(detail || `批量生成失败（${res.status}）`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// 流式批量生成：后端通过 SSE 逐个返回每个主体的生成结果
// onSubjectImage(subjectId, imageUrl) — 单个主体生成成功
// onSubjectError(subjectId, errorMsg)   — 单个主体生成失败
// onComplete()                          — 全部完成
// 如果后端尚未支持 SSE，会自动降级为普通 JSON 响应
export async function apiBatchGenerateStream(projectId, params, { onSubjectImage, onSubjectError, onComplete, signal } = {}) {
  const res = await authFetchStream(`${BASE}/api/projects/${projectId}/subjects/batch-generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify(params),
    signal,
  });

  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.detail || body?.message || '';
      if (Array.isArray(detail)) {
        detail = detail.map(d => d.msg || JSON.stringify(d)).join('; ');
      }
    } catch {
      // 非 JSON 响应
    }
    const err = new Error(detail || `批量生成失败（${res.status}）`);
    err.status = res.status;
    throw err;
  }

  const contentType = res.headers.get('content-type') || '';

  // ── 非流式降级：后端返回普通 JSON ────────────────────────────────
  if (!contentType.includes('text/event-stream')) {
   const data = await res.json();
    const results = Array.isArray(data) ? data : (data?.results || data?.items || data?.data || []);
    if (Array.isArray(results)) {
      for (const item of results) {
        const sid = item.subject_id || item.id;
       const imgUrl = item.image_url || item.imageUrl || item.url;
        if (item.status === 'error' || item.error || item.success === false) {
          onSubjectError?.(sid, item.error || item.message || '生成失败');
        } else if (imgUrl) {
          onSubjectImage?.(sid, imgUrl);
        }
      }
    }
    // 如果有 data.results 但都是空 URL，说明整个请求同步失败了
    // 抛出第一个有 error 的结果
    const firstError = results.find(r => r.error || r.status === 'error' || r.success === false);
    if (firstError && !results.some(r => r.image_url || r.imageUrl || r.url)) {
      const err = new Error(firstError.error || firstError.message || '批量生成失败');
      err.status = res.status;
      throw err;
    }
    onComplete?.();
    return data;
  }

  // ── SSE 流式读取 ────────────────────────────────────────────────
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();

        // 流结束标记
        if (payload === '[DONE]') {
          onComplete?.();
          return;
        }

        try {
          const parsed = JSON.parse(payload);

          // 兼容多种事件格式：
          //   { subject_id, image_url, status: 'success'|'error', error }
          //   { type: 'subject_image', subject_id, image_url }
          //   { type: 'subject_error', subject_id, error }
          const sid = parsed.subject_id || parsed.id;
          const errMsg = parsed.error || parsed.message;
          const imgUrl = parsed.image_url || parsed.imageUrl || parsed.url;

          if (errMsg || parsed.success === false) {
            onSubjectError?.(sid, errMsg);
          } else if (imgUrl) {
            onSubjectImage?.(sid, imgUrl);
          }
        } catch {
          // 忽略无法解析的 chunk
        }
      }
    }
    // 流自然结束（没有收到 [DONE] 也算完成）
    onComplete?.();
  } finally {
    reader.releaseLock();
  }
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

// 流式版本：SSE 逐 chunk 回调，完成后返回完整内容字符串
// onChunk(accumulated: string) 每次收到新内容时触发
// signal 用于 AbortController 取消
export async function apiChatScriptWorkspaceStream(
  projectId,
  { message, model, episode_count } = {},
  { onChunk, signal } = {}
) {
  const body = { message, apply_to_script: true };
  if (model) body.model = model;
  if (episode_count != null) body.episode_count = episode_count;

  const res = await authFetchStream(
    `${BASE}/api/projects/${projectId}/script-workspace/chat`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    }
  );

  // 504 网关超时 → 抛出带标记的错误，由调用方统一处理
  if (res.status === 504) {
    const err = new Error('Gateway Timeout');
    err.isGatewayTimeout = true;
    throw err;
  }

  // 非 2xx 响应 → 读取错误体并抛出，避免静默吞错
  if (!res.ok) {
    let errorDetail = `HTTP ${res.status}`;
    try {
      const errBody = await res.json();
      errorDetail = errBody?.message || errBody?.detail || errBody?.error || JSON.stringify(errBody);
    } catch {
      try {
        errorDetail = await res.text();
      } catch { /* keep HTTP status as fallback */ }
    }
    const err = new Error(errorDetail);
    err.status = res.status;
    throw err;
  }

  const contentType = res.headers.get('content-type') || '';

  // ── 非流式 fallback：后端返回普通 JSON ───────────────────────────────────────
  if (!contentType.includes('text/event-stream')) {
    const data = await res.json();
    const content = data?.script?.content || data?.content || '';
    if (content) onChunk?.(content);
    return content;
  }

  // ── SSE 流式读取 ─────────────────────────────────────────────────────────────
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let accumulated = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? ''; // 保留最后一段不完整行

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') return accumulated;

        let chunk = '';
        try {
          const parsed = JSON.parse(payload);
          // 兼容多种格式：OpenAI delta / 自定义 delta / content / chunk
          chunk =
            parsed?.choices?.[0]?.delta?.content ??
            parsed?.delta ??
            parsed?.content ??
            parsed?.chunk ??
            '';
        } catch {
          chunk = payload; // 纯文本 chunk
        }

        if (chunk) {
          accumulated += chunk;
          onChunk?.(accumulated);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return accumulated;
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
  const body = { split_mode: 'rule_first' };
  if (model) body.model = model;
  if (episode_count != null) body.episode_count = episode_count;

  const res = await authFetch(
    `${BASE}/api/projects/${projectId}/script-workspace/finalize`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );
  return res.json();
}

export async function apiExtractSubjectsFromScript(projectId) {
  const res = await authFetch(
    `${BASE}/api/projects/${projectId}/script-workspace/extract-subjects`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }
  );
  return res.json();
}
