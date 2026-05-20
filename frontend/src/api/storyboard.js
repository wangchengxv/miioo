export async function apiUpdateShotFinalized(shotId, finalized) {
  // TODO: PATCH /shots/:shotId  body: { finalized }
  console.log('[mock] update shot finalized', shotId, finalized);
}

export async function apiGetShots(episodeId) {
  // TODO: GET /shots?episodeId=episodeId
  console.log('[mock] get shots', episodeId);
  return [];
}

export async function apiUploadFile(file) {
  // TODO: POST /upload  body: FormData { file }
  // returns: { url }
  console.log('[mock] upload file', file.name);
  return { url: URL.createObjectURL(file) };
}

export async function apiGenerateImage(shotId, params) {
  // TODO: POST /shots/:shotId/generate-image  body: params
  // returns: { jobId, imageUrl }
  console.log('[mock] generate image for shot', shotId, params);
  return { jobId: `job-${Date.now()}`, imageUrl: null };
}

export async function apiGenerateVideo(shotId, params) {
  // TODO: POST /shots/:shotId/generate-video  body: params
  // returns: { jobId, videoUrl }
  console.log('[mock] generate video for shot', shotId, params);
  return { jobId: `job-${Date.now()}`, videoUrl: null };
}

export async function apiCreateShot(episodeId, data) {
  // TODO: POST /episodes/:episodeId/shots  body: data
  console.log('[mock] create shot', episodeId, data);
  return { id: `shot-${Date.now()}-${Math.random()}` };
}

export async function apiUpdateShot(shotId, data) {
  // TODO: PATCH /shots/:shotId  body: data
  console.log('[mock] update shot', shotId, data);
}

export async function apiDeleteShot(shotId) {
  // TODO: DELETE /shots/:shotId
  console.log('[mock] delete shot', shotId);
}

export async function apiReorderShots(episodeId, orderedIds) {
  // TODO: PATCH /episodes/:episodeId/shots/reorder  body: { orderedIds }
  console.log('[mock] reorder shots', episodeId, orderedIds);
}
