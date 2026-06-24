# Harness P0 Backlog Legacy 2026-06-10

以下内容保留拆分前的完整 backlog 母本，便于追溯。

# Harness P0 Backlog

## P0

- `2026-06-09` 当前状态
  - `SUBTASK-01 ~ SUBTASK-04` 首期代码主干已落地：`subjects/extract`、`storyboards/generate`、`subjects/{subject_id}/generate-image`、`subjects/batch-generate` 都已切到 `GenTask + gen_task_items + /api/tasks/{task_id}`。
  - 当前进入“真实环境联调验证 + 文档收口”阶段；P1 保留项继续收口为失败子项重试、断点恢复细化与 SSE 预留。
  - 同日已新增 `SUBTASK-07`，用于把项目剪辑页从“轻剪辑首版”增强为“在线编辑版”，当前范围限定为四区结构、时间线顺序/时长/字幕编辑、素材池追加、保存导出与结果回显。

- `SUBTASK-01` 主体提取任务化
  - 将 `POST /api/projects/{project_id}/subjects/extract` 从同步整包返回改为父任务 + 子项表 + 短轮询。
  - 验收：点击“开始提取主体”后立即返回 `taskId`；任务执行中已有主体逐步落库；页面可按 `GET /api/tasks/{task_id}` 轮询并实时回显。

- `SUBTASK-02` 智能分镜任务化
  - 将 `POST /api/projects/{project_id}/storyboards/generate` 从同步整包返回改为按 beat chunk 拆分的任务制。
  - 验收：点击“开始智能分镜”后立即返回 `taskId`；任务执行中已有分镜逐步写入 `storyboards`；结束后 `shot_number / sort_order` 正常。

- `SUBTASK-03` 主体图片任务化
  - 将单主体生成和批量主体图生成统一改造成任务制，任务项按主体粒度落库。
  - 验收：每完成一个主体的图片生成就能刷新该主体卡片；批量任务支持 `partial`。

- `SUBTASK-04` 通用任务运行时扩容
  - 为 `gen_tasks` 补 `scope_key / current_stage / heartbeat_at`，新增 `gen_task_items` 子项表。
  - 验收：`/api/tasks/{task_id}` 返回 `progress / currentStage / latestCreatedIds / previewItems / partial / errorMsg`。

- `SUBTASK-07` 剪辑成片在线编辑增强
  - 保留 `EditPage.jsx + src/api/composition.js + src/lib/composition.js` 现有架构，在此基础上补齐项目内素材池、预览区、时间线区、片段属性区、导出结果区。
  - 验收：
    - 可从分镜页进入剪辑页，且“有分镜图或分镜视频”即可进入。
    - 页面可并行加载 `storyboards / assets / audio-clips / video-clips / compositions / tasks / export-files`。
    - 时间线支持顺序调整、时长修改、复制、删除、字幕编辑、素材追加。
    - 保存草稿与导出成片可正常回显状态、失败原因与下载文件列表。

## P1

- `SUBTASK-05` 任务断点恢复与失败重试
  - 当前首期只保证后台持续执行和部分完成可见；后续继续补“只重试失败子项”和更稳定的断点恢复。

- `SUBTASK-06` SSE 预留
  - 当前前端统一先走 `1~1.5s` 短轮询；后续若需要更丝滑的实时体验，再在现有 `gen_task_items` 基础上补 SSE 推送。

- `SUBTASK-08` 剪辑页高级能力后置
  - 重型拖拽时间线、自动转写字幕、AI Voice、Pexels、复杂动画/转场/裁剪、画布自由变换继续后置，不纳入本轮联调闭环。
