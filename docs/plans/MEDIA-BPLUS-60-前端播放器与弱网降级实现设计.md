# MEDIA-BPLUS-60：前端播放器与弱网降级实现设计

## 1. 文档定位

本文档是 `MEDIA-BPLUS-60` 任务包的实现设计稿，用于把“前端播放器与弱网降级”从 backlog 层继续下钻到播放器状态模型、播放源选择、错误回退、清晰度入口、弱网策略、共享工具层、页面接线与观测承接层。

对应上层事实源：

- `docs/plans/生成资产前端访问体验方案B-生产级媒体资产管线升级.md`
- `docs/plans/生成资产前端访问体验方案B+实施清单.md`
- `docs/plans/backlog-media-pipeline-bplus.md`
- `docs/plans/MEDIA-BPLUS-30-视频预览与HLS交付实现设计.md`
- `docs/plans/MEDIA-BPLUS-50-观测、Runbook与灰度回滚实现设计.md`

## 2. 当前代码事实

基于当前仓库，和 `MEDIA-BPLUS-60` 直接相关的事实如下：

- 前端统一视频模型当前主要收口在 `frontend/src/utils/mediaItem.js`，已统一输出：
  - `posterUrl`
  - `previewVideoUrl`
  - `videoUrl`
  - `downloadUrl`
  但尚未承接：
  - `hlsUrl`
  - `availableQualities`
  - 播放器错误状态
  - 网络降级状态
- `buildVideoMediaItem()` 当前会把 `previewVideoUrl`、`videoUrl`、`downloadUrl` 互相回退，说明视频字段语义已基本稳定，但播放链路仍偏“单直链兜底”。
- `frontend/src/utils/mediaPresentation.js` 当前的 `getVideoPlaybackSource()` 只返回 `previewVideoUrl`，尚未接入 `hlsUrl -> previewVideoUrl -> videoUrl` 的目标顺序。
- `frontend/src/components/CreationVideoDetailModal.jsx` 当前基于原生 `<video>` + 自绘控制条实现详情播放，具备：
  - 播放/暂停
  - 进度拖动
  - 音量调整
  但不具备：
  - HLS 播放内核
  - 清晰度切换
  - 播放失败自动回退
  - 弱网状态识别
  - 播放器级观测埋点
- `frontend/src/pages/CreationPage.jsx`、`AssetsPage.jsx`、`StoryboardPage.jsx` 已经通过统一 getter 和共享详情弹窗承接视频播放，这为后续平滑升级提供了非常好的入口。
- 后端当前真实输出仍停留在 `poster_url / preview_video_url / download_url / preview_ready`，`hlsUrl / availableQualities` 仍主要停留在 `MEDIA-BPLUS-30` 的设计层。
- `MEDIA-BPLUS-30` 已经把视频目标契约冻结为：
  - `hlsUrl`
  - `previewVideoUrl`
  - `downloadUrl`
  - `availableQualities`
  并明确目标回退顺序为：

```text
hlsUrl -> previewVideoUrl -> videoUrl
```

- `MEDIA-BPLUS-50` 已把视频链路观测指标冻结为：
  - `previewVideoUrl` 可用率
  - `hlsUrl` 可用率
  - `playlist 404`
  - `HLS -> previewVideoUrl` 回退命中数

因此，`MEDIA-BPLUS-60` 的目标不是“重新设计一个视频播放器 UI”，而是在保持当前详情弹窗、卡片交互和页面视觉骨架基本不变的前提下，把现有前端播放器升级为：

- `hlsUrl` 优先
- `previewVideoUrl` 稳定回退
- `availableQualities` 显式驱动
- 弱网和异常可降级
- 页面层不扩散判断逻辑

## 3. 目标与不做事项

### 3.1 目标

- 让前端详情播放器优先消费 `hlsUrl`。
- 当 `hlsUrl` 不可用时自动回退到 `previewVideoUrl`。
- 让清晰度入口只基于 `availableQualities` 显式展示。
- 让弱网、播放错误和回退命中进入统一状态机与观测链路。
- 保持页面层继续通过共享工具层和播放器组件消费视频，不在页面 JSX 中散写回退逻辑。

