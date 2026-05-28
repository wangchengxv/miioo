// 创作模块 API

/**
 * 获取视频尾帧图片（用作首帧参考）
 * @param {string} videoUrl - 视频 URL
 * @returns {Promise<{ lastFrameUrl: string }>} - 返回尾帧图片 URL
 */
export async function apiGetVideoLastFrame(videoUrl) {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    console.log('[mock] get video last frame', videoUrl);
    await new Promise((r) => setTimeout(r, 500));

    // Mock: 生成一个测试图片作为尾帧
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 640, 360);
    const hue = Date.now() % 360;
    gradient.addColorStop(0, `hsl(${hue}, 70%, 50%)`);
    gradient.addColorStop(1, `hsl(${(hue + 60) % 360}, 70%, 30%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 640, 360);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Last Frame', 320, 180);

    const lastFrameUrl = canvas.toDataURL('image/jpeg', 0.8);
    return { lastFrameUrl };
  }

  const token = localStorage.getItem('token');
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/creation/video-last-frame`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ videoUrl }),
  });
  return res.json();
}

/**
 * 保存创作生成的资产到资产库（创作资产模块）
 * @param {{ imageUrl: string, prompt: string, model: string, ratio: string, resolution: string, createdAt: string, genType: string }} data
 */
export async function apiSaveCreationAsset(data) {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    console.log('[mock] saveCreationAsset', data);
    await new Promise((r) => setTimeout(r, 400));
    return { id: `asset-${Date.now()}`, success: true };
  }
  const token = localStorage.getItem('token');
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me/creative-assets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiGenerateCreation(params) {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    console.log('[mock] generate creation', params);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 2000));

    const isVideo = params.genType === 'video';

    if (isVideo) {
      // 视频生成假数据 - 使用本地可访问的测试视频
      // 由于 Google Cloud Storage 可能被墙，改用 data URL 方案
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');

      // 创建渐变背景
      const gradient = ctx.createLinearGradient(0, 0, 1280, 720);
      const hue = Date.now() % 360;
      gradient.addColorStop(0, `hsl(${hue}, 60%, 40%)`);
      gradient.addColorStop(1, `hsl(${(hue + 80) % 360}, 60%, 20%)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1280, 720);

      // 添加文字
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Test Video', 640, 320);
      ctx.font = '32px Arial';
      ctx.fillText('Mock video generation', 640, 400);

      // 返回静态图片作为视频占位（因为无法在浏览器端生成真实视频）
      const posterUrl = canvas.toDataURL('image/jpeg', 0.8);

      // 尝试使用可访问的视频源
      const testVideos = [
        'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
        posterUrl, // 如果视频源都不可用，至少返回静态图
      ];

      return { taskId: `task-${Date.now()}`, videos: [testVideos[0]], poster: posterUrl };
    }

    // 图片生成假数据 - 使用 canvas 生成 data URL
    const count = parseInt(params.count) || 1;
    const images = Array.from({ length: count }, (_, i) => {
      // 创建一个简单的 canvas 图片
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');

      // 渐变背景
      const gradient = ctx.createLinearGradient(0, 0, 640, 360);
      const hue = (Date.now() + i * 50) % 360;
      gradient.addColorStop(0, `hsl(${hue}, 70%, 50%)`);
      gradient.addColorStop(1, `hsl(${(hue + 60) % 360}, 70%, 30%)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 640, 360);

      // 添加文字
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Generated Image ${i + 1}`, 320, 180);

      return canvas.toDataURL('image/jpeg', 0.8);
    });
    return { taskId: `task-${Date.now()}`, images };
  }
  const token = localStorage.getItem('token');
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/creation/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(params),
  });
  return res.json();
}

/**
 * 删除创作图片
 * @param {string} imageId
 */
export async function apiDeleteCreationImage(imageId) {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    console.log('[mock] deleteCreationImage', imageId);
    return { success: true };
  }
  const token = localStorage.getItem('token');
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/creation/images/${imageId}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.json();
}

/**
 * 删除创作视频
 * @param {string} videoId
 */
export async function apiDeleteCreationVideo(videoId) {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    console.log('[mock] deleteCreationVideo', videoId);
    return { success: true };
  }
  const token = localStorage.getItem('token');
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/creation/videos/${videoId}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.json();
}

/**
 * 切换创作图片收藏状态
 * @param {string} imageId
 * @param {boolean} liked
 */
export async function apiToggleImageFavorite(imageId, liked) {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    console.log('[mock] toggleImageFavorite', imageId, liked);
    return { success: true, is_liked: liked };
  }
  const token = localStorage.getItem('token');
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/creation/images/${imageId}/favorite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ liked }),
  });
  return res.json();
}

/**
 * 切换创作视频收藏状态
 * @param {string} videoId
 */
export async function apiToggleVideoFavorite(videoId) {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    console.log('[mock] toggleVideoFavorite', videoId);
    return { success: true };
  }
  const token = localStorage.getItem('token');
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/creation/videos/${videoId}/favorite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.json();
}

/**
 * 批量删除创作图片
 * @param {string[]} ids
 */
export async function apiBatchDeleteImages(ids) {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    console.log('[mock] batchDeleteImages', ids);
    return { success: true };
  }
  const token = localStorage.getItem('token');
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/creation/images/batch-delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ ids }),
  });
  return res.json();
}

/**
 * 批量删除创作视频
 * @param {string[]} ids
 */
export async function apiBatchDeleteVideos(ids) {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    console.log('[mock] batchDeleteVideos', ids);
    return { success: true };
  }
  const token = localStorage.getItem('token');
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/creation/videos/batch-delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ ids }),
  });
  return res.json();
}

/**
 * 批量收藏/取消收藏创作图片
 * @param {string[]} ids
 * @param {boolean} liked
 */
export async function apiBatchFavoriteImages(ids, liked) {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    console.log('[mock] batchFavoriteImages', ids, liked);
    return { success: true };
  }
  const token = localStorage.getItem('token');
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/creation/images/batch-favorite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ ids, liked }),
  });
  return res.json();
}
