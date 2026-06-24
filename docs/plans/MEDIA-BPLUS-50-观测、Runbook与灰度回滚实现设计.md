# MEDIA-BPLUS-50：观测、Runbook 与灰度回滚实现设计

## 1. 文档定位

本文档是 `MEDIA-BPLUS-50` 任务包的实现设计稿，用于把“观测、Runbook 与灰度回滚”从 backlog 层继续下钻到指标口径、日志分类、媒体链路排障入口、灰度策略、回滚流程、代码与脚本落点、文档承接层。

对应上层事实源：

- `docs/plans/生成资产前端访问体验方案B-生产级媒体资产管线升级.md`
- `docs/plans/生成资产前端访问体验方案B+实施清单.md`
- `docs/plans/backlog-media-pipeline-bplus.md`
- `docs/plans/MEDIA-BPLUS-10-存储分层与签名下载实现设计.md`
- `docs/plans/MEDIA-BPLUS-20-媒体任务中心与状态机实现设计.md`
- `docs/plans/MEDIA-BPLUS-30-视频预览与HLS交付实现设计.md`
- `docs/plans/MEDIA-BPLUS-40-图片多尺寸与现代格式实现设计.md`

## 2. 当前代码与文档事实

基于当前仓库，和 `MEDIA-BPLUS-50` 直接相关的事实如下：

- 当前仓库已经存在运行时观测基线文档 `docs/runbooks/runtime-observability.md`，并已把请求、SQL、上游调用、队列、媒体、SSE 六类观测源和初版告警阈值沉淀入仓；本轮已继续把 `app.media_download` 下载审计纳入该文档的固定巡检入口。
- 当前后端日志已经具备较清晰的分类：
  - `app.request`
  - `app.sql`
  - `app.upstream`
  - `app.background_runtime`
  - `app.media_download`
  这些日志已足够支撑第一版基于日志的巡检与告警口径。
- `backend/app/services/background_runtime.py` 已具备两种运行模式：
  - 进程内 `asyncio.create_task`
  - Redis 队列模式
  并能记录队列任务状态、失败、取消和基础 Redis ready 异常。
- 生产运行基线已经明确要求 `BACKGROUND_JOB_EXECUTION_MODE=queue`，并通过 Supervisor 拆成 `miioo-web` 与 `miioo-worker` 两类进程。
- 仓库根目录已经提供 `project_ops.sh`，可统一执行 `status / restart / logs / reread / nginx-test / nginx-reload / port / check` 等高频运维动作；本轮已继续补入 `media-audit` 子命令，统一承接下载审计巡检。
- 当前 `docs/runbooks/production-deploy.md` 已覆盖生产部署、Nginx `/uploads` 直出、Worker 启动、Supervisor 模板、基础容量预算与首轮压测基线入口。
- 当前 `docs/runbooks/release-rollback.md` 仍然偏总入口化，但本轮已补充媒体下载专项索引和基础止血说明；更完整的媒体专项灰度、版本切回、配置恢复和缓存回退步骤仍需继续完善。
- `MEDIA-BPLUS-20` 已在设计层明确提出 `scope_key / current_stage / heartbeat_at / partial_ready / retrying / failed_items` 等任务运行时能力，但应用代码当前尚未完整落地这些能力。
- `MEDIA-BPLUS-10` 已提出需要补齐：
  - `media-storage-migration.md`
- `media-storage-migration.md`
- `media-cdn-invalidation.md`
-  这些都属于 `MEDIA-BPLUS-50` 应承接的运行手册范围；其中 `media-download-signing.md`、`media-storage-migration.md`、`media-cdn-invalidation.md`、`media-release-canary.md` 与 `media-release-rollback.md` 已在本轮前后陆续落仓。
- 当前对象存储、CDN、签名下载、HLS、图片现代格式等能力，大多仍停留在方案与专项设计稿层，而不是已落地的运行资产层。

因此，`MEDIA-BPLUS-50` 的核心目标不是“再写一份泛泛的运维文档”，而是把当前已经具备的运行时底座真正收口成媒体链路可上线、可巡检、可灰度、可回滚、可交接的企业级治理方案。

## 3. 目标与不做事项

### 3.1 目标

- 为媒体链路建立统一的指标面板与告警口径。
- 为对象存储、签名下载、视频 HLS、图片多尺寸、任务中心等链路补齐 Runbook。
- 为媒体链路建立明确的灰度发布与回滚步骤。
- 为媒体链路建立“日志 -> 指标 -> 排障 -> 恢复 -> 文档回写”的闭环。
- 让 `MEDIA-BPLUS-10 / 20 / 30 / 40` 在正式实施前，都有可执行的运行治理承接。

