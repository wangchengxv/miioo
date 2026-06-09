/**
 * 模型适配器
 *
 * 将后端 GET /api/models 返回的 ModelConfigResponse[] 转换为 CreationPage 需要的格式：
 *   - modelOptions: [{ value, label }] 供下拉框使用
 *   - capabilitiesMap: { [model_id]: capabilities } 供参数推导使用
 *
 * 策略：后端优先；单个模型 capabilities 为 null 时回退到本地配置文件。
 */

import {
  getImageModelParams,
  getVideoModelParams,
  getImageModelList,
  getVideoModelList,
} from '../config';

/**
 * 将后端模型列表转换为 CreationPage 需要的格式。
 */
export function adaptModels(backendModels, genType) {
  if (!Array.isArray(backendModels) || backendModels.length === 0) {
    return fallbackToLocal(genType);
  }

  const options = [];
  const caps = {};

  for (const m of backendModels) {
    if (!m.is_enabled) continue;
    const cat = (m.category || '').toLowerCase();
    if (genType === 'image' && !cat.includes('image')) continue;
    if (genType === 'video' && !cat.includes('video')) continue;

    options.push({ value: m.model_id, label: m.name });

    if (m.capabilities && typeof m.capabilities === 'object' && Object.keys(m.capabilities).length > 0) {
      caps[m.model_id] = m.capabilities;
    }
  }

  return { modelOptions: options, capabilitiesMap: caps };
}

/**
 * 根据 genType + modelId 推导模型参数。
 */
export function getModelParams(genType, modelId, capabilitiesMap) {
  const backendCap = capabilitiesMap?.[modelId];
  if (backendCap) {
    return genType === 'image'
      ? getImageModelParamsFromCap(backendCap)
      : getVideoModelParamsFromCap(backendCap);
  }
  return genType === 'image'
    ? getImageModelParams(modelId)
    : getVideoModelParams(modelId);
}

function getImageModelParamsFromCap(capabilities) {
  // Support both backend format and local config format
  const hasBackendFormat = capabilities.resolution_size_map !== undefined
    || capabilities.supported_resolutions !== undefined;

  let resolutions, ratios, resolutionRatios, maxCount;

  if (hasBackendFormat) {
    // Backend format: resolution_size_map + supported_resolutions + supported_aspect_ratios
    const sizeMap = capabilities.resolution_size_map || {};
    resolutions = (capabilities.supported_resolutions || [])
      .filter(r => sizeMap[r] && Object.keys(sizeMap[r]).length > 0);

    // Filter out non-standard ratios like 'adaptive'
    const aspectRatios = (capabilities.supported_aspect_ratios || [])
      .filter(r => /^\d+:\d+$/.test(r));
    ratios = aspectRatios.map(ratio => ({
      value: ratio,
      label: ratio,
      w: parseInt(ratio.split(':')[0]),
      h: parseInt(ratio.split(':')[1]),
    }));

    // Build resolutionRatios from sizeMap: which ratios are available per resolution
    resolutionRatios = {};
    for (const res of resolutions) {
      const map = sizeMap[res] || {};
      resolutionRatios[res] = Object.keys(map).filter(r => /^\d+:\d+$/.test(r));
    }

    maxCount = Math.min(capabilities.max_output_images || 4, 4);
  } else {
    // Local config format: resolutions = { "2K": [{ratio, width, height}, ...] }
    resolutions = Object.keys(capabilities.resolutions || {})
      .filter(k => capabilities.resolutions[k] !== null);

    const firstResolution = resolutions[0];
    ratios = capabilities.resolutions?.[firstResolution]?.map(item => ({
      value: item.ratio,
      label: item.ratio,
      w: parseInt(item.ratio.split(':')[0]),
      h: parseInt(item.ratio.split(':')[1]),
    })) || [];

    resolutionRatios = {};
    for (const res of resolutions) {
      const items = capabilities.resolutions?.[res];
      if (Array.isArray(items)) {
        resolutionRatios[res] = items.map(item => item.ratio);
      }
    }

    maxCount = Math.min(capabilities.features?.maxImagesTotal || 4, 4);
  }

  const counts = Array.from({ length: maxCount }, (_, i) => `${i + 1}张`);

  return {
    ratios,
    resolutionRatios,
    resolutions,
    counts,
    defaults: capabilities.defaults || {
      ratio: ratios[0]?.value || '16:9',
      resolution: resolutions[0] || '2K',
      count: '1张',
    },
  };
}

