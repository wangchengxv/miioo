# 媒体 CDN 缓存失效手册

## 1. 适用范围

- 适用于图片 `thumbnailUrl / previewUrl / largeUrl`、视频封面 `posterUrl`、视频轻量预览、HLS playlist 与分片的缓存失效排查。
- 适用于后续 `MEDIA-BPLUS-10 / 30 / 40 / 50` 正式引入对象存储与 CDN 后的缓存刷新、验证和回滚。
- 适用于当前仓库尚未正式接入 CDN 的阶段，用作“先固化流程、当前以 `/uploads` 与应用日志替代观测”的专项 Runbook。

## 2. 症状表现

- 已替换图片、视频封面或预览资源，但前端仍看到旧内容。
- 资源已重新生成或重新上传，但只有部分用户看到新内容。
- `previewUrl` 正常，`posterUrl` 或 `thumbnailUrl` 仍命中旧缓存。
- HLS playlist 已更新，但分片仍返回旧内容，或播放器表现为“播放列表新、内容旧”。
- 统一下载正常，预览链路却持续命中旧文件。

## 3. 快速判断

先判断当前故障落在哪一层：

- 若 `local/public` 都直接命中 `/uploads/...`，当前问题更可能是 Nginx 静态文件、浏览器缓存或资源路径未变。
- 若后续接入了 `cdn_url`，且应用层 descriptor 已返回 CDN 地址，当前问题更可能是 CDN 未刷新或回源未更新。
- 若 `downloadUrl` 已恢复正常，但 `previewUrl / posterUrl / thumbnailUrl` 仍旧，优先看缓存层而不是签名下载链。

当前仓库仍未正式接 CDN，因此首轮快速判断建议先执行：

```bash
./project_ops.sh media-delivery <media-url>
./project_ops.sh media-audit 200
```

## 4. 核查命令

### 4.1 统一交付链路

```bash
./project_ops.sh media-delivery <media-url>
```

用于判断：

- 当前命中的是 `/uploads/...` 还是未来 CDN URL
- `local/public` 是否一致
- HLS playlist 与首个分片是否都已更新

### 4.2 检查媒体下载/预览日志

```bash
./project_ops.sh media-audit 200
./project_ops.sh logs web 300 | grep "app.media_download"
```

用于判断：

- 预览/下载问题是否其实来自受控下载链失败
- 是否存在 `not_found / rejected / invalid_token`

### 4.3 直接看静态文件链路

```bash
bash backend/scripts/check_uploads_access.sh /uploads/某条样本.png
```

### 4.4 当前代码口径核查

若怀疑某类资源应该走 CDN 但实际没走，可先核查 descriptor / resolver：

- [media_object_descriptor.py](file:///Users/xingyi/Desktop/迭代一版/backend/app/services/media_object_descriptor.py)
- [media_access_resolver.py](file:///Users/xingyi/Desktop/迭代一版/backend/app/services/media_access_resolver.py)

重点确认：

- metadata 中是否存在 `cdn_url`
- resolver 是否在对应媒体语义下优先返回 `cdn_url`

## 5. 常见根因

### 5.1 路径未变但内容已替换

- 资源覆盖写入到了相同路径
- CDN 或浏览器仍持有旧缓存

### 5.2 descriptor 未携带 `cdn_url`

- metadata 没有补 `cdn_url / public_cdn_url`
- descriptor 仍回退到本地 `source_url`

### 5.3 预览和下载语义混用

- 下载地址更新了，但预览地址仍旧指向旧资源
- 组件把 `downloadUrl` 当成了预览地址，或把旧预览地址当成最终下载入口

### 5.4 回源资源未更新

- CDN 已刷新，但回源层 `/uploads/...` 或对象存储中的对象仍是旧内容
- HLS playlist 已更新，分片未同步更新

### 5.5 缓存头过长

- 静态资源仍带长时间缓存头
- 新资源未改名，导致客户端持续命中旧缓存

## 6. 处理步骤

### 6.1 先确认是不是 CDN 问题

- 若当前 `media-delivery` 显示仍是 `/uploads/...`，先不要把问题归因到 CDN。
- 若当前 descriptor 已返回 `cdn_url`，再进入 CDN 刷新流程。

### 6.2 先核对源站是否已更新

优先确认：

- `/uploads/...` 文件是否已更新
- 或对象存储中的目标对象是否已更新
- HLS playlist 与分片是否同批次生成

若源站没更新，先修源站，不要先做 CDN 刷新。

### 6.3 再执行缓存失效

当前仓库还没有统一的 CDN 失效脚本，因此首版固定动作是：

1. 记录本次要刷新的资源清单
2. 区分刷新类型：
   - 单资源：图片、视频封面、单条预览视频
   - 目录级：某个任务批次、某个项目的派生产物
   - HLS：playlist + 分片一起刷新
3. 在对应 CDN 控制台或 API 中执行失效
4. 记录失效时间、操作者和路径范围

HLS 场景特别注意：

- 不要只刷新 `.m3u8`
- 必须把相关 `.ts / .m4s` 分片一起纳入

### 6.4 刷新后立即抽样验证

```bash
./project_ops.sh media-delivery <playlist-or-media-url>
```

验证点：

- 图片/视频封面是否已返回新内容
- HLS playlist 是否已更新
- 首个分片是否已同步可读

### 6.5 若刷新后仍无效

优先排查：

- 刷新的是否是错误域名或错误路径
- 资源是否其实仍由 `/uploads/...` 提供
- descriptor 是否没有真正切换到 `cdn_url`
- 上游缓存是否分层存在，例如浏览器缓存 + CDN 缓存

## 7. 回滚步骤

### 7.1 当前回滚原则

- 当前 CDN 尚未正式接入，因此优先回滚到 `/uploads/...` 或源站直链，而不是继续扩大缓存层复杂度。
- 若 CDN 接入后出现大面积缓存异常，优先退回源站直出或关闭 `cdn_url` 回填，而不是继续强刷。

### 7.2 回滚动作

1. 记录当前受影响的资源类型、路径范围和开始时间
2. 若存在 descriptor 层 `cdn_url`，先恢复为源站 `source_url`
3. 对前端或接口适配层，确认没有继续消费旧 CDN 地址
4. 再执行：

```bash
./project_ops.sh media-delivery <media-url>
```

确认是否已恢复为源站地址

### 7.3 HLS 特殊回滚

- 若新版 HLS 产物存在一致性问题，优先整体回退到上一版稳定的 playlist + 分片集合
- 不要只回退 playlist 而保留新分片

## 8. 验证步骤

- 同一路径在 `local/public` 下返回一致
- 若使用 CDN，刷新后 descriptor 返回的 `cdn_url` 已正确可读
- 图片、封面、预览视频在真实环境手工刷新后可见新内容
- HLS playlist 与首个分片都已更新
- `media-audit` 中未出现因缓存切换引发的异常下载失败

## 9. 需要回写的文档

- 若正式引入 CDN 配置项或切换默认交付策略，更新：
  - `backend/BACKEND_API_DOC.md`
  - `接口变动文档.md`
- 每轮缓存失效治理完成后至少检查：
  - `docs/plans/module-progress.md`
  - `docs/plans/项目进度文档.md`
  - `CHANGELOG.md`

## 10. 当前限制

- 当前仓库还没有统一的 CDN 失效 API/脚本入口
- 当前主要观测仍以 `/uploads/`、`media-delivery`、`app.media_download` 和 Nginx 日志替代
- 后续若正式接入对象存储/CDN，应继续补：
  - 统一失效脚本
  - 统一失效记录模板
  - 目录级/批量级失效策略
