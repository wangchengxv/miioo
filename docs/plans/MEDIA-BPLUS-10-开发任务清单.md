# MEDIA-BPLUS-10 开发任务清单

## 1. 文档定位

本文档用于把 [MEDIA-BPLUS-10-存储分层与签名下载实现设计.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/MEDIA-BPLUS-10-存储分层与签名下载实现设计.md) 继续下钻为可直接开工的开发任务单。

它不重复解释方案背景，而是只回答：

- 先做哪一步
- 每一步改哪些代码
- 每一步产出什么
- 每一步如何验收
- 每一步完成后要回写什么

## 2. 使用方式

建议按以下顺序使用：

1. 先阅读 [MEDIA-BPLUS-10-存储分层与签名下载实现设计.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/MEDIA-BPLUS-10-存储分层与签名下载实现设计.md)
2. 若准备直接进入首批编码，优先阅读 [MEDIA-BPLUS-10-首批实际编码计划.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/MEDIA-BPLUS-10-首批实际编码计划.md)
3. 再按本文档拆成具体开发任务
4. 每完成一组任务，配合 [media-acceptance-checklist.md](file:///Users/xingyi/Desktop/迭代一版/docs/runbooks/media-acceptance-checklist.md) 做阶段验收
5. 每轮完成后，配合 [media-doc-writeback-checklist.md](file:///Users/xingyi/Desktop/迭代一版/docs/runbooks/media-doc-writeback-checklist.md) 做文档回写

## 3. 开发边界

### 3.1 本轮要达到的目标

- 建立媒体对象描述、访问等级和访问解析的统一抽象层
- 让 `downloadUrl` 可以从“裸地址”升级为“受控入口”
- 保持前端页面层继续沿用既有 `downloadUrl` 语义
- 兼容当前本地 `/uploads` 和后续对象存储双模式

### 3.2 本轮不做

- 不直接落完整对象存储迁移
- 不直接落完整 CDN 体系
- 不直接改前端页面视觉或下载交互
- 不在本轮推进 HLS 与播放器能力

## 4. 任务拆分总览

| 任务编号 | 任务主题 | 类型 | 主要代码落点 | 前置依赖 |
|---|---|---|---|---|
| `MEDIA-BPLUS-10-DEV-01` | 建立对象描述抽象层 | 后端 | `media_storage.py`、新服务文件 | 无 |
| `MEDIA-BPLUS-10-DEV-02` | 建立访问等级与解析器 | 后端 | 新服务文件、`media_view_models.py` | `10-DEV-01` |
| `MEDIA-BPLUS-10-DEV-03` | 建立下载签名与 token 载荷 | 后端 | 新签名服务 | `10-DEV-02` |
| `MEDIA-BPLUS-10-DEV-04` | 建立统一受控下载入口 | 后端 | 新路由、现有资源路由 | `10-DEV-03` |
| `MEDIA-BPLUS-10-DEV-05` | 切换视图模型下载地址生成方式 | 后端 | `media_view_models.py` | `10-DEV-04` |
| `MEDIA-BPLUS-10-DEV-06` | 业务路由兼容与历史链路接入 | 后端 | `assets.py`、`creation.py`、`storyboards.py`、`subjects.py` | `10-DEV-05` |
| `MEDIA-BPLUS-10-DEV-07` | 配置、Runbook 与运维入口补齐 | 后端 + 文档 | 配置、runbook | `10-DEV-06` |
| `MEDIA-BPLUS-10-DEV-08` | 测试、验收与文档回写 | 后端 + 文档 | 测试文件、计划文档 | `10-DEV-07` |

## 5. 详细任务单

## 5.1 `MEDIA-BPLUS-10-DEV-01` 建立对象描述抽象层

### 目标

- 把当前“路径即访问地址”的隐式逻辑，收口为统一对象描述结构。

### 代码落点

- `backend/app/services/media_storage.py`
- `backend/app/services/media_object_descriptor.py`

### 任务项

- 为本地 `/uploads` 资源建立统一 descriptor 结构
- 为对象存储资源预留统一 descriptor 结构
- 统一 descriptor 字段命名：
  - `storage_mode`
  - `storage_bucket`
  - `storage_key`
  - `origin_storage_key`
  - `preview_storage_key`
  - `download_storage_key`
- 保持旧 metadata 兼容，不要求一次性清理旧字段

### 产出

- 新增 `media_object_descriptor.py`
- `media_storage.py` 可辅助构建本地对象描述信息

### 验收口径

- `/uploads` 与对象存储都能被统一描述
- 后续 resolver 不需要再直接猜底层路径类型

## 5.2 `MEDIA-BPLUS-10-DEV-02` 建立访问等级与解析器

### 目标

- 让“资源怎么访问”从视图拼装逻辑中分离出来。

### 代码落点

- `backend/app/services/media_access_policy.py`
- `backend/app/services/media_access_resolver.py`
- `backend/app/services/media_view_models.py`

### 任务项

- 固定访问等级：
  - `public_preview`
  - `authenticated_preview`
  - `controlled_download`
  - `internal_only`
- 建立访问等级判定函数
- 建立 preview / download 地址解析函数
- 让 `media_view_models.py` 不再直接默认回落原始 `file_url`

### 产出

- 新增 `media_access_policy.py`
- 新增 `media_access_resolver.py`
- `media_view_models.py` 接入 resolver

### 验收口径

- `previewUrl` 与 `downloadUrl` 的生成逻辑不再散落在视图层
- 原始 `file_url` 不再成为默认下载兜底第一选择

## 5.3 `MEDIA-BPLUS-10-DEV-03` 建立下载签名与 token 载荷

### 目标

- 让受控下载具备用户、资源、过期时间三类绑定能力。

### 代码落点

- `backend/app/services/media_download_signing.py`

### 任务项

- 建立下载 token 生成函数
- 建立下载 token 校验函数
- 固定 token 最小载荷：
  - `user_id`
  - `project_id`
  - `asset_id` 或业务资源 ID
  - `storage_key`
  - `access_level`
  - `issued_at`
  - `expires_at`
  - `nonce`
- 设计短效默认值与过期策略

### 产出

- 新增 `media_download_signing.py`
- 补齐配置项占位：
  - `MEDIA_DOWNLOAD_TOKEN_SECRET`
  - `MEDIA_DOWNLOAD_TOKEN_EXPIRE_SECONDS`

### 验收口径

- token 具备最小校验能力
- 下载签名不再是纯路径拼接

## 5.4 `MEDIA-BPLUS-10-DEV-04` 建立统一受控下载入口

### 目标

- 让 `downloadUrl` 可以无感切到统一受控下载链路。

### 代码落点

- `backend/app/routers/media_access.py`
- 路由注册入口

### 任务项

- 新增统一受控下载入口，例如：
  - `GET /api/media/downloads/{token}`
- 下载入口负责：
  - 校验 token
  - 校验登录态
  - 校验资源归属
  - 记录下载审计
  - 返回 302 或受控流转
- 首版优先实现“应用层校验 + 302 跳转”

### 产出

- 新增 `media_access.py`
- 路由注册到应用主入口

### 验收口径

- 前端不改下载交互，也能走受控下载
- Web 进程不需要长期承担大文件下载带宽

## 5.5 `MEDIA-BPLUS-10-DEV-05` 切换视图模型下载地址生成方式

### 目标

- 让 `downloadUrl` 从“裸对象地址”切换到“受控访问入口”。

### 代码落点

- `backend/app/services/media_view_models.py`
- 可能涉及 `media_derivative_pipeline.py`

### 任务项

- 将图片、视频、音频的 `download_url / downloadUrl` 统一改为走 resolver
- 保持 `downloadUrl` 字段名和前端消费语义不变
- 预览地址先按风险分层逐步切换，不要求本轮全部加签

### 产出

- 视图模型统一通过 resolver 生成 `downloadUrl`

### 验收口径

- 前端仍继续消费 `downloadUrl`
- `downloadUrl` 不再默认直指原始 `file_url`

## 5.6 `MEDIA-BPLUS-10-DEV-06` 业务路由兼容与历史链路接入

### 目标

- 让现有业务接口与下载入口平滑切换，不打断已有页面。

### 代码落点

- `backend/app/routers/assets.py`
- `backend/app/routers/creation.py`
- `backend/app/routers/storyboards.py`
- `backend/app/routers/subjects.py`

### 任务项

- 检查各业务接口的媒体字段生成是否都已切到 resolver
- 检查已有单独下载接口是否需要统一复用受控下载服务
- 明确哪些旧下载接口继续保留、哪些逐步收口到统一入口
- 保持历史 `/uploads` 数据在未迁移前仍可用

### 产出

- 业务路由与统一下载链路的兼容方案

### 验收口径

- 旧页面不因下载链路升级而失效
- 历史数据与新链路能并存

## 5.7 `MEDIA-BPLUS-10-DEV-07` 配置、Runbook 与运维入口补齐

### 目标

- 为后续混合承接、排障与回滚提供最小运行资产。

### 代码与文档落点

- 环境变量与配置说明
- `docs/runbooks/media-storage-migration.md`
- `docs/runbooks/media-download-signing.md`
- `docs/runbooks/media-cdn-invalidation.md`

### 任务项

- 补齐配置项说明：
  - `MEDIA_STORAGE_MODE`
  - `MEDIA_PUBLIC_BASE_URL`
  - `MEDIA_PRIVATE_DOWNLOAD_MODE`
  - `MEDIA_OBJECT_BUCKET_*`
  - `MEDIA_CDN_BASE_URL`
- 补齐 token 失效、302 异常、路径核对、兼容回退的 runbook
- 明确本地 `local` 与生产 `hybrid` 的默认建议

### 产出

- 配置说明
- 至少 1 到 3 份专项 runbook

### 验收口径

- 出现下载异常时有明确排障入口
- 生产切换不再只靠口头说明

## 5.8 `MEDIA-BPLUS-10-DEV-08` 测试、验收与文档回写

### 目标

- 让 `MEDIA-BPLUS-10` 不只“代码可跑”，还具备可验收、可交接、可回写闭环。

### 代码与文档落点

- 后端聚焦测试
- `docs/plans/module-progress.md`
- `docs/plans/项目进度文档.md`
- `CHANGELOG.md`
- 如涉及契约变化，再同步：
  - `backend/BACKEND_API_DOC.md`
  - `接口变动文档.md`

### 任务项

- 为 descriptor / resolver / signing service 补聚焦测试
- 为统一下载入口补聚焦测试
- 用 `media-acceptance-checklist.md` 做阶段验收
- 用 `media-handover-template.md` 做交接包
- 用 `media-doc-writeback-checklist.md` 做回写检查

### 验收口径

- 测试覆盖关键抽象与下载入口
- 本轮文档回写完整
- 能明确说明是否涉及 API 契约变化

## 6. 推荐实施顺序

建议严格按以下顺序推进：

1. `10-DEV-01`
2. `10-DEV-02`
3. `10-DEV-03`
4. `10-DEV-04`
5. `10-DEV-05`
6. `10-DEV-06`
7. `10-DEV-07`
8. `10-DEV-08`

不要反过来先改业务路由或先改前端页面。

## 7. 每阶段完成后的最低回写

每完成一组任务后，至少检查：

1. 当前任务清单是否需要更新状态
2. `MEDIA-BPLUS-10` 设计稿是否需要补充新事实
3. `module-progress.md` 是否需要同步
4. `项目进度文档.md` 是否需要同步
5. `CHANGELOG.md` 是否需要同步
6. 若涉及对外契约变化，是否需要同步 `BACKEND_API_DOC.md` 与 `接口变动文档.md`

## 8. 当前结论

`MEDIA-BPLUS-10` 到这里已经不只是“有设计稿”，而是已经具备一份可直接进入实施的开发任务单。

后续真正开工时，建议不要再从大方案重新拆，而是直接按本文档从：

- descriptor
- access policy
- resolver
- signing
- controlled download
- route integration
- runbook
- acceptance

这条链路逐步推进。
