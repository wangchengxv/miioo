# MEDIA-BPLUS-10：存储分层与签名下载实现设计

## 1. 文档定位

本文档是 `MEDIA-BPLUS-10` 任务包的实现设计稿，用于把“存储分层与签名下载”从 backlog 层继续下钻到接口、服务、配置、对象 key 规则、鉴权流程与 Runbook 落点层。

对应上层事实源：

- `docs/plans/生成资产前端访问体验方案B-生产级媒体资产管线升级.md`
- `docs/plans/生成资产前端访问体验方案B+实施清单.md`
- `docs/plans/backlog-media-pipeline-bplus.md`
- `docs/plans/MEDIA-BPLUS-10-开发任务清单.md`

## 2. 当前代码事实

基于当前仓库，和 `MEDIA-BPLUS-10` 直接相关的实现事实如下：

- 当前本地与生产基线都仍以 `/uploads/...` 路径作为托管媒体地址核心语义，见 `backend/app/services/media_storage.py`。
- `build_upload_url()` 直接生成 `/uploads/...` 相对路径，`resolve_upload_path()` 和 `delete_managed_upload()` 都围绕本地目录进行解析和删除。
- `build_image_media_fields()`、`build_video_media_fields()`、`build_audio_media_fields()` 当前默认把 `download_url` 回落到 `file_url` 或 `origin_url`，这意味着“原始下载地址 = 媒体实际存储地址”的旧口径仍然存在。
- 多个页面当前直接消费 `downloadUrl`，并默认认为它可以直接触发浏览器下载，因此后续升级不能粗暴改变该字段含义。
- 当前已有多处“后端代下再回传”的下载接口，例如分镜和主体的下载接口，这说明“下载受控化”在项目里是可以被接受的，不是完全新概念。
- 当前仓库已经补入 `MEDIA_STORAGE_MODE`、`MEDIA_PUBLIC_BASE_URL`、`MEDIA_CDN_BASE_URL`、腾讯云 COS `region/secret/bucket/prefix` 等配置骨架，`media_object_descriptor.py`、`media_access_resolver.py`、`media_download_runtime.py` 也已能在 metadata 只提供 `bucket/key` 时统一推导对象存储地址。
- 当前首轮部署口径已固定为“仅复用 `www.miiooai.com` 一个后端域名”：对象存储源站默认经 `https://www.miiooai.com/media/origin/<bucket>/<key>` 暴露，公开预览与视频/HLS 默认经 `https://www.miiooai.com/media/cdn/<bucket>/<key>` 暴露；`backend/nginx/miiooai.conf` 与 `backend/deploy/supervisor/miioo-backend.conf` 已同步收口这套模板骨架。

因此，`MEDIA-BPLUS-10` 的设计核心不是马上切掉 `/uploads`，而是先把“存储位置”与“对外访问地址”解耦，再渐进切到对象存储和签名下载。

## 3. 目标与不做事项

### 3.1 目标

- 保持前端 `downloadUrl` 字段语义不变，但逐步把其底层实现从“裸地址”升级为“受控访问地址”。
- 让图片、视频、音频的预览与下载可以区分访问等级，而不再全部默认为同一条静态文件路径。
- 为后续对象存储、CDN、HLS 和删除治理建立统一 key 规范与元数据规范。
- 保证当前 `/uploads` 仍可作为本地开发和过渡阶段存储层，不阻断现有流程。

### 3.2 当前阶段不做

- 不在本轮设计里直接定义完整 HLS 播放架构，那属于 `MEDIA-BPLUS-30`。
- 不在本轮直接改动前端页面视觉或组件结构。
- 不要求一开始就把所有预览资源都切成签名资源。
- 不要求一次性把所有历史 `/uploads` 数据迁移到对象存储。

## 4. 设计原则

### 4.1 字段语义稳定，底层交付升级

- `previewUrl / previewVideoUrl / posterUrl / downloadUrl` 的前端消费语义保持不变。
- 优先升级后端生成这些字段的方式，而不是让页面层新增复杂判断。

### 4.2 存储位置与访问入口分离

- 数据库存“对象定位信息”和“访问策略信息”。
- 前端拿到的是“当前可访问入口”，而不是底层真实对象位置。

