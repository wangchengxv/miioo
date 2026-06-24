# MEDIA-BPLUS-20：媒体任务中心与状态机实现设计

## 1. 文档定位

本文档是 `MEDIA-BPLUS-20` 任务包的实现设计稿，用于把“媒体任务中心与状态机”从 backlog 层继续下钻到任务模型、状态机、幂等、重试/死信、写回顺序、代码落点与 Runbook 层。

对应上层事实源：

- `docs/plans/生成资产前端访问体验方案B-生产级媒体资产管线升级.md`
- `docs/plans/生成资产前端访问体验方案B+实施清单.md`
- `docs/plans/backlog-media-pipeline-bplus.md`
- `docs/plans/MEDIA-BPLUS-10-存储分层与签名下载实现设计.md`

## 2. 当前代码事实

基于当前仓库，和 `MEDIA-BPLUS-20` 直接相关的事实如下：

- 当前项目已经存在通用任务表 `gen_tasks`，并且数据库层已经有 `scope_key / current_stage / heartbeat_at` 字段。
- 数据库层已经存在 `gen_task_items` 子项表，字段包括 `task_id / item_type / status / sequence / payload / result_ref_type / result_ref_id / error_message / started_at / finished_at`。
- 当前 `GET /api/tasks/{task_id}` 已作为统一任务查询入口存在，前端和文档已接受 `taskId -> 轮询 -> 刷新真实列表/详情` 这一承接方式。
- `background_runtime.py` 已具备两种运行模式：
  - 进程内 `asyncio.create_task(...)`
  - Redis 队列驱动的 `queue` 模式
- 当前媒体派生能力已经存在于 `media_derivative_pipeline.py`，但仍以“函数式派生工具”存在，还没有被系统化纳入统一媒体任务中心。
- 当前项目在图片、视频、分镜、创作任务上已经大量使用 `running / partial / completed / failed / cancelled` 这些通用任务口径。
- 当前媒体衍生侧已经存在：
  - `preview_ready`
  - `derivative_status`
  - `derivative_error`
  但这些字段目前更多是媒体元数据状态，还没有和统一任务子项状态机严格对齐。

因此，`MEDIA-BPLUS-20` 的目标不是重做一套全新任务系统，而是把“媒体衍生任务”正式收编到现有 `gen_tasks + gen_task_items + background_runtime` 运行时口径中。

## 3. 目标与不做事项

### 3.1 目标

- 把图片派生、视频海报、视频预览转码、HLS 切片、音频波形、清理任务统一纳入通用任务运行时。
- 为媒体链路建立统一父任务、子任务、阶段状态、心跳、重试和失败承接规则。
- 让 `preview_ready / derivative_status` 等媒体字段与任务状态机有明确映射关系。
- 让后续 `MEDIA-BPLUS-30 / 40 / 50` 都建立在同一任务运行时上，而不是各自散写后台协程。

### 3.2 当前阶段不做

- 不在本轮直接设计完整视频转码参数矩阵，那属于 `MEDIA-BPLUS-30`。
- 不在本轮直接设计对象存储签名下载细节，那属于 `MEDIA-BPLUS-10`。
- 不要求当前所有已有生成任务立即一次性迁移，只先明确媒体相关任务的统一承接方式。

## 4. 设计原则

### 4.1 不另起并行任务系统

- 继续沿用 `gen_tasks` 作为父任务表。
- 继续沿用 `gen_task_items` 作为子项表。
- 继续沿用 `/api/tasks/{task_id}` 作为统一轮询入口。

### 4.2 父任务看全局，子任务看派生粒度

- 父任务负责：
  - 总状态
  - 总数量
  - 成功/失败数
  - 当前阶段
  - 聚合结果
- 子任务负责：
  - 单个派生步骤
  - 单个媒体对象
  - 单个失败原因
  - 单个重试与结果引用

### 4.3 任务状态与媒体可见性解耦但联动

- 任务状态用于表达运行过程。
- `preview_ready / derivative_status` 用于表达当前媒体是否可展示。
- 两者必须有稳定映射，但不能完全混为一个字段。

### 4.4 先保证可追踪，再谈高阶优化

- 先有心跳、阶段、失败原因、子项记录。
- 再上自动重试、死信、批量重驱动。

