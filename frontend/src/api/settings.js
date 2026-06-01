import { authFetch } from './request';

/**
 * 获取水印设置
 */
export async function apiGetWatermarkSettings() {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return {
      imageWatermark: false,
      videoWatermark: false,
    };
  }
  return authFetch(`${import.meta.env.VITE_API_BASE_URL}/api/settings/watermark`, {
    method: 'GET',
  });
}

/**
 * 更新水印设置
 * @param {Object} params
 * @param {boolean} params.imageWatermark - 图片 AI 水印开关
 * @param {boolean} params.videoWatermark - 视频 AI 水印开关
 */
export async function apiUpdateWatermarkSettings(params) {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return { success: true };
  }
  return authFetch(`${import.meta.env.VITE_API_BASE_URL}/api/settings/watermark`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
