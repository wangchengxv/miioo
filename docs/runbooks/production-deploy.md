# 生产部署手册

## 1. 当前固定口径

- 生产前端域名：`https://miiooai.com`
- 生产后端域名：`https://www.miiooai.com`
- 生产前端代码目录：`frontend/`
- 生产后端代码目录：`backend/`
- 前端生产请求基地址：`VITE_API_BASE_URL=https://www.miiooai.com`
- 前端生产媒体基地址：`VITE_MEDIA_BASE_URL=https://www.miiooai.com`
- 后端公网素材基地址：`PUBLIC_BASE_URL=https://www.miiooai.com`

### 1.1 MEDIA-BPLUS 首轮云端闭环口径

- 当前线上媒体链路仍处于 `Nginx /uploads/ + Web/Worker/Redis` 桥接态，`腾讯云 COS/CDN` 还没有完全替代本地托管。
- `MEDIA-BPLUS` 第一轮云端闭环默认采用 `www.miiooai.com` 主域复用方案，不要求这轮额外申请二级域名或新证书。
- 这轮目标是先把“配置骨架、对象存储地址解析、受控下载、视频预览/HLS 运行依赖、灰度/回滚/验收入口”补齐，而不是第一次就做历史媒体全量迁移。
- 推荐把对象存储源站和 CDN 都先挂到主域路径，例如：
  - `MEDIA_PUBLIC_BASE_URL=https://www.miiooai.com/media/origin`
  - `MEDIA_CDN_BASE_URL=https://www.miiooai.com/media/cdn`
- 对应 Nginx/CDN 回源建议按 `/<bucket>/<key>` 承接，因此后端侧生成的对象存储地址会统一落成 `https://www.miiooai.com/media/{origin|cdn}/<bucket>/<key>`。

## 2. 前端上线前

- 确认 `frontend/.env.production` 存在且为：

```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://www.miiooai.com
VITE_MEDIA_BASE_URL=https://www.miiooai.com
```

- 当前推荐口径是“前端在 `https://miiooai.com`，后端 API/媒体在 `https://www.miiooai.com`”；因此前端生产环境仍应固定请求 `https://www.miiooai.com`
- 若线上 `nginx -T` 已确认 `miiooai.com` 与 `www.miiooai.com` 分属两个独立站点，则后端站点 `server_name` 继续只保留 `www.miiooai.com`，不要把 apex 域名再绑进后端站点，否则会触发 `conflicting server name`
- 若前端部署到其它独立域名，后端 `CORS_ORIGINS` 还需额外加入该前端域名
- 若后端也改为由 `https://miiooai.com` 直接承接，请同时确认 Nginx `server_name`、证书与站点根目录已同步切到 apex 域名
- 执行 `pnpm build`，确认产物可正常生成

## 3. 后端上线前

- 确认 `backend/.env` 中 `PUBLIC_BASE_URL=https://www.miiooai.com`
- 若本轮准备启用 `COS/CDN` 主域复用闭环，补齐以下环境变量：
  - `MEDIA_STORAGE_MODE=local|hybrid|object_storage`
  - `MEDIA_PUBLIC_BASE_URL=https://www.miiooai.com/media/origin`
  - `MEDIA_CDN_BASE_URL=https://www.miiooai.com/media/cdn`
  - `MEDIA_OBJECT_STORAGE_PROVIDER=tencent_cos`
  - `MEDIA_OBJECT_STORAGE_REGION=<你的 COS region>`
  - `MEDIA_OBJECT_STORAGE_SECRET_ID=<你的 SecretId>`
  - `MEDIA_OBJECT_STORAGE_SECRET_KEY=<你的 SecretKey>`
  - `MEDIA_OBJECT_STORAGE_BUCKET_RAW / MEDIA_OBJECT_STORAGE_BUCKET_PREVIEW / MEDIA_OBJECT_STORAGE_BUCKET_DERIVED / MEDIA_OBJECT_STORAGE_BUCKET_HLS / MEDIA_OBJECT_STORAGE_BUCKET_PRIVATE_DOWNLOAD`
  - 若首轮暂不拆多 bucket，也至少固定单 bucket 并补前缀：`MEDIA_OBJECT_STORAGE_KEY_PREFIX_RAW / PREVIEW / DERIVED / HLS / PRIVATE_DOWNLOAD`