### 3.2 当前阶段不做

- 不要求第一阶段就接入完整的 Prometheus / Grafana / OpenTelemetry 平台。
- 不在本轮直接实现自动化 CI/CD 发布流水线。
- 不在本轮直接引入最重型的蓝绿发布基础设施。
- 不要求现在就把所有恢复动作自动化，首版允许“明确 Runbook + 人工执行”。

## 4. 设计原则

### 4.1 先有可执行基线，再谈高级平台

- 第一阶段先把日志分类、巡检命令、阈值、告警条件、回滚步骤写清楚。
- 第二阶段再把高价值指标接入正式 metrics backend。

### 4.2 媒体专项治理建立在现有运行时之上

- 不另造并行日志体系。
- 不另造并行进程管理体系。
- 不另造并行排障入口。

继续复用当前仓库已有的：

- `app.request / app.sql / app.upstream / app.background_runtime`
- `project_ops.sh`
- Supervisor
- Nginx
- `runtime-observability.md`

### 4.3 灰度和回滚必须面向真实风险点

不是抽象写“可灰度、可回滚”，而是明确：

- 哪些链路能灰度
- 哪些链路只能开关切换
- 哪些链路涉及缓存失效
- 哪些链路涉及数据库或对象存储不可逆影响

### 4.4 文档必须与实现任务一一对应

- `MEDIA-BPLUS-10` 对应存储、签名下载与 CDN Runbook
- `MEDIA-BPLUS-20` 对应任务运行时、重试、卡死恢复 Runbook
- `MEDIA-BPLUS-30` 对应 HLS 打包与播放回退 Runbook
- `MEDIA-BPLUS-40` 对应图片格式回退与缓存失效 Runbook

## 5. 观测设计

## 5.1 分层指标模型

建议 `MEDIA-BPLUS-50` 将媒体链路观测固定拆成五层：

- `请求层`
- `任务层`
- `媒体交付层`
- `存储与 CDN 层`
- `发布与回滚层`

## 5.2 请求层指标

继续复用当前 `runtime-observability.md` 中已存在的基线，但应把媒体链路相关接口单独聚合。

建议重点关注：

- 媒体详情接口成功率
- 资产列表接口慢请求比例
- 下载入口 4xx / 5xx 比例
- 任务查询接口慢请求比例

### 5.2.1 初版观测源

- `app.request`
- Nginx access log

## 5.3 任务层指标

这是 `MEDIA-BPLUS-50` 与 `MEDIA-BPLUS-20` 的重点交叉区。

建议统一关注：

- 队列长度
- 父任务失败率
- `partial_ready` 占比
- 子任务失败分布
- 单阶段平均耗时
- 卡死任务数量
- 人工重驱动次数

### 5.3.1 首版可落地指标

结合当前现状，首版至少落：

- `redis-cli LLEN BACKGROUND_JOB_QUEUE_NAME`
- `app.background_runtime` 失败日志数
- 按 `task_type / pipeline_type` 聚合的失败任务数
- 超过阈值未完成的任务数

### 5.3.2 第二阶段指标

当 `scope_key / current_stage / heartbeat_at / gen_task_items` 全量接线后，再逐步补：

- `heartbeat timeout` 数
- `retrying` 次数
- `failed_items` 按 `item_type` 分布
- `metadata_commit` 阶段失败数

## 5.4 媒体交付层指标

### 5.4.1 图片链路

- `thumbnailUrl` 404 比例
- `previewUrl` 仍回落原图的比例
- `largeUrl` 缺失比例
- `AVIF` 派生失败数
- `WebP` 回退命中比例

### 5.4.2 视频链路

- `previewVideoUrl` 可用率
- `hlsUrl` 可用率
- `playlist 404` 数
- `HLS -> previewVideoUrl` 回退命中数
- 预览 mp4 转码耗时

### 5.4.3 下载链路

- `downloadUrl` 成功率
- 签名下载失败率
- 受控下载 302 异常数
- 下载审计写入失败数

## 5.5 存储与 CDN 层指标

当前仓库还未正式接上对象存储/CDN，但 `MEDIA-BPLUS-50` 必须预留这一层指标模型。

建议指标固定为：

- 对象写入失败数
- 对象读取失败数
- CDN 命中率
- CDN 回源错误率
- CDN 失效调用失败数
- 回源延迟

### 5.5.1 首版承接方式

在对象存储/CDN 未正式上线前：

- 先以 Nginx `/uploads/` 访问日志代替静态媒体层指标
- 先以应用层下载/预览失败日志代替对象层指标

