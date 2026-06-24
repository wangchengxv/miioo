# 创作视频全能参考使用指南

**完成日期**：2026-06-11  
**状态**：✅ 全能参考能力已实现，本文档提供使用说明

---

## 一、能力概述

创作视频（seedance2.0/seedance2.0fast）已完整支持**全能参考**能力，实现方式与分镜视频一致：

- ✅ 提示词中直接引用数字资产（通过 `@资产名` 或 mentions）
- ✅ 自动解析资产绑定关系（asset_id → URL → 上传到 OneLink AI）
- ✅ 自动生成 token 替换（`@角色A` → `图片1`）
- ✅ 支持多类型资产（图片、视频、音频）
- ✅ 支持角色分配（首帧、尾帧、参考图、参考视频、参考音频）

---

## 二、前端调用示例

### 2.1 基础用法：传递 attachments

```javascript
import { apiGenerateUnified } from '@/api/creation.js';

// 场景1：使用资产库中的图片作为参考
const result = await apiGenerateUnified({
  prompt: '一个舞者在舞台上旋转',
  model: 'doubao-seedance-2.0',
  ratio: '16:9',
  resolution: '720P',
  videoDuration: 5,
  soundEnabled: false,
  
  // 数字资产绑定
  attachments: [
    {
      assetId: 'asset-uuid-123',  // 资产库 ID
      assetType: 'image',
      assetName: '舞者角色',
      url: 'https://example.com/dancer.jpg',
      role: 'reference_image',  // 可选：reference_image, first_frame, last_frame
      source: 'asset_library',
    },
  ],
});
```

### 2.2 高级用法：提示词 mention + 自动 token 替换

```javascript
// 场景2：提示词中引用资产，后端自动替换为 token
const result = await apiGenerateUnified({
  prompt: '@舞者角色 在舞台上旋转，灯光打在她身上',
  model: 'doubao-seedance-2.0',
  ratio: '16:9',
  resolution: '720P',
  videoDuration: 5,
  
  // 资产列表
  attachments: [
    {
      localId: 'local-1',  // 前端临时 ID，用于关联 mentions
      assetId: 'asset-uuid-123',
      assetType: 'image',
      assetName: '舞者角色',
      url: 'https://example.com/dancer.jpg',
      role: 'reference_image',
    },
  ],
  
  // mention 列表（前端解析 @ 符号生成）
  mentions: [
    {
      local_id: 'local-1',  // 关联到 attachments 中的资产
      display_text: '@舞者角色',
      start: 0,  // 在提示词中的起始位置
      end: 5,    // 在提示词中的结束位置
    },
  ],
});

// 后端处理流程：
// 1. 将 @舞者角色 替换为 图片1
// 2. 最终提示词：'图片1 在舞台上旋转，灯光打在她身上'
// 3. 同时在 content 中附加图片的 base64 或 URL
```

### 2.3 复杂场景：多资产 + 首尾帧

```javascript
// 场景3：多个资产 + 首尾帧控制
const result = await apiGenerateUnified({
  prompt: '@角色A 和 @角色B 在花园里跳舞，@背景音乐 渲染氛围',
  model: 'doubao-seedance-2.0',
  ratio: '16:9',
  resolution: '720P',
  videoDuration: 5,
  refMode: 'video_ref',  // 启用首尾帧模式
  
  // 资产列表
  attachments: [
    {
      localId: 'local-1',
      assetId: 'asset-uuid-123',
      assetType: 'image',
      assetName: '角色A',
      url: 'https://example.com/dancer-a.jpg',
      role: 'reference_image',
    },
    {
      localId: 'local-2',
      assetId: 'asset-uuid-456',
      assetType: 'image',
      assetName: '角色B',
      url: 'https://example.com/dancer-b.jpg',
      role: 'reference_image',
    },
    {
      localId: 'local-3',
      assetId: 'asset-uuid-789',
      assetType: 'audio',
      assetName: '背景音乐',
      url: 'https://example.com/bgm.mp3',
      role: 'reference_audio',
    },
  ],
  
  // mentions
  mentions: [
    { local_id: 'local-1', display_text: '@角色A', start: 0, end: 4 },
    { local_id: 'local-2', display_text: '@角色B', start: 6, end: 10 },
    { local_id: 'local-3', display_text: '@背景音乐', start: 18, end: 23 },
  ],
  
  // 首尾帧（可选）
  firstFrameFile: {
    assetId: 'asset-uuid-first',
    url: 'https://example.com/first-frame.jpg',
  },
  lastFrameFile: {
    assetId: 'asset-uuid-last',
    url: 'https://example.com/last-frame.jpg',
  },
});

// 后端处理流程：
// 1. 提示词替换：'图片1 和 图片2 在花园里跳舞，音频1 渲染氛围'
// 2. 资产角色分配：
//    - 图片1 (角色A) → reference_image
//    - 图片2 (角色B) → reference_image
//    - 音频1 (背景音乐) → reference_audio
//    - 首帧 → first_frame
//    - 尾帧 → last_frame
// 3. 生成 content 数组传递给 OneLink AI
```

