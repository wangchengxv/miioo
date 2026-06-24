# MEDIA-BPLUS-30：视频预览与 HLS 交付实现设计

## 1. 文档定位

本文档是 `MEDIA-BPLUS-30` 任务包的实现设计稿，用于把“视频预览与 HLS 交付”从 backlog 层继续下钻到字段契约、媒体元数据、任务接线、播放器消费顺序、回退策略、验收口径与后续代码落点层。

对应上层事实源：

- `docs/plans/生成资产前端访问体验方案B-生产级媒体资产管线升级.md`
- `docs/plans/生成资产前端访问体验方案B+实施清单.md`
- `docs/plans/backlog-media-pipeline-bplus.md`
- `docs/plans/MEDIA-BPLUS-10-存储分层与签名下载实现设计.md`
- `docs/plans/MEDIA-BPLUS-20-媒体任务中心与状态机实现设计.md`

## 2. 当前代码事实

基于当前仓库，和 `MEDIA-BPLUS-30` 直接相关的事实如下：

- 后端当前已经把视频字段基础语义统一到了 `poster_url / preview_video_url / download_url`，见 `backend/app/services/media_view_models.py`。
- 当前 `preview_video_url` 仍然普遍回落到原始 `file_url` 或原始视频地址，本质上只是“轻量播放字段语义已存在”，但底层仍未真正完成轻量预览转码。
- `backend/app/services/media_derivative_pipeline.py` 当前已经提供了视频海报提取和视频预览字段写回的基础收口，但没有 HLS、多码率和清晰度索引能力。
- 后端文档 `backend/BACKEND_API_DOC.md` 已经明确前端消费顺序应为：
  - 卡片优先 `poster_url`
  - 详情播放优先 `preview_video_url`
  - 下载优先 `download_url`
- 前端当前已有统一消费工具：
  - `frontend/src/utils/mediaItem.js`
  - `frontend/src/utils/mediaPresentation.js`
- `getVideoPlaybackSource()` 当前仍然只返回 `previewVideoUrl`，并未引入 `hlsUrl`。
- `CreationPage.jsx`、`StoryboardPage.jsx`、`AssetsPage.jsx` 等页面已经把“详情播放”和“下载原件”分开承接，但底层播放能力仍以原始 mp4/preview mp4 为主，没有正式进入 HLS。

因此，`MEDIA-BPLUS-30` 的目标不是重写前端播放器视觉，而是在保持当前视频字段消费顺序的基础上，把 `previewVideoUrl` 从“语义占位”升级为“真实轻量预览”，并把 `hlsUrl / availableQualities` 平滑接进现有契约。

## 3. 目标与不做事项

### 3.1 目标

- 让视频详情默认不再依赖原始大文件播放。
- 让 `previewVideoUrl` 具备真实的轻量预览价值。
- 为播放器补入 `hlsUrl` 作为未来主播放地址。
- 为多码率切换补入 `availableQualities` 契约。
- 保持前端现有字段消费习惯基本不变，避免引发页面层语义重构。

### 3.2 当前阶段不做

- 不在本轮直接确定具体播放器库选型。
- 不在本轮直接做前端视觉改版。
- 不在本轮直接落完整 ABR 自适应策略实现。
- 不要求第一阶段就完成时间轴预览图与字幕轨等高级能力。

## 4. 设计原则

### 4.1 保持现有字段语义稳定

继续保持：

- `posterUrl`
  - 卡片静态海报
- `previewVideoUrl`
  - 详情轻量预览播放
- `downloadUrl`
  - 原始下载

新增但不破坏现有语义：

- `hlsUrl`
  - HLS 主播放入口
- `availableQualities`
  - 当前可用清晰度集合

### 4.2 渐进接入 HLS，而不是一步替换

首版不要求所有视频都必须 HLS 才能展示。

推荐顺序：

1. 先保证 `previewVideoUrl` 是真正轻量预览。
2. 再补单码率 HLS。
3. 再补多码率与清晰度切换。

### 4.3 播放与下载彻底分离

- 播放优先使用 `hlsUrl` 或 `previewVideoUrl`
- 下载继续使用 `downloadUrl`
- 不再默认用 `downloadUrl` 作为播放兜底首选

### 4.4 与 `MEDIA-BPLUS-20` 共用任务运行时

- 视频海报
- 视频预览转码
- HLS 打包
- 清晰度索引写回

全部建立在 `MEDIA-BPLUS-20` 统一媒体任务中心上。

## 5. 字段契约设计

## 5.1 对外字段

建议视频类视图模型统一输出：

