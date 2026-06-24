# MEDIA-BPLUS-40：图片多尺寸与现代格式实现设计

## 1. 文档定位

本文档是 `MEDIA-BPLUS-40` 任务包的实现设计稿，用于把“图片多尺寸与现代格式”从 backlog 层继续下钻到字段契约、图片变体、格式策略、任务接线、前端消费顺序、缓存与回退规则、代码落点与 Runbook 层。

对应上层事实源：

- `docs/plans/生成资产前端访问体验方案B-生产级媒体资产管线升级.md`
- `docs/plans/生成资产前端访问体验方案B+实施清单.md`
- `docs/plans/backlog-media-pipeline-bplus.md`
- `docs/plans/MEDIA-BPLUS-10-存储分层与签名下载实现设计.md`
- `docs/plans/MEDIA-BPLUS-20-媒体任务中心与状态机实现设计.md`

## 2. 当前代码事实

基于当前仓库，和 `MEDIA-BPLUS-40` 直接相关的事实如下：

- 后端当前图片视图模型已经统一输出 `thumbnail_url / preview_url / download_url`，见 `backend/app/services/media_view_models.py`，但还没有 `largeUrl`、格式候选集或图片尺寸索引契约。
- `build_image_media_fields()` 当前仍会把 `preview_url` 和 `download_url` 大范围回落到原始 `file_url`，这意味着“详情预览”和“原图下载”虽然字段已分语义，但底层仍经常指向同一份源文件。
- `backend/app/services/image_derivatives.py` 已经具备图片派生能力，当前固定生成：
  - `card_square`
  - `card_landscape`
  - `preview_contain`
  且输出格式默认是 `AVIF`。
- `backend/app/services/media_derivative_pipeline.py` 当前会在图片链路里生成缩略图与预览图，并把 `thumbnail_variant / thumbnail_format / preview_variant / preview_format / preview_width / preview_height` 等元数据写入 metadata，但还没有 `large` 变体、格式候选清单和任务化索引写回。
- `backend/app/schemas/asset.py` 目前对外契约仍停留在 `previewUrl / downloadUrl / previewReady` 等基础字段，没有专门的大图查看字段。
- 前端统一图片模型 `frontend/src/utils/mediaItem.js` 目前只收口：
  - `imageUrl`
  - `thumbnailUrl`
  - `previewUrl`
  - `downloadUrl`
  并且 `getMediaCardImageUrl()` 与 `getMediaDetailImageUrl()` 还没有区分“详情预览图”和“放大查看大图”。
- `frontend/src/utils/mediaPresentation.js` 已把图片卡片和详情取图逻辑统一成 getter，但当前 getter 仍只围绕 `thumbnailUrl / previewUrl`，没有为 `<picture>`、`srcset` 或大图渐进切换预留承接位。
- 多个页面虽已开始复用统一 getter，但 `CreationPage.jsx`、`StoryboardPage.jsx` 等位置仍可见局部图片字段兼容回退，说明若未来要引入 `largeUrl`、多格式和响应式来源，必须继续收口到适配层与工具层，而不是扩散到页面 JSX。
- 当前不同上传入口对图片输入格式的接受范围并不完全一致：仓内已经出现 `image/avif`、`image/webp` 的部分支持，但并未形成统一的“输入可接受格式”和“输出派生格式”治理口径。

因此，`MEDIA-BPLUS-40` 的目标不是重做图片查看 UI，而是在保持现有卡片、详情、下载语义稳定的基础上，把图片交付从“原图或单一预览图直出”升级为“多尺寸 + 多格式 + 渐进加载 + 原图下载分离”的企业级交付方式。

## 3. 目标与不做事项

### 3.1 目标

- 让列表卡片、详情弹窗、放大查看和下载分别消费合理尺寸，而不是继续默认由原图兜底。
- 为图片链路补齐 `thumbnail / preview / large / original` 四层职责。
- 为现代格式补齐 `AVIF -> WebP -> 原格式` 的渐进交付和兼容回退。
- 让前端仍通过统一适配层和 getter 消费图片，而不是在页面层散写 `<picture>` 与回退逻辑。
- 让图片变体生成正式接入 `MEDIA-BPLUS-20` 的统一媒体任务运行时。

### 3.2 当前阶段不做

- 不在本轮直接改造页面视觉风格或图片查看交互骨架。
- 不在本轮直接做超复杂的图片编辑器或深度缩放组件选型。
- 不要求第一阶段就覆盖所有非常规图片格式的完美转码，例如完整动画格式保真。
- 不把原始下载替换为派生大图，原图仍保留给 `downloadUrl`。

## 4. 设计原则

### 4.1 字段语义继续稳定

继续保持：

- `thumbnailUrl`
  - 列表卡片、小尺寸宫格、轻量选择器
