# 功能模块 Todo 文档

## 1. 文档定位

本文档继续保留为功能模块 Todo 的执行母表，但角色已经收口为“跨模块执行口径 + 当前阶段摘要 + 统一回写规则”。

它负责：

- 给出当前阶段 Todo 的跨模块执行重点
- 说明 Todo 子文档和其它计划文档之间如何配合
- 作为 Todo 层统一回写规则的固定入口

它不负责：

- 取代 `todo-index.md` 维护主题导航入口
- 重复保存每个主题的完整待办明细
- 充当历史母表全文

## 2. 使用方式

建议按下面顺序使用：

1. 先看 `docs/plans/todo-index.md`
2. 再按任务主题进入对应 Todo 子文档
3. 若任务需要页面事实，再对照 `HARNESS_PAGE_API_MAPPING.md` 与对应 `page-mappings-*.md`
4. 需要追溯拆分前完整母表时，再看 `docs/plans/todo-legacy-2026-06-10.md`

## 3. 子文档目录

| 子文档 | 覆盖范围 |
|---|---|
| `docs/plans/todo-auth-project.md` | 登录、当前用户、首页、API 配置、项目与全局设定 |
| `docs/plans/todo-script-subject-storyboard.md` | 剧本、主体、分镜、分镜专项 |
| `docs/plans/todo-creation-assets-edit.md` | 创作页、资产库、剪辑成片 |
| `docs/plans/todo-runtime-performance.md` | 生产运行时、并发、长任务、轮询、媒体流量、数据库容量、SSE 与可观测性 |
| `docs/plans/todo-doc-governance.md` | 文档治理、回写纪律、维护规则 |
| `docs/plans/todo-legacy-2026-06-10.md` | 拆分前完整 Todo 母表归档 |

## 4. 与 `todo-index.md` 的分工

| 文档 | 负责什么 | 不负责什么 |
|---|---|---|
| `todo-index.md` | 按主题把任务分流到对应 `todo-*.md` | 不负责跨模块阶段摘要和统一回写规则 |
| 当前文档 | 维护 Todo 层的跨模块执行口径、阶段摘要和回写规则 | 不负责重复抄写各主题完整待办 |

## 5. 当前阶段摘要

- 当前 Todo 的重点已经从“补首版代码”转入“真实环境手工联调 + 失败路径验证 + 文档持续回写”
- 登录、项目、剧本、主体、分镜仍是主链路优先级最高的任务组
- 创作页、资产库、剪辑成片属于聚合页，重点转入真实素材与真实模型环境验证
- 生产运行时治理已从零散优化点升级为独立 Todo 主题，后续共享状态、长任务、轮询、媒体与容量问题优先回写 `todo-runtime-performance.md`

## 6. 回写规则

每次任务完成后，优先更新：

1. 对应 Todo 子文档
2. `docs/plans/module-progress.md`
3. `HARNESS_P0_BACKLOG.md` 或对应 backlog 子文档
4. `CHANGELOG.md`

若只是历史背景补录，再更新 `docs/plans/todo-legacy-2026-06-10.md` 或其它历史母本。
