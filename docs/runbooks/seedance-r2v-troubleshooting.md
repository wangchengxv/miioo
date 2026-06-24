# Seedance 全能参考视频（r2v）排障经验

适用模型：`doubao-seedance-2.0`、`doubao-seedance-2-0-fast`
相关代码：`backend/app/services/video_gen.py`、`backend/app/services/reference_video_proxy.py`

## 一、典型报错

```
Seedance 请求失败: 参考素材 参数不合法：The parameter `content` specified in the request
is not valid: the parameter video total duration (seconds) specified in the request
must be less than or equal to 15.2 for model doubao-seedance-2-0 in r2v.
```

Seedance r2v 模式要求 `content` 里**所有参考视频的总时长 ≤ 15.2 秒**。注意是“总时长累加”，不是单条时长。

## 二、两类根因（按出现概率排序）

### 根因 1：参考视频被重复加入 content（最常见，易误判）

**现象**：参考视频本身远小于 15 秒（如 8.75s），却仍报总时长超限。

**原理**：同一个视频在 `_map_assets_to_model_params` 里同时被写进两个字段：
- `attachments`（带 `asset_id`）
- `reference_video_url`（兜底字段，**不带** `asset_id`）

两条记录在 `_build_seedance_attachment_pool` 去重时，旧逻辑用 `asset_id or "type:url"` 作 key，
一条按 asset_id、一条按 url，key 不同 → 去重失效 → 视频进 content 两次 → 时长翻倍。
8.75 × 2 = 17.5s > 15.2s，于是报错。

**定位方法**：看后端日志，同一次生成请求里 `Preparing 参考视频 for Seedance r2v` 出现两次、
且 URL 相同，即为此问题。或临时在 `_generate_seedance` 构建 payload 前打印
`content` 中 `video_url` 的数量，正常应为 1。

**修复**：`_append_unique_seedance_attachment` 的去重改为
“**asset_id 相同 _或_ url 相同就视为同一素材并合并**”（`_seedance_attachment_dedup_keys`）。

### 根因 2：参考视频真的超过 15 秒，但没被自动裁剪

**原理**：`reference_video_proxy.prepare_local_reference_video_for_upstream` 只对被识别为
**本地/私网托管**的视频做 probe + 裁剪（≤15s）。当视频 URL 带了 `PUBLIC_BASE_URL` 前缀
（如 `https://xxx.trycloudflare.com/uploads/...`）时，不被识别为本地文件 → 跳过裁剪 → 原始超长视频直接发给 API。

**修复**：在 `_prepare_seedance_reference_media_url` 和 `_prepare_external_video_url` 中，
调用裁剪函数前**先剥离 `PUBLIC_BASE_URL` 前缀**，把 URL 还原成 `/uploads/...` 让裁剪逻辑命中；
对通过 `persist_remote_file` 下载落盘的外链视频也补做一次 probe + 裁剪。

## 三、排查清单

1. **确认时长**：看日志 `Reference video probe result: ... duration=Xs`（或临时加该日志）。
   - duration 远小于 15 → 走根因 1（重复）
   - duration > 15 → 走根因 2（裁剪未命中）
2. **确认 ffmpeg/ffprobe 可用**：`ffprobe -version`、`ffmpeg -version`。
   缺失时裁剪会跳过并告警 `Skip reference video probe/transcode because ffprobe is unavailable`。
3. **确认 content 中 video_url 数量**：正常恒为 1。出现 2 即重复 bug 复发。

## 四、PUBLIC_BASE_URL 配置（本地 / 云端切换）

`backend/.env` 不要写多个 `PUBLIC_BASE_URL`（dotenv 取最后一行，易踩坑）。统一方式：

- **云端**：`.env` 里设 `PUBLIC_BASE_URL=https://www.miiooai.com`
- **云端启动**：优先执行 `bash backend/脚本/start_cloud.sh web` 或仓库根目录 `./start_backend.sh cloud`；脚本会先关闭本地公网隧道、清理 `.runtime/public_base_url` 等临时覆盖文件，并以 `PUBLIC_BASE_URL_FILE=""`、`SERVE_UPLOADS_VIA_APP=false` 的云端口径启动
- **本地**：保留 `PUBLIC_BASE_URL_FILE=.runtime/public_base_url`，把当前隧道地址写进该文件：
  ```bash
  echo "https://你的隧道地址.trycloudflare.com" > backend/.runtime/public_base_url
  ```
  运行时该文件内容会覆盖 `.env` 的 `PUBLIC_BASE_URL`，换隧道只改这一个文件。
- **关闭本地隧道**：可执行 `bash backend/stop_public_tunnel.sh` 或仓库根目录 `./start_backend.sh stop-public`，会终止本地 Cloudflare/LocalTunnel 进程，并清理 `.runtime` 下的临时公网地址文件

无论哪种，Seedance API 都要能通过该地址回访到 `/uploads/...` 的素材文件，
本地联调时隧道必须在线。

## 五、关键约束备忘

- Seedance r2v 参考视频**总时长** ≤ 15.2s（裁剪安全余量设为 15.0s，见 `reference_video_proxy.REFERENCE_VIDEO_MAX_DURATION_SECONDS`）。
- 参考视频分辨率上限 1920×1080 / 2086876 像素，超出会自动压缩。
- 去重的唯一可靠标识是 **url**，asset_id 可能只存在于部分来源，不能单独依赖。
