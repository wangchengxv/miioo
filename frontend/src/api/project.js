const BASE = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

function authHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiGetProjects() {
  if (USE_MOCK) {
    console.log('[mock] get projects');
    return [];
  }
  const res = await fetch(`${BASE}/api/projects`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function apiCreateProject({ name, desc, ratio, style, customStyleDesc, coverFile }) {
  if (USE_MOCK) {
    console.log('[mock] create project', { name, desc, ratio, style });
    return { id: `project-${Date.now()}` };
  }
  const res = await fetch(`${BASE}/api/projects`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name, desc, ratio, style, custom_style_desc: customStyleDesc }),
  });
  return res.json();
}

export async function apiUpdateProject(projectId, data) {
  if (USE_MOCK) {
    console.log('[mock] update project', projectId, data);
    return;
  }
  const res = await fetch(`${BASE}/api/projects/${projectId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}
