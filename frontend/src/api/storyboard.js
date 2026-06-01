const BASE = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

import { authFetch, authFetchForm } from './request.js';

export async function apiGetStoryboards(projectId, { episode_id } = {}) {
  if (USE_MOCK) {
    console.log('[mock] get storyboards', projectId, episode_id);
    // 从 localStorage 读取分镜数据
    const key = `miioo_storyboards_${projectId}_${episode_id || 'all'}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }
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
  if (USE_MOCK) {
    console.log('[mock] create storyboard', projectId, data);
    const episode_id = data.episode_id || 'all';
    const key = `miioo_storyboards_${projectId}_${episode_id}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');

    // 自动计算下一个编号：找到当前最大编号 + 1（仅在未提供 number 时使用）
    const maxNumber = existing.length > 0
      ? Math.max(...existing.map(sb => sb.number || 0))
      : 0;
    const nextNumber = maxNumber + 1;

    const newItem = {
      ...data,
      id: `sb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      number: data.number !== undefined ? data.number : nextNumber,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 追加到末尾，保持创建顺序（不自动排序，由客户端控制顺序）
    const updated = [...existing, newItem];

    localStorage.setItem(key, JSON.stringify(updated));
    return newItem;
  }
  const res = await authFetch(`${BASE}/api/projects/${projectId}/storyboards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiUpdateStoryboard(projectId, storyboardId, data) {
  if (USE_MOCK) {
    console.log('[mock] update storyboard', projectId, storyboardId, data);
    const episode_id = data.episode_id || 'all';
    const key = `miioo_storyboards_${projectId}_${episode_id}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = existing.map(sb =>
      sb.id === storyboardId
        ? { ...sb, ...data, updated_at: new Date().toISOString() }
        : sb
    );
    localStorage.setItem(key, JSON.stringify(updated));
    return updated.find(sb => sb.id === storyboardId);
  }
  const res = await authFetch(`${BASE}/api/projects/${projectId}/storyboards/${storyboardId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiDeleteStoryboard(projectId, storyboardId) {
  if (USE_MOCK) {
    console.log('[mock] delete storyboard', projectId, storyboardId);
    // 需要遍历所有可能的 episode_id 来找到并删除
    // 简化处理：假设前端会传入正确的 episode_id，或者遍历所有 keys
    const allKeys = Object.keys(localStorage).filter(k => k.startsWith(`miioo_storyboards_${projectId}_`));
    for (const key of allKeys) {
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = existing.filter(sb => sb.id !== storyboardId);
      if (filtered.length !== existing.length) {
        localStorage.setItem(key, JSON.stringify(filtered));
        break;
      }
    }
    return;
  }
  await authFetch(`${BASE}/api/projects/${projectId}/storyboards/${storyboardId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiReorderStoryboards(projectId, ordered_ids) {
  if (USE_MOCK) {
    console.log('[mock] reorder storyboards', projectId, ordered_ids);
    // 原子更新所有分镜的编号：根据 ordered_ids 的顺序重新分配 number
    const allKeys = Object.keys(localStorage).filter(k => k.startsWith(`miioo_storyboards_${projectId}_`));
    for (const key of allKeys) {
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      // 根据 ordered_ids 的顺序重新排序并分配 number
      const reordered = ordered_ids
        .map((id, index) => {
          const shot = existing.find(s => s.id === id);
          return shot ? { ...shot, number: index + 1 } : null;
        })
        .filter(Boolean);
      localStorage.setItem(key, JSON.stringify(reordered));
    }
    return;
  }
  await authFetch(`${BASE}/api/projects/${projectId}/storyboards/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ordered_ids }),
  });
}

// ── 分镜生成 ──────────────────────────────────────────────────────────────────

export async function apiGenerateStoryboardsFromEpisode(projectId, { episode_id, model }) {
  if (USE_MOCK) {
    console.log('[mock] generate storyboards from episode', projectId, episode_id);
    return [];
  }
  const res = await authFetch(`${BASE}/api/projects/${projectId}/storyboards/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ episode_id, model }),
  });
  return res.json();
}

export async function apiGenerateStoryboardsFromFinalScript(projectId) {
  if (USE_MOCK) {
    console.log('[mock] generate storyboards from final script', projectId);
    return { script_status: 'done', episode_count: 0, total_storyboard_count: 0, items: [] };
  }
  const res = await authFetch(
    `${BASE}/api/projects/${projectId}/storyboards/generate-from-final-script`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' } }
  );
  return res.json();
}

// ── 分镜图片/视频生成 ─────────────────────────────────────────────────────────

export async function apiGenerateStoryboardImage(projectId, storyboardId, params) {
  if (USE_MOCK) {
    console.log('[mock] generate image for storyboard', projectId, storyboardId, params);
    // 模拟 1 秒延迟
    await new Promise(r => setTimeout(r, 1000));
    const mockUrl = `https://picsum.photos/seed/${storyboardId}/400/225`;

    // 更新 localStorage 中的 storyboard，保存完整的 storyboardImage 对象
    const episode_id = params.episode_id || 'all';
    const key = `miioo_storyboards_${projectId}_${episode_id}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = existing.map(sb =>
      sb.id === storyboardId
        ? {
            ...sb,
            image_url: mockUrl,
            storyboardImage: { id: mockUrl, url: mockUrl, name: 'generated.jpg', type: 'image/jpeg' },
            updated_at: new Date().toISOString()
          }
        : sb
    );
    localStorage.setItem(key, JSON.stringify(updated));

    return { image_url: mockUrl };
  }
  const res = await authFetch(
    `${BASE}/api/projects/${projectId}/storyboards/${storyboardId}/generate-image`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }
  );
  return res.json();
}

export async function apiGenerateStoryboardVideo(projectId, storyboardId, params) {
  if (USE_MOCK) {
    console.log('[mock] generate video for storyboard', projectId, storyboardId, params);
    // 模拟 1.2 秒延迟
    await new Promise(r => setTimeout(r, 1200));
    const mockUrl = `https://www.w3schools.com/html/mov_bbb.mp4`;

    // 更新 localStorage 中的 storyboard，保存完整的 storyboardVideo 对象
    const episode_id = params.episode_id || 'all';
    const key = `miioo_storyboards_${projectId}_${episode_id}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = existing.map(sb =>
      sb.id === storyboardId
        ? {
            ...sb,
            video_url: mockUrl,
            storyboardVideo: { id: `vid-${storyboardId}`, url: mockUrl, name: 'generated.mp4', type: 'video/mp4' },
            updated_at: new Date().toISOString()
          }
        : sb
    );
    localStorage.setItem(key, JSON.stringify(updated));

    return { video_url: mockUrl };
  }
  const res = await authFetch(
    `${BASE}/api/projects/${projectId}/storyboards/${storyboardId}/generate-video`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }
  );
  return res.json();
}

// ── 分镜文件上传/下载 ─────────────────────────────────────────────────────────

export async function apiUploadStoryboardImage(projectId, storyboardId, file) {
  if (USE_MOCK) {
    console.log('[mock] upload storyboard image', projectId, storyboardId, file?.name);
    return { image_url: URL.createObjectURL(file) };
  }
  const form = new FormData();
  form.append('file', file);
  const res = await authFetchForm(
    `${BASE}/api/projects/${projectId}/storyboards/${storyboardId}/upload-image`,
    { method: 'POST', body: form }
  );
  return res.json();
}

export async function apiUploadStoryboardVideo(projectId, storyboardId, file) {
  if (USE_MOCK) {
    console.log('[mock] upload storyboard video', projectId, storyboardId, file?.name);
    return { video_url: URL.createObjectURL(file) };
  }
  const form = new FormData();
  form.append('file', file);
  const res = await authFetchForm(
    `${BASE}/api/projects/${projectId}/storyboards/${storyboardId}/upload-video`,
    { method: 'POST', body: form }
  );
  return res.json();
}

export async function apiDownloadStoryboardVideo(projectId, storyboardId) {
  if (USE_MOCK) {
    console.log('[mock] download storyboard video', projectId, storyboardId);
    return new Blob();
  }
  const res = await authFetch(
    `${BASE}/api/projects/${projectId}/storyboards/${storyboardId}/download-video`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  return res.blob();
}

export async function apiBatchDownloadStoryboardImages(projectId, storyboard_ids) {
  if (USE_MOCK) {
    console.log('[mock] batch download storyboard images', projectId, storyboard_ids);
    return new Blob();
  }
  const res = await authFetch(`${BASE}/api/projects/${projectId}/storyboards/download/images`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storyboard_ids }),
  });
  return res.blob();
}

export async function apiBatchDownloadStoryboardVideos(projectId, storyboard_ids) {
  if (USE_MOCK) {
    console.log('[mock] batch download storyboard videos', projectId, storyboard_ids);
    return new Blob();
  }
  const res = await authFetch(`${BASE}/api/projects/${projectId}/storyboards/download/videos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storyboard_ids }),
  });
  return res.blob();
}

// ── 通用文件上传（图片）──────────────────────────────────────────────────────

export async function apiUploadImage(file) {
  if (USE_MOCK) {
    console.log('[mock] upload image', file.name);
    return { url: URL.createObjectURL(file) };
  }
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