function getVideoModelParamsFromCap(capabilities) {
  // Support both backend format and local config format
  const hasBackendFormat = capabilities.supported_durations !== undefined
    || capabilities.supported_resolutions !== undefined;

  let ratios, resolutions, durations, refModes, supportsAudio;

  if (hasBackendFormat) {
    // Backend format: flat arrays
    // Filter out non-standard ratios like 'adaptive'
    const aspectRatios = (capabilities.supported_aspect_ratios || [])
      .filter(r => /^\d+:\d+$/.test(r));
    ratios = aspectRatios.map(ratio => ({
      value: ratio,
      label: ratio,
      w: parseInt(ratio.split(':')[0]),
      h: parseInt(ratio.split(':')[1]),
    }));

    resolutions = capabilities.supported_resolutions || [];

    // Durations come as string array ["4", "5", ..., "12"]
    const durationNums = (capabilities.supported_durations || [])
      .map(d => parseInt(d))
      .filter(n => !isNaN(n));
    durations = durationNums.map(d => `${d}s`);

    // Reference modes mapping
    const backendRefModes = capabilities.reference_modes || [];
    refModes = [];
    if (backendRefModes.includes('full')) refModes.push({ value: 'all', label: '全能参考' });
    if (backendRefModes.includes('first_frame') && backendRefModes.includes('last_frame')) {
      refModes.push({ value: 'frame', label: '首尾帧' });
    } else if (backendRefModes.includes('first_frame')) {
      refModes.push({ value: 'first_frame', label: '首帧' });
    }
    if (capabilities.max_reference_images > 1 && !refModes.some(r => r.value === 'multi')) {
      refModes.push({ value: 'multi', label: '智能多帧' });
    }
    if (backendRefModes.includes('video_ref')) {
      refModes.push({ value: 'video_ref', label: '视频参考' });
    }

    // Audio support
    supportsAudio = capabilities.supports_reference_audio || false;
  } else {
    // Local config format: resolutions = { "1080p": [{ratio, width, height}] }
    const resKeys = Object.keys(capabilities.resolutions || {})
      .filter(k => capabilities.resolutions[k] !== null);

    const firstResolution = resKeys[0];
    ratios = capabilities.resolutions?.[firstResolution]?.map(item => ({
      value: item.ratio,
      label: item.ratio,
      w: parseInt(item.ratio.split(':')[0]),
      h: parseInt(item.ratio.split(':')[1]),
    })) || [];

    resolutions = resKeys;

    const [minDuration, maxDuration] = capabilities.outputVideo?.durationRange || [4, 15];
    durations = Array.from(
      { length: maxDuration - minDuration + 1 },
      (_, i) => `${minDuration + i}s`,
    );

    refModes = [];
    const cat = capabilities.category || [];
    if (cat.includes('multi-modal-ref')) refModes.push({ value: 'all', label: '全能参考' });
    if (cat.includes('first-last-frame')) refModes.push({ value: 'frame', label: '首尾帧' });
    if (capabilities.features?.multiImageInput && !refModes.some(r => r.value === 'multi')) {
      refModes.push({ value: 'multi', label: '智能多帧' });
    }

    supportsAudio = Array.isArray(capabilities.inputAudio?.formats)
      && capabilities.inputAudio.formats.length > 0;
  }

  return {
    ratios,
    resolutions,
    durations,
    refModes,
    supportsAudio,
    defaults: capabilities.defaults || {
      ratio: ratios[0]?.value || '16:9',
      resolution: resolutions[0] || '1080P',
      duration: durations[0] || '5s',
      refMode: refModes[0]?.value,
    },
  };
}

function fallbackToLocal(genType) {
  if (genType === 'image') {
    const list = getImageModelList();
    return { modelOptions: list, capabilitiesMap: {} };
  }
  const list = getVideoModelList();
  return { modelOptions: list, capabilitiesMap: {} };
}