### 3.2 当前阶段不做

- 不在本轮重做播放器视觉风格。
- 不在本轮直接确定最终播放器库品牌偏好，仅定义能力边界和承接方式。
- 不在本轮直接做完整自适应 ABR 策略细化。
- 不在本轮直接做字幕、倍速、画中画、时间轴预览图等重交互能力。
- 不让卡片 hover 播放与详情主播放器一次性一起重构。

## 4. 设计原则

### 4.1 详情播放器升级，不改页面视觉骨架

- `CreationVideoDetailModal.jsx` 继续作为共享详情入口。
- 现有创作页、资产页、分镜页继续沿用当前弹窗接线。
- 播放器能力升级集中发生在共享组件与工具层。

### 4.2 播放、预览、下载彻底分离

- 主播放优先 `hlsUrl`
- 回退播放使用 `previewVideoUrl`
- 原始 `videoUrl` 仅作为末级兜底
- 下载继续只走 `downloadUrl`

### 4.3 回退逻辑只允许出现在共享层

- 页面层不直接判断 `hlsUrl` 是否存在
- 页面层不直接判断弱网
- 页面层不自己监听 `<video>` 错误事件做业务回退
- 所有这些逻辑统一收口到：
  - `frontend/src/utils/mediaPresentation.js`
  - 共享播放器 hook / service
  - 共享详情弹窗组件

### 4.4 弱网降级必须可观测

弱网降级不能做成静默行为。

至少要能区分：

- `HLS 初始化失败`
- `playlist 404`
- `segment 连续失败`
- `首帧超时`
- `用户主动切换清晰度`
- `自动回退到 previewVideoUrl`

## 5. 播放器状态模型

## 5.1 建议的播放会话状态

建议前端共享播放器至少维护以下状态：

- `sourceType`
  - `hls`
  - `preview`
  - `direct`
- `playbackStatus`
  - `idle`
  - `loading`
  - `ready`
  - `playing`
  - `paused`
  - `buffering`
  - `ended`
  - `error`
- `fallbackStatus`
  - `none`
  - `fallback_to_preview`
  - `fallback_to_direct`
  - `fallback_failed`
- `networkStatus`
  - `normal`
  - `degraded`
  - `recovering`
- `qualityMode`
  - `auto`
  - `manual`

## 5.2 为什么需要会话状态

当前共享详情弹窗虽然已经能播，但播放器只维护“是不是在播放”这类简单局部状态，无法支撑：

- HLS 初始化失败后自动回退
- 用户手动切换清晰度
- 弱网触发的保守模式
- 回退命中的观测埋点

因此 `MEDIA-BPLUS-60` 需要先把播放器从“原生 `<video>` 控件的简单状态”升级为“受控播放会话状态”。

## 6. 播放源选择设计

## 6.1 统一播放源顺序

`MEDIA-BPLUS-30` 已经定义目标顺序，这里将其前端化：

```text
hlsUrl -> previewVideoUrl -> videoUrl
```

### 6.1.1 含义

- `hlsUrl`
  - 详情主播放首选
- `previewVideoUrl`
  - HLS 缺失或错误时的主回退
- `videoUrl`
  - 只作为末级兜底

### 6.1.2 明确排除

```text
downloadUrl
```

不参与默认详情首播。

## 6.2 共享工具层建议

建议在 `frontend/src/utils/mediaItem.js` 中逐步补齐：

- `hlsUrl`
- `availableQualities`
- `preferredPlaybackUrl`
- `preferredPlaybackType`

建议在 `frontend/src/utils/mediaPresentation.js` 中新增或升级：

- `getVideoPlaybackSource(media)`
- `getVideoPlaybackCandidates(media)`
- `getVideoPlaybackQualities(media)`
- `getVideoFallbackSource(media, failureReason)`

推荐返回结构：