- 首次补模板时，建议先在 `.env` 与 Supervisor 中显式写全上述变量，但把 `MEDIA_STORAGE_MODE` 暂时保留为 `local`；待 `SecretId / SecretKey / bucket / Nginx / CDN` 都完成后，再切到 `hybrid`，避免未接好回源前就让新资源直接走对象存储。
- 确认 `backend/.env` 中不要再让 `PUBLIC_BASE_URL_FILE` 指向本地 `.runtime/public_base_url` 一类运行时覆盖；若仓库仍保留该配置，线上启动时应通过云端启动脚本显式覆盖为空
- 确认 `backend/.env` 中 `MEDIA_ENABLE_SIGNED_DOWNLOAD=true`，当前生产默认保持统一受控下载开启；若需临时止血回退到旧直链语义，应结合 `docs/runbooks/media-download-signing.md` 与 `docs/runbooks/media-release-rollback.md` 明确记录后再关闭
- 确认 `backend/.env` 中 `MEDIA_ENABLE_OBJECT_STORAGE_PREVIEW=true`，当前生产默认保持对象存储/CDN 预览开启；若灰度或止血需要切回旧预览链路，应结合 `docs/runbooks/media-release-canary.md` 与 `docs/runbooks/release-rollback.md` 明确记录后再关闭
- 确认 `backend/.env` 中 `MEDIA_ENABLE_IMAGE_LARGE_VARIANT=true`，当前生产默认允许图片主响应返回 `largeUrl`；若灰度或止血需要临时撤掉大图字段，应结合 `docs/runbooks/media-release-canary.md` 与 `docs/runbooks/release-rollback.md` 明确记录后再关闭
- 确认 `backend/.env` 中 `MEDIA_ENABLE_VIDEO_PREVIEW_TRANSCODE=true`，当前生产默认允许后端在视频落盘阶段生成轻量 mp4 预览，并优先写回 `previewVideoUrl`；若灰度或止血需要临时回退为原始视频预览，应结合 `docs/runbooks/media-release-canary.md` 与 `docs/runbooks/release-rollback.md` 明确记录后再关闭
- 确认 `backend/.env` 中 `MEDIA_ENABLE_VIDEO_HLS=true`，当前生产默认允许后端在视频落盘阶段生成单码率 HLS，并对外返回 `hlsUrl / availableQualities`；若灰度或止血需要临时回退到仅 `previewVideoUrl` 链路，应结合 `docs/runbooks/media-release-canary.md` 与 `docs/runbooks/release-rollback.md` 明确记录后再关闭
- 确认生产机已安装 `ffmpeg` 与 `ffprobe`，否则 `MEDIA_ENABLE_VIDEO_PREVIEW_TRANSCODE` 与 `MEDIA_ENABLE_VIDEO_HLS` 仅会走字段回退，不会产出真实轻量预览/HLS 文件
- 确认 `backend/.env` 中 `SERVE_UPLOADS_VIA_APP=false`，生产环境默认由 `Nginx` 直接承接 `/uploads/`，不要继续让 FastAPI 兜底伺服静态媒体
- 确认 `backend/.env` 中 `BACKGROUND_JOB_EXECUTION_MODE=queue`，生产 Web 进程只负责接请求与提交任务，不再在 worker 进程内直接跑长任务
- 确认 `backend/.env` 中 `CORS_ORIGINS` 已包含：
  - `https://miiooai.com`
  - `https://www.miiooai.com`
  - 你的真实前端域名
- 若需要严格限制上游媒体只接受 HTTPS，可将 `UPSTREAM_MEDIA_REQUIRE_HTTPS=true`
- 保持数据库、Redis、短信和各模型 provider key 为生产值
- 确认服务器 Redis 可用，且 `backend/.env` 中 `REDIS_URL` 指向真实生产实例
- 确认 `backend/.env` 中 `REQUIRE_REDIS_IN_PRODUCTION=true`
- 确认 `backend/.env` 中已配置上游 HTTP client 基线参数：
  - `UPSTREAM_HTTP_MAX_CONNECTIONS`
  - `UPSTREAM_HTTP_MAX_KEEPALIVE_CONNECTIONS`
  - `UPSTREAM_PROVIDER_MAX_CONCURRENCY`
  - `UPSTREAM_MODEL_MAX_CONCURRENCY`
  - `UPSTREAM_MEDIA_MAX_CONCURRENCY`
