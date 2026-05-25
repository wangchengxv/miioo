const BASE = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

import { authFetch, authFetchForm } from './request.js';

export async function apiGetShots(episodeId) {
  if (USE_MOCK) {
    console.log('[mock] get shots', episodeId);
    return [];
  }
  const res = await authFetch(`${BASE}/api/episodes/${episodeId}/storyboards`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiCreateShot(episodeId, data) {
  if (USE_MOCK) {
    console.log('[mock] create shot', episodeId, data);
    return { id: `shot-${Date.now()}-${Math.random()}` };
  }
  const res = await authFetch(`${BASE}/api/episodes/${episodeId}/storyboards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiUpdateShot(shotId, data) {
  if (USE_MOCK) {
    console.log('[mock] update shot', shotId, data);
    return;
  }
  const res = await authFetch(`${BASE}/api/storyboards/${shotId}`, {
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
  await authFetch(`${BASE}/api/storyboards/${shotId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiUploadFile(file) {
  if (USE_MOCK) {
    console.log('[mock] upload file', file.name);
    return { url: URL.createObjectURL(file) };
  }
  const form = new FormData();
  form.append('file', file);
  const res = await authFetchForm(`${BASE}/api/upload`, {
    method: 'POST',
    body: form,
  });
  return res.json();
}

export async function apiGenerateImage(shotId, params) {
  if (USE_MOCK) {
    console.log('[mock] generate image for shot', shotId, params);
    return { jobId: `job-${Date.now()}`, imageUrl: null };
  }
  const res = await authFetch(`${BASE}/api/storyboards/${shotId}/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function apiGenerateVideo(shotId, params) {
  if (USE_MOCK) {
    console.log('[mock] generate video for shot', shotId, params);
    return { jobId: `job-${Date.now()}`, videoUrl: null };
  }
  const res = await authFetch(`${BASE}/api/storyboards/${shotId}/generate-video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function apiUpdateShotFinalized(shotId, finalized) {
  if (USE_MOCK) {
    console.log('[mock] update shot finalized', shotId, finalized);
    return;
  }
  const res = await authFetch(`${BASE}/api/storyboards/${shotId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ finalized }),
  });
  return res.json();
}

export async function apiReorderShots(episodeId, orderedIds) {
  if (USE_MOCK) {
    console.log('[mock] reorder shots', episodeId, orderedIds);
    return;
  }
  await authFetch(`${BASE}/api/episodes/${episodeId}/storyboards/reorder`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderedIds }),
  });
}