### 4.3 本地过渡兼容

- 本地开发和部分历史数据继续允许 `/uploads`。
- 设计必须允许同一套视图模型同时兼容：
  - 本地托管上传
  - 对象存储
  - 受控签名下载

### 4.4 下载链路优先受控

- `downloadUrl` 优先进入受控化。
- `previewUrl` 相关资源按风险分层逐步治理，不一次性全量加签。

## 5. 目标态架构

`MEDIA-BPLUS-10` 建议拆成四层：

- `Storage Descriptor`
  - 存储对象的真实定位信息
- `Access Policy`
  - 决定该对象属于公开预览、登录态预览、受控下载还是内部回源
- `Access Resolver`
  - 根据对象描述与访问策略生成对外地址
- `Delivery Endpoint / Signed URL`
  - 实际返回给前端的 `downloadUrl / previewUrl`

也就是说，后续数据库或元数据里不再只存一个“能直接访问的 url”，而是要能区分：

- 真实对象在哪里
- 对外该怎么访问
- 当前返回给前端的入口是什么

## 6. 对象 key 规则

### 6.1 顶层命名

建议对象路径固定按以下前缀组织：

- `raw/`
- `preview/`
- `derived/`
- `hls/`
- `private-download/`

### 6.2 二级路径规则

建议统一按业务域组织：

- `projects/{project_id}/...`
- `subjects/{subject_id}/...`
- `storyboards/{storyboard_id}/...`
- `assets/{asset_id}/...`
- `users/{user_id}/...`

### 6.3 推荐 key 示例

图片原图：

```text
raw/projects/{project_id}/assets/{asset_id}/original/{uuid}.png
```

图片预览：

```text
preview/projects/{project_id}/assets/{asset_id}/image/preview_{size}.webp
```

视频原始文件：

```text
raw/projects/{project_id}/assets/{asset_id}/video/source/{uuid}.mp4
```

视频预览文件：

```text
preview/projects/{project_id}/assets/{asset_id}/video/preview.mp4
```

受控下载文件：

```text
private-download/projects/{project_id}/assets/{asset_id}/download/source.mp4
```

### 6.4 命名原则

- key 可从路径直接判断资源类型、访问等级和业务归属。
- key 中不直接暴露用户可猜测的连续整数编号作为唯一凭据。
- 真实对象名使用 `uuid` 或稳定哈希，避免覆盖与猜路径。

## 7. 元数据模型设计

### 7.1 新增推荐元数据字段

建议在现有媒体 metadata 中逐步补齐以下字段：

- `storage_mode`
  - `managed_upload`
  - `object_storage`
- `storage_bucket`
  - 对象存储桶或逻辑桶名
- `storage_key`
  - 对象 key
- `storage_region`
  - 可选
- `access_level`
  - `public_preview`
  - `authenticated_preview`
  - `controlled_download`
  - `internal_only`
- `origin_storage_key`
  - 原始对象 key
- `preview_storage_key`
  - 预览对象 key
- `download_storage_key`
  - 下载对象 key
- `cdn_url`
  - 可选，缓存公开资源的稳定地址
- `signed_url_expires_at`
  - 当前已发放签名地址的失效时间
- `access_audit_required`
  - 是否需要记录下载审计

### 7.2 与现有 metadata 的兼容

当前已有：

- `storage_mode`
- `origin_url`
- `download_url`
- `preview_url`

设计建议不是立即删掉旧字段，而是按下述顺序兼容：

1. 继续保留 `download_url / preview_url` 作为视图模型输入源。
2. 逐步补充 `storage_key / access_level / storage_bucket`。
3. 由统一的访问解析服务生成最终对外地址。

## 8. 服务拆分设计

## 8.1 建议新增服务

### `backend/app/services/media_access_policy.py`

职责：

- 根据媒体类型、资源用途和业务场景返回访问等级
- 决定哪些资源默认公开，哪些资源必须受控

建议接口：

```python
def resolve_media_access_level(*, media_type: str, usage: str, is_original: bool) -> str: ...
```

### `backend/app/services/media_object_descriptor.py`

职责：

- 统一构建和解析对象描述信息
- 把 `/uploads` 地址和对象存储描述抽象到同一结构

建议接口：

