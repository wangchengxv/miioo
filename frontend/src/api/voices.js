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