```json
{
  "preferred": {
    "type": "hls",
    "url": "/media/demo/master.m3u8"
  },
  "candidates": [
    { "type": "hls", "url": "/media/demo/master.m3u8" },
    { "type": "preview", "url": "/media/demo/preview.mp4" },
    { "type": "direct", "url": "/uploads/raw/video.mp4" }
  ],
  "qualities": [
    { "id": "540p", "label": "540p", "default": true }
  ]
}
```

这样页面仍只消费统一结构，而不直接碰原始字段。

## 7. 清晰度入口设计

## 7.1 清晰度入口的前提

只有在 `availableQualities` 存在且有效时，才展示清晰度入口。

如果出现以下情况，则不展示：

- `availableQualities` 为空
- 只有一个默认档位且播放器当前不支持切换
- 当前播放源不是 HLS

## 7.2 清晰度 UI 的约束

- 不改现有播放器整体视觉骨架
- 入口可先做轻量下拉菜单或按钮组
- 文案只显示后端明确返回的档位，不让前端猜测 `720p / 1080p`

## 7.3 手动切换的行为

建议首版行为：

- 默认 `auto`
- 用户手动切换后进入 `manual`
- 播放器记录最近一次用户手动选择
- 若当前档位不可用，可回退到默认档位并提示轻量状态文案

## 8. 弱网降级设计

## 8.1 弱网不是“网络断开”才触发

建议把以下都视为弱网/链路退化信号：

- `HLS manifest` 请求超时
- 分片连续失败
- 首帧等待超过阈值
- 缓冲事件频繁出现
- 清晰度切换后长时间无法恢复播放

## 8.2 首版降级顺序

建议首版降级不要一步做复杂 ABR，而是优先做确定性回退：

### 8.2.1 HLS 场景

```text
HLS 当前档位失败 -> HLS 默认档位 -> previewVideoUrl -> videoUrl
```

### 8.2.2 非 HLS 场景

```text
previewVideoUrl 失败 -> videoUrl
```

## 8.3 首版保守策略

在弱网或错误频发时，优先保证“能播”，而不是强追求最高画质。

因此建议：

- 默认回退到较低风险源
- 减少失败后无限重试
- 明确一次播放会话的最大自动回退次数

## 8.4 不建议的做法

- 不在页面层自行用 `navigator.connection` 做业务分支
- 不做无上限死循环重试
- 不在没有观测的情况下静默切换多个源

## 9. 错误分类与回退设计

## 9.1 错误分类

建议播放器层统一归类：

- `manifest_error`
- `segment_error`
- `media_decode_error`
- `first_frame_timeout`
- `network_timeout`
- `source_unsupported`
- `unknown_error`

## 9.2 回退规则

### 9.2.1 HLS 首选失败

- 记录错误分类
- 记录首次失败源为 `hls`
- 触发回退到 `previewVideoUrl`
- 产生一次回退命中埋点

### 9.2.2 Preview 失败

- 若存在 `videoUrl`，回退到 `videoUrl`
- 若仍失败，展示明确不可播放状态

### 9.2.3 所有源失败

播放器进入：

- `playbackStatus=error`
- `fallbackStatus=fallback_failed`

同时继续保留：

- 海报图
- 下载入口
- 轻量错误提示

## 10. 共享组件与代码落点建议

## 10.1 现有组件继续承接

直接相关代码：

- `frontend/src/components/CreationVideoDetailModal.jsx`
- `frontend/src/utils/mediaItem.js`
- `frontend/src/utils/mediaPresentation.js`
- `frontend/src/pages/CreationPage.jsx`
- `frontend/src/pages/AssetsPage.jsx`
- `frontend/src/pages/StoryboardPage.jsx`

## 10.2 建议新增前端能力

建议逐步新增：

- `frontend/src/hooks/useVideoPlaybackSession.js`
  - 维护播放会话状态、回退状态和错误分类
- `frontend/src/services/videoPlaybackResolver.js`
  - 统一解析候选播放源和回退顺序