- `posterUrl`
- `previewVideoUrl`
- `hlsUrl`
- `downloadUrl`
- `availableQualities`
- `previewReady`

### 5.1.1 字段语义

#### `posterUrl`

- 列表卡片静态海报图
- 详情页进入前的静态占位

#### `previewVideoUrl`

- 轻量 mp4 预览地址
- 用于：
  - 详情首版回放
  - HLS 不可用时回退
  - 卡片 hover 轻量播放

#### `hlsUrl`

- HLS 主播放入口
- 首版可为空
- 当存在时，详情播放器优先消费它

#### `downloadUrl`

- 原始文件下载地址
- 不参与默认详情首播

#### `availableQualities`

- 当前 HLS 或预览链路可提供的清晰度集合
- 建议结构：

```json
[
  { "id": "540p", "label": "540p", "bandwidth": 1200000, "height": 540, "default": true },
  { "id": "720p", "label": "720p", "bandwidth": 2500000, "height": 720, "default": false }
]
```

#### `previewReady`

- 只表示“至少已有可回显可播放的预览入口”
- 不等于 HLS 已完成

## 5.2 向后兼容策略

当前已有页面大量依赖：

- `previewVideoUrl`
- `downloadUrl`
- `posterUrl`

因此首版不建议改变以下事实：

- 页面继续优先读取 `previewVideoUrl`
- `getVideoPlaybackSource()` 继续保留原有调用位

建议改造方式是：

- `getVideoPlaybackSource()` 未来升级为：

```text
hlsUrl -> previewVideoUrl -> videoUrl
```

而不是让页面层自行新增复杂判断。

## 6. 视频元数据设计

建议在视频 metadata 中补齐：

- `poster_url`
- `preview_video_url`
- `hls_url`
- `available_qualities`
- `preview_ready`
- `derivative_status`
- `transcode_profile`
- `preview_codec`
- `preview_bitrate`
- `preview_duration`
- `hls_master_playlist`
- `hls_variant_count`
- `hls_packaging_status`
- `video_pipeline_stage`
- `video_pipeline_task_id`

### 6.1 说明

- `derivative_status`
  - 面向媒体衍生状态
- `video_pipeline_stage`
  - 面向视频管线阶段
- `video_pipeline_task_id`
  - 用于把视频元数据和媒体父任务关联起来

## 7. 预览策略设计

## 7.1 `previewVideoUrl` 首版目标

`previewVideoUrl` 不应再默认等于原始视频文件。

建议首版轻量预览策略：

- 编码格式：`mp4`
- 目标用途：快速首播、详情回放、非原件播放
- 优先级高于 HLS 打包

### 7.1.1 首版建议能力

- 降低码率
- 保持兼容播放器友好的封装
- 限制预览最大分辨率到合理档位

推荐不是直接定义极细的转码参数，而是先定义原则：

- 以“更快首帧、更低带宽、更稳播放”为目标
- 不以“保留原始最高质量”为目标

## 7.2 与原始视频的关系

- 原始视频保留在 `downloadUrl`
- `previewVideoUrl` 明确是派生产物
- 原始视频不再作为详情默认主播放入口

## 8. HLS 设计

## 8.1 首版 HLS 目标

首版 HLS 要解决的不是“所有复杂 ABR 问题”，而是：

- 播放器 seek 更稳定
- 长视频回放更平滑
- 大文件不再整段直拉

### 8.1.1 首版建议

- 先上单码率 HLS
- 只要播放器可优先消费 `hlsUrl`
- `previewVideoUrl` 作为稳妥回退

这样可以先解决：

- 拖动体验
- 首屏等待
- 长时回放稳定性

## 8.2 多码率演进

第二阶段再补：

- `360p`
- `540p`
- `720p`
- `1080p`

但不要求第一版全部到位。

## 8.3 HLS 相关元数据

建议补齐：

- `hls_url`
- `hls_master_playlist`
- `available_qualities`
- `default_quality`
- `hls_packaging_status`

## 9. 与 `MEDIA-BPLUS-20` 的任务接线

建议视频管线统一拆成以下任务子项：

- `source_validate`
- `poster_extract`
- `preview_transcode`
- `hls_package`
- `qualities_index_commit`
- `metadata_commit`

### 9.1 阶段语义

父任务 `current_stage` 建议至少包括：

- `queued`
- `source_validating`
- `poster_extracting`
- `preview_transcoding`
- `hls_packaging`
- `qualities_indexing`
- `metadata_committing`
- `completed`

### 9.2 `partial_ready` 何时触发

建议在以下条件满足时进入 `partial_ready`：

- `posterUrl` 已就绪
- 且 `previewVideoUrl` 已就绪

