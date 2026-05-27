// 创作模块 API

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
    const count = parseInt(params.count) || 1;
    // Return placeholder images (picsum) for demo
    const images = Array.from({ length: count }, (_, i) =>
      `https://picsum.photos/seed/${Date.now() + i}/640/360`
    );
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