- 执行 `pip install -r backend/requirements.txt` 时确认已安装 `redis[hiredis]`
- 当前登录验证码、微信扫码登录会话、手机号换绑验证码已切到“Redis 优先、内存回退”模式；开发环境 Redis 不可用时仍可临时回退，但生产多 worker 环境不得依赖该回退模式
- 当前长任务运行时已支持 Redis 队列 Worker；生产需要同时启动 `backend/start_prod.sh` 和 `backend/start_worker.sh` 两类进程，不能只启动 Web 进程
- `SERVE_UPLOADS_VIA_APP=true` 仅作为本地开发或临时排障兜底；生产环境若仍保持开启，即使 Nginx 已做静态托管，也会让“应用层也能直接承接 `/uploads/`”继续存在，偏离本轮运行时治理对静态流量剥离的目标

### 3.1 首轮上线前额外准备

- 腾讯云侧：
  - 准备 `COS` bucket，首选 5 bucket 分层；若想先简单上线，可先用单 bucket + 前缀。
  - 准备 `CDN` 加速域名或回源规则；首轮可直接复用 `www.miiooai.com` 下的媒体路径，不要求新增证书。
- 服务器侧：
  - 在 `/www/wwwroot/miiooaib.com/backend/.env` 写入上述对象存储配置。
  - 确认 `/etc/supervisord.d/miioo-backend.ini` 的 `environment` 已显式带上新增媒体环境变量，避免长期运行只依赖隐式 `.env`。
  - 确认 `ffmpeg / ffprobe / redis-cli / curl` 可用，方便这轮视频和巡检验收。
- 样本侧：
  - 至少准备 1 组图片样本、1 组视频样本、1 组受控下载样本。
  - 若要验 HLS，再额外准备 1 个可转码的新视频样本，不建议一开始就拿全量历史大文件开刀。

## 4. Nginx 反向代理配置（必须）

生产环境 Nginx 必须同时承接 `/api/` 和 `/uploads/` 两条路径。
其中 `/uploads/` 必须使用 `alias` 直接伺服静态媒体，而不是再反向代理回 FastAPI。
**只代理 `/api/` 而遗漏 `/uploads/`，或者虽然配了 `/uploads/` 但仍让应用层长期兜底，是最常见的媒体链路隐患。**

若本轮同时启用 `www.miiooai.com` 主域复用的 `COS/CDN` 闭环，还需要额外补两段媒体路径。仓内模板当前采用“占位 upstream + 未替换前直接 503”的方式，建议按下面的固定步骤替换：

```nginx
set $media_origin_upstream "https://<你的 COS 源站或回源网关>";
set $media_origin_host "<你的 COS 或回源 Host>";
set $media_cdn_upstream "https://<你的 CDN 回源入口>";
set $media_cdn_host "<你的 CDN Host>";

location ~ ^/media/origin/(?<media_origin_path>.*)$ {
    proxy_pass $media_origin_upstream/$media_origin_path$is_args$args;
    proxy_set_header Host $media_origin_host;
}

location ~ ^/media/cdn/(?<media_cdn_path>.*)$ {
    proxy_pass $media_cdn_upstream/$media_cdn_path$is_args$args;
    proxy_set_header Host $media_cdn_host;
}
```

这两段的职责分别是：

- `/media/origin/` 作为对象存储源站访问与受控下载最终跳转目标
- `/media/cdn/` 作为公开预览、视频预览与 HLS 的首轮主路径
- 若首轮 CDN 还没正式切好，可以先让 `media_cdn_upstream / media_cdn_host` 与 `media_origin_*` 保持同一套 COS 源站值，先让 URL 结构稳定，再在下一轮单独切 CDN 回源。

完整 Nginx 配置文件见 [`backend/nginx/miiooai.conf`](../../backend/nginx/miiooai.conf)。

快速部署步骤：

```bash
# 1. 修改配置中的实际路径（alias 和 root 行）
#    将 /root/miioo/backend/uploads 替换为服务器上 backend/uploads/ 的绝对路径

# 1.1. 同步确认 backend/.env 中已设置：
#      SERVE_UPLOADS_VIA_APP=false
#      UPLOAD_DIR=/你的真实 uploads 绝对路径

# 2. 部署并启用
sudo cp backend/nginx/miiooai.conf /etc/nginx/sites-available/miiooai.conf
sudo ln -sf /etc/nginx/sites-available/miiooai.conf /etc/nginx/sites-enabled/

# 3. 验证并重载
sudo nginx -t && sudo nginx -s reload
```

