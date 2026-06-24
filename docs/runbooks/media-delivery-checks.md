# 媒体交付链路巡检手册

## 1. 适用范围

- 适用于图片 `thumbnail / preview`、视频 `preview / hls`、音频预览以及下载地址的基础连通性核查。
- 适用于 `/uploads/...` 直链、`/api/media/downloads/{token}` 受控下载地址以及 `.m3u8` HLS 播放列表。
- 适用于你手工联调前后的“先探测地址是否可读”排障动作。

## 2. 快速命令

### 2.1 统一入口

```bash
./project_ops.sh media-delivery <url1> [url2 ...]
```

### 2.2 直接脚本

```bash
bash backend/scripts/check_media_delivery.sh <url1> [url2 ...]
```

## 3. 常见用法

### 3.1 检查 `/uploads/` 图片或视频

```bash
./project_ops.sh media-delivery /uploads/assets/demo.png
./project_ops.sh media-delivery /uploads/creation/demo.mp4
```

### 3.2 检查统一受控下载地址

```bash
AUTH_HEADER="Authorization: Bearer <token>" \
./project_ops.sh media-delivery /api/media/downloads/<download-token>
```

### 3.3 检查 HLS playlist

```bash
./project_ops.sh media-delivery https://cdn.example.com/media/demo.m3u8
```

## 4. 输出解释

- `类型=controlled_download`
  - 重点看是否返回 `302 / 401 / 403 / 404`
  - 若返回 `302`，会同时打印 `location`
- `类型=managed_upload`
  - 会同时探测 `local` 和 `public`
  - 若路径命中 `/uploads/`，还会附带本地文件存在性检查
- `类型=hls_playlist`
  - 除 playlist 自身状态码外，还会继续抽查第一条分片

## 5. 常见判断口径

- `local=200/206` 且 `public=404`
  - 优先查 Nginx、域名、静态映射或公网暴露
- `/uploads/` 本地文件不存在
  - 优先查 `UPLOAD_DIR`、文件持久化或 metadata 落点
- `controlled_download=401/403`
  - 优先查登录态、token 过期、签名绑定用户
- `playlist=200` 但首分片失败
  - 优先查 HLS 分片路径、回源目录或 CDN

## 6. 配置项

- `PUBLIC_BASE_URL`
  - 默认 `https://www.miiooai.com`
- `LOCAL_BASE_URL`
  - 默认 `http://127.0.0.1:8000`
- `AUTH_HEADER`
  - 用于受控下载或需要登录态的接口探测
- `COOKIE_HEADER`
  - 用于需要 Cookie 的探测场景
- `REQUEST_TIMEOUT`
  - 默认 `15`

## 7. 与其它手册的关系

- 下载签名与失败 outcome 排障，继续看 `docs/runbooks/media-download-signing.md`
- 运行时指标与告警基线，继续看 `docs/runbooks/runtime-observability.md`
- 发布与止血入口，继续看 `docs/runbooks/release-rollback.md`