- `previewUrl`
  - 详情弹窗默认预览
- `downloadUrl`
  - 原始文件下载

新增但不破坏现有语义：

- `largeUrl`
  - 放大查看、大图弹层、细节预览
- `imageSources`
  - 各尺寸的多格式候选清单

### 4.2 详情预览与放大查看分离

- 详情默认继续先用 `previewUrl`，避免弹窗一打开就拉大图。
- 用户进入放大查看或高分辨率场景时，再延迟加载 `largeUrl`。
- 原图不参与默认详情预览，只保留给 `downloadUrl`。

### 4.3 多格式能力收口在适配层和工具层

- 页面层不直接拼接 `<source type="image/avif">` 之类逻辑。
- 统一由后端输出尺寸/格式候选，由前端共享工具或组件生成 `<picture>` / `srcset`。
- 页面层只表达“卡片图”“详情图”“大图查看”这三类产品语义。

### 4.4 与 `MEDIA-BPLUS-10 / 20` 共用同一交付边界

- 图片预览资源按预览资源权限策略走 `MEDIA-BPLUS-10`。
- 图片变体生成、格式索引、元数据提交走 `MEDIA-BPLUS-20`。
- 不在图片链路里单独另起一套派生调度体系。

## 5. 字段契约设计

## 5.1 对外字段

建议图片类视图模型逐步统一输出：

- `thumbnailUrl`
- `previewUrl`
- `largeUrl`
- `downloadUrl`
- `imageSources`
- `previewReady`

### 5.1.1 字段语义

#### `thumbnailUrl`

- 卡片和列表默认图
- 优先返回可快速加载的小尺寸图片
- 不承担下载或大图查看语义

#### `previewUrl`

- 详情弹窗默认预览图
- 应优先指向中等尺寸预览，而不是原图
- 允许作为大图失败时的安全回退

#### `largeUrl`

- 大图查看、高分辨率细节预览
- 不应在列表或普通卡片场景默认加载
- 首版可为空，缺失时由 `previewUrl` 回退

#### `downloadUrl`

- 原始图片下载地址
- 保留原始格式、原始尺寸和原始元数据的治理边界
- 不参与默认卡片与详情首屏展示

#### `imageSources`

- 为不同逻辑尺寸提供多格式候选集
- 推荐结构：

```json
{
  "thumbnail": [
    { "format": "avif", "url": "/media/.../thumb.avif", "mimeType": "image/avif", "width": 256, "height": 256 },
    { "format": "webp", "url": "/media/.../thumb.webp", "mimeType": "image/webp", "width": 256, "height": 256 },
    { "format": "jpeg", "url": "/media/.../thumb.jpg", "mimeType": "image/jpeg", "width": 256, "height": 256 }
  ],
  "preview": [
    { "format": "avif", "url": "/media/.../preview.avif", "mimeType": "image/avif", "width": 1600, "height": 1200 },
    { "format": "webp", "url": "/media/.../preview.webp", "mimeType": "image/webp", "width": 1600, "height": 1200 }
  ],
  "large": [
    { "format": "avif", "url": "/media/.../large.avif", "mimeType": "image/avif", "width": 2560, "height": 1920 },
    { "format": "webp", "url": "/media/.../large.webp", "mimeType": "image/webp", "width": 2560, "height": 1920 }
  ]
}
```

#### `previewReady`

- 只表示“至少已有可展示的缩略图或详情预览图”
- 不等于 `largeUrl` 和全部格式候选都已生成

## 5.2 向后兼容策略

当前前端已广泛依赖：

- `thumbnailUrl`
- `previewUrl`
- `downloadUrl`

因此首版不建议让页面直接感知复杂字段新增。

建议兼容顺序：

1. 继续保留 `thumbnailUrl / previewUrl / downloadUrl` 原语义。
2. 增量补入 `largeUrl`，但只由统一 getter 和查看组件消费。
3. 增量补入 `imageSources`，但仅由共享图片展示组件或工具层消费。
4. 页面层继续通过 `getImageCardSource()`、`getImageDetailSource()`、后续新增的 `getImageZoomSource()` 获取地址。

## 6. 图片变体与格式设计

## 6.1 逻辑尺寸分层

建议图片管线至少统一生成四层：

- `thumbnail`
  - 面向卡片和列表
  - 首版建议维持当前小尺寸策略
- `preview`
  - 面向详情弹窗
  - 继续保留当前中等尺寸预览口径
- `large`
  - 面向放大查看
  - 新增
- `original`
  - 原始文件
  - 仅下载和特殊受控场景使用

## 6.2 首版建议尺寸

结合当前代码事实，建议首版继续沿用现有派生方向并补齐 `large`：

- `thumbnail`
  - 图片卡片：`256 x 256`
  - 裁剪模式：`cover`