若当前服务器仍是“密码 SSH、未配免密”的口径，仓库也已补充一条本机发起的自动化入口：

```bash
REMOTE_PASSWORD='你的服务器密码' \
bash backend/deploy/supervisor/deploy_media_bplus_main_domain.sh
```

若当前只是“后端代码有更新，需要重新上传部署，但不能覆盖线上已配置好的 `.env / COS / Nginx / Supervisor / uploads`”，则优先使用新的代码刷新入口：

```bash
REMOTE_PASSWORD='你的服务器密码' \
bash backend/deploy/supervisor/deploy_backend_code_preserve_runtime.sh
```

这条脚本会：

- 只打包后端代码、迁移、启动脚本与部署模板
- 默认排除 `.env / .env copy / .env prod / uploads / .venv / .runtime`
- 远端先备份当前代码，再替换 `app / alembic / deploy / nginx / scripts / 脚本` 等代码路径
- 保留线上已有 `MEDIA_STORAGE_MODE`、`MEDIA_PUBLIC_BASE_URL`、`MEDIA_CDN_BASE_URL`、`SecretId / SecretKey / bucket` 等真实 COS 配置
- 自动执行 `pip install -r requirements.txt`、`alembic upgrade head`、`supervisorctl reread/update/restart`

这条脚本会自动完成以下动作：

- 备份远端 `.env / Supervisor / Nginx`
- 给远端 `.env` 补齐 `MEDIA_*` 配置骨架
- 给现有线上 Nginx 插入 `/media/origin/` 与 `/media/cdn/`
- `nginx -t && reload`
- `supervisorctl reread && update && restart`

默认仍按安全口径保持 `MEDIA_STORAGE_MODE=local`；若你已经拿到 COS/CDN 真值，可通过环境变量把 `MEDIA_OBJECT_STORAGE_*`、`MEDIA_ORIGIN_*`、`MEDIA_CDN_*` 一起传给该脚本，再完成真正切换。

核心规则（缺一不可）：

```nginx
# /uploads/ — 静态媒体文件（Nginx 直接伺服，外部 AI 模型可拉取）
location ^~ /uploads/ {
    alias /root/miioo/backend/uploads/;   # ← 改为实际路径
    add_header Access-Control-Allow-Origin *;
    add_header Cache-Control "public, max-age=604800, immutable";
    add_header X-Static-Handled "nginx" always;
    expires 7d;
    autoindex off;
}

# /api/ — FastAPI 后端接口
location /api/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_read_timeout 3600s;
}
```

## 5. uploads 目录持久化（必须）

`uploads/` 目录存放所有用户上传的图片、视频、音频文件。
若进程重启后该目录被清空（如容器无 volume），Seedance 全能参考等功能会报 404。

- 确认 `uploads/` 目录路径固定、可写，且不会被系统清理
- 若用 Docker，必须挂载 volume：`-v /data/miioo-uploads:/root/miioo/backend/uploads`
- 并在 `backend/.env` 里设 `UPLOAD_DIR=/data/miioo-uploads`（绝对路径）
- 保证 `Nginx location /uploads/` 的 `alias` 与 `backend/.env` 中 `UPLOAD_DIR` 指向同一目录；两者不一致时，后端写盘成功但公网访问依然会 404

## 6. 媒体链路检查

- 用诊断脚本一键排查（在服务器上运行）：

```bash
bash backend/scripts/check_uploads_access.sh \
  /uploads/creation/sessions/你的session_id/shots/你的shot_id/uploads/文件名.mp4
```

- 若本次上线包含“历史外链回填为本站托管地址”的迁移动作，执行前后请同步参考：
  - `docs/runbooks/media-storage-migration.md`
  - `./project_ops.sh media-delivery /uploads/某条迁移后的样本文件`
- 若本次上线包含“预览图/封面/HLS 资源切换、CDN 域名切换或缓存刷新”动作，执行前后请同步参考：
  - `docs/runbooks/media-cdn-invalidation.md`
  - `./project_ops.sh media-delivery <某条预览或 HLS 样本地址>`
