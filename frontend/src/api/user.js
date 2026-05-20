export async function apiGetCurrentUser() {
  // TODO: GET /users/me
  console.log('[mock] get current user');
  return {};
}

export async function apiGetNotifications() {
  // TODO: GET /notifications
  console.log('[mock] get notifications');
  return [];
}

export async function apiUpdateUser(data) {
  // TODO: PATCH /users/me  body: { name?, email?, bio?, ... }
  console.log('[mock] update user', data);
}

export async function apiUploadAvatar(file) {
  // TODO: POST /users/me/avatar  body: FormData { file }
  // returns: { avatarUrl }
  console.log('[mock] upload avatar', file?.name);
  return { avatarUrl: null };
}

export async function apiDeleteAccount() {
  // TODO: DELETE /users/me
  console.log('[mock] delete account');
}