- `preview`
  - 最大边：`1600`
  - 缩放模式：`contain`
- `large`
  - 最大边：`2560`
  - 缩放模式：`contain`
- `original`
  - 保留原始尺寸

这里的关键不是像素值本身绝对精确，而是先把“列表 / 详情 / 放大 / 下载”四层职责固定下来。

## 6.3 输出格式策略

推荐首版输出策略：

- 首选 `AVIF`
- 回退 `WebP`
- 最后回退原始静态格式，例如 `JPEG / PNG`

### 6.3.1 为什么不能只输出 AVIF

当前仓库虽然已经具备 `AVIF` 派生能力，但如果只输出一种格式，会带来两个问题：

- 浏览器兼容与解码回退不够稳
- 某些链路失败时，前端没有自然的格式回退空间

因此 `MEDIA-BPLUS-40` 推荐把当前“AVIF 单输出”升级为“AVIF 优先 + WebP 回退 + 原格式兜底”。

### 6.3.2 特殊输入建议

- 透明图片：
  - 保留支持 alpha 的输出格式
- 动图：
  - 首版不强求把动画完整转成多格式派生
  - 可优先生成静态缩略图/预览图，原文件继续保留下载
- 异常格式或转码失败：
  - 保留原始可展示格式作为最后兜底

## 6.4 元数据建议

建议在图片 metadata 中逐步补齐：

- `thumbnail_url`
- `preview_url`
- `large_url`
- `download_url`
- `image_sources`
- `thumbnail_variant`
- `thumbnail_format`
- `thumbnail_width`
- `thumbnail_height`
- `preview_variant`
- `preview_format`
- `preview_width`
- `preview_height`
- `large_variant`
- `large_format`
- `large_width`
- `large_height`
- `original_format`
- `derivative_status`
- `preview_ready`
- `image_pipeline_stage`
- `image_pipeline_task_id`

## 7. 前端消费顺序设计

当前前端已经有统一图片 getter，这为平滑演进提供了很好入口。

## 7.1 建议的统一消费顺序

### 7.1.1 卡片层

建议保持：

```text
thumbnailUrl -> previewUrl -> imageUrl
```

卡片层继续以轻量图为主，不直接拉 `largeUrl` 和 `downloadUrl`。

### 7.1.2 详情层

建议保持：

```text
previewUrl -> largeUrl -> imageUrl -> thumbnailUrl
```

原因：

- 详情首开应该优先稳和快，而不是一开始就拉最大图。
- 当 `previewUrl` 缺失时，允许回退到 `largeUrl`。

### 7.1.3 放大查看层

建议新增统一 getter：

```text
largeUrl -> previewUrl -> imageUrl -> downloadUrl
```

这样可以把“大图查看”和“详情普通查看”明确拆开，而不是让现有 `getImageDetailSource()` 承担所有场景。

### 7.1.4 下载层

下载始终只看：

```text
downloadUrl
```

## 7.2 `imageSources` 的消费策略

前端不建议让每个页面自己使用 `imageSources`。

建议由共享图片工具或展示组件统一处理：

- 卡片图优先读取 `imageSources.thumbnail`
- 详情图优先读取 `imageSources.preview`
- 大图查看优先读取 `imageSources.large`

共享组件生成 `<picture>` 时建议顺序：

```text
AVIF -> WebP -> fallback img src
```

## 7.3 建议新增的前端工具层能力

建议在 `frontend/src/utils/mediaItem.js` 或配套图片工具中逐步补入：

- `largeUrl`
- `imageSources`
- `getMediaZoomImageUrl()`
- `getMediaPictureSources(media, usage)`

同时在 `frontend/src/utils/mediaPresentation.js` 中补入：

- `getImageZoomSource(media)`
- `getImagePictureSources(media, usage)`

这样页面仍只表达：

- 这是卡片图
- 这是详情图
- 这是放大图

而不直接表达格式和回退细节。

## 8. 与 `MEDIA-BPLUS-20` 的任务接线

建议图片管线统一拆成以下子任务：

- `source_validate`
- `thumbnail_generate`
- `preview_generate`
- `large_generate`
- `format_index_commit`
- `metadata_commit`

### 8.1 阶段语义

父任务 `current_stage` 建议至少包括：

- `queued`
- `source_validating`
- `thumbnail_generating`
- `preview_generating`
- `large_generating`
- `format_indexing`
- `metadata_committing`
- `completed`

### 8.2 `partial_ready` 何时触发

建议在以下条件满足时进入 `partial_ready`：

- `thumbnailUrl` 已就绪
- 且 `previewUrl` 已就绪

即使此时：

- `largeUrl` 仍未完成
- `imageSources.large` 仍未写入
- `AVIF / WebP` 某一组候选仍在生成

