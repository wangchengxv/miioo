# 历史归档索引

## 1. 目的

本文件用于保留现有大文件的价值，同时明确它们已经从“默认入口”调整为“历史归档或母本”。

## 2. 当前归档文件

| 文件 | 当前角色 | 什么时候看 |
|---|---|---|
| `backlog-legacy-2026-06-10.md` | backlog 拆分前完整母本 | 需要追溯根级 backlog 拆分前全文时 |
| `page-mapping-legacy-2026-06-10.md` | 页面映射拆分前完整母本 | 需要追溯根级映射拆分前全文时 |
| `todo-legacy-2026-06-10.md` | Todo 拆分前完整母表 | 需要追溯拆分前完整执行清单时 |
| `../HARNESS_P0_HISTORY.md` | P0 历史记录与专项母本 | 需要追溯某个专项完整背景时 |
| `../miioo/frontend/PROJECT.md` | 前端工程母本 + 历史进度入口 | 需要看前端目录结构或较完整前端历史时 |
| `../大模型官方文档/经验总结个人知识库/进度文档.md` | 全局阶段总结归档 | 需要复盘早期阶段结果时 |
| `../miioo/frontend/API_AUDIT.md` | API 缺口审查历史 | 需要追溯某条 API 缺口来源时 |

## 3. 当前使用建议

默认不要先读这些大文件。

先读：

1. `../HARNESS_DOC_INDEX.md`
2. `项目进度文档.md`
3. `current-roadmap.md`
4. `module-progress.md`
5. `page-mapping-index.md`
6. `backlog-index.md`
7. `todo-index.md`
8. `frontend-progress-index.md`
9. `../CHANGELOG.md`

如果上述当前层文档已经能回答问题，就不要回到归档层。

只有在需要追溯历史细节、拆分前母本或某次专项完整过程时，再进入归档文件。

## 4. 与当前主文档的对应关系

当前新增主文档已经成为默认入口，历史大文件继续保留但建议按以下关系互相参照：

| 历史文件 | 当前优先阅读的主文档 | 使用建议 |
|---|---|---|
| `backlog-legacy-2026-06-10.md` | `backlog-index.md`、`../HARNESS_P0_BACKLOG.md` | 需要还原 backlog 拆分前全文时再进入 legacy 母本 |
| `page-mapping-legacy-2026-06-10.md` | `page-mapping-index.md`、`../HARNESS_PAGE_API_MAPPING.md` | 需要还原页面映射拆分前全文时再进入 legacy 母本 |
| `todo-legacy-2026-06-10.md` | `todo-index.md`、`功能模块Todo文档.md` | 需要还原 Todo 拆分前母表时再进入 legacy 母本 |
| `../miioo/frontend/PROJECT.md` | `frontend-progress-index.md`、`../docs/plans/项目进度文档.md` | 需要看前端目录母本和长时间序列时再回到 `PROJECT.md` |
| `../大模型官方文档/经验总结个人知识库/进度文档.md` | `../docs/plans/项目进度文档.md`、`../docs/plans/开发总结文档.md` | 需要追溯某阶段完整背景时再回看历史进度文档 |
| `../HARNESS_P0_HISTORY.md` | `../docs/plans/项目进度文档.md`、`../docs/plans/功能模块Todo文档.md` | 需要还原专项完整过程时再进入历史母本 |
| `../miioo/frontend/API_AUDIT.md` | `../docs/architecture/详细设计文档.md`、`../docs/plans/功能模块Todo文档.md` | 需要追溯具体 API 缺口来源时再进入审计历史 |

## 5. 当前维护策略

历史文件继续保留，不删除、不大规模重命名。

后续维护默认遵循以下规则：

- 当前阶段结论优先写入 `docs/` 主体系
- 页面闭环优先回写 `page-mappings-*.md`
- backlog 优先回写 `backlog-*.md`
- Todo 优先回写 `todo-*.md`
- 前端进度优先回写 `frontend-progress-*.md`
- 模块执行项优先写入 `功能模块Todo文档.md`
- 经验与总结优先写入 `开发总结文档.md`
- 只有需要追溯完整历史链路时，才回写本页所列历史母本
