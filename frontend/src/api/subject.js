const BASE = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

import { authFetch, authFetchForm } from './request.js';

export async function apiGetSubjects(projectId, { type, episode_id } = {}) {
  if (USE_MOCK) {
    console.log('[mock] get subjects', projectId, type);
    const key = `miioo_subjects_${projectId}_${type || 'all'}`;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  }
  const params = new URLSearchParams();
  if (type) params.append('type', type);
  if (episode_id) params.append('episode_id', episode_id);
  const query = params.toString();
  const url = query ? `${BASE}/api/projects/${projectId}/subjects?${query}` : `${BASE}/api/projects/${projectId}/subjects`;
  const res = await authFetch(url, { headers: { 'Content-Type': 'application/json' } });
  return res.json();
}

export async function apiGetSubjectDetail(projectId, subjectId) {
  if (USE_MOCK) {
    console.log('[mock] get subject detail', projectId, subjectId);
    return {};
  }
  const res = await authFetch(`${BASE}/api/projects/${projectId}/subjects/${subjectId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiCreateSubject(projectId, data) {
  if (USE_MOCK) {
    console.log('[mock] create subject', projectId, data);
    const newSubject = { id: `mock-${Date.now()}`, ...data };

    // 保存到 localStorage
    const key = `miioo_subjects_${projectId}_${data.type}`;
    const saved = localStorage.getItem(key);
    const subjects = saved ? JSON.parse(saved) : [];
    subjects.push(newSubject);
    localStorage.setItem(key, JSON.stringify(subjects));

    return newSubject;
  }
  const res = await authFetch(`${BASE}/api/projects/${projectId}/subjects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiUpdateSubject(projectId, subjectId, data) {
  if (USE_MOCK) {
    console.log('[mock] update subject', projectId, subjectId, data);

    // 更新 localStorage
    const types = ['character', 'scene', 'prop'];
    for (const type of types) {
      const key = `miioo_subjects_${projectId}_${type}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const subjects = JSON.parse(saved);
        const index = subjects.findIndex(s => s.id === subjectId);
        if (index !== -1) {
          subjects[index] = { ...subjects[index], ...data };
          localStorage.setItem(key, JSON.stringify(subjects));
          return subjects[index];
        }
      }
    }
    return { id: subjectId, ...data };
  }
  const res = await authFetch(`${BASE}/api/projects/${projectId}/subjects/${subjectId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiDeleteSubject(projectId, subjectId) {
  if (USE_MOCK) {
    console.log('[mock] delete subject', projectId, subjectId);

    // 从 localStorage 删除
    const types = ['character', 'scene', 'prop'];
    for (const type of types) {
      const key = `miioo_subjects_${projectId}_${type}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        const subjects = JSON.parse(saved);
        const filtered = subjects.filter(s => s.id !== subjectId);
        if (filtered.length !== subjects.length) {
          localStorage.setItem(key, JSON.stringify(filtered));
          return;
        }
      }
    }
    return;
  }
  await authFetch(`${BASE}/api/projects/${projectId}/subjects/${subjectId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiDuplicateSubject(projectId, subjectId, { target_episode_id, as_global } = {}) {
  if (USE_MOCK) {
    console.log('[mock] duplicate subject', projectId, subjectId);
    return { id: `dup-${Date.now()}` };
  }
  const res = await authFetch(`${BASE}/api/projects/${projectId}/subjects/${subjectId}/duplicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_episode_id, as_global }),
  });
  return res.json();
}

export async function apiExtractSubjectsFromEpisode(projectId, episodeId) {
  if (USE_MOCK) {
    console.log('[mock] extract subjects from episode', projectId, episodeId);
    return [];
  }
  const res = await authFetch(
    `${BASE}/api/projects/${projectId}/subjects/extract?episode_id=${encodeURIComponent(episodeId)}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' } }
  );
  return res.json();
}

// ── 主体图片 ──────────────────────────────────────────────────────────────────

export async function apiGetSubjectImages(projectId, subjectId) {
  if (USE_MOCK) {
    console.log('[mock] get subject images', projectId, subjectId);
    return [];
  }
  const res = await authFetch(`${BASE}/api/projects/${projectId}/subjects/${subjectId}/images`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiGenerateSubjectImage(projectId, subjectId, params) {
  if (USE_MOCK) {
    console.log('[mock] generate image for subject', projectId, subjectId, params);
    // 模拟 1.5 秒延迟
    await new Promise(r => setTimeout(r, 1500));
    const mockUrl = `https://picsum.photos/seed/${subjectId}-${Date.now()}/512/512`;
    const mockImageId = `img-${Date.now()}`;

    // 更新 localStorage 中的主体数据，添加 primary_image（带错误保护）
    try {
      const types = ['character', 'scene', 'prop'];
      for (const type of types) {
        const key = `miioo_subjects_${projectId}_${type}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          const subjects = JSON.parse(saved);
          const index = subjects.findIndex(s => s.id === subjectId || String(s.id) === String(subjectId));
          if (index !== -1) {
            subjects[index].primary_image = {
              asset_id: mockImageId,
              file_url: mockUrl
            };
            subjects[index].imageUrl = mockUrl; // 兼容前端使用的字段
            localStorage.setItem(key, JSON.stringify(subjects));
            break;
          }
        }
      }
    } catch (err) {
      console.warn('[mock] update subject image in localStorage failed:', err);
      // 即使 localStorage 更新失败，仍返回 mock 数据
    }

    return {
      jobId: `job-${Date.now()}`,
      imageUrl: mockUrl,
      assetId: mockImageId,
      image_url: mockUrl,
      asset_id: mockImageId
    };
  }
  const res = await authFetch(`${BASE}/api/projects/${projectId}/subjects/${subjectId}/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function apiDeleteSubjectImage(projectId, subjectId, imageId) {
  if (USE_MOCK) {
    console.log('[mock] delete subject image', projectId, subjectId, imageId);
    return;
  }
  await authFetch(`${BASE}/api/projects/${projectId}/subjects/${subjectId}/images/${imageId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiSetPrimarySubjectImage(projectId, subjectId, imageId) {
  if (USE_MOCK) {
    console.log('[mock] set primary subject image', projectId, subjectId, imageId);
    return;
  }
  const res = await authFetch(
    `${BASE}/api/projects/${projectId}/subjects/${subjectId}/images/${imageId}/set-primary`,
    { method: 'PATCH', headers: { 'Content-Type': 'application/json' } }
  );
  return res.json();
}

export async function apiUploadSubjectReferenceImage(projectId, subjectId, file) {
  if (USE_MOCK) {
    console.log('[mock] upload subject reference image', projectId, subjectId, file?.name);
    return { asset_id: `mock-${Date.now()}`, file_url: URL.createObjectURL(file), name: file.name };
  }
  const form = new FormData();
  form.append('file', file);
  const res = await authFetchForm(
    `${BASE}/api/projects/${projectId}/subjects/${subjectId}/reference-images/upload`,
    { method: 'POST', body: form }
  );
  return res.json();
}

export async function apiBindSubjectReferenceImages(projectId, subjectId, { asset_ids, primary_asset_id }) {
  if (USE_MOCK) {
    console.log('[mock] bind subject reference images', projectId, subjectId, asset_ids);
    return [];
  }
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
  if (USE_MOCK) {
    console.log('[mock] download subject image', projectId, subjectId, imageId);
    return;
  }
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
  if (USE_MOCK) {
    console.log('[mock] batch generate', projectId, params);
    return [];
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
  if (USE_MOCK) {
    console.log('[mock] update subject (compat)', subjectId, data);
    return;
  }
  return { id: subjectId, ...data };
}

// ── 剧集 ──────────────────────────────────────────────────────────────────────

export async function apiGetEpisodes(projectId) {
  if (USE_MOCK) {
    console.log('[mock] get episodes', projectId);
    return [];
  }
  const res = await authFetch(`${BASE}/api/projects/${projectId}/episodes`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiCreateEpisode(projectId, { title, episode_number, content, summary }) {
  if (USE_MOCK) {
    console.log('[mock] create episode', projectId, title);
    return { id: `ep-${Date.now()}`, title, episode_number };
  }
  const res = await authFetch(`${BASE}/api/projects/${projectId}/episodes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, episode_number, content, summary }),
  });
  return res.json();
}

export async function apiUpdateEpisode(projectId, episodeId, data) {
  if (USE_MOCK) {
    console.log('[mock] update episode', projectId, episodeId, data);
    return;
  }
  const res = await authFetch(`${BASE}/api/projects/${projectId}/episodes/${episodeId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiDeleteEpisode(projectId, episodeId) {
  if (USE_MOCK) {
    console.log('[mock] delete episode', projectId, episodeId);
    return;
  }
  await authFetch(`${BASE}/api/projects/${projectId}/episodes/${episodeId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiGenerateEpisodeScript(projectId, episodeId, { prompt, model }) {
  if (USE_MOCK) {
    console.log('[mock] generate episode script', projectId, episodeId, prompt);
    return {};
  }
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
  if (USE_MOCK) {
    console.log('[mock] upload episode script', projectId, episodeId, file?.name);
    return;
  }
  const form = new FormData();
  form.append('file', file);
  const res = await authFetchForm(
    `${BASE}/api/projects/${projectId}/episodes/${episodeId}/upload`,
    { method: 'POST', body: form }
  );
  return res.json();
}

// ── 剧本工作区 ────────────────────────────────────────────────────────────────

/**
 * 获取剧本工作区数据
 * @param {string} projectId - 项目 ID
 * @returns {Promise<{content: string, episodes: Array, phase: string}>}
 */
export async function apiGetScriptWorkspace(projectId) {
  if (USE_MOCK) {
    console.log('[mock] get script workspace', projectId);
    const key = `miioo_script_${projectId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      content: '',
      episodes: [],
      phase: 'initial'
    };
  }
  const res = await authFetch(
    `${BASE}/api/projects/${projectId}/script-workspace`,
    { headers: { 'Content-Type': 'application/json' } }
  );
  return res.json();
}

/**
 * 保存剧本工作区数据
 * @param {string} projectId - 项目 ID
 * @param {object} data - 剧本数据 {content, episodes, phase}
 * @returns {Promise<object>}
 */
export async function apiSaveScriptWorkspace(projectId, data) {
  if (USE_MOCK) {
    console.log('[mock] save script workspace', projectId, data);
    const key = `miioo_script_${projectId}`;
    const saved = {
      content: data.content || '',
      episodes: data.episodes || [],
      phase: data.phase || 'view',
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(saved));
    return saved;
  }
  const res = await authFetch(
    `${BASE}/api/projects/${projectId}/script-workspace`,
    {
      method: 'PATCH',  // 修改为 PATCH，与 API 文档一致
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
  return res.json();
}

/**
 * 剧本对话生成（用于 ScriptPage 的生成按钮）
 * @param {string} projectId - 项目 ID
 * @param {object} params - {message: string}
 * @returns {Promise<{content: string}>}
 */
export async function apiChatScriptWorkspace(projectId, { message }) {
  if (USE_MOCK) {
    console.log('[mock] chat script workspace', projectId, message);
    // 模拟 3 秒延迟
    await new Promise(r => setTimeout(r, 3000));

    // 使用硬编码的 mock 剧本（从 ScriptPage.jsx 导入）
    const MOCK_SCRIPT_MARKDOWN = `# 两只老虎的青枫奇遇

## 第一集：陌生的邻居

**场景1：青枫林·晨光草地（0:00-1:30）**

【镜头1】俯拍：青枫林被晨雾笼罩，阳光透过树叶洒下斑驳光影。镜头缓缓下降，聚焦到一片开阔的草地。

【镜头2】中景：大虎（橙黄色，体型健壮）正在草地上做伸展运动，动作笨拙但认真。

【镜头3】特写：大虎打了个大大的哈欠，露出锋利的牙齿。

**大虎**（自言自语）："又是美好的一天！今天要去找小虎玩！"

**场景2：青枫林·小虎的树洞（1:30-3:00）**

【镜头4】全景：镜头跟随大虎穿过树林，来到一棵巨大的枫树前。树干上有一个圆形的洞口。

【镜头5】中景：大虎站在树洞前，用爪子轻轻敲门。

**大虎**："小虎！小虎！起床啦！"

【镜头6】内景·树洞：小虎（白色带黑纹，体型较小）蜷缩在柔软的草垫上，耳朵动了动。

【镜头7】特写：小虎睁开惺忪的眼睛，揉了揉眼睛。

**小虎**（慵懒地）："大虎？这么早……"

## 第二集：神秘的声音

**场景1：青枫林·深处（0:00-2:00）**

【镜头1】全景：大虎和小虎并肩走在林间小路上，阳光透过树叶形成光斑。

【镜头2】中景：两只老虎突然停下脚步，竖起耳朵。

**小虎**（警觉）："你听到了吗？"

**大虎**（点头）："好像是……歌声？"

【镜头3】特写：远处传来悠扬的笛声，伴随着风吹树叶的沙沙声。`;

    const content = MOCK_SCRIPT_MARKDOWN;

    // 保存到 localStorage
    const key = `miioo_script_${projectId}`;
    localStorage.setItem(key, JSON.stringify({
      content,
      episodes: [],
      phase: 'view',
      updated_at: new Date().toISOString()
    }));

    return { content };
  }

  const res = await authFetch(`${BASE}/api/projects/${projectId}/script-workspace/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  return res.json();
}
