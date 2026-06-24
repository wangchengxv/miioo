# 发布与回滚手册

## 1. 发布前检查

- 核心入口文档存在且未过期
- 本轮改动已写入 `CHANGELOG.md`
- 页面闭环映射已同步更新
- 当前阻塞与待联调项已明确写入 backlog 或 progress

## 2. 发布建议

### 前端

- 确认 `miioo/frontend/.env.production` 与目标环境一致
- 确认 API 域名、资源域名、上传访问域名已对齐

### 后端

- 确认数据库迁移状态一致
- 确认 CORS、`PUBLIC_BASE_URL`、模型 provider 配置无误
- 确认长任务超时与错误信息未被回退

## 3. 回滚原则

- 优先回滚最新一批功能性改动
- 文档不删除，只补“回滚记录”
- 若问题来自外部模型或环境配置，优先记录到运行手册和 changelog

## 4. 故障排查入口

- 接口契约问题：`miioo/backend/BACKEND_API_DOC.md`
- 页面闭环问题：`HARNESS_PAGE_API_MAPPING.md`
- 阶段阻塞：`HARNESS_P0_BACKLOG.md`
- 历史排障：`docs/plans/archive-index.md`
- 媒体下载与签名链路：`docs/runbooks/media-download-signing.md`
- 媒体链路灰度发布：`docs/runbooks/media-release-canary.md`
- 媒体链路专项回滚：`docs/runbooks/media-release-rollback.md`

## 5. 媒体链路补充

- 若故障集中在 `downloadUrl`、`/api/media/downloads/{token}` 或批量 ZIP 下载，先执行 `./project_ops.sh media-audit 200`，确认失败是否集中在 `invalid_token / forbidden / not_found / rejected`。
- 当前统一媒体地址解析/视图模型层已补入五个真实开关：`MEDIA_ENABLE_SIGNED_DOWNLOAD`、`MEDIA_ENABLE_OBJECT_STORAGE_PREVIEW`、`MEDIA_ENABLE_IMAGE_LARGE_VARIANT`、`MEDIA_ENABLE_VIDEO_PREVIEW_TRANSCODE` 与 `MEDIA_ENABLE_VIDEO_HLS`；若下载、预览、图片大图、轻量 mp4 预览或 HLS 主播放字段主链路异常，可优先关闭对应开关回退到旧直链/旧预览/无大图语义/原始视频预览/仅保留 `previewVideoUrl` 语义。当前 `MEDIA_ENABLE_VIDEO_HLS` 已同时控制本地单码率 HLS 打包与 `hlsUrl` 对外暴露，关闭后会直接退回 `previewVideoUrl` 主播放。
- 若本次是媒体专项灰度发布，先按 `docs/runbooks/media-release-canary.md` 中的灰度范围、观察点和止损条件确认是否应该立刻停放量。
- 若已经确认进入媒体专项回滚，直接按 `docs/runbooks/media-release-rollback.md` 选择配置回滚、流量回滚、代码回滚或数据与缓存回滚路径。
- 媒体下载故障完成止血后，至少同步回写：
  - `docs/plans/module-progress.md`
  - `docs/plans/项目进度文档.md`
  - `CHANGELOG.md`