## 5.6 告警分级

建议统一分三档：

- `Info`
  - 可观察但不影响用户主链路
- `Warning`
  - 已影响局部链路，需要当天处理
- `Critical`
  - 已影响主链路，需要立即止血或回滚

### 5.6.1 典型 Critical 场景

- `downloadUrl` 大面积失效
- `previewVideoUrl` 与 `hlsUrl` 同时失效
- 队列长度持续积压且 Worker 无法消费
- `heartbeat timeout` 激增
- `/uploads/` 或未来 CDN 大面积 404 / 5xx

## 6. Runbook 设计

## 6.1 Runbook 总目录建议

建议 `docs/runbooks/` 至少补齐以下媒体专项手册：

- `media-task-runtime.md`
- `media-task-retry-and-recovery.md`
- `media-storage-migration.md`
- `media-download-signing.md`
- `media-cdn-invalidation.md`
- `media-release-canary.md`
- `media-release-rollback.md`
- `video-preview-transcode.md`
- `video-hls-packaging.md`
- `video-playback-fallback.md`
- `image-derivative-pipeline.md`
- `image-format-fallback.md`
- `image-cache-invalidation.md`
- `media-release-canary.md`
- `media-release-rollback.md`

## 6.2 每份 Runbook 的固定结构

建议统一模板：

1. 适用范围
2. 症状表现
3. 快速判断
4. 核查命令
5. 常见根因
6. 处理步骤
7. 回滚步骤
8. 验证步骤
9. 需要回写的文档

## 6.3 首批必须优先补的 Runbook

### 6.3.1 任务运行时

- 队列堆积排查
- Worker 无消费排查
- 任务卡死或 `pending` 长时间不动排查
- 失败任务人工重驱动步骤

### 6.3.2 下载与存储

- 下载 302 异常排查
- 签名 token 失效排查
- 对象/本地路径不一致排查
- CDN 失效未生效排查

### 6.3.3 视频播放

- `previewVideoUrl` 不可用排查
- `hlsUrl` 404 / playlist 错误排查
- 播放器自动回退判定与恢复步骤

### 6.3.4 图片交付

- `thumbnailUrl` / `previewUrl` 404 排查
- `largeUrl` 缺失排查
- `AVIF` 失败后的 `WebP / 原格式` 回退核查

## 7. 灰度设计

## 7.1 灰度对象分层

媒体链路不建议“一键全量切换”，建议按对象分层灰度：

- `功能开关灰度`
  - 例如是否启用签名下载
- `字段消费灰度`
  - 例如播放器是否优先消费 `hlsUrl`
- `资源类型灰度`
  - 例如图片先灰度 `largeUrl`
- `用户/项目作用域灰度`
  - 先对内部账号、测试项目生效

## 7.2 建议的灰度顺序

### 7.2.1 `MEDIA-BPLUS-10`

- 先灰度下载链路
- 再灰度预览资源鉴权
- 最后灰度对象存储替换

### 7.2.2 `MEDIA-BPLUS-20`

- 先灰度新任务中心承接某一类媒体任务
- 再扩大到全部媒体任务

### 7.2.3 `MEDIA-BPLUS-30`

- 先灰度 `previewVideoUrl`
- 再灰度 `hlsUrl`
- 最后灰度 `availableQualities`

### 7.2.4 `MEDIA-BPLUS-40`

- 先灰度 `largeUrl`
- 再灰度 `AVIF`
- 再灰度 `imageSources`

## 7.3 灰度开关建议

建议后续统一以配置项或显式 feature flag 承接：

- `MEDIA_ENABLE_SIGNED_DOWNLOAD`
- `MEDIA_ENABLE_OBJECT_STORAGE_PREVIEW`
- `MEDIA_ENABLE_MEDIA_TASK_RUNTIME_V2`
- `MEDIA_ENABLE_VIDEO_HLS`
- `MEDIA_ENABLE_IMAGE_LARGE_VARIANT`
- `MEDIA_ENABLE_IMAGE_MODERN_FORMATS`

原则：

- 开关必须可快速关闭
- 关闭后能回退到旧链路
- 开关语义必须写入 Runbook 和部署手册

## 8. 回滚设计

## 8.1 回滚分层

建议把回滚固定拆成四类：

- `配置回滚`
- `流量回滚`
- `代码回滚`
- `数据与缓存回滚`

## 8.2 配置回滚

适用场景：

- 签名下载灰度开启后异常
- HLS 主播放切换后异常
- 图片现代格式回退异常

回滚动作：

