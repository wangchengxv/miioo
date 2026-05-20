const MOCK_EPISODES = ['第一集', '第二集', '第三集', '第四集', '第五集', '第六集', '第七集', '第八集', '第九集', '第十集', '第十一集', '第十二集'];

export async function apiCreateSubject(type, data) {
  // TODO: POST /projects/:projectId/subjects  body: { type, ...data }
  console.log('[mock] create subject', type, data);
  return { id: Date.now() };
}

export async function apiUpdateSubject(id, data) {
  // TODO: PATCH /subjects/:id  body: data
  console.log('[mock] update subject', id, data);
}

export async function apiDeleteSubject(id) {
  // TODO: DELETE /subjects/:id
  console.log('[mock] delete subject', id);
}

export async function apiGenerateSubjectImage(subjectId, params) {
  // TODO: POST /subjects/:subjectId/generate  body: params
  // returns: { jobId, imageUrl }
  console.log('[mock] generate image for subject', subjectId, params);
  return { jobId: `job-${Date.now()}`, imageUrl: null };
}

export async function apiBatchGenerate(params) {
  // TODO: POST /projects/:projectId/subjects/batch-generate  body: params
  console.log('[mock] batch generate', params);
}

export async function apiGetEpisodes(projectId) {
  // TODO: GET /projects/:projectId/episodes
  console.log('[mock] get episodes', projectId);
  return MOCK_EPISODES;
}

export async function apiGetModels() {
  // TODO: GET /models?type=image
  console.log('[mock] get models');
  return ['Doubao-Seed-2.0-Pro', 'Doubao-Seed-1.6', 'FLUX.1-dev', 'Stable Diffusion XL'];
}