- 若本次上线包含“媒体链路灰度放量”动作，执行前后请同步参考：
  - `docs/runbooks/media-release-canary.md`
  - `./project_ops.sh media-audit 200`
- 若本次上线后需要做媒体专项止血或回滚，请同步参考：
  - `docs/runbooks/media-release-rollback.md`
  - `./project_ops.sh media-delivery <某条核心样本地址>`

- 随机打开一个图片地址，确认 `https://www.miiooai.com/uploads/...` 可公网访问
- 随机打开一个视频封面或音频文件地址，确认不是临时隧道地址
- 若前端与后端分属不同域名，先确认浏览器里破图请求究竟打到了哪个域名：
  1. 若命中的是前端域名上的 `/uploads/...`，说明前端构建时的 `VITE_API_BASE_URL` 未正确指向后端公网域名，或页面仍在消费未归一的相对路径；这种场景下前端静态站 Nginx 即使本身正常，也会因为没有对应 `location /uploads/` 而返回 `404`
  2. 若命中的是后端公网域名上的 `/uploads/...`，再继续检查后端 Nginx `alias`、`UPLOAD_DIR` 与磁盘文件是否一致
- 当前前端 `normalizeImageUrl()` 在生产环境会把 `/uploads/...` 相对路径自动拼到 `VITE_API_BASE_URL` 的域名上，因此独立域名部署时必须保证：
  1. `frontend/.env.production` 中 `VITE_API_BASE_URL` 指向真实后端公网域名
  2. 若 `/uploads/...` 与 API 不同域承载，则额外设置 `VITE_MEDIA_BASE_URL`；若同域承载，仍建议显式写成当前线上域名，避免历史构建产物继续沿用旧站点
  3. `backend/.env` 中 `PUBLIC_BASE_URL` 与该公网域名保持同口径
  4. 若继续保留“前端域名直接访问 `/uploads/...`”的方案，则前端站点 Nginx 也必须额外转发 `/uploads/` 到后端；否则更推荐直接让浏览器访问后端公网域名上的 `/uploads/...`
- 若浏览器控制台已经出现 `Origin https://chengxvblog.top is not allowed by Access-Control-Allow-Origin`，但请求实际打到的是 `https://www.chengxvblog.top/api/...`，先区分两类情况：
  1. 如果当前前端页面实际部署在 `https://chengxvblog.top`，但该站点本身没有 `/api` 反向代理，则不要把 `VITE_API_BASE_URL` 改成 `https://chengxvblog.top`，否则会直接把所有接口打成 `404`
  2. 如果真实后端只承载在 `https://www.chengxvblog.top`，则 `VITE_API_BASE_URL / VITE_MEDIA_BASE_URL` 仍应保持 `https://www.chengxvblog.top`，此时控制台里看到的“跨域”往往只是 `www` 站点先返回了 `502`，而错误页没带 CORS 头，浏览器才把真实后端异常表象成跨域报错
- 当前 `www.chengxvblog.top` 线上若视频已经真实落盘到 `/www/wwwroot/www.chengxvblog.top/backend/uploads/creation/global/videos/`，但创作页仍不显示，优先核查：
  1. 浏览器请求的视频地址是否仍落在旧域名或错误站点
  2. `frontend/.env.production` 是否已带上 `VITE_MEDIA_BASE_URL=https://www.chengxvblog.top`
  3. 当前站点 Nginx 是否已对 `/uploads/` 配置 `alias /www/wwwroot/www.chengxvblog.top/backend/uploads/;`
- 若生成接口仍报参考素材不可访问，优先核查：
  1. Nginx 是否有 `location /uploads/` 规则
  2. `alias` 路径是否与 `backend/.env` 中 `UPLOAD_DIR` 一致
  3. `backend/.env` 中是否已设置 `SERVE_UPLOADS_VIA_APP=false`，避免把生产问题误判成仍依赖 FastAPI 兜底
  4. 文件是否真实存在于磁盘（`ls` 验证）

## 7. 人工验收建议

- 登录与刷新 token
- 新建项目与封面上传
- 主体图片生成、分镜图片生成、分镜视频生成
- 创作页图片、视频、配音
- 剪辑导出与结果下载

## 8. 长任务 Worker 启动

- Web 进程：

```bash
bash backend/脚本/start_cloud.sh web
```

- 长任务 Worker 进程：

