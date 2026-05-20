export async function apiUpdateProject(projectId, data) {
  // TODO: PATCH /projects/:projectId  body: { name?, description?, coverUrl?, ratio?, style? }
  console.log('[mock] update project', projectId, data);
}

export async function apiCreateProject(data) {
  // TODO: POST /projects
  // body: { name, desc, ratio, style, customStyleDesc, coverFile }
  console.log('[mock] create project', data);
  return { id: `project-${Date.now()}` };
}

export async function apiGetProjects() {
  // TODO: GET /projects
  console.log('[mock] get projects');
  return [];
}
