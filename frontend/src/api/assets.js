const BASE = import.meta.env.VITE_API_BASE_URL;
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

import { authFetch, authFetchForm } from './request.js';

export async function apiGetAssetDetail(assetId) {
  if (USE_MOCK) {
    console.log('[mock] get asset detail', assetId);
    return {
      name: '小虎',
      description: '一只雄性成年孟加拉虎，大型健壮体型，肩背宽厚，四肢粗壮，橘黄色短毛，黑色条纹较粗且分布稳定，右眼上方有一道浅色旧疤，颈部一圈深棕色较长鬃毛，头部较大，口鼻宽，尾巴中等长度，站姿平稳。',
      prompt: 'A lone detective walks through a rain-soaked alley at night, neon reflections shimmering on wet cobblestones, cinematic wide shot, shallow depth of field, moody noir atmosphere',
      model: 'Kling 2.1 Pro',
      ratio: '16:9',
      resolution: '1920 × 1080',
      generatedAt: '2026-04-21 15:30:09',
      images: [
        { id: 'i1', src: 'https://app.paper.design/static/flowers.webp', finalized: true },
        { id: 'i2', src: 'https://app.paper.design/static/flowers.webp', finalized: false },
        { id: 'i3', src: 'https://app.paper.design/static/flowers.webp', finalized: false },
      ],
    };
  }
  const res = await authFetch(`${BASE}/api/assets/${assetId}`, { headers: { 'Content-Type': 'application/json' } });
  return res.json();
}

export async function apiGetShotDetail(shotId) {
  if (USE_MOCK) {
    console.log('[mock] get shot detail', shotId);
    return {
      shotNumber: '01',
      prompt: 'A lone detective walks through a rain-soaked alley at night, neon reflections shimmering on wet cobblestones, cinematic wide shot, shallow depth of field, moody noir atmosphere',
      model: 'Kling 2.1 Pro',
      resolution: '1920 × 1080',
      generatedAt: '2026-04-21 15:30:09',
      images: [
        { id: 's1', src: 'https://app.paper.design/static/flowers.webp', finalized: true },
        { id: 's2', src: 'https://app.paper.design/static/flowers.webp', finalized: false },
        { id: 's3', src: 'https://app.paper.design/static/flowers.webp', finalized: false },
      ],
    };
  }
  const res = await authFetch(`${BASE}/api/storyboards/${shotId}`, { headers: { 'Content-Type': 'application/json' } });
  return res.json();
}

export async function apiGetShotVideoDetail(shotId) {
  if (USE_MOCK) {
    console.log('[mock] get shot video detail', shotId);
    return {
      shotNumber: '03',
      prompt: 'A lone detective walks through a rain-soaked alley at night, neon reflections shimmering on wet cobblestones, cinematic wide shot, shallow depth of field, moody noir atmosphere',
      model: 'Kling 2.1 Pro',
      resolution: '1920 × 1080',
      duration: '0:24',
      ratio: '16:9',
      generatedAt: '2026-04-21 15:30:09',
      videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
      frames: [
        { id: 'v1', src: 'https://app.paper.design/static/flowers.webp', finalized: true },
        { id: 'v2', src: 'https://app.paper.design/static/flowers.webp', finalized: false },
        { id: 'v3', src: 'https://app.paper.design/static/flowers.webp', finalized: false },
      ],
    };
  }
  const res = await authFetch(`${BASE}/api/storyboards/${shotId}/video`, { headers: { 'Content-Type': 'application/json' } });
  return res.json();
}

