<!--
  创作视频全能参考 - UI 组件示例
  展示如何在前端页面中集成数字资产选择和提示词 mention 功能
-->

<template>
  <div class="video-generation-with-references">
    <h2>创作视频 - 全能参考</h2>

    <!-- 提示词输入区 -->
    <div class="prompt-section">
      <label>提示词</label>
      <div class="prompt-editor">
        <textarea
          v-model="prompt"
          @input="handlePromptChange"
          placeholder="输入提示词，可以用 @资产名 引用数字资产"
          rows="4"
        />
        <!-- 高亮显示 mentions -->
        <div class="mention-overlay">
          <span
            v-for="(segment, index) in promptSegments"
            :key="index"
            :class="{ 'mention-highlight': segment.isMention }"
          >
            {{ segment.text }}
          </span>
        </div>
      </div>
    </div>

    <!-- 数字资产选择区 -->
    <div class="assets-section">
      <h3>选择参考资产</h3>
      <button @click="showAssetPicker = true">+ 添加资产</button>

      <div class="selected-assets">
        <div
          v-for="asset in selectedAssets"
          :key="asset.localId"
          class="asset-card"
        >
          <img :src="asset.url" :alt="asset.assetName" />
          <div class="asset-info">
            <span class="asset-name">{{ asset.assetName }}</span>
            <select v-model="asset.role" class="asset-role">
              <option value="reference_image">参考图片</option>
              <option value="first_frame">首帧</option>
              <option value="last_frame">尾帧</option>
              <option value="reference_video" v-if="asset.assetType === 'video'">参考视频</option>
              <option value="reference_audio" v-if="asset.assetType === 'audio'">参考音频</option>
            </select>
            <button @click="insertAssetMention(asset)" class="btn-insert">
              插入提示词
            </button>
            <button @click="removeAsset(asset)" class="btn-remove">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 生成参数 -->
    <div class="params-section">
      <div class="param-row">
        <label>模型</label>
        <select v-model="model">
          <option value="doubao-seedance-2.0">Seedance 2.0</option>
          <option value="doubao-seedance-2.0-fast">Seedance 2.0 Fast</option>
        </select>
      </div>

      <div class="param-row">
        <label>参考模式</label>
        <select v-model="referenceMode">
          <option value="full">全能参考（支持图片+视频+音频）</option>
          <option value="video_ref">首尾帧</option>
          <option value="first_frame">仅首帧</option>
          <option value="last_frame">仅尾帧</option>
        </select>
      </div>

      <div class="param-row">
        <label>分辨率</label>
        <select v-model="resolution">
          <option value="720P">720P</option>
          <option value="1080P">1080P</option>
        </select>
      </div>

      <div class="param-row">
        <label>时长（秒）</label>
        <input v-model.number="duration" type="number" min="1" max="10" />
      </div>

      <div class="param-row">
        <label>宽高比</label>
        <select v-model="ratio">
          <option value="16:9">16:9</option>
          <option value="9:16">9:16</option>
          <option value="1:1">1:1</option>
        </select>
      </div>
    </div>

    <!-- 生成按钮 -->
    <div class="actions">
      <button @click="generate" :disabled="loading" class="btn-generate">
        {{ loading ? '生成中...' : '生成视频' }}
      </button>
    </div>

    <!-- 生成结果 -->
    <div v-if="result" class="result-section">
      <h3>生成结果</h3>
      <video :src="result.videoUrl" controls />

      <div class="asset-bindings">
        <h4>使用的资产</h4>
        <ul>
          <li v-for="binding in result.assetBindings" :key="binding.resolved_token">
            <strong>{{ binding.resolved_token }}</strong>: {{ binding.asset_name }} ({{ binding.role }})
          </li>
        </ul>
      </div>

      <div class="prompt-resolved">
        <h4>解析后的提示词</h4>
        <pre>{{ result.promptResolved }}</pre>
      </div>
    </div>

    <!-- 资产选择弹窗 -->
    <AssetPickerModal
      v-if="showAssetPicker"
      @select="handleAssetSelect"
      @close="showAssetPicker = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { apiGenerateUnified } from '@/api/creation.js';
import AssetPickerModal from './AssetPickerModal.vue';

// 状态
const prompt = ref('');
const selectedAssets = ref([]);
const mentions = ref([]);
const model = ref('doubao-seedance-2.0');
const referenceMode = ref('full');
const resolution = ref('720P');
const duration = ref(5);
const ratio = ref('16:9');
const loading = ref(false);
const result = ref(null);
const showAssetPicker = ref(false);

// 解析提示词，高亮 mentions
const promptSegments = computed(() => {
  if (!mentions.value.length) {
    return [{ text: prompt.value, isMention: false }];
  }

  const segments = [];
  let cursor = 0;

  // 按 start 排序
  const sortedMentions = [...mentions.value].sort((a, b) => a.start - b.start);

  for (const mention of sortedMentions) {
    if (mention.start > cursor) {
      segments.push({
        text: prompt.value.slice(cursor, mention.start),
        isMention: false,
      });
    }
    segments.push({
      text: mention.display_text,
      isMention: true,
    });
    cursor = mention.end;
  }

  if (cursor < prompt.value.length) {
    segments.push({
      text: prompt.value.slice(cursor),
      isMention: false,
    });
  }

  return segments;
});