## 5. 任务模型设计

## 5.1 父任务 `gen_tasks`

`gen_tasks` 继续作为媒体任务中心的父任务表。

建议媒体类父任务使用的 `task_type` 包括：

- `media_pipeline`
- `media_image_derivative`
- `media_video_pipeline`
- `media_audio_pipeline`
- `media_cleanup`

首版更推荐：

- 统一落为 `media_pipeline`
- 在 `params.pipeline_type` 中区分具体媒体链路

原因：

- 便于任务列表聚合
- 便于统一 `/api/tasks/{task_id}` 轮询语义
- 避免后期任务类型碎片化

### 5.1.1 父任务建议字段用法

- `task_type`
  - 固定大类，例如 `media_pipeline`
- `status`
  - 父任务总体状态
- `params.pipeline_type`
  - `image_derivative`
  - `video_poster_extract`
  - `video_preview_transcode`
  - `video_hls_package`
  - `audio_waveform_extract`
  - `media_cleanup`
- `params.media_type`
  - `image / video / audio`
- `params.subject_type`
  - 例如 `asset / storyboard / subject / creation_result`
- `params.subject_id`
  - 对应业务资源 ID
- `scope_key`
  - 幂等与去重范围键
- `current_stage`
  - 父任务当前阶段
- `heartbeat_at`
  - 运行心跳
- `results`
  - 对前端友好的聚合结果

## 5.2 子任务 `gen_task_items`

`gen_task_items` 继续作为媒体任务子项表。

### 5.2.1 子项粒度建议

图片类：

- `source_validate`
- `thumbnail_generate`
- `preview_generate`
- `large_generate`
- `metadata_commit`

视频类：

- `source_validate`
- `poster_extract`
- `preview_transcode`
- `hls_package`
- `qualities_index_commit`
- `metadata_commit`

音频类：

- `source_validate`
- `preview_prepare`
- `waveform_extract`
- `metadata_commit`

清理类：

- `object_delete`
- `cdn_invalidate`
- `metadata_cleanup`
- `audit_append`

### 5.2.2 子项状态建议

建议子项状态固定为：

- `pending`
- `queued`
- `running`
- `succeeded`
- `failed`
- `retrying`
- `cancelled`
- `skipped`

这里和父任务状态故意不完全相同：

- 子项强调步骤执行结果
- 父任务强调整体可见状态

## 6. 状态机设计

## 6.1 父任务状态机

建议 `MEDIA-BPLUS-20` 统一父任务状态如下：

- `queued`
- `running`
- `partial_ready`
- `completed`
- `failed`
- `cancelled`

### 6.1.1 状态语义

#### `queued`

- 已创建父任务
- 尚未开始执行
- 允许前端展示“已进入媒体处理队列”

#### `running`

- 至少一个子任务正在执行
- 可能尚无任何可展示产物

#### `partial_ready`

- 已产生至少一个可展示的媒体派生结果
- 但整体链路尚未全部完成

典型场景：

- 视频已生成 `poster` 和 `previewVideoUrl`，但 HLS 仍在打包
- 图片已有 `thumbnail / preview`，但 `large` 或现代格式仍在生成

#### `completed`

- 本阶段承诺的子任务全部完成
- 所有必须产物均可读

#### `failed`

- 当前父任务没有产出足够可展示的有效结果
- 或整个链路已无法继续

#### `cancelled`

- 人工取消
- 或被更高优先级新任务替代

## 6.2 子项状态机

建议子项执行顺序：

```text
pending -> queued -> running -> succeeded
                       \-> failed -> retrying -> queued
                       \-> cancelled
                       \-> skipped
```

### 6.2.1 映射到父任务的聚合规则

- 所有子项都未开始：父任务 `queued`
- 有子项执行中：父任务 `running`
- 至少一个关键可见产物已成功，但仍有未完成子项：父任务 `partial_ready`
- 所有必需子项成功：父任务 `completed`
- 所有关键子项失败且无可展示结果：父任务 `failed`
- 被人工或系统取消：父任务 `cancelled`

## 7. 阶段与阶段标签设计

建议媒体任务父任务统一使用 `current_stage` 表达当前阶段，而不是只看 `status`。

### 7.1 建议阶段枚举

图片类：

