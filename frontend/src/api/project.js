const BASE = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

import { authFetch } from './request.js';

export async function apiGetProjects() {
  if (USE_MOCK) {
    console.log('[mock] get projects');
    return [];
  }
  const res = await authFetch(`${BASE}/api/projects`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiCreateProject({ name, desc, ratio, style, customStyleDesc, coverFile }) {
  if (USE_MOCK) {
    console.log('[mock] create project', { name, desc, ratio, style });
    return { id: `project-${Date.now()}` };
  }
  const res = await authFetch(`${BASE}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, desc, ratio, style, custom_style_desc: customStyleDesc }),
  });
  return res.json();
}

export async function apiUpdateProject(projectId, data) {
  if (USE_MOCK) {
    console.log('[mock] update project', projectId, data);
    return;
  }
  const res = await authFetch(`${BASE}/api/projects/${projectId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}