即使此时：

- `hlsUrl` 仍未完成
- `availableQualities` 仍未写入

前端也已经可以开始安全展示详情播放。

## 10. 播放器消费顺序设计

当前前端已有 `getVideoPlaybackSource()`。

建议未来改造目标为：

```text
hlsUrl -> previewVideoUrl -> videoUrl
```

### 10.1 卡片层

- 卡片静态展示：
  - `posterUrl`
- 卡片轻量 hover 播放：
  - 可继续用 `previewVideoUrl`
- 卡片不直接消费 `downloadUrl`

### 10.2 详情层

- 详情主播放：
  - 优先 `hlsUrl`
  - 否则 `previewVideoUrl`
  - 最后才允许受控回退 `videoUrl`

### 10.3 下载层

- 下载始终只看 `downloadUrl`

## 11. 回退策略

推荐回退顺序：

### 11.1 HLS 不可用

- 自动回退 `previewVideoUrl`

### 11.2 预览 mp4 不可用

- 允许最后回退 `videoUrl`
- 但应记录错误并提示是兜底链路

### 11.3 海报不可用

- 回退 `thumbnailUrl`
- 再回退首帧图或已有静态图

## 12. 清晰度策略

`availableQualities` 首版建议只作为显式档位说明，不一定立即强制前端做复杂切换器。

### 12.1 首版要求

- 后端返回明确档位列表
- 前端只在有有效档位时展示清晰度选项

### 12.2 无档位时

- 不展示伪清晰度切换入口
- 继续按默认主播放策略走

## 13. 代码落点建议

直接相关后端代码：

- `backend/app/services/media_derivative_pipeline.py`
- `backend/app/services/media_view_models.py`
- `backend/app/routers/creation.py`
- `backend/app/routers/storyboards.py`
- `backend/app/routers/assets.py`

建议新增后端服务：

- `backend/app/services/video_preview_pipeline.py`
  - 负责轻量预览转码
- `backend/app/services/video_hls_pipeline.py`
  - 负责 HLS 打包
- `backend/app/services/video_quality_manifest.py`
  - 负责生成 `availableQualities`

直接相关前端代码：

- `frontend/src/utils/mediaItem.js`
- `frontend/src/utils/mediaPresentation.js`
- `frontend/src/pages/CreationPage.jsx`
- `frontend/src/pages/StoryboardPage.jsx`
- `frontend/src/pages/AssetsPage.jsx`

前端改造原则：

- 仅改播放源消费策略
- 不改页面视觉骨架
- 不改设计风格

## 14. Runbook 落点

建议后续新增：

- `docs/runbooks/video-preview-transcode.md`
- `docs/runbooks/video-hls-packaging.md`
- `docs/runbooks/video-playback-fallback.md`

至少覆盖：

- `previewVideoUrl` 不可用排查
- `hlsUrl` 404 / playlist 错误排查
- `availableQualities` 缺失排查
- HLS 回退到 mp4 的判定逻辑

## 15. 分阶段落地建议

### 阶段 1：轻量预览落地

- 让 `previewVideoUrl` 不再只是原始地址别名
- 补齐真实轻量 mp4 预览
- 详情默认不直拉原始视频

### 阶段 2：单码率 HLS

- 输出 `hlsUrl`
- 播放器优先消费 HLS
- mp4 预览继续作为回退

### 阶段 3：多码率与档位

- 输出 `availableQualities`
- 支持显式清晰度切换

### 阶段 4：增强能力

- 时间轴预览图
- 更细的弱网策略
- 更完整的播放器诊断与观测

## 16. 验收标准

完成 `MEDIA-BPLUS-30` 首版设计与实现后，至少满足：

- `previewVideoUrl` 不再默认等于原始视频地址
- 详情主播放不再默认使用原始大文件
- `hlsUrl` 可作为主播放入口存在
- `previewVideoUrl` 可作为稳定回退
- `availableQualities` 有明确契约，不再靠页面猜测
- `partial_ready` 状态下前端已可安全展示视频详情

## 17. 当前结论

`MEDIA-BPLUS-30` 的关键，不是立刻把播放器改成复杂多码率平台，而是先把当前已经存在的 `posterUrl / previewVideoUrl / downloadUrl` 三层语义真正做实，再把 `hlsUrl / availableQualities` 作为增量能力平滑接入。

只要这一步设计收口好，后续前端页面不需要改视觉骨架，后端也不需要推翻当前媒体视图模型，就能逐步把视频播放从“原始文件直拉”升级到“轻量预览 + HLS 主播 + 原始下载分离”的企业级交付方式。
