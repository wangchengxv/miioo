const BASE = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const MOCK_STORAGE_KEY = 'miioo_mock_projects';

import { authFetch } from './request.js';

// Mock 模式下的本地存储辅助函数
function getMockProjects() {
  if (!USE_MOCK) return [];
  try {
    const data = localStorage.getItem(MOCK_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveMockProjects(projects) {
  if (!USE_MOCK) return;
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('[mock] Failed to save projects to localStorage', e);
  }
}

export async function apiGetProjects({ search } = {}) {
  if (USE_MOCK) {
    console.log('[mock] get projects');
    const projects = getMockProjects();
    if (search) {
      return projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    return projects;
  }
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
  if (USE_MOCK) {
    console.log('[mock] get project', projectId);
    const projects = getMockProjects();
    const project = projects.find(p => p.id === projectId);
    return project || {};
  }
  const res = await authFetch(`${BASE}/api/projects/${projectId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function apiCreateProject({ name, description, aspect_ratio, visual_style, project_type, cover_url }) {
  if (USE_MOCK) {
    console.log('[mock] create project', { name, description, aspect_ratio, visual_style });
    const projects = getMockProjects();
    const newProject = {
      id: `project-${Date.now()}`,
      name,
      description,
      aspect_ratio,
      visual_style,
      project_type,
      cover_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    projects.unshift(newProject); // 新项目放在最前面
    saveMockProjects(projects);
    return newProject;
  }
  const res = await authFetch(`${BASE}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description, aspect_ratio, visual_style, project_type, cover_url }),
  });
  return res.json();
}

export async function apiUpdateProject(projectId, data) {
  if (USE_MOCK) {
    console.log('[mock] update project', projectId, data);
    const projects = getMockProjects();
    const index = projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...data, updated_at: new Date().toISOString() };
      saveMockProjects(projects);
      return projects[index];
    }
    // 如果找不到项目，返回更新数据（兼容旧逻辑）
    return { id: projectId, ...data };
  }
  const res = await authFetch(`${BASE}/api/projects/${projectId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function apiDeleteProject(projectId) {
  if (USE_MOCK) {
    console.log('[mock] delete project', projectId);
    const projects = getMockProjects();
    const filtered = projects.filter(p => p.id !== projectId);
    saveMockProjects(filtered);
    return;
  }
  await authFetch(`${BASE}/api/projects/${projectId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiDownloadProjectAssets(projectId) {
  if (USE_MOCK) {
    console.log('[mock] download project assets', projectId);
    return;
  }
  await authFetch(`${BASE}/api/projects/${projectId}/assets/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function apiGetProjectOverview(projectId) {
  if (USE_MOCK) {
    console.log('[mock] get project overview', projectId);
    return { asset_counts: {}, storyboard_thumbnails: [], episode_progress: [] };
  }
  const res = await authFetch(`${BASE}/api/projects/${projectId}/overview`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}