```bash
bash backend/脚本/start_cloud.sh worker
```

- `backend/脚本/start_prod.sh` 与 `backend/start_worker.sh` 共享同一套启动 bootstrap，但默认会进入“固定线上虚拟环境”模式：默认使用 `PROD_VENV_DIR=/www/wwwroot/miiooaib.com/backend/.venv`，若该虚拟环境缺失、Python 版本不兼容或依赖未装全，会直接失败提示，而不是自动重建或在线补装依赖。
- 当前仓库已补充 `backend/脚本/start_cloud.sh` 与根目录 `./start_backend.sh cloud / cloud-worker` 作为更推荐的线上启动入口：脚本会先关闭本地公网隧道、清理 `.runtime` 下的临时公网地址文件，并显式以 `PUBLIC_BASE_URL_FILE=""`、`SERVE_UPLOADS_VIA_APP=false`、`APP_ENV=production`、`BACKGROUND_JOB_EXECUTION_MODE=queue` 的云端口径启动，避免线上误读本地 `trycloudflare` 覆盖。
- 若当前云端固定目录就是 `/www/wwwroot/miiooaib.com/backend`，可直接使用新增的 `bash backend/脚本/start_cloud_server.sh web` 或 `bash backend/脚本/start_cloud_server.sh worker`，无需再额外手工传 `PROD_VENV_DIR`。
- 如线上实际部署目录不是 `/www/wwwroot/miiooaib.com/backend/.venv`，请显式覆盖后再启动，例如：`PROD_VENV_DIR=/your/backend/.venv bash backend/脚本/start_prod.sh`、`PROD_VENV_DIR=/your/backend/.venv bash backend/start_worker.sh`。
- `backend/脚本/start_prod.sh` 默认会带上 `APP_ENV=production`、`BACKGROUND_JOB_EXECUTION_MODE=queue`、`WORKERS=2`、`HOST=0.0.0.0`、`PORT=8000`，并开启 `uvicorn --proxy-headers`；`backend/start_worker.sh` 默认会带上 `APP_ENV=production` 与 `BACKGROUND_JOB_EXECUTION_MODE=queue`。
- Supervisor / PM2 等进程管理器至少要拆成两组：
  - Web：`uvicorn app.main:app --workers 2`
  - Worker：`python -m app.workers.background_worker`
- 如果只启动 Web 不启动 Worker，在 `BACKGROUND_JOB_EXECUTION_MODE=queue` 下，任务会停留在 `pending`

### 8.1 Supervisor 模板

仓库已提供可直接改路径后落地的 Supervisor 模板：

