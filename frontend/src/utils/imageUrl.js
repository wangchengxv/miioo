const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

/**
 * 将后端返回的相对路径拼接为完整可访问 URL
 * 例如 /uploads/subjects/xxx.jpg → http://localhost:8000/uploads/subjects/xxx.jpg
 * 已经是完整 URL 或 blob URL 的直接返回
 */
export function normalizeImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url;
  // 开发环境返回相对路径，走 Vite proxy 避免 CORS
  if (import.meta.env.DEV) {
    return url.startsWith('/') ? url : `/${url}`;
  }
  // 去掉 API_BASE 末尾的 /api（图片通常不在 /api 路径下）
  const origin = API_BASE.replace(/\/api\/?$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}
/**
 * 始终返回完整绝对 URL（透传给第三方模型时需要）
 */
export function toAbsoluteUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url;
  const origin = API_BASE.replace(/\/api\/?$/, '');
  if (!origin) return url.startsWith('/') ? url : `/${url}`;
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}
