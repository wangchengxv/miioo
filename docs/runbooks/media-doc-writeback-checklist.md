# 媒体链路文档回写清单

## 1. 目标

本清单用于在 `MEDIA-BPLUS-*` 任务完成后，快速判断：

- 哪些文档必须回写
- 哪些文档需要按条件判断
- 哪些情况必须同步接口文档

## 2. 适用范围

适用于以下任务包或其实现阶段：

- `MEDIA-BPLUS-10`
- `MEDIA-BPLUS-20`
- `MEDIA-BPLUS-30`
- `MEDIA-BPLUS-40`
- `MEDIA-BPLUS-50`
- `MEDIA-BPLUS-60`
- `MEDIA-BPLUS-70`

推荐与以下文档配合使用：

- [MEDIA-BPLUS-70-文档回写闭环与验收矩阵实现设计.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/MEDIA-BPLUS-70-文档回写闭环与验收矩阵实现设计.md)
- [docs/README.md](file:///Users/xingyi/Desktop/迭代一版/docs/README.md)
- [task-workflow.md](file:///Users/xingyi/Desktop/迭代一版/docs/runbooks/task-workflow.md)

## 3. 默认回写顺序

1. 先更新当前专项设计稿或当前事实源
2. 再更新 `module-progress.md`
3. 再更新 `项目进度文档.md`
4. 再更新 `CHANGELOG.md`
5. 最后判断是否需要更新接口文档、runbook 或架构文档

## 4. 固定回写清单

每次任务完成后，至少检查以下文件：

| 文档 | 是否默认检查 | 用途 |
|---|---|---|
| 当前专项设计稿 | 是 | 保持当前事实源最新 |
| `docs/plans/module-progress.md` | 是 | 记录模块级摘要 |
| `docs/plans/项目进度文档.md` | 是 | 记录接手视角与时间线 |
| `CHANGELOG.md` | 是 | 记录逐日留痕 |
| `docs/plans/backlog-media-pipeline-bplus.md` | 建议 | 任务拆分或验收口径变化时同步 |
| `docs/plans/生成资产前端访问体验方案B+实施清单.md` | 建议 | 包级边界、设计稿入口或推进顺序变化时同步 |

## 5. 条件触发清单

以下文档不是每次都改，但每次都要判断：

| 文档 | 何时更新 |
|---|---|
| `backend/BACKEND_API_DOC.md` | 新增字段、变更字段语义、变更接口行为、变更状态机对外口径 |
| `接口变动文档.md` | 后端接口新增、删除、返回变化、行为变化、默认值变化 |
| `docs/runbooks/*.md` | 形成新操作流程、排障结论、灰度步骤、回滚路径 |
| `docs/architecture/*.md` | 架构边界、模块职责或治理规则变化 |
| `frontend/PROJECT.md` | 前端工程边界、事实源入口或关键承接方式变化 |

## 6. API 文档判断规则

### 6.1 必须更新

以下任一出现时，必须同步更新：

- 新增对外字段
- 变更既有字段语义
- 新增接口或删除接口
- 变更默认回退顺序
- 变更错误码、状态值或返回结构

涉及文件：

- `backend/BACKEND_API_DOC.md`
- `接口变动文档.md`

### 6.2 可不更新

以下场景可不更新接口文档，但应在 `CHANGELOG.md` 或专项设计稿说明：

- 纯文档治理
- 纯前端内部工具层整理
- 不影响对外契约的内部重构
- 只新增内部 runbook、模板或治理约束

建议统一写法：

- `本轮仅涉及文档治理，不改后端接口契约，因此不更新 接口变动文档.md`

## 7. 回写动作模板

````md
## 本轮回写检查

- 当前专项设计稿：已更新 / 不需要
- module-progress：已更新 / 不需要
- 项目进度文档：已更新 / 不需要
- CHANGELOG：已更新 / 不需要
- backlog：已更新 / 不需要
- 实施清单：已更新 / 不需要
- BACKEND_API_DOC：已更新 / 不需要
- 接口变动文档：已更新 / 不需要
- runbook：已更新 / 不需要
- 其他：

## 判断说明

- 本轮是否涉及接口契约变化：
- 本轮是否形成新 runbook 或模板资产：
- 本轮是否需要用户手工验证真实环境：
- 当前下一步建议：
````

## 8. 快速决策树

- 若本轮新增或修改了 `MEDIA-BPLUS-*` 设计边界：
  - 更新专项设计稿
  - 视情况更新 backlog 与实施清单
- 若本轮形成阶段结论：
  - 更新 `module-progress.md`
  - 更新 `项目进度文档.md`
  - 更新 `CHANGELOG.md`
- 若本轮改了后端对外契约：
  - 必须更新 `BACKEND_API_DOC.md`
  - 必须更新 `接口变动文档.md`
- 若本轮形成操作手册或模板：
  - 更新 `docs/runbooks/README.md`
  - 视情况在专项设计稿中补入口

## 9. 最低通过标准

一次任务可以判定为“文档回写合格”，至少满足：

- 当前事实源已同步
- `module-progress.md` 已同步
- `项目进度文档.md` 已同步
- `CHANGELOG.md` 已同步
- 已明确说明是否涉及接口契约变化
