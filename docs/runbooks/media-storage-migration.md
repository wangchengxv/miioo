# 媒体存储迁移手册

## 1. 适用范围

- 适用于把历史外链媒体回填为本站托管地址 `/uploads/...` 的迁移动作。
- 适用于当前 `MEDIA-BPLUS-10` 的“本地 `/uploads` 兼容 + 托管地址统一”阶段。
- 适用于后续从 `local` 逐步演进到 `hybrid / object_storage` 前的准备、核查与回退。

## 2. 当前固定口径

- 当前仓库已经提供迁移脚本：`backend/scripts/backfill_managed_media.py`
- 当前迁移目标不是“一步切到对象存储”，而是先把历史 `http(s)` 外链回收到本站托管地址
- `MEDIA-BPLUS` 第一轮云端闭环已经固定采用 `www.miiooai.com` 主域复用方案：
  - `MEDIA_PUBLIC_BASE_URL=https://www.miiooai.com/media/origin`
  - `MEDIA_CDN_BASE_URL=https://www.miiooai.com/media/cdn`
  - 若 COS/CDN 真实回源、Secret 与 bucket 还没全部补齐，`MEDIA_STORAGE_MODE` 先保持 `local`，不要提前切到 `hybrid`
- 当前回填后的元数据会补：
  - `storage_mode=managed_upload`
  - `import_source=migration`
  - `origin_url`
- 当前生产公网媒体基地址口径仍是：
  - `PUBLIC_BASE_URL=https://www.miiooai.com`
- 当前生产静态媒体仍以 `Nginx + /uploads/ alias` 承接，不建议让 FastAPI 长期开启兜底

## 3. 迁移前检查

### 3.1 环境配置

- 核查 `backend/.env`
  - `UPLOAD_DIR` 指向真实持久化目录
  - `PUBLIC_BASE_URL` 指向真实公网媒体域名
  - 若本轮准备继续推进主域复用的对象存储闭环，确认 `MEDIA_PUBLIC_BASE_URL / MEDIA_CDN_BASE_URL` 已固定到 `https://www.miiooai.com/media/{origin|cdn}`
  - 生产默认 `SERVE_UPLOADS_VIA_APP=false`
- 核查 Nginx
  - `/uploads/` 已配置 `alias`
  - `alias` 路径与 `UPLOAD_DIR` 一致
  - `backend/nginx/miiooai.conf` 中 `/media/origin/` 与 `/media/cdn/` 已替换成真实可用的 COS/CDN upstream，不再是仓内占位值

### 3.2 进程与磁盘

- 确认 `miioo-web / miioo-worker` 处于正常状态：

```bash
./project_ops.sh status
```

- 确认 `UPLOAD_DIR` 可写且容量充足
- 若目标批次较大，先预估本轮下载总量，避免迁移中把磁盘写满

### 3.3 先做连通性抽样

- 随机抽一条当前仍是外链的资源，确认外链暂时可读
- 若已有 `/uploads/...` 地址，先确认本站托管链路正常：

```bash
./project_ops.sh media-delivery /uploads/某条历史样本.png
```

## 4. 脚本能力

当前迁移脚本：

```bash
python3 backend/scripts/backfill_managed_media.py --help
```

支持的核心筛选项：

- `--dry-run`
- `--tables`
- `--media-types`
- `--user-id`
- `--project-id`

当前可处理表包括：

- `assets`
- `storyboards`
- `subject_images`
- `audio_clips`
- `video_clips`
- `creation_shots`
- `compositions`

当前可处理媒体类型包括：

- `image`
- `video`
- `audio`
- `document`

## 5. 推荐执行顺序

### 5.1 第一步只做 dry-run

先看本轮会扫到多少记录：

```bash
cd /Users/xingyi/Desktop/迭代一版/backend
PYTHONPATH=/Users/xingyi/Desktop/迭代一版/backend \
python3 scripts/backfill_managed_media.py \
  --dry-run \
  --tables assets,storyboards,creation_shots \
  --media-types image,video \
  --project-id <PROJECT_ID>
```

重点看输出：

- `scanned`
- `migrated`
- `skipped`
- `failed`

### 5.2 第二步小批量正式执行

先按单项目或单用户切一小批：

```bash
cd /Users/xingyi/Desktop/迭代一版/backend
PYTHONPATH=/Users/xingyi/Desktop/迭代一版/backend \
python3 scripts/backfill_managed_media.py \
  --tables assets,storyboards,creation_shots \
  --media-types image,video \
  --project-id <PROJECT_ID>
```

### 5.3 第三步扩大范围

首批样本验证通过后，再放大到更多表：

