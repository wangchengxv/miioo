# MEDIA-BPLUS 执行总入口

## 1. 文档定位

本文档用于作为 `MEDIA-BPLUS` 全链路的统一执行入口。

它不替代主方案、实施清单、backlog 或专项设计稿，而是负责把以下内容收口到一页：

- 先看什么
- 当前链路有哪些专项设计稿
- 当前有哪些可直接复用的治理模板
- 真正开始执行时建议按什么顺序推进
- 每轮结束后需要回写哪些文档

适用场景：

- 新接手者第一次进入 `MEDIA-BPLUS`
- 需要判断当前应该从 `10 / 20 / 30 / 40 / 50 / 60 / 70` 哪一段开始推进
- 需要在设计稿、runbook、回写文档之间快速导航

## 2. 推荐阅读顺序

统一按以下顺序阅读：

1. [生成资产前端访问体验方案B-生产级媒体资产管线升级.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/生成资产前端访问体验方案B-生产级媒体资产管线升级.md)
2. [生成资产前端访问体验方案B+实施清单.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/生成资产前端访问体验方案B+实施清单.md)
3. [backlog-media-pipeline-bplus.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/backlog-media-pipeline-bplus.md)
4. 当前正在推进的 `MEDIA-BPLUS-*` 专项设计稿
5. 对应 runbook 与模板资产
6. [module-progress.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/module-progress.md)
7. [项目进度文档.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/项目进度文档.md)
8. [CHANGELOG.md](file:///Users/xingyi/Desktop/迭代一版/CHANGELOG.md)

## 3. 主链路入口

| 层级 | 文档 | 作用 |
|---|---|---|
| 主方案 | [生成资产前端访问体验方案B-生产级媒体资产管线升级.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/生成资产前端访问体验方案B-生产级媒体资产管线升级.md) | 定义边界、目标态、原则与验收门槛 |
| 实施清单 | [生成资产前端访问体验方案B+实施清单.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/生成资产前端访问体验方案B+实施清单.md) | 定义阶段、包级边界、推进顺序与回写规则 |
| Backlog | [backlog-media-pipeline-bplus.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/backlog-media-pipeline-bplus.md) | 定义任务包、依赖、优先级和验收口径 |
| 进度摘要 | [module-progress.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/module-progress.md) | 记录模块级最新状态 |
| 接手总览 | [项目进度文档.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/项目进度文档.md) | 记录接手视角、阶段状态与阅读建议 |
| 变更留痕 | [CHANGELOG.md](file:///Users/xingyi/Desktop/迭代一版/CHANGELOG.md) | 记录按日期的关键变更 |

## 4. 专项设计稿导航

| 任务包 | 主题 | 设计稿 |
|---|---|---|
| `MEDIA-BPLUS-10` | 存储分层与签名下载 | [MEDIA-BPLUS-10-存储分层与签名下载实现设计.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/MEDIA-BPLUS-10-存储分层与签名下载实现设计.md) |
| `MEDIA-BPLUS-20` | 媒体任务中心与状态机 | [MEDIA-BPLUS-20-媒体任务中心与状态机实现设计.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/MEDIA-BPLUS-20-媒体任务中心与状态机实现设计.md) |
| `MEDIA-BPLUS-30` | 视频预览与 HLS 交付 | [MEDIA-BPLUS-30-视频预览与HLS交付实现设计.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/MEDIA-BPLUS-30-视频预览与HLS交付实现设计.md) |
| `MEDIA-BPLUS-40` | 图片多尺寸与现代格式 | [MEDIA-BPLUS-40-图片多尺寸与现代格式实现设计.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/MEDIA-BPLUS-40-图片多尺寸与现代格式实现设计.md) |
| `MEDIA-BPLUS-50` | 观测、Runbook 与灰度回滚 | [MEDIA-BPLUS-50-观测、Runbook与灰度回滚实现设计.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/MEDIA-BPLUS-50-观测、Runbook与灰度回滚实现设计.md) |
| `MEDIA-BPLUS-60` | 前端播放器与弱网降级 | [MEDIA-BPLUS-60-前端播放器与弱网降级实现设计.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/MEDIA-BPLUS-60-前端播放器与弱网降级实现设计.md) |
| `MEDIA-BPLUS-70` | 文档回写闭环与验收矩阵 | [MEDIA-BPLUS-70-文档回写闭环与验收矩阵实现设计.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/MEDIA-BPLUS-70-文档回写闭环与验收矩阵实现设计.md) |

## 4.1 当前开发任务单

当前已开始把专项设计稿继续下钻到可直接开工的开发任务单：

| 任务包 | 任务单 |
|---|---|
| `MEDIA-BPLUS-10` | [MEDIA-BPLUS-10-开发任务清单.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/MEDIA-BPLUS-10-开发任务清单.md) |

当前已进一步细化的首批编码计划：

- [MEDIA-BPLUS-10-首批实际编码计划.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/MEDIA-BPLUS-10-首批实际编码计划.md)

## 5. Runbook 与模板资产

当前与 `MEDIA-BPLUS` 直接相关的治理资产如下：

| 类型 | 文档 | 作用 |
|---|---|---|
| 首轮部署 | [production-deploy.md](file:///Users/xingyi/Desktop/迭代一版/docs/runbooks/production-deploy.md) | 固定 `www.miiooai.com` 主域复用、云端目录、Supervisor 与首轮 COS/CDN 上线前准备 |
| 验收模板 | [media-acceptance-checklist.md](file:///Users/xingyi/Desktop/迭代一版/docs/runbooks/media-acceptance-checklist.md) | 固定方案/实现/运行/文档/交接五层验收模板 |
| 交接模板 | [media-handover-template.md](file:///Users/xingyi/Desktop/迭代一版/docs/runbooks/media-handover-template.md) | 固定最小交接包与完整交接包 |
| 回写清单 | [media-doc-writeback-checklist.md](file:///Users/xingyi/Desktop/迭代一版/docs/runbooks/media-doc-writeback-checklist.md) | 固定文档回写顺序与 API 文档判断规则 |
| 标准闭环 | [task-workflow.md](file:///Users/xingyi/Desktop/迭代一版/docs/runbooks/task-workflow.md) | 固定从阅读到回写的标准流程 |
| 灰度入口 | [media-release-canary.md](file:///Users/xingyi/Desktop/迭代一版/docs/runbooks/media-release-canary.md) | 固定首轮放量顺序、止损条件与巡检入口 |
| 回滚入口 | [media-release-rollback.md](file:///Users/xingyi/Desktop/迭代一版/docs/runbooks/media-release-rollback.md) | 固定媒体专项止血、主域回退与缓存/配置回滚步骤 |
| 发布回滚 | [release-rollback.md](file:///Users/xingyi/Desktop/迭代一版/docs/runbooks/release-rollback.md) | 承接发布、回滚与排障入口 |

## 6. 当前推荐执行顺序

若后续准备按 B+ 正式推进，建议按以下顺序执行：

1. `阶段 0 / 生产基线冻结`
2. `MEDIA-BPLUS-10`
3. `MEDIA-BPLUS-30`
4. `MEDIA-BPLUS-50`
5. `MEDIA-BPLUS-20`
6. `MEDIA-BPLUS-40`
7. `MEDIA-BPLUS-60`
8. `MEDIA-BPLUS-70`

其中：

- 若当前任务是“第一次把 `www.miiooai.com` 收口为 COS/CDN 主域复用入口”，默认先读：
  1. [production-deploy.md](file:///Users/xingyi/Desktop/迭代一版/docs/runbooks/production-deploy.md)
  2. [MEDIA-BPLUS-10-存储分层与签名下载实现设计.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/MEDIA-BPLUS-10-存储分层与签名下载实现设计.md)
  3. [MEDIA-BPLUS-30-视频预览与HLS交付实现设计.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/MEDIA-BPLUS-30-视频预览与HLS交付实现设计.md)
  4. [media-release-canary.md](file:///Users/xingyi/Desktop/迭代一版/docs/runbooks/media-release-canary.md)
  5. [media-release-rollback.md](file:///Users/xingyi/Desktop/迭代一版/docs/runbooks/media-release-rollback.md)
- `MEDIA-BPLUS-50` 与 `MEDIA-BPLUS-70` 应伴随各阶段持续推进，不应等最后收尾再补。
- 若当前是纯治理或交接任务，可直接从 `MEDIA-BPLUS-70` 进入。
- 若当前是前端播放与展示升级，可优先看 `MEDIA-BPLUS-30 + 40 + 60`。

## 7. 场景速查

### 7.1 如果当前要做后端媒体交付

优先阅读：

1. `MEDIA-BPLUS-10`
2. `MEDIA-BPLUS-20`
3. `MEDIA-BPLUS-30`
4. `MEDIA-BPLUS-50`

### 7.2 如果当前要做前端媒体体验

优先阅读：

1. `MEDIA-BPLUS-30`
2. `MEDIA-BPLUS-40`
3. `MEDIA-BPLUS-60`
4. `MEDIA-BPLUS-50`

### 7.3 如果当前要做治理、验收、交接

优先阅读：

1. `MEDIA-BPLUS-70`
2. `media-acceptance-checklist.md`
3. `media-handover-template.md`
4. `media-doc-writeback-checklist.md`

## 8. 每轮完成后的最低回写

任意 `MEDIA-BPLUS-*` 阶段完成后，至少检查：

1. 当前专项设计稿是否需要同步
2. [module-progress.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/module-progress.md) 是否需要同步
3. [项目进度文档.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/项目进度文档.md) 是否需要同步
4. [CHANGELOG.md](file:///Users/xingyi/Desktop/迭代一版/CHANGELOG.md) 是否需要同步
5. 若涉及后端契约变化，[BACKEND_API_DOC.md](file:///Users/xingyi/Desktop/迭代一版/backend/BACKEND_API_DOC.md) 与 [接口变动文档.md](file:///Users/xingyi/Desktop/迭代一版/接口变动文档.md) 是否需要同步

推荐直接配合：

- [media-doc-writeback-checklist.md](file:///Users/xingyi/Desktop/迭代一版/docs/runbooks/media-doc-writeback-checklist.md)

## 9. 当前结论

到目前为止，`MEDIA-BPLUS` 已经形成完整的可执行分层：

- 主方案
- 实施清单
- backlog
- 专项设计稿
- runbook 模板资产
- progress 与 changelog 回写

因此后续再推进 `MEDIA-BPLUS`，默认不需要重新整理入口，只需要从本页进入，并按当前任务类型选择对应专项设计稿与 runbook 模板即可。
