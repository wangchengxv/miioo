# MEDIA-BPLUS-10 首批实际编码计划

## 1. 文档定位

本文档用于把 [MEDIA-BPLUS-10-开发任务清单.md](file:///Users/xingyi/Desktop/迭代一版/docs/plans/MEDIA-BPLUS-10-开发任务清单.md) 中的：

- `MEDIA-BPLUS-10-DEV-01`
- `MEDIA-BPLUS-10-DEV-02`
- `MEDIA-BPLUS-10-DEV-03`

进一步压缩为第一批可直接编码的实施计划。

本计划只覆盖首批基础抽象层，不覆盖：

- 统一受控下载入口
- 业务路由接线
- 运行手册补齐
- 生产切换

## 1.1 当前落地状态

`2026-06-19` 已完成首批基础服务层真实代码落地，当前已新增或改动：

- `backend/app/services/media_object_descriptor.py`
- `backend/app/services/media_access_policy.py`
- `backend/app/services/media_access_resolver.py`
- `backend/app/services/media_download_signing.py`
- `backend/app/services/media_view_models.py`
- `backend/app/services/media_storage.py`
- `backend/app/config.py`

当前仍未落地：

- 业务二进制下载接口统一收口
- 对象存储签名直出

当前已进一步收口：

- 部分老单资源下载接口已开始复用同一套受控下载目标解析逻辑
- `backend/app/routers/assets.py` 的 `GET /api/assets/{asset_id}/download` 已纳入同一套统一解析链路，并保留 `prefer_origin` 查询参数语义
- `backend/app/routers/projects.py`、`backend/app/routers/workbench.py`、`backend/app/routers/creation.py` 的部分批量 ZIP 下载接口已开始在打包前复用统一 `download_url` 解析与受控目标校验
- `backend/app/routers/storyboards.py` 的 `POST /download/images`、`POST /download/videos`、`POST /download/bundle` 也已纳入同一套统一解析链路，并保留原有 ZIP 结构与 manifest 语义
- `backend/app/services/media_download_audit.py` 已落地首版日志级下载审计，并接入 `backend/app/routers/media_access.py` 与 `backend/app/services/media_download_runtime.py`
- 但仍有历史下载入口尚未完全统一到同一个下载服务层，下载审计尚未沉到独立存储，对象存储直签也尚未落地

## 2. 当前代码事实

基于当前仓库，首批编码计划直接依赖以下事实：

- [media_storage.py](file:///Users/xingyi/Desktop/迭代一版/backend/app/services/media_storage.py) 当前已经具备：
  - `/uploads` 本地托管路径构建
  - 路径解析
  - 外链持久化
  - `storage_mode=managed_upload` 的 metadata 落点
- [media_view_models.py](file:///Users/xingyi/Desktop/迭代一版/backend/app/services/media_view_models.py) 当前仍直接把：
  - `download_url -> origin_url -> file_url`
  - `preview_url -> file_url`
  当作默认回退顺序
- 当前仓内还没有：
  - `media_object_descriptor.py`
  - `media_access_policy.py`
  - `media_access_resolver.py`
  - `media_download_signing.py`

因此首批编码应优先补“抽象层与服务层”，而不是直接改业务路由。

## 3. 首批编码目标

首批完成后，至少达到：

1. 后端已经有统一对象描述结构
2. 后端已经有统一访问等级判定函数
3. 后端已经有统一 preview / download 解析器
4. 后端已经有下载 token 生成与校验能力
5. `media_view_models.py` 已能调用 resolver 生成地址
6. 但对外接口路径和业务路由可以暂时保持不变

## 4. 本批次不做

- 不新增 `GET /api/media/downloads/{token}`
- 不让任何业务路由切到新下载入口
- 不让前端页面做任何字段适配改动
- 不做对象存储 SDK 接入
- 不补 HLS、CDN、删除失效链路

## 5. 编码顺序

严格建议按以下顺序实施：

1. `BATCH1-01`：补对象描述服务
2. `BATCH1-02`：补访问等级服务
3. `BATCH1-03`：补地址解析服务
4. `BATCH1-04`：补下载签名服务
5. `BATCH1-05`：接入 `media_view_models.py`
6. `BATCH1-06`：补测试与文档回写

## 6. 详细编码计划

## 6.1 `BATCH1-01` 补对象描述服务

### 目标

- 让本地 `/uploads` 和后续对象存储都能被统一描述。

### 新增文件

- `backend/app/services/media_object_descriptor.py`

### 计划提供的核心函数

```python
def build_local_object_descriptor(url: str | None, metadata: dict | None = None) -> dict | None: ...
def build_object_storage_descriptor(
    *,
    bucket: str | None,
    key: str | None,
    metadata: dict | None = None,
) -> dict | None: ...
def build_media_object_descriptor(
    *,
    url: str | None,
    metadata: dict | None = None,
) -> dict | None: ...
```

### 统一 descriptor 结构

建议首版最少返回：

```json
{
  "storage_mode": "managed_upload",
  "storage_bucket": null,
  "storage_key": "storyboards/abc/file.png",
  "origin_storage_key": null,
  "preview_storage_key": null,
  "download_storage_key": null,
  "source_url": "/uploads/storyboards/abc/file.png",
  "is_local_upload": true
}
```

### 实施规则

- 若 `url` 是 `/uploads/...`，优先构建本地 descriptor
- 若 metadata 中已有 `storage_bucket / storage_key`，优先构建对象存储 descriptor
- 若两者都没有，则返回 `None`
- 首版不做复杂 schema 类，先用轻量 `dict` 即可

### 相关文件微调

- `media_storage.py`

建议只补最小辅助函数，不做大改：

- 复用 `extract_managed_or_private_upload_url()`
- 若需要，新增一个从 `/uploads/...` 推导相对 key 的小辅助函数

### 验收口径

- 本地托管上传资源可被稳定描述
- 后续 resolver 不再需要直接依赖原始 URL 字符串做过多判断

## 6.2 `BATCH1-02` 补访问等级服务

### 目标

- 固定资源访问等级，不再让视图层隐式决定“这个地址该不该直接暴露”。

### 新增文件

- `backend/app/services/media_access_policy.py`

### 计划提供的核心函数

```python
def resolve_media_access_level(
    *,
    media_type: str,
    usage: str,
    is_original: bool,
) -> str: ...
```

### 首版判定规则

- 图片：
  - `preview` 默认 `public_preview`
  - `download` 且原图默认 `controlled_download`
- 视频：
  - `preview` 默认 `authenticated_preview`
  - `download` 且原始视频默认 `controlled_download`
- 音频：
  - `preview` 默认 `authenticated_preview`
  - `download` 且原始音频默认 `controlled_download`
- 中间产物：
  - `internal_only`

### 首版限制

- 先把规则写死在服务里
- 不在本批次引入配置化策略
- 不在本批次处理项目级细粒度权限差异

### 验收口径

- `public_preview / authenticated_preview / controlled_download / internal_only` 四类有统一判定入口
- 视图层不再直接推导访问等级

## 6.3 `BATCH1-03` 补地址解析服务

### 目标

- 统一从 descriptor + access policy 生成 preview / download 地址。

### 新增文件

- `backend/app/services/media_access_resolver.py`

### 计划提供的核心函数

```python
def resolve_preview_url(
    descriptor: dict | None,
    *,
    metadata: dict | None = None,
    fallback_url: str | None = None,
    media_type: str | None = None,
) -> str | None: ...

def resolve_download_url(
    descriptor: dict | None,
    *,
    metadata: dict | None = None,
    fallback_url: str | None = None,
    media_type: str | None = None,
) -> str | None: ...
```

### 首版解析规则

#### preview

- 若 metadata 已有 `preview_url / preview_video_url / poster_url`，优先返回已有值
- 若 descriptor 是本地 `/uploads`，首版 preview 仍允许回落到本地地址
- 若 descriptor 是对象存储且已存在 `cdn_url`，优先返回 `cdn_url`
- 若没有任何结果，再回落 `fallback_url`

#### download

- 若 metadata 已存在 `download_url` 且明显已是受控地址，先保留
- 若 descriptor 存在但首版还没接统一下载入口，则暂时回落：
  - `origin_url`
  - `fallback_url`
- 但函数内部结构必须为下一批接入 token 下载预留位置

### 核心要求

- 虽然首版 download 还可能回落旧地址，但回落逻辑必须集中在 resolver 中
- `media_view_models.py` 后续不再自己拼装 `download_url`

### 验收口径

- preview / download 地址都有统一解析入口
- 视图模型不再自己维护复杂回退链

## 6.4 `BATCH1-04` 补下载签名服务

### 目标

- 为下一批统一下载入口准备 token 能力，但本批次先只完成服务层。

### 新增文件

- `backend/app/services/media_download_signing.py`

### 计划提供的核心函数

```python
def issue_download_token(
    *,
    user_id: str | int,
    project_id: str | int | None,
    resource_id: str,
    storage_key: str,
    access_level: str,
    expires_in: int | None = None,
) -> str: ...

def verify_download_token(token: str) -> dict: ...
```

### token 最小载荷

- `user_id`
- `project_id`
- `resource_id`
- `storage_key`
- `access_level`
- `issued_at`
- `expires_at`
- `nonce`

### 配置依赖

建议先读取：

- `MEDIA_DOWNLOAD_TOKEN_SECRET`
- `MEDIA_DOWNLOAD_TOKEN_EXPIRE_SECONDS`

若当前配置层未提供，可先在配置文件中补默认占位，但不在本批次启用真实生产切换。

### 首版要求

- 能签发
- 能校验
- 能判断过期
- 出错时有明确异常或返回结构

### 验收口径

- token 不再是简单路径字符串
- 下一批接统一下载入口时不需要再重新设计载荷

## 6.5 `BATCH1-05` 接入视图模型

### 目标

- 让抽象层开始真正进入当前媒体字段输出链路。

### 修改文件

- `backend/app/services/media_view_models.py`

### 修改原则

- 不改对外字段名
- 只改内部生成逻辑
- 保持当前前端消费不受影响

### 具体调整

#### 图片

- 先通过 descriptor 构建对象描述
- `preview_url` 改由 resolver 生成
- `download_url` 改由 resolver 生成

#### 视频

- `preview_video_url` 继续优先 `metadata.preview_video_url / preview_url`
- `download_url` 改由 resolver 生成

#### 音频

- `preview_url` 改由 resolver 统一处理
- `download_url` 改由 resolver 统一处理

### 验收口径

- `media_view_models.py` 不再自己维护完整下载回退链
- 当前字段输出结构保持稳定

## 6.6 `BATCH1-06` 测试与回写

### 测试建议

建议新增聚焦测试：

- `backend/tests/test_media_object_descriptor.py`
- `backend/tests/test_media_access_policy.py`
- `backend/tests/test_media_access_resolver.py`
- `backend/tests/test_media_download_signing.py`
- 如有必要，再补：
  - `backend/tests/test_media_view_models.py`

### 最低测试覆盖

- 本地 `/uploads` descriptor 构建
- metadata 对象存储 descriptor 构建
- 访问等级判定
- resolver 的 preview / download 回退顺序
- token 签发与校验
- token 过期判断

### 文档回写

完成本批次后，至少检查：

- `MEDIA-BPLUS-10-存储分层与签名下载实现设计.md`
- `MEDIA-BPLUS-10-开发任务清单.md`
- `docs/plans/module-progress.md`
- `docs/plans/项目进度文档.md`
- `CHANGELOG.md`

若本批次只是服务层抽象接入、未新增对外接口：

- 明确写“本轮不更新 `BACKEND_API_DOC.md` 与 `接口变动文档.md`”

## 7. 建议改动顺序到文件级

建议按以下顺序实际落码：

1. 新增 `media_object_descriptor.py`
2. 新增 `media_access_policy.py`
3. 新增 `media_access_resolver.py`
4. 新增 `media_download_signing.py`
5. 最后修改 `media_view_models.py`
6. 再补测试

不要先改 `media_view_models.py`，否则容易把旧回退链改乱。

## 8. 风险与回滚

### 风险 1

- resolver 接入过早，导致现有图片/视频/音频字段空值回退异常

### 风险 2

- token 服务先落地但尚未接业务路由，容易出现“代码有了但没人调用”的误解

### 风险 3

- 对象存储 descriptor 结构设计过重，反而拖慢首批实现

### 首版回滚策略

- 若 resolver 接入后字段异常，先回滚 `media_view_models.py` 的接线
- descriptor / policy / signing 服务文件可保留，不必整体删除
- 保持新增服务尽量独立，避免大面积侵入现有业务路由

## 9. 当前结论

`MEDIA-BPLUS-10-DEV-01 ~ 10-DEV-03` 的首批编码核心，不是“立刻切对象存储”，而是先把下面四层抽出来：

- object descriptor
- access policy
- access resolver
- download signing

只要这一批抽象层稳定落地，下一批：

- 统一受控下载入口
- 业务路由切换
- 本地 `/uploads` 与对象存储混合承接

就能在不打乱现有页面语义的前提下继续往前推。
