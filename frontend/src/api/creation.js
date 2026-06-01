const BASE = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

import { authFetch } from './request.js';

// ── 创作会话（Session）───────────────────────────────────────────────────────

export async function apiListCreationSessions({ project_id, status } = {}) {
  if (USE_MOCK) {
    console.log('[mock] list creation sessions');
    return [];
  }
  const params = new URLSearchParams();
  if (project_id) params.append('project_id', project_id);
  if (status) params.append('status', status);
  const query = params.toString();
  const url = query ? `${BASE}/api/creation/sessions?${query}` : `${BASE}/api/creation/sessions`;
  const res = await authFetch(url, { headers: { 'Content-Type': 'application/json' } });
  return res.json();
}

export async function apiCreateSession(data) {
  if (USE_MOCK) {
    console.log('[mock] create session', data);
    return { id: `sess-${Date.now()}` };
  }
  const res = await authFetch(`${BASE}/api/creation/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiGetSession(sessionId) {
  if (USE_MOCK) {
    console.log('[mock] get session', sessionId);
    return {};
  }
  const res = await authFetch(`${BASE}/api/creation/sessions/${sessionId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiUpdateSession(sessionId, data) {
  if (USE_MOCK) {
    console.log('[mock] update session', sessionId, data);
    return;
  }
  const res = await authFetch(`${BASE}/api/creation/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiDeleteSession(sessionId) {
  if (USE_MOCK) {
    console.log('[mock] delete session', sessionId);
    return;
  }
  await authFetch(`${BASE}/api/creation/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

// ── 创作镜头（Shot）──────────────────────────────────────────────────────────

export async function apiListShots(sessionId) {
  if (USE_MOCK) {
    console.log('[mock] list shots', sessionId);
    return [];
  }
  const res = await authFetch(`${BASE}/api/creation/sessions/${sessionId}/shots`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiCreateShot(sessionId, data) {
  if (USE_MOCK) {
    console.log('[mock] create shot', sessionId, data);
    return { id: `shot-${Date.now()}` };
  }
  const res = await authFetch(`${BASE}/api/creation/sessions/${sessionId}/shots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiGetShot(shotId) {
  if (USE_MOCK) {
    console.log('[mock] get shot', shotId);
    return {};
  }
  const res = await authFetch(`${BASE}/api/creation/shots/${shotId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiUpdateShot(shotId, data) {
  if (USE_MOCK) {
    console.log('[mock] update shot', shotId, data);
    return;
  }
  const res = await authFetch(`${BASE}/api/creation/shots/${shotId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiDeleteShot(shotId) {
  if (USE_MOCK) {
    console.log('[mock] delete shot', shotId);
    return;
  }
  await authFetch(`${BASE}/api/creation/shots/${shotId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiReorderShots(sessionId, shot_ids) {
  if (USE_MOCK) {
    console.log('[mock] reorder shots', sessionId, shot_ids);
    return [];
  }
  const res = await authFetch(`${BASE}/api/creation/sessions/${sessionId}/shots/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shot_ids }),
  });
  return res.json();
}

// ── 创作图片 ──────────────────────────────────────────────────────────────────

export async function apiListCreationImages(filters = {}) {
  if (USE_MOCK) {
    console.log('[mock] list creation images', filters);
    return { list: [], total: 0, has_more: false, page: 1, page_size: 20 };
  }
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
  if (USE_MOCK) {
    console.log('[mock] get creation image', imageId);
    return {};
  }
  const res = await authFetch(`${BASE}/api/creation/images/${imageId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiGenerateCreationImages(data) {
  if (USE_MOCK) {
    console.log('[mock] generate creation images', data);
    return { id: `task-${Date.now()}`, task_id: `task-${Date.now()}`, status: 'pending' };
  }
  const res = await authFetch(`${BASE}/api/creation/images/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiGenerateShotImage(shotId, data) {
  if (USE_MOCK) {
    console.log('[mock] generate shot image', shotId, data);
    return { id: `task-${Date.now()}`, task_id: `task-${Date.now()}`, status: 'pending' };
  }
  const res = await authFetch(`${BASE}/api/creation/shots/${shotId}/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiDeleteCreationImage(imageId) {
  if (USE_MOCK) {
    console.log('[mock] deleteCreationImage', imageId);
    return { success: true };
  }
  const res = await authFetch(`${BASE}/api/creation/images/${imageId}`, { method: 'DELETE' });
  return res.json();
}

export async function apiToggleImageFavorite(imageId, liked) {
  if (USE_MOCK) {
    console.log('[mock] toggleImageFavorite', imageId, liked);
    return { success: true, is_liked: liked };
  }
  const res = await authFetch(`${BASE}/api/creation/images/${imageId}/favorite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ liked }),
  });
  return res.json();
}

export async function apiBatchDeleteImages(ids) {
  if (USE_MOCK) {
    console.log('[mock] batchDeleteImages', ids);
    return { success: true };
  }
  const res = await authFetch(`${BASE}/api/creation/images/batch-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, asset_ids: ids }),
  });
  return res.json();
}

export async function apiBatchDownloadImages(ids) {
  if (USE_MOCK) {
    console.log('[mock] batchDownloadImages', ids);
    return new Blob();
  }
  const res = await authFetch(`${BASE}/api/creation/images/batch-download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, asset_ids: ids }),
  });
  return res.blob();
}

export async function apiBatchFavoriteImages(ids, liked) {
  if (USE_MOCK) {
    console.log('[mock] batchFavoriteImages', ids, liked);
    return { success: true };
  }
  const res = await authFetch(`${BASE}/api/creation/images/batch-favorite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, liked }),
  });
  return res.json();
}

export async function apiDownloadCreationImage(imageId) {
  if (USE_MOCK) {
    console.log('[mock] download creation image', imageId);
    return new Blob();
  }
  const res = await authFetch(`${BASE}/api/creation/images/${imageId}/download`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.blob();
}

// ── 创作视频 ──────────────────────────────────────────────────────────────────

export async function apiListCreationVideos({ page, page_size } = {}) {
  if (USE_MOCK) {
    console.log('[mock] list creation videos');
    return { list: [], total: 0, has_more: false, page: 1, page_size: 20 };
  }
  const params = new URLSearchParams();
  if (page !== undefined) params.append('page', page);
  if (page_size !== undefined) params.append('page_size', page_size);
  const query = params.toString();
  const url = query ? `${BASE}/api/creation/videos?${query}` : `${BASE}/api/creation/videos`;
  const res = await authFetch(url, { headers: { 'Content-Type': 'application/json' } });
  return res.json();
}

export async function apiGenerateCreationVideo(data) {
  if (USE_MOCK) {
    console.log('[mock] generate creation video', data);
    return { id: `task-${Date.now()}`, task_id: `task-${Date.now()}`, status: 'pending' };
  }
  const res = await authFetch(`${BASE}/api/creation/videos/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiGenerateShotVideo(shotId, data) {
  if (USE_MOCK) {
    console.log('[mock] generate shot video', shotId, data);
    return { clip_id: `clip-${Date.now()}`, video_url: '' };
  }
  const res = await authFetch(`${BASE}/api/creation/shots/${shotId}/generate-video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiDeleteCreationVideo(videoId) {
  if (USE_MOCK) {
    console.log('[mock] deleteCreationVideo', videoId);
    return { success: true };
  }
  const res = await authFetch(`${BASE}/api/creation/videos/${videoId}`, { method: 'DELETE' });
  return res.json();
}

export async function apiToggleVideoFavorite(videoId) {
  if (USE_MOCK) {
    console.log('[mock] toggleVideoFavorite', videoId);
    return { success: true };
  }
  const res = await authFetch(`${BASE}/api/creation/videos/${videoId}/favorite`, { method: 'POST' });
  return res.json();
}

export async function apiBatchDeleteVideos(ids) {
  if (USE_MOCK) {
    console.log('[mock] batchDeleteVideos', ids);
    return { success: true };
  }
  const res = await authFetch(`${BASE}/api/creation/videos/batch-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, asset_ids: ids }),
  });
  return res.json();
}

export async function apiBatchDownloadVideos(ids) {
  if (USE_MOCK) {
    console.log('[mock] batchDownloadVideos', ids);
    return new Blob();
  }
  const res = await authFetch(`${BASE}/api/creation/videos/batch-download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, asset_ids: ids }),
  });
  return res.blob();
}

export async function apiDownloadCreationVideo(videoId) {
  if (USE_MOCK) {
    console.log('[mock] download creation video', videoId);
    return new Blob();
  }
  const res = await authFetch(`${BASE}/api/creation/videos/${videoId}/download`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.blob();
}

// ── 创作音频 ──────────────────────────────────────────────────────────────────

export async function apiGenerateCreationAudio(data) {
  if (USE_MOCK) {
    console.log('[mock] generate creation audio', data);
    return {};
  }
  const res = await authFetch(`${BASE}/api/creation/audios/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiGenerateShotAudio(shotId, data) {
  if (USE_MOCK) {
    console.log('[mock] generate shot audio', shotId, data);
    return { clip_id: `clip-${Date.now()}`, audio_url: '' };
  }
  const res = await authFetch(`${BASE}/api/creation/shots/${shotId}/generate-audio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiListCreationAudios({ page, page_size, is_favorite, search } = {}) {
  if (USE_MOCK) {
    console.log('[mock] list creation audios');
    return [];
  }
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
  if (USE_MOCK) {
    console.log('[mock] get creation audio', audioId);
    return {};
  }
  const res = await authFetch(`${BASE}/api/creation/audios/${audioId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiDeleteCreationAudio(audioId) {
  if (USE_MOCK) {
    console.log('[mock] delete creation audio', audioId);
    return;
  }
  await authFetch(`${BASE}/api/creation/audios/${audioId}`, { method: 'DELETE' });
}

export async function apiToggleAudioFavorite(audioId) {
  if (USE_MOCK) {
    console.log('[mock] toggle audio favorite', audioId);
    return;
  }
  await authFetch(`${BASE}/api/creation/audios/${audioId}/favorite`, { method: 'POST' });
}

export async function apiBatchDeleteAudios(audio_ids) {
  if (USE_MOCK) {
    console.log('[mock] batch delete audios', audio_ids);
    return;
  }
  await authFetch(`${BASE}/api/creation/audios/batch-delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audio_ids }),
  });
}

export async function apiBatchDownloadAudios(audio_ids) {
  if (USE_MOCK) {
    console.log('[mock] batch download audios', audio_ids);
    return new Blob();
  }
  const res = await authFetch(`${BASE}/api/creation/audios/batch-download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audio_ids }),
  });
  return res.blob();
}

export async function apiDownloadCreationAudio(audioId) {
  if (USE_MOCK) {
    console.log('[mock] download creation audio', audioId);
    return new Blob();
  }
  const res = await authFetch(`${BASE}/api/creation/audios/${audioId}/download`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.blob();
}

// ── 创作任务轮询 ──────────────────────────────────────────────────────────────

export async function apiListCreationTasks({ status, task_type, session_id, shot_id } = {}) {
  if (USE_MOCK) {
    console.log('[mock] list creation tasks');
    return [];
  }
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
  if (USE_MOCK) {
    console.log('[mock] get creation image task', taskId);
    return { task_id: taskId, status: 'done', progress: 100, images: [] };
  }
  const res = await authFetch(`${BASE}/api/creation/tasks/${taskId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiGetCreationVideoTask(taskId) {
  if (USE_MOCK) {
    console.log('[mock] get creation video task', taskId);
    return { task_id: taskId, status: 'done', progress: 100, result: null };
  }
  const res = await authFetch(`${BASE}/api/creation/videos/tasks/${taskId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

// ── 创作上传 ──────────────────────────────────────────────────────────────────

export async function apiUploadCreationImage({ file, category, asset_name, session_id, shot_id, project_id }) {
  if (USE_MOCK) {
    console.log('[mock] upload creation image', file?.name);
    return { asset_id: `mock-${Date.now()}`, uploaded_url: URL.createObjectURL(file) };
  }
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
  if (USE_MOCK) {
    console.log('[mock] upload creation video', file?.name);
    return { asset_id: `mock-${Date.now()}`, uploaded_url: URL.createObjectURL(file) };
  }
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
  if (USE_MOCK) {
    console.log('[mock] upload creation audio', file?.name);
    return { asset_id: `mock-${Date.now()}`, uploaded_url: URL.createObjectURL(file) };
  }
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
  if (USE_MOCK) {
    console.log('[mock] get video last frame', videoUrl);
    return { lastFrameUrl: null };
  }
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

  if (USE_MOCK) {
    console.log('[mock] generate creation', params);
    await new Promise((r) => setTimeout(r, 1000));
    if (isVideo) {
      return { taskId: `task-${Date.now()}`, videos: [], cardIds: [] };
    }
    return { taskId: `task-${Date.now()}`, images: [], cardIds: [] };
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