- 关闭 feature flag
- 恢复旧的 resolver / getter 选择顺序
- 重新加载应用或代理

## 8.3 流量回滚

适用场景：

- 新存储链路局部异常
- 新媒体域名/CDN 回源异常

回滚动作建议：

- 恢复旧域名或旧路径分发
- 恢复旧 Nginx upstream / 路由规则
- 停止新增对象写入或切回本地托管路径

## 8.4 代码回滚

适用场景：

- 任务中心代码变更导致主链路失败
- 下载校验逻辑误杀
- HLS 打包代码发布后大面积失败

建议至少明确：

- 回滚目标版本
- 回滚前数据与日志保留
- 回滚后执行迁移检查
- 回滚后执行 `project_ops.sh check`

## 8.5 数据与缓存回滚

媒体链路最容易漏掉的是缓存与派生产物。

建议统一明确：

- 对象是否需要清理
- CDN 是否需要失效
- metadata 是否需要恢复旧字段
- 任务状态是否需要人工修正

## 8.6 为什么现有 `release-rollback.md` 不够

当前仓库已有发布回滚手册，但它仍停留在原则层：

- 没有针对媒体链路
- 没有命令级步骤
- 没有开关级回退
- 没有缓存/对象/任务状态回退

因此 `MEDIA-BPLUS-50` 建议不要继续修改原文档承载全部细节，而是新增媒体专项回滚手册，并让 `release-rollback.md` 作为总入口索引。

## 9. 运行时与脚本落点建议

## 9.1 继续复用的现有资产

- `project_ops.sh`
- `docs/runbooks/runtime-observability.md`
- `docs/runbooks/production-deploy.md`
- `docs/runbooks/release-rollback.md`
- Supervisor 模板
- Nginx 模板

## 9.2 建议新增的脚本能力

后续可逐步新增：

- `backend/scripts/check_media_runtime.sh`
  - 统一检查队列、Worker、Redis、最近失败任务
- `backend/scripts/check_media_delivery.sh`
  - 检查 `preview/download/hls/thumbnail` 连通性
  - 当前已完成首版脚本落地，并由 `./project_ops.sh media-delivery ...` 统一承接
- `backend/scripts/check_cdn_backsource.sh`
  - 检查 CDN 回源与缓存命中
- `backend/scripts/requeue_media_task.sh`
  - 人工重驱动失败任务

## 9.3 建议补充的代码落点

- `backend/app/services/background_runtime.py`
  - 增加更明确的任务状态采样与失败分类日志
- `backend/app/routers/tasks.py`
  - 为排障提供更清晰的任务查询视图
- `backend/app/services/media_task_runtime.py`
  - 承接媒体失败聚合、阶段耗时和恢复入口
- `backend/app/services/media_access_resolver.py`
  - 记录签名下载、受控访问失败日志

## 10. 分阶段落地建议

### 阶段 1：统一观测口径

- 锁定媒体链路指标清单
- 锁定日志分类
- 锁定首版告警阈值

### 阶段 2：补齐媒体专项 Runbook

- 先补任务运行时、下载签名、视频播放、图片回退四类高频故障手册

### 阶段 3：补齐灰度与回滚手册

- 形成 feature flag 清单
- 形成切换顺序
- 形成命令级回退步骤

### 阶段 4：补正式指标平台

- 把高价值指标从“日志 + 手工巡检”升级到正式 metrics backend

## 11. 验收标准

完成 `MEDIA-BPLUS-50` 首版设计与实现后，至少满足：

- 媒体链路已有统一指标清单和告警口径
- 关键媒体故障已有明确 Runbook
- 媒体能力上线前已有明确灰度顺序
- 媒体能力异常时已有明确回滚步骤
- `project_ops.sh`、部署手册、回滚手册和媒体专项手册之间形成索引闭环
- `MEDIA-BPLUS-10 / 20 / 30 / 40` 后续落地时，不再需要临时边上线边补排障文档

## 12. 当前结论

`MEDIA-BPLUS-50` 的关键，不是把“观测、Runbook、灰度回滚”当成收尾文档工作，而是把它定义为媒体企业级交付的前置能力。

当前仓库已经有：

- 日志分类
- 队列运行时
- Worker 托管
- 运维脚本
- 部署手册

缺的不是“有没有运维基础”，而是缺一份把这些基础真正组织成媒体专项上线治理闭环的实现设计。

只要这一步设计收口好，后续 `MEDIA-BPLUS-10 / 20 / 30 / 40` 就不再是“写完代码再看能不能上线”，而是从一开始就沿着“可观测、可巡检、可灰度、可回滚”的企业级路径推进。