- [`backend/deploy/supervisor/miioo-backend.conf`](file:///Users/xingyi/Desktop/迭代一版/backend/deploy/supervisor/miioo-backend.conf)

模板默认约定：

- 部署目录：`/www/wwwroot/miiooaib.com/backend`
- 固定虚拟环境：`/www/wwwroot/miiooaib.com/backend/.venv`
- 运行用户：`www`
- 日志目录：`/www/wwwroot/miiooaib.com/backend/logs/supervisor`
- Web 入口：`./脚本/start_prod.sh`
- Worker 入口：`./start_worker.sh`

服务器使用步骤：

```bash
# 1. 准备日志目录
mkdir -p /www/wwwroot/miiooaib.com/backend/logs/supervisor
chown -R www:www /www/wwwroot/miiooaib.com/backend/logs

# 2. 部署 supervisor 配置
cp /www/wwwroot/miiooaib.com/backend/backend/deploy/supervisor/miioo-backend.conf \
  /etc/supervisord.d/miioo-backend.ini

# 3. 重新加载并启动
supervisorctl reread
supervisorctl update
supervisorctl status
```

常用排查命令：

```bash
supervisorctl restart miioo-web
supervisorctl restart miioo-worker
supervisorctl tail -100 miioo-web
supervisorctl tail -100 miioo-worker
```

若你希望把这组高频命令收口为仓库根目录可复用脚本，可直接使用：

```bash
./project_ops.sh status
./project_ops.sh restart all
./project_ops.sh logs web 100
./project_ops.sh follow worker
./project_ops.sh reread
./project_ops.sh nginx-test
./project_ops.sh nginx-reload
./project_ops.sh port
./project_ops.sh check
```

说明：

- `project_ops.sh` 默认按当前生产口径操作 `miioo-web / miioo-worker`
- 默认日志路径为 `logs/supervisor/web.log` 与 `logs/supervisor/worker.log`
- 若你的线上 Supervisor 名称或日志路径不同，可通过环境变量覆盖 `SUPERVISOR_WEB_NAME / SUPERVISOR_WORKER_NAME / WEB_LOG_FILE / WORKER_LOG_FILE`

若你的线上目录、运行用户或虚拟环境路径不同，只改模板里的以下字段即可：

- `directory`
- `user`
- `command`
- `stdout_logfile`
- `environment=PROD_VENV_DIR=...`

## 9. 容量预算基线

- 默认数据库池预算见 [生产环境容量预算基线.md](file:///Users/xingyi/Documents/222222/docs/plans/生产环境容量预算基线.md)
- 当前默认值下：
  - Web：`2` 个 worker
  - 长任务 Worker：`1` 个独立进程
  - 单进程数据库理论上限：`pool_size + max_overflow = 15`
  - 当前总理论数据库连接上限：`45`
- 在没有结合生产 `PostgreSQL max_connections` 做核算前，不建议继续直接上调 Web worker 数量

## 10. 首轮压测基线

- 真实环境热点链路轻量压测脚本见 [runtime-loadtest.md](file:///Users/xingyi/Documents/222222/docs/runbooks/runtime-loadtest.md)
- 迁移执行、`EXPLAIN (ANALYZE, BUFFERS)`、压测结果落仓与阈值回写的完整闭环见 [runtime-verification.md](file:///Users/xingyi/Documents/222222/docs/runbooks/runtime-verification.md)
- 若需要直接复制结果文件结构，可配合 [runtime-result-templates.md](file:///Users/xingyi/Documents/222222/docs/runbooks/runtime-result-templates.md)
- 当前脚本入口为：

```bash
python3 backend/scripts/loadtest_runtime_baseline.py \
  --base-url https://www.miiooai.com \
  --token "$ACCESS_TOKEN"
```

- 若要补分镜列表与媒体链路基线，可继续追加：
  - `--project-id "$PROJECT_ID"`
  - `--media-url "$MEDIA_URL"`
- 建议先以 `requests=50`、`concurrency=10` 做首轮基线，再逐步抬高，不要在未核算数据库和 Redis 余量前直接高压

## 11. 上线后验证

部署完成后，建议按以下顺序执行：

1. 执行 Alembic 迁移并确认版本到达 `head`
2. 校验 `pg_trgm` 扩展与新增索引存在
3. 按 [runtime-verification.md](file:///Users/xingyi/Documents/222222/docs/runbooks/runtime-verification.md) 执行热点搜索 SQL 的 `EXPLAIN (ANALYZE, BUFFERS)`
4. 按 [runtime-loadtest.md](file:///Users/xingyi/Documents/222222/docs/runbooks/runtime-loadtest.md) 执行首轮轻量压测
5. 结合 [runtime-observability.md](file:///Users/xingyi/Documents/222222/docs/runbooks/runtime-observability.md) 采集日志与指标，并将结果落仓到 `docs/plans/`
6. 需要沉淀迁移核验、搜索 `EXPLAIN`、压测与阈值调整结论时，可直接套用 [runtime-result-templates.md](file:///Users/xingyi/Documents/222222/docs/runbooks/runtime-result-templates.md)

## 12. 上游失败观测

- 当前统一上游 client 已补入 `app.upstream` 日志口径；当 provider / model / media 链路出现超时、`429`、`5xx`、请求错误或非预期异常时，会输出统一结构化字段
- 当前日志重点字段包括：
  - `profile=provider|model|media`
  - `operation=<具体操作>`
  - `category=retryable_http_status|timeout|request_error|http_status|unexpected`
  - `retryable=true|false`
  - `status_code=<上游状态码>`
  - `context=<provider_type/base_url/...>`
- 建议在生产日志中优先关注：
  - `category=retryable_http_status`
  - `category=timeout`
  - `status_code=429`
  - `status_code=502|503|504`
- 目前 `MiniMax` 运行时链路和服务商连通性测试已接入该日志口径；后续继续扩展到更多上游任务链路时，统一沿用同一字段集合

## 13. 运行时指标与告警

- 运行时指标清单、日志入口和初版告警阈值见 [runtime-observability.md](file:///Users/xingyi/Documents/222222/docs/runbooks/runtime-observability.md)
- 当前建议最少纳入巡检或告警的日志源：
  - `app.request`
  - `app.sql`
  - `app.upstream`
  - `app.background_runtime`
  - Nginx `/uploads/` access/error log
- 当前建议优先落地的阈值类别：
  - API `5xx` 比例
  - 慢请求数量
  - 慢 SQL 数量
  - 上游 `timeout / 429 / 5xx`
  - Redis 队列长度
  - `/uploads/` 访问异常率

## 14. SSE 流式接口约束

- `SSE` 运行约束见 [runtime-sse.md](file:///Users/xingyi/Documents/222222/docs/runbooks/runtime-sse.md)
- 当前仓库中真实使用 `text/event-stream` 的接口只包括：
  - `/api/llm/chat/stream`
  - `/api/projects/{project_id}/episodes/{episode_id}/generate/stream`
- 长任务主链路仍然使用 `GenTask + 轮询`，不要把图片/视频/导出类任务临时改成 `SSE` 主承载
- 生产 Nginx 必须对真实 SSE 端点关闭代理缓冲：
  - `proxy_buffering off`
  - `proxy_cache off`
  - `add_header X-Accel-Buffering no`
- 若后续新增 SSE 端点，必须同步修改：
  - `backend/nginx/miiooai.conf`
  - `docs/runbooks/runtime-sse.md`
  - 本手册

## 14.1 微信扫码登录 apex 回调站点（必须）

微信开放平台「授权回调域」登记的是 apex 域名 `miiooai.com`（仅域名，不带 `https://`、不带路径）。扫码确认后微信会把二维码 iframe 跳回 `https://miiooai.com/?code=...&state=...`，前端 SPA 需在根路径承接 `code/state` 并调用 `/api/auth/wechat/callback/complete`。

既有 `backend/nginx/miiooai.conf` 只绑定 `www.miiooai.com miiooaib.com`，**不含 apex `miiooai.com`**。apex 是独立站点，必须单独配置，否则扫码跳回 apex 会直接 `404`，后端回调逻辑根本不执行。

- apex 站点 nginx 模板见 [`backend/nginx/miiooai-apex.conf`](../../backend/nginx/miiooai-apex.conf)，关键两段：
  - `location /api/` 反代到同一个 FastAPI(:8000)，保证 `/api/auth/wechat/callback/complete` 可达
  - `location /` 用 `try_files $uri $uri/ /index.html` 做 SPA 回退，承接 `code/state`
- apex 与 www 必须指向 **同一套后端 + 同一份前端构建产物**，否则 www 端建立的扫码会话与 apex 端回调会话对不上。
- 同步本轮后端代码后必须 **重启 `miioo-web`**，否则线上残留的旧 `WECHAT_OPEN_REDIRECT_URI` 不会被覆盖。

部署与自检：

```bash
# 部署 apex 站点
sudo cp backend/nginx/miiooai-apex.conf /www/server/panel/vhost/nginx/miiooai.com.conf
sudo nginx -t && sudo nginx -s reload

# 一键自检（apex 回调入口 / 后端回调接口 / CORS apex→www / 二维码 redirect_uri 主机）
bash backend/scripts/check_wechat_login.sh
```

注意：localhost 无法登记到微信开放平台，**本地不可验证真实微信扫码**，只能在 `https://miiooai.com` 上测。详细根因见 [`docs/plans/微信扫码登录回调链路核对.md`](../plans/微信扫码登录回调链路核对.md)。

## 15. 备注

- 当前仓库应统一以“页面 origin = `https://miiooai.com`、API/media = `https://www.miiooai.com`”作为默认生产口径；若仓内仍残留历史域名，请按本手册统一回收
- 只要后端 `CORS_ORIGINS` 明确包含 `https://miiooai.com`，前端从 apex 访问 `https://www.miiooai.com` 属于正常跨域场景，不需要修改页面层请求写法
- 若后续前端正式域名确定，记得只补 `CORS_ORIGINS`，不要再改页面层接口调用方式
- 若本次部署同时包含索引迁移，请在迁移执行后按 [runtime-verification.md](file:///Users/xingyi/Documents/222222/docs/runbooks/runtime-verification.md) 补完索引命中与压测结果，不要只停留在“迁移已执行”