### 2.4 文件上传场景

```javascript
// 场景4：用户上传本地文件作为参考
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const result = await apiGenerateUnified({
  prompt: '这个角色在跳舞',
  model: 'doubao-seedance-2.0',
  ratio: '16:9',
  resolution: '720P',
  videoDuration: 5,
  
  // 传递 File 对象，apiGenerateUnified 会自动上传
  attachments: [
    {
      localId: 'upload-1',
      file: file,  // File 对象
      assetType: 'image',
      assetName: file.name,
      role: 'reference_image',
    },
  ],
  
  mentions: [
    { local_id: 'upload-1', display_text: '这个角色', start: 0, end: 4 },
  ],
});
```

---

## 三、后端处理流程（已实现）

### 3.1 数据流向

```
前端 attachments + mentions
    ↓
后端 creation.py: generate_creation_video
    ↓
video_gen.py: _build_seedance_attachment_pool
    ↓ (合并 attachments + legacy URLs)
video_gen.py: _build_seedance_prompt_and_content
    ↓ (生成 token 映射 + 替换提示词)
OneLink AI Seedance 2.0
    ↓ (接收 content 数组：[text, image_url, video_url, ...])
生成视频 + asset_bindings 元数据
```

### 3.2 关键函数职责

| 函数 | 职责 |
|------|------|
| `_build_seedance_attachment_pool` | 合并 attachments + legacy URLs（first_frame_url 等），根据 asset_id 分配角色 |
| `_build_seedance_prompt_and_content` | 为每个资产生成 token（图片1、视频1），替换提示词中的 mentions，构建 content 数组 |
| `_rewrite_prompt_mentions_to_seedance_tokens` | 提示词字符串替换逻辑（@资产名 → 图片1） |
| `_prepare_external_image_url` | 将图片 URL 转为 base64 data URI（Seedance 要求内联图片） |
| `_prepare_seedance_reference_media_url` | 确保视频/音频 URL 公网可访问（本地上传需走隧道） |

### 3.3 资产角色优先级

在 `reference_mode` 不同模式下，资产角色分配逻辑：

| reference_mode | 支持的角色 | 说明 |
|----------------|------------|------|
| `full` | first_frame, last_frame, reference_image, reference_video, reference_audio | 全能参考模式（默认） |
| `video_ref` | first_frame, last_frame | 仅首尾帧 |
| `first_frame` | first_frame | 仅首帧 |
| `last_frame` | last_frame | 仅尾帧 |

---

## 四、前端 UI 集成建议

当前前端代码已完整支持全能参考，但 UI 层可能需要暴露以下能力：

### 4.1 资产选择器组件

```vue
<template>
  <div class="asset-picker">
    <h3>选择参考资产</h3>
    <div class="asset-grid">
      <div 
        v-for="asset in assets" 
        :key="asset.id"
        @click="toggleAsset(asset)"
        :class="{ selected: isSelected(asset) }"
      >
        <img :src="asset.thumbnail_url" />
        <span>{{ asset.name }}</span>
      </div>
    </div>
    
    <button @click="insertMention">插入到提示词</button>
  </div>
</template>

<script setup>
const selectedAssets = ref([]);

function toggleAsset(asset) {
  const index = selectedAssets.value.findIndex(a => a.id === asset.id);
  if (index >= 0) {
    selectedAssets.value.splice(index, 1);
  } else {
    selectedAssets.value.push({
      localId: `asset-${asset.id}`,
      assetId: asset.id,
      assetType: asset.asset_type,
      assetName: asset.name,
      url: asset.file_url,
      role: 'reference_image',
      source: 'asset_library',
    });
  }
}

function insertMention() {
  // 在提示词输入框中插入 @资产名
  // 同时记录 mention 信息（start、end、local_id）
}
</script>
```

### 4.2 提示词输入框增强

参考富文本编辑器的 mention 功能（如 Slate.js、Draft.js）：

1. 用户输入 `@` 时弹出资产选择器
2. 选择资产后插入 `@资产名`，并高亮显示
3. 提交时解析出 `mentions` 数组（包含 start、end、local_id）

### 4.3 生成结果展示

```javascript
// 生成完成后，后端返回 asset_bindings 元数据
const result = await apiGenerateUnified({ /* ... */ });

// 从任务结果中获取 asset_bindings
const taskData = await fetch(`/api/creation/videos/tasks/${result.taskId}`);
const assetBindings = taskData.metadata_json?.asset_bindings || [];

// 展示使用的资产列表
assetBindings.forEach(binding => {
  console.log(`${binding.resolved_token}: ${binding.asset_name} (${binding.role})`);
});

// 示例输出：
// 图片1: 舞者角色 (reference_image)
// 图片2: 舞台背景 (reference_image)
// 音频1: 背景音乐 (reference_audio)
```

---

## 五、与分镜视频的对比

