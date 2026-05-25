// 创作模块 API

/**
 * 按生成类型获取可用模型列表
 * @param {'image' | 'video'} genType
 */
export async function apiGetCreationModels(genType) {
  // TODO: GET /creation/models?genType=image|video
  console.log('[mock] getCreationModels', genType);
  if (genType === 'video') {
    return [
      { value: 'Kling-2.1-Pro', label: 'Kling 2.1 Pro' },
      { value: 'Kling-1.6', label: 'Kling 1.6' },
      { value: 'Wan2.1', label: 'Wan 2.1' },
    ];
  }
  // image
  return [
    { value: 'Doubao-Seed-2.0-Pro', label: 'Doubao-Seed-2.0-Pro' },
    { value: 'Doubao-Seed-1.6', label: 'Doubao-Seed-1.6' },
    { value: 'GPT-4o', label: 'GPT-4o' },
  ];
}

/**
 * 按生成类型 + 当前模型获取生成参数配置
 * @param {'image' | 'video'} genType
 * @param {string} model
 * @returns {Promise<ImageCreationParams | VideoCreationParams>}
 *
 * ImageCreationParams: { ratios: [{value, label, w, h}], resolutions: string[], counts: string[] }
 * VideoCreationParams: { ratios: [{value, label, w, h}], resolutions: string[], durations: string[], refModes: [{value, label}] }
 */
export async function apiGetCreationParams(genType, model) {
  // TODO: GET /creation/params?genType=image|video&model=xxx
  console.log('[mock] getCreationParams', genType, model);
  if (genType === 'video') {
    return {
      ratios: [
        { value: '16:9', label: '16:9', w: 16, h: 9 },
        { value: '9:16', label: '9:16', w: 9, h: 16 },
        { value: '4:3',  label: '4:3',  w: 4,  h: 3  },
        { value: '3:4',  label: '3:4',  w: 3,  h: 4  },
        { value: '1:1',  label: '1:1',  w: 1,  h: 1  },
        { value: '21:9', label: '21:9', w: 21, h: 9  },
      ],
      resolutions: ['720P', '1080P', '2K', '4K'],
      durations: ['4s', '5s', '6s', '7s', '8s', '9s', '10s', '11s'],
      // 后端根据模型能力决定返回哪 1/2/3 种，前端只渲染，不硬编码数量
      // 三种可能值：all（全能参考）、frame（首尾帧）、multi（智能多帧）
      refModes: [
        { value: 'all',   label: '全能参考' },
        { value: 'frame', label: '首尾帧'   },
        { value: 'multi', label: '智能多帧' },
      ],
    };
  }
  // image
  return {
    ratios: [
      { value: '1:1',  label: '1:1',  w: 1, h: 1 },
      { value: '4:3',  label: '4:3',  w: 4, h: 3 },
      { value: '3:4',  label: '3:4',  w: 3, h: 4 },
      { value: '16:9', label: '16:9', w: 16, h: 9 },
      { value: '9:16', label: '9:16', w: 9, h: 16 },
    ],
    resolutions: ['1K', '2K', '4K'],
    counts: ['1张', '2张', '3张', '4张'],
  };
}

/**
 * 提交创作生成请求
 * @param {object} params
 */
export async function apiGenerateCreation(params) {
  // TODO: POST /creation/generate
  // body: { prompt, genType, model, refMode?, soundEnabled?, ratio?, resolution?, count?, duration?, files? }
  console.log('[mock] generate creation', params);
  return { taskId: `task-${Date.now()}` };
}
