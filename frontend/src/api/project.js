const BASE = import.meta.env.VITE_API_BASE_URL;

import { authFetch, authFetchForm } from './request.js';

export async function apiUploadProjectCover(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await authFetchForm(`${BASE}/api/images/upload`, {
    method: 'POST',
    body: form,
  });
  const data = await res.json();
  return data.url || data.file_url || data.uploaded_url || null;
}

export async function apiGetProjects({ search } = {}) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  const query = params.toString();
  const url = query ? `${BASE}/api/projects?${query}` : `${BASE}/api/projects`;
  const res = await authFetch(url, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiGetProject(projectId) {
  const res = await authFetch(`${BASE}/api/projects/${projectId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiCreateProject({ name, description, aspect_ratio, visual_style, project_type, cover_url }) {
  const res = await authFetch(`${BASE}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, aspect_ratio, visual_style, project_type, cover_url }),
  });
  return res.json();
}

export async function apiUpdateProject(projectId, data) {
  const res = await authFetch(`${BASE}/api/projects/${projectId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiDeleteProject(projectId) {
  await authFetch(`${BASE}/api/projects/${projectId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiDownloadProjectAssets(projectId) {
  await authFetch(`${BASE}/api/projects/${projectId}/assets/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiGetProjectOverview(projectId) {
  const res = await authFetch(`${BASE}/api/projects/${projectId}/overview`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}