export async function apiGetCreativeDays() {
  if (USE_MOCK) {
    console.log('[mock] get creative days');
    return {
      image: [
        {
          date: '今天',
          cards: [
            { id: 'img1', name: '镜头_001.jpg', url: null },
            { id: 'img2', name: '场景草图.png', url: null },
            { id: 'img3', name: '角色设定.jpg', url: null },
            { id: 'img4', name: '道具参考.png', url: null },
          ],
        },
        {
          date: '昨天',
          cards: [
            { id: 'img5', name: '分镜_A01.jpg', url: null },
            { id: 'img6', name: '背景板.png', url: null },
          ],
        },
      ],
      video: [
        {
          date: '今天',
          cards: [
            { id: 'vid1', name: '第1集_预览.mp4', url: null },
            { id: 'vid2', name: '第2集_预览.mp4', url: null },
          ],
        },
        {
          date: '昨天',
          cards: [
            { id: 'vid3', name: '片头动画.mp4', url: null },
          ],
        },
      ],
      dubbing: [
        {
          date: '今天',
          cards: [
            { id: 'dub1', name: '主角旁白_01', duration: '0:32' },
            { id: 'dub2', name: '主角旁白_02', duration: '0:45' },
            { id: 'dub3', name: '反派台词', duration: '1:08' },
          ],
        },
      ],
    };
  }
  const res = await authFetch(`${BASE}/api/users/me/creative-days`, { headers: { 'Content-Type': 'application/json' } });
  return res.json();
}

export async function apiGetProjectAssets(projectId) {
  if (USE_MOCK) {
    console.log('[mock] get project assets', projectId);
    return {
      chars: [
        { id: 'c1', name: '老虎主角', starred: true, bgColor: '#252525', url: null },
        { id: 'c2', name: '老虎姈姈', starred: false, bgColor: '#1F2320', url: null },
        { id: 'c3', name: '老虎弟弟', starred: false, bgColor: '#20201F', url: null },
        { id: 'c4', name: '老虎妹妹', starred: false, bgColor: '#202024', url: null },
        { id: 'c5', name: '小老虎 A', starred: false, bgColor: '#1F2020', url: null },
        { id: 'c6', name: '反派狼', starred: false, bgColor: '#1D2020', url: null },
        { id: 'c7', name: '猎人爷爷', starred: false, bgColor: '#21201D', url: null },
        { id: 'c8', name: '神秘猫咪', starred: false, bgColor: '#1E1E22', url: null },
      ],
      scenes: [
        { id: 's1', name: '森林入口', starred: false, bgColor: '#1A2018', url: null },
        { id: 's2', name: '老虎洞穴', starred: true, bgColor: '#1E2020', url: null },
        { id: 's3', name: '山顶瞭望台', starred: false, bgColor: '#1C1E1A', url: null },
        { id: 's4', name: '村庄广场', starred: false, bgColor: '#201E1A', url: null },
      ],
      props: [
        { id: 'p1', name: '猎人陷阱', starred: false, bgColor: '#201E1A', url: null },
        { id: 'p2', name: '老虎项圈', starred: true, bgColor: '#1E1E22', url: null },
        { id: 'p3', name: '神秘宝箱', starred: false, bgColor: '#1A1E20', url: null },
      ],
      storyboard_img: [
        { id: 'si1', name: '第1集_镜头01', starred: false, bgColor: '#1E2022', url: null },
        { id: 'si2', name: '第1集_镜头02', starred: false, bgColor: '#201E22', url: null },
        { id: 'si3', name: '第1集_镜头03', starred: true, bgColor: '#1E2020', url: null },
        { id: 'si4', name: '第2集_镜头01', starred: false, bgColor: '#22201E', url: null },
        { id: 'si5', name: '第2集_镜头02', starred: false, bgColor: '#1E2220', url: null },
      ],
      storyboard_video: [
        { id: 'sv1', name: '第1集_预览', starred: false, bgColor: '#1A1E24', url: null },
        { id: 'sv2', name: '第2集_预览', starred: false, bgColor: '#1E1A24', url: null },
      ],
      audio: [
        { id: 'au1', name: '主题曲_片头', starred: true, duration: '2:34' },
        { id: 'au2', name: '背景音乐_森林', starred: false, duration: '4:12' },
        { id: 'au3', name: '音效_老虎吼叫', starred: false, duration: '0:08' },
      ],
      final: [
        { id: 'f1', name: '第1集_成片', starred: true, bgColor: '#1A1E22', url: null },
        { id: 'f2', name: '第2集_成片', starred: false, bgColor: '#1E1A22', url: null },
      ],
    };
  }
  const res = await authFetch(`${BASE}/api/projects/${projectId}/assets`, { headers: { 'Content-Type': 'application/json' } });
  return res.json();
}