```python
def build_local_object_descriptor(url: str, metadata: dict | None) -> dict: ...
def build_object_storage_descriptor(*, bucket: str, key: str, metadata: dict | None) -> dict: ...
```

### `backend/app/services/media_access_resolver.py`

职责：

- 根据对象描述和访问策略生成最终对外地址
- 兼容本地 `/uploads`、对象存储公开地址、签名地址和后端受控下载入口

建议接口：

```python
def resolve_preview_url(descriptor: dict, *, user_id: int | None = None) -> str | None: ...
def resolve_download_url(descriptor: dict, *, user_id: int | None = None) -> str | None: ...
```

### `backend/app/services/media_download_signing.py`

职责：

- 生成短时下载 token 或对象存储签名 URL
- 校验签名参数
- 提供签名载荷格式

建议接口：

```python
def issue_download_token(*, subject_type: str, subject_id: int, user_id: int, storage_key: str, expires_in: int) -> str: ...
def verify_download_token(token: str) -> dict: ...
```

## 8.2 对现有服务的调整建议

### `media_storage.py`

保留职责：

- 本地上传落盘
- 本地路径解析
- 开发态 `/uploads` 兼容

新增建议：

- 不再直接承担“对外访问地址就是底层存储地址”的默认假设
- 新增 descriptor 构建辅助函数

### `media_view_models.py`

当前问题：

- `download_url` 过于容易回落到 `file_url`

调整建议：

- 由 `media_access_resolver` 生成 `download_url`
- 由 `media_access_resolver` 生成 `preview_url / preview_video_url`
- `media_view_models.py` 仅负责视图字段拼装，不再自行决定访问策略

## 9. 接口设计建议

## 9.1 设计目标

尽量不破坏前端现有字段消费方式，但允许后端内部从“静态路径”升级到“受控入口”。

## 9.2 推荐两阶段方案

### 阶段 A：先不改前端调用模式

- 保持现有视图模型仍返回 `downloadUrl`
- 但 `downloadUrl` 的值从裸 `/uploads/...` 逐步升级为：

```text
/api/media/downloads/{token}
```

或：

```text
https://cdn-or-storage/...signed...
```

优点：

- 前端几乎无感
- 页面下载逻辑可继续沿用

### 阶段 B：按需增加显式签名接口

若后续需要更强控制，再补充：

- `POST /api/media/access/sign`
- `POST /api/media/access/batch-sign`

适用场景：

- 批量下载
- 临时导出包
- 多资源并发签名

## 9.3 推荐首版受控下载接口

建议后续增加统一入口：

```text
GET /api/media/downloads/{token}
```

职责：

- 校验 token
- 校验登录态与资源归属
- 记录下载审计
- 决定是：
  - 302 跳转到对象存储签名 URL
  - 302 跳转到本地受控地址
  - 或由后端流式转发

首版更推荐：

- 应用层校验
- 然后 302 到真实对象地址

原因：

- 避免 Web 进程长期承担大文件下载带宽
- 保留权限控制与审计

## 10. token 载荷设计

建议 token 最少绑定：

- `user_id`
- `project_id`
- `asset_id` 或业务资源 ID
- `storage_key`
- `access_level`
- `issued_at`
- `expires_at`
- `nonce`

建议能力：

- 默认短效，例如 `60s ~ 300s`
- 可选单次使用
- 可校验当前登录用户是否与发放用户一致

## 11. 访问等级设计

建议固定四类：

### `public_preview`

- 用于低风险预览资源
- 可直接返回 CDN 地址

### `authenticated_preview`

- 用于登录后可见的预览资源
- 首版可继续保持受控较弱，但需预留签名能力

### `controlled_download`

- 用于原始文件和导出包
- 必须通过 token 或对象存储签名访问

### `internal_only`

- 用于中间产物、回源临时文件
- 绝不直接暴露给前端

## 12. 下载流程设计

推荐首版流程：

1. 用户访问页面接口。
2. 页面从视图模型拿到 `downloadUrl`。
3. `downloadUrl` 实际为受控下载入口或短时签名地址。
4. 若为受控入口，则后端：
   - 校验用户身份
   - 校验资源归属
   - 记录审计
   - 返回 302 到真实下载地址
5. 浏览器下载真实对象。