| 特性 | 分镜视频 | 创作视频 | 说明 |
|------|---------|---------|------|
| attachments 支持 | ✅ | ✅ | 完全一致 |
| mentions 支持 | ✅ | ✅ | 完全一致 |
| token 自动替换 | ✅ | ✅ | 后端统一实现 |
| 图片内联（base64） | ✅ | ✅ | Seedance 模型要求 |
| 视频/音频公网访问 | ✅ | ✅ | 通过隧道服务暴露 |
| asset_bindings 元数据 | ✅ | ✅ | 记录在生成结果中 |

**结论**：创作视频与分镜视频使用**完全相同的后端逻辑**（`video_gen.py`），全能参考能力已完全复用。

---

## 六、测试验证

### 6.1 简单测试：单图片参考

```javascript
const result = await apiGenerateUnified({
  prompt: '一个女孩在跳舞',
  model: 'doubao-seedance-2.0',
  ratio: '16:9',
  resolution: '720P',
  videoDuration: 5,
  attachments: [
    {
      assetId: 'test-asset-1',
      assetType: 'image',
      assetName: '参考角色',
      url: 'https://example.com/girl.jpg',
      role: 'reference_image',
    },
  ],
});

// 验证：
// 1. 查看后端日志，确认 attachments 被解析
// 2. 查看 OneLink AI 请求，确认 content 包含图片
// 3. 生成结果的 metadata_json.asset_bindings 应包含该资产
```

### 6.2 复杂测试：多资产 + mention

```javascript
const result = await apiGenerateUnified({
  prompt: '@角色A 和 @角色B 一起跳舞',
  model: 'doubao-seedance-2.0',
  ratio: '16:9',
  resolution: '720P',
  videoDuration: 5,
  attachments: [
    { localId: 'a1', assetId: 'id1', assetType: 'image', assetName: '角色A', url: 'url1', role: 'reference_image' },
    { localId: 'a2', assetId: 'id2', assetType: 'image', assetName: '角色B', url: 'url2', role: 'reference_image' },
  ],
  mentions: [
    { local_id: 'a1', display_text: '@角色A', start: 0, end: 4 },
    { local_id: 'a2', display_text: '@角色B', start: 6, end: 10 },
  ],
});

// 验证：
// 1. 后端日志应显示提示词被替换为：'图片1 和 图片2 一起跳舞'
// 2. asset_bindings 应包含两个资产，resolved_token 分别为 图片1、图片2
```

---

## 七、常见问题

### Q1：为什么我的资产没有生效？

**检查清单**：
1. 确认 `attachments` 数组非空
2. 确认每个资产有 `url` 字段
3. 确认 `url` 公网可访问（本地上传需走隧道服务）
4. 查看后端日志，确认 `_build_seedance_attachment_pool` 输出
5. 确认 `reference_mode` 与资产角色匹配（如 `video_ref` 模式下不支持 `reference_audio`）

### Q2：提示词中的 @资产名 没有被替换？

**可能原因**：
1. `mentions` 数组为空或格式错误
2. `mentions` 中的 `local_id` 与 `attachments` 中的 `localId` 不匹配
3. `display_text` 与提示词中的文本不一致

**解决方案**：
检查前端 `resolvedMentions` 的生成逻辑，确保 `attachmentByLocalId.get(item.local_id)` 能找到对应资产。

### Q3：如何调试资产绑定？

**方法1：查看任务结果元数据**
```javascript
const taskData = await fetch(`/api/creation/videos/tasks/${taskId}`).then(r => r.json());
console.log(taskData.metadata_json?.asset_bindings);
console.log(taskData.metadata_json?.prompt_resolved);
```

**方法2：后端日志**
```bash
# 查看后端日志
tail -f backend/logs/app.log | grep "VIDEO_GEN"
```

---

## 八、后续优化方向

### 8.1 前端 UI 增强

- [ ] 资产选择器组件
- [ ] 提示词输入框 mention 支持（@ 触发下拉）
- [ ] 生成结果展示 asset_bindings

### 8.2 体验优化

- [ ] 资产预加载（生成前上传到 OneLink AI，返回 file_id 复用）
- [ ] 批量资产管理（一次选择多个，批量插入提示词）
- [ ] 资产角色自动推断（根据资产类型和位置推断 role）

### 8.3 性能优化

- [ ] 图片 base64 缓存（避免重复转换）
- [ ] 视频/音频 URL 验证（提前检测公网可访问性）
- [ ] 并发上传优化（多个资产同时上传）

---

## 九、总结

✅ **创作视频已完整支持全能参考能力**，与分镜视频使用相同的后端实现。

✅ **前端调用方式已标准化**：通过 `attachments` 和 `mentions` 参数传递数字资产。

✅ **后端处理流程已生产化**：自动解析、token 替换、URL 转换、资产绑定元数据记录。

🎯 **下一步行动**：前端 UI 层暴露资产选择和提示词 mention 功能，让用户更方便地使用全能参考能力。

---

## 十、相关文档

- **Seedance 2.0 集成经验**：`docs/plans/seedance-2.0-integration-summary.md`
- **后端 API 文档**：`backend/BACKEND_API_DOC.md`
- **前端项目文档**：`frontend/PROJECT.md`
- **视频生成服务**：`backend/app/services/video_gen.py`
- **创作视频路由**：`backend/app/routers/creation.py`
