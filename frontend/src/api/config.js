const BASE = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

import { authFetch } from './request.js';

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
  const res = await authFetch(`${BASE}/api/providers`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiTestConnection(providerId) {
  if (USE_MOCK) {
    console.log('[mock] test connection', providerId);
    return;
  }
  await authFetch(`${BASE}/api/providers/${providerId}/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiSaveApiConfig({ name, api_key, base_url, models }) {
  if (USE_MOCK) {
    console.log('[mock] save api config', { name, base_url });
    return;
  }
  await authFetch(`${BASE}/api/providers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, api_key, base_url, models }),
  });
}