- `queued`
- `source_validating`
- `thumbnail_generating`
- `preview_generating`
- `variants_generating`
- `metadata_committing`
- `completed`

视频类：

- `queued`
- `source_validating`
- `poster_extracting`
- `preview_transcoding`
- `hls_packaging`
- `qualities_indexing`
- `metadata_committing`
- `completed`

音频类：

- `queued`
- `source_validating`
- `preview_preparing`
- `waveform_extracting`
- `metadata_committing`
- `completed`

清理类：

- `queued`
- `object_deleting`
- `cdn_invalidating`
- `metadata_cleaning`
- `audit_appending`
- `completed`

### 7.2 `status` 与 `current_stage` 的关系

- `status` 面向前端轮询停止条件和整体任务判断
- `current_stage` 面向中间进度展示和排障

也就是说：

- 轮询停止主要看 `completed / failed / cancelled`
- 页面进度文案主要看 `current_stage`

## 8. 幂等设计

## 8.1 `scope_key` 作为父任务幂等键

当前 `gen_tasks` 已有 `scope_key`，建议正式用于媒体任务幂等。

### 8.1.1 生成规则建议

```text
media:{pipeline_type}:{subject_type}:{subject_id}:{source_version}
```

示例：

```text
media:video_preview_transcode:asset:123e4567:source-v2
media:image_derivative:storyboard:5baf...:image-v1
```

### 8.1.2 幂等策略

- 若存在同 `scope_key` 的 `queued / running / partial_ready` 父任务：
  - 默认不重复创建
  - 直接返回现有任务
- 若存在同 `scope_key` 的 `completed` 父任务且产物仍有效：
  - 默认不重跑
  - 仅在强制重建时新建任务
- 若存在 `failed` 任务：
  - 可由显式 retry 入口触发复用或重建

## 8.2 子任务幂等

子项也需要稳定幂等键，建议逻辑上由以下维度唯一：

- `task_id`
- `item_type`
- `sequence`
- `payload.source_key`

避免同一父任务内反复创建相同步骤子项。

## 9. 重试与死信设计

## 9.1 失败分类

建议把失败分成两类：

- `retryable`
  - 上游暂时失败
  - 网络抖动
  - 转码超时
  - 对象存储临时不可达
- `non_retryable`
  - 源文件缺失
  - 参数错误
  - 文件格式不支持
  - 权限错误

### 9.1.1 建议记录字段

放在子项 `payload` 或错误结构中：

- `error_code`
- `error_category`
- `retryable`
- `attempt`
- `max_attempts`

## 9.2 重试策略

建议首版采用：

- 最大尝试次数：`3`
- 退避策略：指数退避
- 仅 `retryable` 失败进入自动重试

### 9.2.1 父任务如何感知重试

- 子项进入 `retrying`
- 父任务仍保持 `running` 或 `partial_ready`
- 仅所有关键子项都最终失败时，父任务转 `failed`

## 9.3 死信策略

当前阶段不一定要立刻引入独立消息队列死信队列，但应先沉淀“逻辑死信”语义：

- 超过最大重试次数的子项标记为最终失败
- 在子项 `payload` 中记录最后一次失败详情
- 父任务结果中可聚合出 `failed_items`

后续若队列体系升级，可再映射到真实死信队列。

## 10. 心跳与卡死检测

当前 `gen_tasks` 已有 `heartbeat_at`，建议 `MEDIA-BPLUS-20` 正式启用。

### 10.1 心跳规则

- 父任务执行中定期刷新 `heartbeat_at`
- 推荐粒度：`15s ~ 30s`

### 10.2 卡死判定

若满足：

- `status in {queued, running, partial_ready}`
- `heartbeat_at` 超过阈值未更新

则任务应被标记为：

- `stalled` 逻辑状态，或
- 在现有模型中先按 `failed` + `error_code=heartbeat_timeout` 收口

首版更推荐后者，避免当前接口立即新增一个额外前端状态。

## 11. 一致性写回顺序

`MEDIA-BPLUS-20` 最关键的工程约束之一是写回顺序。

建议统一顺序：

1. 子项完成实际处理
2. 校验产物确实可读
3. 写入对象描述或本地对象路径
4. 更新媒体 metadata
5. 更新业务实体的视图字段来源
6. 更新子项状态为 `succeeded`
7. 聚合并刷新父任务 `success_count / fail_count / current_stage / status`

