# Todo 索引

## 1. 定位

本索引只负责把执行 Todo 分流到按主题拆分的小文档。

它负责：

- 告诉你当前任务应该进入哪个 `todo-*.md`
- 作为 Todo 子文档的默认阅读入口

它不负责：

- 维护跨模块的阶段摘要
- 重复保存回写规则全文
- 取代 `docs/plans/功能模块Todo文档.md` 的执行母表角色

## 2. 阅读顺序

1. `todo-auth-project.md`
2. `todo-script-subject-storyboard.md`
3. `todo-creation-assets-edit.md`
4. `todo-runtime-performance.md`
5. `todo-doc-governance.md`
6. `todo-legacy-2026-06-10.md`

## 3. 使用原则

- 先按主题找到当前任务所在区域
- 再对照 `page-mapping-index.md` 获取页面闭环事实
- 若任务涉及阶段优先级，再同步看 `backlog-index.md`
- 若需要看跨模块执行口径、当前阶段摘要和统一回写规则，再看 `功能模块Todo文档.md`
- 完成任务后，优先回写对应 Todo 子文档，再同步 `module-progress.md` 与 `CHANGELOG.md`
