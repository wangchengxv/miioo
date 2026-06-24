# Harness 文档中心

## 1. 文档定位

本目录用于把当前工作区的 Harness 工程文档从“少数超大文件”重构为“入口页 + 分层子文档 + 历史归档”的稳定结构。

目标只有三个：

- 让新接手的人能在 5 分钟内找到正确事实源
- 让当前阶段状态、变更日志、架构约束分开维护
- 让页面映射和前端进度都能按主题拆小，持续做“小内存回写”

## 2. 当前推荐阅读顺序

本文件只负责 `docs/` 子体系导航，不再重复维护根级总导航或完整接手顺序。

进入 `docs/` 后，建议按下面方式分流：

1. 要理解架构与设计边界：`architecture/README.md`
2. 要理解当前阶段状态：`plans/项目进度文档.md`
3. 要看路线图与模块状态：`plans/current-roadmap.md`、`plans/module-progress.md`
4. 要接具体任务：`plans/page-mapping-index.md`、`plans/backlog-index.md`、`plans/todo-index.md`
5. 要看前端主题推进：`plans/frontend-progress-index.md`
6. 要追改动留痕：`../CHANGELOG.md`

若需要补背景，再进入：

- `../需求分析文档.md`
- `architecture/可行性报告文档.md`
- `architecture/概要设计文档.md`
- `architecture/详细设计文档.md`

## 3. 分层说明

| 目录 | 作用 | 适用场景 |
|---|---|---|
| `architecture/` | 可行性、概要设计、详细设计、架构边界、模块职责、文档治理 | 判断“为什么这样做、系统如何分层、应该改哪一层” |
| `decisions/` | ADR 决策记录 | 追溯为什么采用当前方案 |
| `plans/` | 当前路线图、模块状态、页面映射索引、前端进度索引、backlog 索引、Todo 索引、开发总结、历史归档索引 | 追踪阶段目标、接手状态与执行清单 |
| `runbooks/` | 本地开发、任务执行、发布回滚 | 执行标准动作时按手册操作 |
| `generated/` | 自动生成产物入口 | 未来存放 schema、openapi、导出索引 |

## 4. 当前事实源约定

- 页面行为事实：`miioo/frontend/src/pages/` 与现有 UI
- 前后端适配事实：`miioo/frontend/src/api/`
- 后端契约事实：`miioo/backend/BACKEND_API_DOC.md` 与 `backend/app/routers/`
- 页面闭环固定入口：`../HARNESS_PAGE_API_MAPPING.md`
- 页面闭环默认索引：`plans/page-mapping-index.md`
- 阶段优先级默认索引：`plans/backlog-index.md`
- 当前优先级事实：`../HARNESS_P0_BACKLOG.md`
- 当前模块状态：`plans/module-progress.md`
- 当前路线图：`plans/current-roadmap.md`
- 当前接手视角：`plans/项目进度文档.md`
- 前端日常进度入口：`plans/frontend-progress-index.md`
- 当前执行 Todo 默认索引：`plans/todo-index.md`
- 当前执行清单：`plans/功能模块Todo文档.md`
- 当前经验沉淀：`plans/开发总结文档.md`
- 改动留痕：`../CHANGELOG.md`

## 5. 回写规则

每次任务完成后，至少判断是否需要同步以下文件：

- 对应页面映射子文档：`plans/page-mappings-*.md`
- 对应 backlog 子文档：`plans/backlog-*.md`
- 对应前端进度子文档：`plans/frontend-progress-*.md`
- 对应 Todo 子文档：`plans/todo-*.md`
- `plans/module-progress.md`
- `plans/项目进度文档.md`
- `plans/功能模块Todo文档.md`
- `plans/开发总结文档.md`
- `../HARNESS_P0_BACKLOG.md`
- `../CHANGELOG.md`
- `miioo/frontend/PROJECT.md`

## 6. 大文件瘦身策略

当前仓库仍保留若干大文件，但角色已经收口：

- `../HARNESS_PAGE_API_MAPPING.md`：页面闭环根级固定入口
- `miioo/frontend/PROJECT.md`：前端工程入口 + 历史进度母本
- `HARNESS_P0_HISTORY.md`：历史专项与阶段记录归档
- `大模型官方文档/经验总结个人知识库/进度文档.md`：历史阶段总结归档

当前默认阅读入口已经拆到小文档：

- `plans/page-mapping-index.md` + `plans/page-mappings-*.md`
- `plans/frontend-progress-index.md` + `plans/frontend-progress-*.md`
- `plans/backlog-index.md` + `plans/backlog-*.md`
- `plans/todo-index.md` + `plans/todo-*.md`
- `plans/current-roadmap.md`
- `plans/module-progress.md`

后续新增内容优先写入小文档；只有需要沉淀完整历史链路时，再回写到历史母本。
