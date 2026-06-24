# 方案 B+ 媒体资产管线 Backlog

## 1. 定位

本文档用于把 `docs/plans/生成资产前端访问体验方案B-生产级媒体资产管线升级.md` 与 `docs/plans/生成资产前端访问体验方案B+实施清单.md` 继续下钻为可直接排期的开发 backlog。

使用原则：

- 先看主方案，确认边界与目标态
- 再看实施清单，确认阶段与依赖
- 最后用本 backlog 拆到可开工的任务包与子任务

## 2. 阅读顺序

建议按以下顺序阅读：

1. `docs/plans/生成资产前端访问体验方案B-生产级媒体资产管线升级.md`
2. `docs/plans/生成资产前端访问体验方案B+实施清单.md`
3. `docs/plans/backlog-media-pipeline-bplus.md`

## 3. 任务包总览

| 任务包 | 主题 | 优先级 | 主要承接方 | 依赖 |
|---|---|---|---|---|
| `MEDIA-BPLUS-00` | 媒体语义与契约基线冻结 | P0 | 后端 + 前端 + 文档 | 无 |
| `MEDIA-BPLUS-10` | 存储分层与签名下载 | P0 | 后端 + 运维 | `MEDIA-BPLUS-00` |
| `MEDIA-BPLUS-20` | 媒体任务中心与状态机 | P0 | 后端 | `MEDIA-BPLUS-10` |
| `MEDIA-BPLUS-30` | 视频预览与 HLS 交付 | P1 | 后端 + 前端 | `MEDIA-BPLUS-20` |
| `MEDIA-BPLUS-40` | 图片多尺寸与现代格式 | P1 | 后端 + 前端 | `MEDIA-BPLUS-10` |
| `MEDIA-BPLUS-50` | 观测、Runbook 与灰度回滚 | P0 | 运维 + 文档 + 后端 | `MEDIA-BPLUS-10`、`MEDIA-BPLUS-20` |
| `MEDIA-BPLUS-60` | 前端播放器与弱网降级 | P1 | 前端 | `MEDIA-BPLUS-30` |
| `MEDIA-BPLUS-70` | 文档回写与治理闭环 | P0 | 文档 | 全阶段持续进行 |

## 4. P0 任务

## 4.1 `MEDIA-BPLUS-00` 媒体语义与契约基线冻结

### `MEDIA-BPLUS-00-01` 统一媒体字段字典

- 类型：后端 + 文档
- 目标：冻结 `thumbnailUrl / previewUrl / posterUrl / previewVideoUrl / downloadUrl / hlsUrl / availableQualities` 的语义边界
- 代码落点：
  - `backend/app/services/media_view_models.py`
  - `backend/app/services/media_derivative_pipeline.py`
- 文档落点：
  - `docs/plans/前端展示约束规范.md`
  - `docs/plans/生成资产前端访问体验方案B-生产级媒体资产管线升级.md`
- 验收口径：
  - 同一字段不再跨图片/视频/下载混用
  - 列表、详情、下载引用的是同一套字段语义

### `MEDIA-BPLUS-00-02` 统一前端适配层消费口径

- 类型：前端
- 目标：确保页面继续只消费 `frontend/src/api/` 输出的视图模型
- 代码落点：
  - `frontend/src/api/`
  - 生成资产相关页面与弹窗
- 验收口径：
  - 页面层不直接拼接媒体地址
  - 页面层不自行猜测文件类型

### `MEDIA-BPLUS-00-03` 盘点历史媒体脏口径

- 类型：后端 + 文档
- 目标：列出当前 `/uploads`、历史 preview、下载口径与潜在脏数据
- 产出：
  - 脏口径清单
  - 是否需要兼容迁移的结论
- 验收口径：
  - 明确哪些旧字段必须兼容
  - 明确哪些旧路径后续可淘汰

## 4.2 `MEDIA-BPLUS-10` 存储分层与签名下载

实现设计稿：

- `docs/plans/MEDIA-BPLUS-10-存储分层与签名下载实现设计.md`
- `docs/plans/MEDIA-BPLUS-10-开发任务清单.md`

### `MEDIA-BPLUS-10-01` 设计对象存储 key 规范

