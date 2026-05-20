export async function apiGetApiConfig() {
  // TODO: GET /api-config
  // returns: { mainConfigured, onelinkEnabled, onelinkApiKey, onelinkModelsByTab, customProviders }
  console.log('[mock] get api config');
  return {
    mainConfigured: false,
    onelinkEnabled: false,
    onelinkApiKey: '',
    onelinkModelsByTab: {
      '对话模型': [
        { id: 'onelink-1', name: 'GPT5.1', description: 'GPT-5.2 是 GPT-5 系列最新一代旗舰级智能模型，在架构设计、推理能力和应用性能上实现重大突破。相比 GPT-5.1…', enabled: true },
        { id: 'onelink-2', name: 'GPT5.1', description: 'GPT-5.2 是 GPT-5 系列最新一代旗舰级智能模型，在架构设计、推理能力和应用性能上实现重大突破。相比 GPT-5.1…', enabled: true },
      ],
      '图片模型': [],
      '视频模型': [],
      '配音模型': [],
    },
    customProviders: [],
  };
}

export async function apiTestConnection() {
  // TODO: POST /api-config/test
  console.log('[mock] test connection');
}

export async function apiSaveApiConfig(data) {
  // TODO: POST /api-config  body: data
  console.log('[mock] save api config', data);
}