前端也已经可以安全展示卡片和详情。

## 9. 缓存、权限与版本治理

## 9.1 访问等级建议

- `thumbnailUrl / previewUrl / largeUrl`
  - 归入预览资源治理边界
  - 默认按 `MEDIA-BPLUS-10` 的公开预览或登录态预览策略承接
- `downloadUrl`
  - 继续归入受控下载边界

## 9.2 缓存建议

- `thumbnail / preview / large`
  - 使用版本化路径
  - 可长缓存
- `download`
  - 短缓存或不缓存
- `imageSources`
  - 本质上是变体索引，随业务详情接口刷新

## 9.3 版本键建议

图片变体缓存键建议至少考虑：

- 资源版本
- 逻辑尺寸
- 输出格式
- 访问等级

避免“原图更新了，但卡片仍命中旧缩略图缓存”的问题。

## 10. 代码落点建议

直接相关后端代码：

- `backend/app/services/image_derivatives.py`
- `backend/app/services/media_derivative_pipeline.py`
- `backend/app/services/media_view_models.py`
- `backend/app/schemas/asset.py`
- `backend/app/routers/assets.py`
- `backend/app/routers/creation.py`
- `backend/app/routers/storyboards.py`
- `backend/app/routers/subjects.py`

建议新增后端服务：

- `backend/app/services/image_variant_pipeline.py`
  - 负责统一组织 `thumbnail / preview / large`
- `backend/app/services/image_format_manifest.py`
  - 负责输出 `imageSources`
- `backend/app/services/image_delivery_resolver.py`
  - 负责解析当前应返回的最佳 `thumbnailUrl / previewUrl / largeUrl`

直接相关前端代码：

- `frontend/src/utils/mediaItem.js`
- `frontend/src/utils/mediaPresentation.js`
- `frontend/src/api/mediaAdapters.js`
- `frontend/src/api/assets.js`
- `frontend/src/api/creation.js`
- `frontend/src/api/storyboard.js`
- `frontend/src/pages/AssetsPage.jsx`
- `frontend/src/pages/CreationPage.jsx`
- `frontend/src/pages/StoryboardPage.jsx`
- `frontend/src/pages/SubjectPage.jsx`

前端改造原则：

- 优先改适配层和共享 getter
- 不改页面视觉骨架
- 不让页面自己写格式回退和尺寸判断

## 11. Runbook 落点

建议后续新增：

- `docs/runbooks/image-derivative-pipeline.md`
- `docs/runbooks/image-format-fallback.md`
- `docs/runbooks/image-cache-invalidation.md`

至少覆盖：

- `thumbnailUrl` 失效但原图正常的排查路径
- `previewUrl` 仍回落到原图的排查路径
- `largeUrl` 缺失时的回退判定
- `AVIF` 生成失败或浏览器兼容异常时的回退策略
- 图片更新后的缓存失效核对步骤

## 12. 分阶段落地建议

### 阶段 1：补齐四层语义

- 明确 `thumbnail / preview / large / original`
- 新增 `largeUrl`
- 保持现有页面消费方式基本不变

### 阶段 2：补齐多格式候选

- 从当前单一 `AVIF` 派生升级到 `AVIF + WebP + fallback`
- 输出 `imageSources`

### 阶段 3：前端共享图片承接升级

- 统一 getter
- 统一共享 `<picture>` / `srcset` 工具
- 放大查看按需拉取 `largeUrl`

### 阶段 4：任务与缓存治理收口

- 接入统一媒体任务中心
- 接入版本化路径和缓存失效策略
- 补齐 Runbook

## 13. 验收标准

完成 `MEDIA-BPLUS-40` 首版设计与实现后，至少满足：

- 列表卡片不再默认拉原图
- 详情弹窗默认预览不再继续大范围回落到原图
- `largeUrl` 与 `downloadUrl` 职责分离
- `AVIF` 不再是唯一派生输出，存在稳定回退链路
- 页面层继续只消费适配层和共享 getter，不新增散点字段兼容
- `partial_ready` 状态下，卡片与详情已经可以安全展示图片

## 14. 当前结论

`MEDIA-BPLUS-40` 的关键，不是把图片链路简单理解成“再压缩几张图”，而是把当前已经存在的 `thumbnailUrl / previewUrl / downloadUrl` 三层语义，真正升级为可支撑企业级生产交付的四层图片模型：

- 卡片看 `thumbnail`
- 详情看 `preview`
- 放大看 `large`
- 下载看 `original`

只要这一步设计收口好，后续前端页面不需要改视觉骨架，后端也不需要推翻现有媒体视图模型，就能逐步把图片交付从“原图兜底 + 单一 AVIF 预览”升级到“多尺寸 + 多格式 + 渐进加载 + 原图下载分离”的企业级图片资产管线。