- 类型：后端 + 运维
- 目标：确定 `raw / preview / derived / hls / private-download` 的目录或桶规范
- 产出：
  - key 规则
  - 生命周期策略
  - 删除与回收策略
- 验收口径：
  - 任何媒体对象都能按路径判断用途和权限等级

### `MEDIA-BPLUS-10-02` 设计下载签名与权限校验

- 类型：后端
- 目标：把原始下载从长期裸链路升级为短时签名
- 代码落点：
  - 后续下载签名服务
  - 权限校验服务
- 验收口径：
  - `downloadUrl` 默认不再是固定永久地址
  - 签名至少绑定用户、资源、过期时间、项目作用域

### `MEDIA-BPLUS-10-03` 设计预览资源访问等级

- 类型：后端 + 运维
- 目标：区分公开预览、登录态预览、受控下载、内部回源
- 验收口径：
  - 每类资源都有明确缓存与鉴权策略
  - 不再把所有媒体统一按裸静态文件处理

### `MEDIA-BPLUS-10-04` 设计删除与 CDN 失效链路

- 类型：后端 + 运维
- 目标：资产删除时，元数据、对象存储、CDN 缓存、审计留痕同步可追踪
- 验收口径：
  - 删除后不会继续出现旧预览或旧下载残留

## 4.3 `MEDIA-BPLUS-20` 媒体任务中心与状态机

实现设计稿：

- `docs/plans/MEDIA-BPLUS-20-媒体任务中心与状态机实现设计.md`

### `MEDIA-BPLUS-20-01` 统一媒体任务类型

- 类型：后端
- 目标：沉淀 `image_derivative / video_poster_extract / video_preview_transcode / video_hls_package / audio_waveform_extract / media_cleanup`
- 代码落点：
  - Worker 任务定义
  - 任务调度入口
- 验收口径：
  - 媒体衍生任务不再零散散落

### `MEDIA-BPLUS-20-02` 建立任务状态机

- 类型：后端
- 目标：统一 `queued / running / partial_ready / retrying / ready / failed / cancelled`
- 验收口径：
  - 前后端都能读懂当前媒体处理处于哪个阶段
  - `partial_ready` 具备明确业务含义

### `MEDIA-BPLUS-20-03` 建立幂等、重试、死信策略

- 类型：后端
- 目标：防止重复提交、无限重试和不可追踪失败
- 验收口径：
  - 同一原文件不会反复产生重复派生任务
  - 失败任务可定位、可重试、可人工重驱动

### `MEDIA-BPLUS-20-04` 建立一致性写回顺序

- 类型：后端
- 目标：固定“产物可读 -> 元数据回写 -> 状态切换”的顺序
- 验收口径：
  - 不再出现 `ready` 但资源不可访问的断点

## 4.4 `MEDIA-BPLUS-50` 观测、Runbook 与灰度回滚

实现设计稿：

- `docs/plans/MEDIA-BPLUS-50-观测、Runbook与灰度回滚实现设计.md`

### `MEDIA-BPLUS-50-01` 定义媒体链路指标面板

- 类型：运维 + 后端
- 目标：沉淀派生成功率、队列堆积、转码时延、HLS 可用率、CDN 命中率、下载成功率、回源错误率
- 验收口径：
  - 每个关键指标都有采集口径与解释

### `MEDIA-BPLUS-50-02` 建立故障 Runbook

- 类型：文档 + 运维
- 目标：补齐对象存储、签名、转码、回源、CDN 排障手册
- 文档落点：
  - `docs/runbooks/`
- 验收口径：
  - 媒体访问故障有统一排障入口

### `MEDIA-BPLUS-50-03` 建立灰度与回滚方案

- 类型：运维 + 后端
- 目标：为预览地址切换、HLS 上线、签名下载上线提供回退路径
- 验收口径：
  - 新链路异常时可退回旧预览策略

## 4.5 `MEDIA-BPLUS-70` 文档回写与治理闭环

实现设计稿：

- `docs/plans/MEDIA-BPLUS-70-文档回写闭环与验收矩阵实现设计.md`

### `MEDIA-BPLUS-70-01` 固定回写矩阵

- 类型：文档
- 目标：每阶段完成后同步更新 `module-progress.md`、`项目进度文档.md`、`CHANGELOG.md`
- 验收口径：
  - 不再出现代码已变、文档未跟上的断层