// 处理提示词变化
function handlePromptChange() {
  // 简单实现：如果提示词变化，清除失效的 mentions
  mentions.value = mentions.value.filter(mention => {
    return prompt.value.slice(mention.start, mention.end) === mention.display_text;
  });
}

// 处理资产选择
function handleAssetSelect(asset) {
  const localId = `asset-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  selectedAssets.value.push({
    localId,
    assetId: asset.id,
    assetType: asset.asset_type,
    assetName: asset.name,
    url: asset.file_url || asset.thumbnail_url,
    role: inferAssetRole(asset.asset_type),
    source: 'asset_library',
  });

  showAssetPicker.value = false;
}

// 推断资产角色
function inferAssetRole(assetType) {
  if (assetType === 'image') return 'reference_image';
  if (assetType === 'video') return 'reference_video';
  if (assetType === 'audio') return 'reference_audio';
  return 'reference';
}

// 插入资产到提示词
function insertAssetMention(asset) {
  const mentionText = `@${asset.assetName}`;
  const cursorPos = prompt.value.length; // 简化：插入到末尾

  const newPrompt = prompt.value + (prompt.value ? ' ' : '') + mentionText;

  mentions.value.push({
    local_id: asset.localId,
    display_text: mentionText,
    start: cursorPos + (prompt.value ? 1 : 0),
    end: cursorPos + (prompt.value ? 1 : 0) + mentionText.length,
  });

  prompt.value = newPrompt;
}

// 移除资产
function removeAsset(asset) {
  // 移除资产
  selectedAssets.value = selectedAssets.value.filter(a => a.localId !== asset.localId);

  // 移除相关 mentions
  mentions.value = mentions.value.filter(m => m.local_id !== asset.localId);
}

// 生成视频
async function generate() {
  if (!prompt.value.trim()) {
    alert('请输入提示词');
    return;
  }

  loading.value = true;
  result.value = null;

  try {
    const params = {
      prompt: prompt.value,
      model: model.value,
      ratio: ratio.value,
      resolution: resolution.value,
      videoDuration: duration.value,
      refMode: referenceMode.value,
      soundEnabled: false,

      // 全能参考核心参数
      attachments: selectedAssets.value.map(asset => ({
        localId: asset.localId,
        assetId: asset.assetId,
        assetType: asset.assetType,
        assetName: asset.assetName,
        url: asset.url,
        role: asset.role,
        source: asset.source,
      })),

      mentions: mentions.value.map(mention => ({
        local_id: mention.local_id,
        display_text: mention.display_text,
        start: mention.start,
        end: mention.end,
      })),
    };

    const response = await apiGenerateUnified(params);

    // 获取生成结果
    const taskData = await fetch(`/api/creation/videos/tasks/${response.taskId}`)
      .then(r => r.json());

    result.value = {
      videoUrl: response.videos[0],
      assetBindings: taskData.metadata_json?.asset_bindings || [],
      promptResolved: taskData.metadata_json?.prompt_resolved || prompt.value,
    };

  } catch (error) {
    console.error('生成失败', error);
    alert(`生成失败: ${error.message}`);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.video-generation-with-references {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.prompt-section {
  margin-bottom: 20px;
}

.prompt-editor {
  position: relative;
}

.prompt-editor textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  resize: vertical;
}

.mention-overlay {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  padding: 10px;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: transparent;
}

.mention-highlight {
  background-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border-radius: 3px;
  padding: 2px 4px;
}

.assets-section {
  margin-bottom: 20px;
}

.selected-assets {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.asset-card {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.asset-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.asset-info {
  padding: 10px;
}

.asset-name {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

.asset-role {
  width: 100%;
  margin-bottom: 5px;
  padding: 5px;
}

.btn-insert,
.btn-remove {
  padding: 5px 10px;
  margin-right: 5px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.btn-insert {
  background-color: #3b82f6;
  color: white;
}

.btn-remove {
  background-color: #ef4444;
  color: white;
}

.params-section {
  margin-bottom: 20px;
}

.param-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.param-row label {
  width: 120px;
  font-weight: bold;
}

.param-row select,
.param-row input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.actions {
  margin-bottom: 20px;
}

.btn-generate {
  width: 100%;
  padding: 12px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

.btn-generate:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.result-section {
  margin-top: 30px;
}

.result-section video {
  width: 100%;
  border-radius: 8px;
}

.asset-bindings,
.prompt-resolved {
  margin-top: 20px;
  padding: 15px;
  background-color: #f9fafb;
  border-radius: 4px;
}

.asset-bindings ul {
  list-style: none;
  padding: 0;
}

.asset-bindings li {
  margin-bottom: 5px;
}

.prompt-resolved pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Courier New', monospace;
  background-color: white;
  padding: 10px;
  border-radius: 4px;
}
</style>
