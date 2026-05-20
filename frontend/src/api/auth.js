export async function sendVerificationCode(phone) {
  // TODO: 替换为真实接口 POST /auth/send-code
  // await fetch('/api/auth/send-code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) });
  console.log('[mock] send-code to', phone);
}

export async function loginWithPhone(phone, code) {
  // TODO: 替换为真实接口 POST /auth/login
  // const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, code }) });
  // return res.json(); // { token, user }
  console.log('[mock] login', phone, code);
  return { token: 'mock-token', user: { id: 'mock-id', name: 'mock-user' } };
}

export async function bindPhone(wechatToken, phone, code) {
  // TODO: 替换为真实接口 POST /auth/bind-phone
  // const res = await fetch('/api/auth/bind-phone', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wechatToken, phone, code }) });
  // return res.json();
  console.log('[mock] bind-phone', phone, code);
  return { token: 'mock-token', user: { id: 'mock-id', name: 'mock-user' } };
}

export async function apiLogout() {
  // TODO: POST /auth/logout
  console.log('[mock] logout');
}
