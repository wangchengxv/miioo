const BASE = import.meta.env.VITE_API_BASE_URL;

import { authFetch } from './request.js';

// ── 创作会话（Session）───────────────────────────────────────────────────────

export async function apiListCreationSessions({ project_id, status } = {}) {
  const params = new URLSearchParams();
  if (project_id) params.append('project_id', project_id);
  if (status) params.append('status', status);
  const query = params.toString();
  const url = query ? `${BASE}/api/creation/sessions?${query}` : `${BASE}/api/creation/sessions`;
  const res = await authFetch(url, { headers: { 'Content-Type': 'application/json' } });
  return res.json();
}

export async function apiCreateSession(data) {
  const res = await authFetch(`${BASE}/api/creation/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiGetSession(sessionId) {
  const res = await authFetch(`${BASE}/api/creation/sessions/${sessionId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiUpdateSession(sessionId, data) {
  const res = await authFetch(`${BASE}/api/creation/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiDeleteSession(sessionId) {
  await authFetch(`${BASE}/api/creation/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

// ── 创作镜头（Shot）──────────────────────────────────────────────────────────

export async function apiListShots(sessionId) {
  const res = await authFetch(`${BASE}/api/creation/sessions/${sessionId}/shots`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiCreateShot(sessionId, data) {
  const res = await authFetch(`${BASE}/api/creation/sessions/${sessionId}/shots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiGetShot(shotId) {
  const res = await authFetch(`${BASE}/api/creation/shots/${shotId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiUpdateShot(shotId, data) {
  const res = await authFetch(`${BASE}/api/creation/shots/${shotId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiDeleteShot(shotId) {
  await authFetch(`${BASE}/api/creation/shots/${shotId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiReorderShots(sessionId, shot_ids) {
  const res = await authFetch(`${BASE}/api/creation/sessions/${sessionId}/shots/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shot_ids }),
  });
  return res.json();
}

// ── 创作图片 ──────────────────────────────────────────────────────────────────

export async function apiListCreationImages(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, v);
  });
  const query = params.toString();
  const url = query ? `${BASE}/api/creation/images?${query}` : `${BASE}/api/creation/images`;
  const res = await authFetch(url, { headers: { 'Content-Type': 'application/json' } });
  return res.json();
}

export async function apiGetCreationImage(imageId) {
  const res = await authFetch(`${BASE}/api/creation/images/${imageId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiGenerateCreationImages(data) {
  const res = await authFetch(`${BASE}/api/creation/images/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiGenerateShotImage(shotId, data) {
  const res = await authFetch(`${BASE}/api/creation/shots/${shotId}/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiDeleteCreationImage(imageId) {
  const res = await authFetch(`${BASE}/api/creation/images/${imageId}`, { method: 'DELETE' });
  return res.json();
}

export async function apiToggleImageFavorite(imageId, liked) {
  const res = await authFetch(`${BASE}/api/creation/images/${imageId}/favorite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ liked }),
  });
  return res.json();
}

export async function apiBatchDeleteImages(ids) {
  const res = await authFetch(`${BASE}/api/creation/images/batch-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, asset_ids: ids }),
  });
  return res.json();
}

export async function apiBatchDownloadImages(ids) {
  const res = await authFetch(`${BASE}/api/creation/images/batch-download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, asset_ids: ids }),
  });
  return res.blob();
}

export async function apiBatchFavoriteImages(ids, liked) {
  const res = await authFetch(`${BASE}/api/creation/images/batch-favorite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, liked }),
  });
  return res.json();
}

export async function apiDownloadCreationImage(imageId) {
  const res = await authFetch(`${BASE}/api/creation/images/${imageId}/download`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.blob();
}

// ── 创作视频 ──────────────────────────────────────────────────────────────────

export async function apiListCreationVideos({ page, page_size } = {}) {
  const params = new URLSearchParams();
  if (page !== undefined) params.append('page', page);
  if (page_size !== undefined) params.append('page_size', page_size);
  const query = params.toString();
  const url = query ? `${BASE}/api/creation/videos?${query}` : `${BASE}/api/creation/videos`;
  const res = await authFetch(url, { headers: { 'Content-Type': 'application/json' } });
  return res.json();
}

export async function apiGenerateCreationVideo(data) {
  const res = await authFetch(`${BASE}/api/creation/videos/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiGenerateShotVideo(shotId, data) {
  const res = await authFetch(`${BASE}/api/creation/shots/${shotId}/generate-video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiDeleteCreationVideo(videoId) {
  const res = await authFetch(`${BASE}/api/creation/videos/${videoId}`, { method: 'DELETE' });
  return res.json();
}

export async function apiToggleVideoFavorite(videoId) {
  const res = await authFetch(`${BASE}/api/creation/videos/${videoId}/favorite`, { method: 'POST' });
  return res.json();
}

export async function apiBatchDeleteVideos(ids) {
  const res = await authFetch(`${BASE}/api/creation/videos/batch-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, asset_ids: ids }),
  });
  return res.json();
}

export async function apiBatchDownloadVideos(ids) {
  const res = await authFetch(`${BASE}/api/creation/videos/batch-download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, asset_ids: ids }),
  });
  return res.blob();
}

export async function apiDownloadCreationVideo(videoId) {
  const res = await authFetch(`${BASE}/api/creation/videos/${videoId}/download`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.blob();
}

// ── 创作音频 ──────────────────────────────────────────────────────────────────

export async function apiGenerateCreationAudio(data) {
  const res = await authFetch(`${BASE}/api/creation/audios/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiGenerateShotAudio(shotId, data) {
  const res = await authFetch(`${BASE}/api/creation/shots/${shotId}/generate-audio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiListCreationAudios({ page, page_size, is_favorite, search } = {}) {
  const params = new URLSearchParams();
  if (page !== undefined) params.append('page', page);
  if (page_size !== undefined) params.append('page_size', page_size);
  if (is_favorite !== undefined) params.append('is_favorite', is_favorite);
  if (search) params.append('search', search);
  const query = params.toString();
  const url = query ? `${BASE}/api/creation/audios?${query}` : `${BASE}/api/creation/audios`;
  const res = await authFetch(url, { headers: { 'Content-Type': 'application/json' } });
  return res.json();
}

export async function apiGetCreationAudio(audioId) {
  const res = await authFetch(`${BASE}/api/creation/audios/${audioId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiDeleteCreationAudio(audioId) {
  await authFetch(`${BASE}/api/creation/audios/${audioId}`, { method: 'DELETE' });
}

export async function apiToggleAudioFavorite(audioId) {
  await authFetch(`${BASE}/api/creation/audios/${audioId}/favorite`, { method: 'POST' });
}

export async function apiBatchDeleteAudios(audio_ids) {
  await authFetch(`${BASE}/api/creation/audios/batch-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audio_ids }),
  });
}

export async function apiBatchDownloadAudios(audio_ids) {
  const res = await authFetch(`${BASE}/api/creation/audios/batch-download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audio_ids }),
  });
  return res.blob();
}

export async function apiDownloadCreationAudio(audioId) {
  const res = await authFetch(`${BASE}/api/creation/audios/${audioId}/download`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.blob();
}

// ── 创作任务轮询 ──────────────────────────────────────────────────────────────

export async function apiListCreationTasks({ status, task_type, session_id, shot_id } = {}) {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (task_type) params.append('task_type', task_type);
  if (session_id) params.append('session_id', session_id);
  if (shot_id) params.append('shot_id', shot_id);
  const query = params.toString();
  const url = query ? `${BASE}/api/creation/tasks?${query}` : `${BASE}/api/creation/tasks`;
  const res = await authFetch(url, { headers: { 'Content-Type': 'application/json' } });
  return res.json();
}

export async function apiGetCreationImageTask(taskId) {
  const res = await authFetch(`${BASE}/api/creation/tasks/${taskId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiGetCreationVideoTask(taskId) {
  const res = await authFetch(`${BASE}/api/creation/videos/tasks/${taskId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiGetCreationAudioTask(taskId) {
  const res = await authFetch(`${BASE}/api/creation/audios/tasks/${taskId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

// ── 创作上传 ──────────────────────────────────────────────────────────────────

export async function apiUploadCreationImage({ file, category, asset_name, session_id, shot_id, project_id }) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (asset_name) params.append('asset_name', asset_name);
  if (session_id) params.append('session_id', session_id);
  if (shot_id) params.append('shot_id', shot_id);
  if (project_id) params.append('project_id', project_id);
  const form = new FormData();
  form.append('file', file);
  const res = await authFetch(`${BASE}/api/creation/images/upload?${params.toString()}`, {
    method: 'POST',
    body: form,
  });
  return res.json();
}

export async function apiUploadCreationVideo({ file, category, asset_name, session_id, shot_id, project_id }) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (asset_name) params.append('asset_name', asset_name);
  if (session_id) params.append('session_id', session_id);
  if (shot_id) params.append('shot_id', shot_id);
  if (project_id) params.append('project_id', project_id);
  const form = new FormData();
  form.append('file', file);
  const res = await authFetch(`${BASE}/api/creation/videos/upload?${params.toString()}`, {
    method: 'POST',
    body: form,
  });
  return res.json();
}

export async function apiUploadCreationAudio({ file, category, asset_name, session_id, shot_id, project_id }) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (asset_name) params.append('asset_name', asset_name);
  if (session_id) params.append('session_id', session_id);
  if (shot_id) params.append('shot_id', shot_id);
  if (project_id) params.append('project_id', project_id);
  const form = new FormData();
  form.append('file', file);
  const res = await authFetch(`${BASE}/api/creation/audios/upload?${params.toString()}`, {
    method: 'POST',
    body: form,
  });
  return res.json();
}

// ── Legacy：apiGetVideoLastFrame（后端无此接口，暂返回 null）──────────────────

export async function apiGetVideoLastFrame(videoUrl) {
  // 后端无 /api/creation/video-last-frame 接口
  // 如需此功能，可在前端用 ffmpeg.wasm 提取，或等待后端提供
  console.warn('[api] apiGetVideoLastFrame: 后端无此接口，返回 null');
  return { lastFrameUrl: null };
}

// ── Legacy：apiGenerateCreation（兼容旧调用，内部拆分图片/视频分支）──────────

export async function apiGenerateCreation(params) {
  const isVideo = params.genType === 'video';

  async function pollTask(pollUrl, extractFn, timeoutMs = 300000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      await new Promise((r) => setTimeout(r, 2000));
      const pollRes = await authFetch(pollUrl);
      const pollData = await pollRes.json();
      const status = pollData.status;
      if (status === 'done' || status === 'completed' || status === 'success') {
        return extractFn(pollData);
      }
      if (status === 'failed' || status === 'error') {
        throw new Error(pollData.error_msg || 'Generation failed');
      }
    }
    throw new Error('Generation timeout');
  }

  if (!isVideo) {
    const body = {
      prompt: params.prompt,
      model: params.model || undefined,
      image_count: parseInt(params.count) || 1,
      aspect_ratio: params.ratio || undefined,
      resolution: params.resolution || undefined,
      reference_images: params.reference_images || undefined,
      category: params.category || undefined,
      asset_name: params.asset_name || undefined,
      session_id: params.session_id || undefined,
      shot_id: params.shot_id || undefined,
      project_id: params.project_id || undefined,
      save_to_assets: params.save_to_assets ?? true,
      inherit_project_style: params.inherit_project_style ?? false,
      watermark: params.watermark || undefined,
    };
    const genData = await apiGenerateCreationImages(body);
    const taskId = genData.task_id || genData.id;
    if (!taskId) throw new Error('No task_id returned');

    const { images, cardIds } = await pollTask(
      `${BASE}/api/creation/tasks/${taskId}`,
      (pollData) => {
        const imgs = pollData.images || [];
        return {
          images: imgs.map((img) => img.original_url || img.originalUrl || img.thumbnail_url || img.thumbnailUrl),
          cardIds: imgs.map((img) => img.id),
        };
      }
    );
    return { taskId, images, cardIds };
  }

  // Video generation
  const body = {
    prompt: params.prompt,
    model: params.model || 'doubao-seedance-2.0',
    ratio: params.ratio || params.videoRatio || '16:9',
    resolution: params.resolution || params.videoResolution || '720P',
    duration: parseInt(params.videoDuration) || 5,
    first_frame_url: params.firstFrameUrl || undefined,
    last_frame_url: params.lastFrameUrl || undefined,
    reference_mode: params.reference_mode || undefined,
    generation_mode: params.generation_mode || undefined,
    with_audio: params.with_audio || false,
    watermark: params.watermark || undefined,
    first_frame_asset_id: params.first_frame_asset_id || undefined,
    last_frame_asset_id: params.last_frame_asset_id || undefined,
    reference_video_url: params.reference_video_url || undefined,
    reference_audio_url: params.reference_audio_url || undefined,
    reference_image_asset_ids: params.reference_image_asset_ids || undefined,
  };
  const genData = await apiGenerateCreationVideo(body);
  const taskId = genData.task_id || genData.id;
  if (!taskId) throw new Error('No task_id returned');

  const { videos, cardIds } = await pollTask(
    `${BASE}/api/creation/videos/tasks/${taskId}`,
    (pollData) => {
      const result = pollData.result;
      if (!result) return { videos: [], cardIds: [] };
      return {
        videos: [result.video_url || result.videoUrl],
        cardIds: [result.id],
      };
    }
  );
  return { taskId, videos, cardIds };
}
