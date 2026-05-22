const BASE = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

function authHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiGetApiConfig() {
  if (USE_MOCK) {
    console.log('[mock] get api config');
    return {
      mainConfigured: false,
      onelinkEnabled: false,
      onelinkApiKey: '',
      onelinkModelsByTab: {
        '对话模型': [
          { id: 'onelink-1', name: 'GPT5.1', description: 'GPT-5.2 是 GPT-5 系列最新一代旗舰级智能模型，在架构设计、推理能力和应用性能上实现重大突破。相比 GPT-5.1…', enabled: true },
          { id: 'onelink-2', name: 'GPT5.1', description: 'GPT-5.2 是 GPT-5 系列最新一代旗舰级智能模型，在架构设计、推理能力和应用性能上实现重大突破。相比 GPT-5.1…', enabled: true },
        ],
        '图片模型': [],
        '视频模型': [],
        '配音模型': [],
      },
      customProviders: [],
    };
  }
  const res = await fetch(`${BASE}/api/providers`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function apiTestConnection(providerId) {
  if (USE_MOCK) {
    console.log('[mock] test connection', providerId);
    return;
  }
  await fetch(`${BASE}/api/providers/${providerId}/test`, {
    method: 'POST',
    headers: authHeaders(),
  });
}

export async function apiSaveApiConfig({ name, api_key, base_url, models }) {
  if (USE_MOCK) {
    console.log('[mock] save api config', { name, base_url });
    return;
  }
  await fetch(`${BASE}/api/providers`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name, api_key, base_url, models }),
  });
}