### `MEDIA-BPLUS-70-02` 条件触发接口文档回写

- 类型：文档 + 后端
- 目标：如出现新增字段或接口契约变化，回写 `backend/BACKEND_API_DOC.md` 与 `接口变动文档.md`
- 验收口径：
  - 接口行为变化不只停留在代码层

## 5. P1 任务

## 5.1 `MEDIA-BPLUS-30` 视频预览与 HLS 交付

实现设计稿：

- `docs/plans/MEDIA-BPLUS-30-视频预览与HLS交付实现设计.md`

### `MEDIA-BPLUS-30-01` 生成轻量 `previewVideoUrl`

- 类型：后端
- 目标：详情默认不再直接拉原始大视频
- 验收口径：
  - 视频详情默认主播放地址为轻量预览，而非原始文件

### `MEDIA-BPLUS-30-02` 建立单码率 HLS 首版

- 类型：后端
- 目标：先解决 seek 和分片加载问题
- 验收口径：
  - HLS 可作为主播放地址
  - 回退策略明确

### `MEDIA-BPLUS-30-03` 建立多码率与清晰度档位

- 类型：后端
- 目标：输出 `availableQualities`
- 验收口径：
  - 前端可基于显式档位切换，不靠猜测

## 5.2 `MEDIA-BPLUS-40` 图片多尺寸与现代格式

实现设计稿：

- `docs/plans/MEDIA-BPLUS-40-图片多尺寸与现代格式实现设计.md`

### `MEDIA-BPLUS-40-01` 生成缩略图、预览图、大图

- 类型：后端
- 目标：让图片列表、详情、大图查看分别消费合理尺寸
- 验收口径：
  - 列表不再默认拉大图

### `MEDIA-BPLUS-40-02` 支持 `WebP / AVIF` 与回退策略

- 类型：后端 + 前端
- 目标：提升图片加载效率，同时保留兼容性
- 验收口径：
  - 新格式优先，旧格式可回退

## 5.3 `MEDIA-BPLUS-60` 前端播放器与弱网降级

实现设计稿：

- `docs/plans/MEDIA-BPLUS-60-前端播放器与弱网降级实现设计.md`

### `MEDIA-BPLUS-60-01` 播放器优先消费 `hlsUrl`

- 类型：前端
- 目标：固定 `hlsUrl -> previewVideoUrl` 回退顺序
- 验收口径：
  - 播放器不再直接拿原始地址做主播放

### `MEDIA-BPLUS-60-02` 支持清晰度切换

- 类型：前端
- 目标：只根据 `availableQualities` 展示清晰度选项
- 验收口径：
  - 无有效档位时不展示伪清晰度入口

### `MEDIA-BPLUS-60-03` 弱网与异常降级策略

- 类型：前端
- 目标：播放失败时自动回退、弱网时优先保守策略
- 验收口径：
  - 用户不会直接遇到黑屏和无提示失败

### `MEDIA-BPLUS-60-04` 预留时间轴预览与波形图入口

- 类型：前端 + 后端
- 目标：为后续播放器增强预留消费位
- 验收口径：
  - 不影响当前首版交付，但字段与 UI 入口可扩展

## 6. 推荐开工顺序

建议按以下顺序排期：

1. `MEDIA-BPLUS-00`
2. `MEDIA-BPLUS-10`
3. `MEDIA-BPLUS-20`
4. `MEDIA-BPLUS-30`
5. `MEDIA-BPLUS-60`
6. `MEDIA-BPLUS-40`
7. `MEDIA-BPLUS-50`
8. `MEDIA-BPLUS-70`

这样排的原因：

- 先锁字段与契约，避免返工
- 再控下载与权限，避免安全债务
- 再建任务中心，避免转码与派生无统一运行时
- 最后再把播放器体验和观测治理压实

## 7. 当前结论

到这一层为止，方案 B+ 已经从“方向性方案”拆到了“可直接开工的 backlog 任务包”层级。

后续如果继续往下推进，下一步就不再是继续写大文档，而是可以直接选择一个任务包，例如 `MEDIA-BPLUS-10` 或 `MEDIA-BPLUS-20`，再下钻成接口设计、数据结构设计和代码改造清单。
