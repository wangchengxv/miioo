const BASE = import.meta.env.VITE_API_BASE_URL;

import { authFetch } from './request.js';

export async function apiGetVoices({ tab, gender, age_group, emotion_type } = {}) {
  const params = new URLSearchParams();
  if (tab) params.append('tab', tab);
  if (gender) params.append('gender', gender);
  if (age_group) params.append('age_group', age_group);
  if (emotion_type) params.append('emotion_type', emotion_type);
  const query = params.toString();
  const url = query ? `${BASE}/api/voices?${query}` : `${BASE}/api/voices`;
  const res = await authFetch(url, { headers: { 'Content-Type': 'application/json' } });
  return res.json();
}

// 获取官方音色目录（优先使用，用户配了音频模型时可用）
export async function apiGetOfficialVoices({ provider, language } = {}) {
  const params = new URLSearchParams();
  if (provider) params.append('provider', provider);
  if (language) params.append('language', language);
  const query = params.toString();
  const url = query
    ? `${BASE}/api/voices/official?${query}`
    : `${BASE}/api/voices/official`;
  const res = await authFetch(url, { headers: { 'Content-Type': 'application/json' } });
  return res.json();
}
