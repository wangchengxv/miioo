# 活跃 Backlog

## 1. 当前阶段结论

截至 `2026-06-10`，首期运行时改造主干已落地，当前重点已经转入“真实环境联调验证 + 运行时失败路径观察 + 聚合页稳定性收口”。

## 2. 当前活跃项

### `SUBTASK-01` 主体提取任务化

- 当前结论：已落地，转入真实联调
- 范围：`POST /api/projects/{project_id}/subjects/extract` 改为父任务 + 子项表 + 短轮询
- 验收口径：点击“开始提取主体”后立即返回 `taskId`；任务执行中已有主体逐步落库；页面可按 `GET /api/tasks/{task_id}` 轮询并实时回显

### `SUBTASK-02` 智能分镜任务化

- 当前结论：已落地，转入真实联调
- 范围：`POST /api/projects/{project_id}/storyboards/generate` 改为按 beat chunk 拆分的任务制
- 验收口径：点击“开始智能分镜”后立即返回 `taskId`；任务执行中已有分镜逐步写入 `storyboards`；结束后 `shot_number / sort_order` 正常

### `SUBTASK-03` 主体图片任务化

- 当前结论：已落地，转入真实联调
- 范围：单主体生成图和批量主体图生成统一改造成任务制，任务项按主体粒度落库
- 验收口径：每完成一个主体的图片生成就能刷新该主体卡片；批量任务支持 `partial`

### `SUBTASK-04` 通用任务运行时扩容

- 当前结论：已落地，继续观察
- 范围：为 `gen_tasks` 补 `scope_key / current_stage / heartbeat_at`，新增 `gen_task_items` 子项表
- 验收口径：`/api/tasks/{task_id}` 返回 `progress / currentStage / latestCreatedIds / previewItems / partial / errorMsg`

### `SUBTASK-07` 剪辑成片在线编辑增强

- 当前结论：已落地首版，待联调
- 范围：在 `EditPage.jsx + src/api/composition.js + src/lib/composition.js` 现有架构上补齐素材池、预览区、时间线区、片段属性区、导出结果区
- 验收口径：
  - 可从分镜页进入剪辑页，且“有分镜图或分镜视频”即可进入
  - 页面可并行加载 `storyboards / assets / audio-clips / video-clips / compositions / tasks / export-files`
  - 时间线支持顺序调整、时长修改、复制、删除、字幕编辑、素材追加
  - 保存草稿与导出成片可正常回显状态、失败原因与下载文件列表

### `SUBTASK-08` 生产并发与性能治理

- 当前结论：已立项，待分阶段落地
- 范围：按 `docs/plans/生产环境并发与性能治理计划.md` 收口共享状态、长任务、轮询、媒体流量、数据库容量、SSE 与可观测性治理
- 验收口径：
  - 多 worker 生产态不再依赖进程内共享状态承接验证码、扫码登录与绑定票据
  - 长任务运行时完成“Web 进程承接接口、队列/Worker 承接执行”的职责分离
  - 前端页面层直接 `fetch` 与分散轮询有明确盘点和收口计划
  - `/uploads` 的生产静态流量承载路径、数据库容量预算和关键指标面板具备明确方案