```bash
cd /Users/xingyi/Desktop/迭代一版/backend
PYTHONPATH=/Users/xingyi/Desktop/迭代一版/backend \
python3 scripts/backfill_managed_media.py \
  --tables assets,storyboards,subject_images,audio_clips,video_clips,creation_shots,compositions \
  --media-types image,video,audio,document
```

## 6. 迁移后验证

### 6.1 看数据库结果

- 抽样确认目标记录已从外链改为 `/uploads/...`
- 抽样确认 metadata 已补入：
  - `storage_mode=managed_upload`
  - `import_source=migration`
  - `origin_url`

### 6.2 看磁盘结果

- 抽样确认文件真实落到 `UPLOAD_DIR`
- 若是图片、视频封面或音频，确认文件扩展名合理

### 6.3 看交付结果

对迁移后的地址做统一巡检：

```bash
./project_ops.sh media-delivery /uploads/某条迁移后的样本.png
./project_ops.sh media-delivery /uploads/某条迁移后的样本.mp4
```

若要单独检查 `/uploads/` 静态链路，也可继续用：

```bash
bash backend/scripts/check_uploads_access.sh /uploads/某条迁移后的样本.mp4
```

### 6.4 看下载链路

若该资源已经进入统一受控下载链，继续核查：

```bash
./project_ops.sh media-audit 200
```

重点看是否出现异常增长的：

- `not_found`
- `rejected`
- `invalid_token`

## 7. 常见失败与处理

### 7.1 外链下载失败

表现：

- 脚本输出 `failed`
- 控制台出现某条 URL 拉取失败

优先检查：

- 源站是否仍可访问
- 源站是否限制了防盗链、地域或 UA
- 当前服务器是否能访问该上游地址

处理建议：

- 先缩小到单表、单项目重试
- 必要时把失败样本单独记录，先完成其余可迁移记录

### 7.2 迁移后公网仍然 404

表现：

- 数据已改成 `/uploads/...`
- 本地文件存在
- 但公网访问 404

优先检查：

- `UPLOAD_DIR` 与 Nginx `alias` 是否一致
- 文件是否真的落到生产机当前站点目录
- `PUBLIC_BASE_URL` 是否仍指向旧域名

优先执行：

```bash
./project_ops.sh media-delivery /uploads/某条迁移后的样本.png
```

### 7.3 历史页面仍显示旧外链

表现：

- 数据已迁移
- 但页面或导出结果里仍出现旧外链

优先检查：

- 是否还有未覆盖到的业务表
- 是否有 JSON 字段里残留未走统一适配层的历史 URL
- 是否需要重新刷新页面数据或重新触发任务结果同步

### 7.4 批量迁移把磁盘打满

表现：

- 脚本中途失败
- 机器磁盘剩余空间过低

处理建议：

- 立即停止后续批次
- 先记录本轮迁移范围
- 清理无用临时文件后再继续
- 后续改按项目、用户、媒体类型拆批

## 8. 回滚步骤

### 8.1 回滚原则

- 当前迁移脚本会直接改库并落盘，因此正式执行前必须先做 `--dry-run`
- 大批量迁移前，建议先做数据库备份或至少确认对应表存在可恢复快照
- 回滚优先级：
  1. 回滚数据库记录
  2. 保留已下载文件不急着删
  3. 重新验证旧链路是否恢复

### 8.2 小范围回滚

适用于单项目、单用户的小批次：

- 按迁移前记录的样本，把 `file_url / image_url / video_url / audio_url / output_url` 恢复为原始外链
- 同步清理本轮补入的迁移 metadata
- 暂时不要删除已落盘文件，避免二次排障时丢证据

### 8.3 大范围回滚

适用于批量迁移误伤：

- 优先恢复数据库备份或增量快照
- 恢复后重新执行媒体交付巡检：

```bash
./project_ops.sh media-delivery /uploads/某条样本.png
./project_ops.sh media-audit 200
```

## 9. 推荐迁移批次

- 先 `assets + storyboards`
- 再 `creation_shots`
- 再 `subject_images / audio_clips / video_clips`
- 最后 `compositions`

不建议第一次就全表全媒体类型一把梭。

## 10. 迁移完成后的回写

- 更新：
  - `docs/plans/module-progress.md`
  - `docs/plans/项目进度文档.md`
  - `CHANGELOG.md`
- 若实际对外接口契约或返回语义发生变化，再更新：
  - `backend/BACKEND_API_DOC.md`
  - `接口变动文档.md`

## 11. 当前限制

- 当前 Runbook 主要覆盖“历史外链回填为本站托管地址”的阶段，不等于完整对象存储迁移手册
- 当前尚未覆盖：
  - 对象存储 bucket 级迁移
  - CDN 缓存刷新
  - 存储双写与切流
  - 对象存储直签下载

这些继续由后续 `media-cdn-invalidation.md` 和对象存储相关任务承接。