- `frontend/src/services/videoPlaybackTelemetry.js`
  - 统一记录播放成功、失败、回退、质量切换事件

## 10.3 详情弹窗建议拆分

建议 `CreationVideoDetailModal.jsx` 保持外层视觉容器不变，但把视频播放内核逐步拆成：

- `VideoPlayerSurface`
- `VideoPlayerControls`
- `VideoPlayerStatusOverlay`

这样后续补 HLS、弱网、清晰度时，不会把现有详情弹窗继续做成巨型组件。

## 11. 与观测设计的接线

`MEDIA-BPLUS-60` 必须直接承接 `MEDIA-BPLUS-50` 的观测口径。

## 11.1 至少记录的事件

- `video_playback_start`
- `video_playback_ready`
- `video_playback_error`
- `video_playback_fallback`
- `video_quality_change`
- `video_network_degraded`

## 11.2 至少要带的字段

- `source_type`
- `fallback_to`
- `failure_reason`
- `quality_id`
- `media_id`
- `task_id`
- `page_scene`

## 11.3 为什么需要这些事件

否则后续无法支撑：

- `HLS -> previewVideoUrl` 回退命中数
- 某个页面场景更容易失败
- 清晰度切换后是否更稳定
- 弱网策略是否真的减少失败

## 12. 灰度与回滚承接

`MEDIA-BPLUS-50` 已给出上游灰度顺序，这里把前端播放器侧的行为固定下来。

## 12.1 建议灰度顺序

1. 先灰度 `previewVideoUrl` 新回退逻辑
2. 再灰度 `hlsUrl` 首播
3. 再灰度 `availableQualities` 清晰度入口
4. 最后灰度弱网自动降级

## 12.2 建议 feature flag

- `MEDIA_ENABLE_VIDEO_HLS_PLAYBACK`
- `MEDIA_ENABLE_VIDEO_QUALITY_SELECTOR`
- `MEDIA_ENABLE_VIDEO_NETWORK_DEGRADE`

## 12.3 前端回滚要求

如果某阶段异常，至少要能快速切回：

- 仅使用 `previewVideoUrl`
- 隐藏清晰度入口
- 关闭自动弱网降级

也就是回到当前仓库已经可工作的稳态。

## 13. 分阶段落地建议

### 阶段 1：共享播放源收口

- 在工具层补齐 `hlsUrl / availableQualities`
- 固定候选播放源结构
- 页面调用位保持不变

### 阶段 2：详情播放器内核升级

- 引入会话状态
- 引入错误分类
- 引入自动回退

### 阶段 3：清晰度入口接入

- 仅在 `availableQualities` 有效时显示
- 完成 `auto / manual` 基础模式

### 阶段 4：弱网降级与观测打通

- 补齐回退埋点
- 补齐网络退化状态
- 接入 `MEDIA-BPLUS-50` 指标口径

## 14. 验收标准

完成 `MEDIA-BPLUS-60` 首版设计与实现后，至少满足：

- 详情播放器主链路优先消费 `hlsUrl`
- `hlsUrl` 异常时能自动回退到 `previewVideoUrl`
- 页面层不新增散点字段判断和回退逻辑
- 清晰度入口只依赖 `availableQualities`
- 弱网或播放失败的降级过程可观测
- 回滚时能快速恢复到当前 `previewVideoUrl` 稳态链路

## 15. 当前结论

`MEDIA-BPLUS-60` 的关键，不是把前端视频能力理解成“换一个播放器库”，而是把当前已经存在的：

- 统一视频字段模型
- 共享详情弹窗
- 共享播放 getter

真正升级为企业级视频播放承接层。

只要这一层收口好，后续即使 `MEDIA-BPLUS-30` 逐步补齐 `hlsUrl / availableQualities`，前端也不需要改页面视觉骨架，而是只在共享播放器内核、工具层和观测层渐进升级，就能把播放主链路从“单一 preview mp4”平滑推进到“`hlsUrl` 优先、弱网可降级、失败可回退、行为可观测”的生产级方案。