禁止顺序：

- 先把父任务标记 `completed`
- 再去补媒体元数据

否则会出现：

- 任务完成，但页面拿不到预览
- `preview_ready = true`，但对象实际不可读

## 12. 媒体字段与任务状态映射

建议映射关系如下：

- `preview_ready = false`
  - 允许父任务处于 `queued / running`
- `preview_ready = true`
  - 父任务至少已到 `partial_ready`
- `derivative_status = missing_source`
  - 父任务通常为 `failed`
- `derivative_status = ready`
  - 不代表父任务一定 `completed`
  - 可能只是首个关键可见产物已就绪

因此后续建议新增更明确的媒体元数据字段，例如：

- `pipeline_stage`
- `pipeline_task_id`
- `pipeline_partial_ready`

用于把媒体可见状态与任务运行态做更清晰连接。

## 13. 接口设计建议

## 13.1 尽量复用现有 `/api/tasks/{task_id}`

首版不建议新起一套媒体专用轮询接口。

原因：

- 当前前端和文档已经接受统一任务轮询口径
- 可减少新接口数量
- 有利于所有长任务统一收口

## 13.2 建议扩展的返回字段

在不破坏现有任务接口前提下，建议通过 `params` 和 `results` 补齐：

- `params.current_stage`
- `params.stage_label`
- `params.preview_ready`
- `params.available_qualities`
- `params.failed_items`
- `params.latest_created_ids`

若后续需要更强子项排障能力，再增加：

- `GET /api/tasks/{task_id}/items`

但这属于后续增强，不要求首版就做。

## 14. 代码落点清单

直接相关代码：

- `backend/app/models/gen_task.py`
- `backend/app/routers/tasks.py`
- `backend/app/services/background_runtime.py`
- `backend/app/services/media_derivative_pipeline.py`
- `backend/app/routers/creation.py`
- `backend/app/routers/storyboards.py`

建议新增：

- `backend/app/models/gen_task_item.py`
  - 若当前 ORM 层尚未映射 `gen_task_items`
- `backend/app/services/media_task_runtime.py`
  - 统一媒体父任务/子任务创建、阶段推进、聚合
- `backend/app/services/media_task_state.py`
  - 状态转换、父子聚合、心跳与失败收口

## 15. Runbook 落点

建议后续新增：

- `docs/runbooks/media-task-runtime.md`
- `docs/runbooks/media-task-retry-and-recovery.md`

至少覆盖：

- 如何判断任务卡死
- 如何人工重驱动失败子项
- 如何识别 `partial_ready` 是否可对外展示
- 如何处理“产物存在但父任务状态异常”

## 16. 分阶段落地建议

### 阶段 1：模型与状态收口

- ORM 映射 `gen_task_items`
- 统一媒体任务类型和父/子状态枚举
- 启用 `current_stage / heartbeat_at / scope_key`

### 阶段 2：媒体派生接入通用任务

- 图片派生接入
- 视频海报接入
- 音频波形接入

### 阶段 3：高级链路接入

- 视频预览转码接入
- HLS 打包接入
- 清理任务接入

### 阶段 4：重试、恢复与观测

- 自动重试
- 卡死检测
- 任务 Runbook
- 指标与告警

## 17. 验收标准

完成 `MEDIA-BPLUS-20` 首版设计与实现后，至少满足：

- 媒体任务不再零散散落在路由内部后台协程中
- `gen_tasks` 和 `gen_task_items` 对媒体链路有统一承接
- `partial_ready` 具备明确业务语义
- `scope_key` 可用于媒体任务幂等
- `heartbeat_at` 可用于检测卡死或僵尸任务
- 不再出现父任务已完成但媒体产物不可读的明显一致性断点

## 18. 当前结论

`MEDIA-BPLUS-20` 的关键，不是再造一套“媒体专用任务系统”，而是把当前已经存在的通用任务运行时正式升级为媒体任务中心。

只要把 `gen_tasks + gen_task_items + background_runtime + media_derivative_pipeline` 四层收口好，后续图片派生、视频预览、HLS、波形、清理和恢复，都能沿用同一套状态机、幂等、重试和排障体系推进，而不必继续在多个路由里重复散写后台逻辑。