### 12.1 审计字段建议

- `resource_type`
- `resource_id`
- `project_id`
- `user_id`
- `storage_key`
- `client_ip`
- `user_agent`
- `issued_at`
- `download_started_at`

## 13. 配置项设计

建议后续新增以下配置：

- `MEDIA_STORAGE_MODE`
  - `local`
  - `hybrid`
  - `object_storage`
- `MEDIA_PUBLIC_BASE_URL`
  - 公开预览资源基地址
- `MEDIA_PRIVATE_DOWNLOAD_MODE`
  - `redirect_signed`
  - `proxy_stream`
- `MEDIA_DOWNLOAD_TOKEN_SECRET`
- `MEDIA_DOWNLOAD_TOKEN_EXPIRE_SECONDS`
- `MEDIA_OBJECT_BUCKET_RAW`
- `MEDIA_OBJECT_BUCKET_PREVIEW`
- `MEDIA_OBJECT_BUCKET_PRIVATE`
- `MEDIA_CDN_BASE_URL`

设计原则：

- 本地开发默认可回退到 `local`
- 生产建议从 `hybrid` 起步，而不是一步切到 `object_storage`
- 当前第一轮真实执行时，建议先把所有对象存储变量显式写进 `.env` 与 Supervisor，再在 COS/CDN 回源与 Nginx 主域路径都替换完成后，把 `MEDIA_STORAGE_MODE` 从 `local` 切到 `hybrid`

## 14. 分阶段落地建议

### 阶段 1：抽象访问解析层

- 不改对外接口
- 先新增 descriptor / access policy / access resolver
- 让 `media_view_models.py` 不再直接回落原始 `file_url`

### 阶段 2：下载链路受控化

- `downloadUrl` 切到后端受控入口
- 加入 token 校验与审计

### 阶段 3：对象存储混合承接

- 新生成资源逐步写入对象存储
- 历史 `/uploads` 继续兼容

### 阶段 4：公开预览与受控下载完全分层

- 预览优先 CDN
- 下载统一受控

## 15. 代码落点清单

优先落点：

- `backend/app/services/media_storage.py`
- `backend/app/services/media_view_models.py`
- `backend/app/routers/assets.py`
- `backend/app/routers/creation.py`
- `backend/app/routers/storyboards.py`
- `backend/app/routers/subjects.py`

建议新增：

- `backend/app/services/media_access_policy.py`
- `backend/app/services/media_object_descriptor.py`
- `backend/app/services/media_access_resolver.py`
- `backend/app/services/media_download_signing.py`
- 后续统一下载入口路由，如 `backend/app/routers/media_access.py`

## 16. Runbook 落点

后续与 `MEDIA-BPLUS-10` 直接相关的运行手册建议补到：

- `docs/runbooks/media-storage-migration.md`
- `docs/runbooks/media-download-signing.md`
- `docs/runbooks/media-cdn-invalidation.md`

建议 Runbook 至少覆盖：

- token 失效排查
- 受控下载 302 异常排查
- 对象存储路径核对
- 历史 `/uploads` 兼容回退
- 删除资源后的缓存失效检查

当前已落仓：

- `docs/runbooks/media-storage-migration.md`
- `docs/runbooks/media-download-signing.md`
- `docs/runbooks/media-cdn-invalidation.md`

## 17. 验收标准

完成 `MEDIA-BPLUS-10` 首版设计与实现后，至少满足：

- `downloadUrl` 不再默认等于原始 `file_url`
- 前端仍可继续按原有语义消费 `downloadUrl`
- 本地 `/uploads` 资源与对象存储资源可被同一套 resolver 承接
- 下载链路具备用户、资源、过期时间三个维度的绑定能力
- 删除链路已具备对象、缓存、审计三层治理边界

## 18. 当前结论

`MEDIA-BPLUS-10` 最关键的设计，不是“立刻把所有文件迁到对象存储”，而是先把“存储位置”和“访问入口”从语义上拆开。

只要这个抽象层建起来，后续无论底层仍是 `/uploads`、切到对象存储，还是升级为 CDN + 签名下载，前端都可以继续沿用当前的媒体字段语义，后端也能在不破坏页面层的前提下逐步完成企业级媒体访问链路升级。
