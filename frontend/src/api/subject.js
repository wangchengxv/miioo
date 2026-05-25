const BASE = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

import { authFetch, authFetchForm } from './request.js';

const MOCK_EPISODES = ['第一集', '第二集', '第三集', '第四集', '第五集', '第六集', '第七集', '第八集', '第九集', '第十集', '第十一集', '第十二集'];

export async function apiGetSubjects(projectId, type) {
  if (USE_MOCK) {
    console.log('[mock] get subjects', projectId, type);
    return [];
  }
  const url = type
    ? `${BASE}/api/projects/${projectId}/subjects?type=${encodeURIComponent(type)}`
    : `${BASE}/api/projects/${projectId}/subjects`;
  const res = await authFetch(url, { headers: { 'Content-Type': 'application/json' } });
  return res.json();
}

export async function apiCreateSubject(projectId, data) {
  if (USE_MOCK) {
    console.log('[mock] create subject', projectId, data);
    return { id: Date.now() };
  }
  const res = await authFetch(`${BASE}/api/projects/${projectId}/subjects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiUpdateSubject(subjectId, data) {
  if (USE_MOCK) {
    console.log('[mock] update subject', subjectId, data);
    return;
  }
  const res = await authFetch(`${BASE}/api/subjects/${subjectId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiDeleteSubject(subjectId) {
  if (USE_MOCK) {
    console.log('[mock] delete subject', subjectId);
    return;
  }
  await authFetch(`${BASE}/api/subjects/${subjectId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiGenerateSubjectImage(subjectId, params) {
  if (USE_MOCK) {
    console.log('[mock] generate image for subject', subjectId, params);
    return { jobId: `job-${Date.now()}`, imageUrl: null };
  }
  const res = await authFetch(`${BASE}/api/subjects/${subjectId}/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function apiGetEpisodes(projectId) {
  if (USE_MOCK) {
    console.log('[mock] get episodes', projectId);
    return MOCK_EPISODES;
  }
  const res = await authFetch(`${BASE}/api/projects/${projectId}/episodes`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiGetModels() {
  if (USE_MOCK) {
    console.log('[mock] get models');
    return ['Doubao-Seed-2.0-Pro', 'Doubao-Seed-1.6', 'FLUX.1-dev', 'Stable Diffusion XL'];
  }
  const res = await authFetch(`${BASE}/api/models`, { headers: { 'Content-Type': 'application/json' } });
  return res.json();
}

export async function apiBatchGenerate(params) {
  if (USE_MOCK) {
    console.log('[mock] batch generate', params);
    return;
  }
  await authFetch(`${BASE}/api/subjects/batch-generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}
