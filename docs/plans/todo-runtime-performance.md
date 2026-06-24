# Todo：生产运行时与性能治理

## 1. 共享状态

| 事项 | 层级 | 当前状态 | 依赖 | 事实源 | 验收口径 |
|---|---|---|---|---|---|
| 登录验证码共享状态 Redis 化 | 后端 + 部署 | 进行中 | Redis、认证链路 | `生产环境并发与性能治理计划.md` | 多 worker 下验证码发送、校验与过期回收稳定一致，不再依赖单进程命中 |
| 微信扫码登录会话 Redis 化 | 后端 + 部署 | 进行中 | Redis、扫码登录链路 | `生产环境并发与性能治理计划.md` | `qrcode -> poll -> confirm` 在多 worker 下稳定可用，不再出现偶发状态丢失 |
| 手机号换绑验证码共享状态化 | 后端 + 部署 | 进行中 | Redis、资料页换绑链路 | `生产环境并发与性能治理计划.md` | 资料页换绑验证码状态可跨 worker 共享，过期与重发逻辑一致 |
| 共享状态 TTL / 幂等 / 清理策略固化 | 后端 + 文档 | 进行中 | Redis 方案落地 | `生产环境并发与性能治理计划.md` | 所有共享票据类状态都有 TTL、幂等键和清理策略说明 |

当前进展：

- `backend/app/services/runtime_state.py` 已新增共享状态服务，优先走 Redis，异常时回退到内存态
- `backend/app/routers/auth.py` 与 `backend/app/routers/users.py` 已切到共享状态服务，不再直接持有进程内 `dict`
- `backend/tests/test_runtime_state.py` 已补齐首轮聚焦测试；当前本地使用 `PYTHONPATH=. pytest tests/test_runtime_state.py` 已通过
- 当前剩余收口重点是：真实生产 Redis 连通性、部署脚本/环境安装、以及多 worker 下的真实联调验证

## 2. 长任务运行时

| 事项 | 层级 | 当前状态 | 依赖 | 事实源 | 验收口径 |
|---|---|---|---|---|---|
| 盘点 `asyncio.create_task(...)` 入口 | 后端 + 文档 | 进行中 | 路由与任务链路清单 | `生产环境并发与性能治理计划.md` | 明确区分哪些任务可继续短任务化、哪些必须迁到队列 worker |
| 长任务执行层与 Web 层职责拆分 | 后端 | 进行中 | 队列方案、任务模型 | `生产环境并发与性能治理计划.md`、`ADR-002-gen-task-runtime.md` | Web 进程只承接创建/查询/取消，长任务执行迁到统一 worker |
| 长任务重试、取消、失败补偿语义收口 | 后端 + 文档 | 待实施 | 队列化方案 | `生产环境并发与性能治理计划.md` | 任务失败、取消、重试与部分完成状态有统一约束和说明 |
| 长任务容量预算表 | 后端 + 部署 + 文档 | 待实施 | worker 模型、数据库连接预算 | `生产环境并发与性能治理计划.md` | 能明确说明 Web worker、任务 worker 与数据库连接之间的容量关系 |

当前进展：

- 已新增 `backend/app/services/background_runtime.py`，统一承接后台任务调度、命名、异常日志、同进程取消与 shutdown 清理
- `tasks / storyboards / workbench / creation / compositions` 路由中的分散 `asyncio.create_task(...)` 与 `BackgroundTasks` 已收口到统一调度服务
- `POST /api/tasks/{task_id}/cancel` 已补同进程取消触发，不再只改数据库状态
- `backend/app/services/background_runtime.py` 已继续升级为“可切换的统一运行时门面”：开发态仍可内联调度，生产态已支持通过 Redis 队列把任务下发给 `backend/app/workers/background_worker.py` 执行；`tasks / storyboards / workbench / creation / compositions` 当前已改为通过可序列化 `handler_path + kwargs` 提交任务，不再直接把协程对象绑定死在 Web 进程里
- `backend/start_prod.sh` 与新增的 `backend/start_worker.sh` 已开始显式区分 Web 进程与长任务 Worker 的启动职责；`docs/runbooks/production-deploy.md` 当前也已补齐 `BACKGROUND_JOB_EXECUTION_MODE=queue`、Worker 常驻进程和“只起 Web 不起 Worker 会导致任务停留 pending”的部署约束
- `backend/app/routers/storyboards.py` 已把后台继续生成分镜的粗粒度 `storyboard-bg:{project_id}` job key 收口为“项目 + 分集集合 + task 标识”的更细粒度键，降低同项目后台任务互相覆盖的风险
- `backend/app/routers/auth.py`、`backend/app/routers/users.py` 与 `backend/app/routers/tasks.py` 已先补入一层最小可用的 Redis 共享限流，用于短信验证码发送、二维码轮询和任务创建/取消/重试热点接口，先为最容易放大 QPS 的入口补上第一层保护

## 3. 前端请求与轮询治理

| 事项 | 层级 | 当前状态 | 依赖 | 事实源 | 验收口径 |
|---|---|---|---|---|---|
| 页面层直接 `fetch` 盘点与收口 | 前端 + 文档 | 进行中 | 页面与组件检索结果 | `生产环境并发与性能治理计划.md` | 页面层不再新增绕过 `src/api/` 的请求，现存直连请求有清理计划 |
| 轮询入口统一收口到适配层 | 前端 + 适配层 | 进行中 | 请求层与业务 API | `生产环境并发与性能治理计划.md` | 登录、任务、成片、资料绑定等轮询统一走同层封装 |
| 轮询退避与停止条件统一化 | 前端 + 适配层 | 进行中 | 轮询封装 | `生产环境并发与性能治理计划.md` | 轮询具备指数退避、终态停止、页面隐藏暂停和失败回退能力 |
| 高频读接口缓存与去重策略补审 | 前端 + 适配层 | 进行中 | `request.js` 现有缓存层 | `生产环境并发与性能治理计划.md` | 高频列表和概览接口有明确 TTL、失效与强刷策略，避免轮询与读缓存互相打架 |

当前进展：

- 已盘出页面层直连 `fetch` 热点主要集中在资产下载、创作结果下载、分镜下载与图片详情下载
- 已确认 `LoginModal.jsx` 的扫码轮询是串行 `setTimeout`，但 `ProfileModal.jsx` 的微信绑定轮询此前仍是 `setInterval(async ...)`
- `frontend/src/components/ProfileModal.jsx` 已先收口为串行 `setTimeout` 轮询，避免接口未返回时继续重叠发起新请求
- `frontend/src/api/composition.js` 已补入成片单条状态读取适配，`frontend/src/pages/EditPage.jsx` 的成片导出轮询也已从 `setInterval(async ...)` 改为串行 `setTimeout`，避免导出接口慢于 3 秒时继续叠加并发轮询请求
- 已新增 `frontend/src/api/polling.js` 共享轮询工具，并将 `frontend/src/api/subject.js`、`frontend/src/api/storyboard.js`、`frontend/src/api/creation.js` 内部分散的任务轮询实现统一收口到同一套 `pollUntil(...)` 机制，减少成功/失败判定、超时和轮询间隔逻辑继续分叉
- 已新增 `frontend/src/utils/serialPolling.js` 共享串行轮询工具，并已接入 `frontend/src/components/LoginModal.jsx` 与 `frontend/src/components/ProfileModal.jsx` 的微信扫码/绑定轮询；当前这两处 UI 层轮询已统一具备“上一轮未结束不发下一轮、页面隐藏暂停、页面恢复后自动继续”的基础能力
- `frontend/src/api/polling.js` 与 `frontend/src/utils/serialPolling.js` 已继续补入连续错误退避能力；当前 API 层任务轮询和 UI 层二维码轮询在遇到临时请求错误时，会按 `2s -> 4s -> 8s` 一类封顶退避节奏自动拉长间隔，并在连续错误超过阈值后停止，避免异常窗口内继续以固定频率放大请求
- 已新增 `frontend/src/api/download.js` 作为共享下载/对象 URL 转文件适配层，并已接入 `AssetsPage.jsx`、`CreationPage.jsx`、`ImageDetailModal.jsx`、`StoryboardPage.jsx`
- `frontend/src/api/download.js` 已继续补入共享 `triggerUrlDownload(...)`，并已把 `SubjectPage.jsx` 的本地 Blob 下载实现与 `StoryboardPage.jsx` 的本地 `<a download>` 逻辑收口到统一下载工具，减少页面层继续复制下载细节的风险
- `frontend/src/api/subject.js` 已继续补入主体列表/详情的 `desc + imageUrl` 归一化，`SubjectPage.jsx` 当前对主体主图的页面层兜底已开始缩减为优先消费适配层视图模型，而不是继续在页面内重复猜 `primary_image_url / image_url / imageUrl`
- `frontend/src/api/subject.js` 已继续补入主体图片生成结果与已生成图片列表的统一归一化，当前 `SubjectPage.jsx` 已开始直接消费 `rawUrl / url / imageUrl / settled`，减少页面内继续手写 `result.image_url || result.imageUrl || result.url` 和 `img.image_url || img.file_url || img.url` 这类结果回退分支
- `frontend/src/api/storyboard.js` 已继续补入分镜图/分镜视频生成结果的统一归一化，`frontend/src/pages/StoryboardPage.jsx` 当前已开始直接消费 `imageUrl / videoUrl / rawUrl`，并把主体参考图补水从 `subject.imageUrl || subject.image_url` 收窄为优先消费适配层视图模型，降低页面层继续散落媒体回退链的风险
- `frontend/src/components/BatchDownloadModal.jsx`、`frontend/src/components/AssetPickerModal.jsx` 与 `frontend/src/components/edit/MaterialLibraryPanel.jsx` 已继续接入共享媒体 getter / builder；当前组件层已开始统一通过 `mediaItem.js` 读取缩略图、视频地址与下载地址，不再在组件内部继续维护 `thumbnail || url`、`previewUrl || url`、`videoUrl || url` 这类局部回退顺序
- `frontend/src/components/ImageDetailModal.jsx`、`frontend/src/components/CreationVideoDetailModal.jsx` 与 `frontend/src/components/ShotViewerModal.jsx` 已继续接入共享媒体 getter / 下载工具；当前详情弹窗与镜头预览已开始统一通过 `mediaItem.js` 读取主图、参考图、参考视频与下载地址，并移除本地 `<a download>` 等页面内下载实现
- `frontend/src/api/request.js` 已补入统一缓存 TTL 预设与 `buildRequestCache(...)` helper，`frontend/src/api/assets.js` 当前也已开始为资产列表 / 详情补入高频读缓存和写后失效逻辑，进一步把“缓存多久、何时强刷、何时失效”从页面消费层收口到 API 适配层
- 当前 `frontend/src` 中页面层直接 `fetch(` 热点已基本消除，剩余主要集中在统一 API 层和 `loginBackgroundCache.js` 这类浏览器缓存工具

## 4. 媒体与静态资源治理

| 事项 | 层级 | 当前状态 | 依赖 | 事实源 | 验收口径 |
|---|---|---|---|---|---|
| `/uploads` 生产静态流量剥离方案确认 | 后端 + 部署 + 文档 | 进行中 | Nginx、生产部署方案 | `生产环境并发与性能治理计划.md`、`production-deploy.md` | 生产媒体访问不再默认穿过 FastAPI 应用层 |
| 图片/视频/音频下载链路统一走正确承载层 | 前端 + 后端 + 部署 | 进行中 | 媒体 URL 语义、静态托管方案 | `生产环境并发与性能治理计划.md` | 预览、下载、首帧图、缩略图各自使用正确地址与承载路径 |
| 热点媒体缓存策略固化 | 前端 + 部署 + 文档 | 待实施 | Nginx/CDN/浏览器缓存策略 | `生产环境并发与性能治理计划.md` | 重复访问的静态媒体命中率提高，回源压力下降 |

当前进展：

- 已为后端新增 `SERVE_UPLOADS_VIA_APP` 配置开关；`backend/app/main.py` 当前仅在该开关开启时才继续挂载 FastAPI 的 `/uploads`，为生产环境关闭应用层静态托管留出正式入口
- `docs/runbooks/production-deploy.md` 已明确要求生产 `backend/.env` 设置 `SERVE_UPLOADS_VIA_APP=false`，并强调 `Nginx location /uploads/` 必须走 `alias` 直出而不是回源 FastAPI
- `backend/nginx/miiooai.conf` 已同步补成更明确的静态直出示例：`location ^~ /uploads/`、`Cache-Control: public, max-age=604800, immutable`、`expires 7d` 与 `X-Static-Handled: nginx`
- `backend/scripts/check_uploads_access.sh` 已把“内网 FastAPI 探测”降级为开发/排障兜底检查，避免生产已关闭应用层静态托管时仍把非 200 误判成异常
- 已新增 `frontend/src/utils/mediaItem.js` 共享媒体对象工具，并先接入 `frontend/src/pages/StoryboardPage.jsx`；当前分镜图、分镜视频、本地参考图/视频/音频上传、卡片预览与下载入口已开始从宽泛 `media.url` 收口为显式 `imageUrl / videoUrl / thumbnailUrl / downloadUrl` 语义，减少 `/uploads` 直出后继续把展示地址、下载地址和 poster 地址混用的风险
- `frontend/src/api/assets.js` 现已把资产列表与资产详情继续归一为显式媒体对象；`frontend/src/pages/AssetsPage.jsx` 与 `frontend/src/pages/CreationPage.jsx` 也已接入共享 `mediaItem` 工具，开始统一卡片展示地址、视频 `poster`、详情弹窗与下载地址的承接顺序，降低页面层继续手写 `imageUrl || videoUrl || audioUrl || url` 回退链的风险

## 5. 数据库与容量治理

| 事项 | 层级 | 当前状态 | 依赖 | 事实源 | 验收口径 |
|---|---|---|---|---|---|
| 数据库连接预算表整理 | 后端 + 部署 + 文档 | 进行中 | worker 数、连接池参数、Postgres 限制 | `生产环境并发与性能治理计划.md` | 能清楚说明每种部署组合下的总连接占用和安全上限 |
| 热点列表与聚合查询索引补审 | 后端 | 进行中 | 当前热点接口与已加索引现状 | `生产环境并发与性能治理计划.md` | 热点列表、任务列表、通知列表、聚合查询均有对应索引与稳定分页策略 |
| PgBouncer / 连接池代理是否需要引入 | 后端 + 部署 + 文档 | 待评估 | 连接预算与压测结果 | `生产环境并发与性能治理计划.md` | 有明确“需要 / 暂不需要”的结论及原因，不靠拍脑袋决定 |
| 压测基线首轮执行 | 后端 + 部署 + 文档 | 进行中 | 压测脚本、真实环境窗口 | `生产环境并发与性能治理计划.md` | 至少产出认证、任务、热点列表、媒体访问的基础压测结果 |

## 6. SSE、上游调用与限流

| 事项 | 层级 | 当前状态 | 依赖 | 事实源 | 验收口径 |
|---|---|---|---|---|---|
| SSE 接口运行约束说明 | 后端 + 部署 + 文档 | 进行中 | LLM / 剧本流式接口 | `生产环境并发与性能治理计划.md` | 明确连接上限、超时、代理层要求和回退机制 |
| 上游 HTTP client 统一策略 | 后端 | 进行中 | `httpx` 调用点盘点 | `生产环境并发与性能治理计划.md` | 外部调用统一连接池、超时、重试、并发控制与错误分类 |
| 登录、任务、轮询类接口限流 | 后端 + 部署 | 待实施 | Redis、网关或应用层限流方案 | `生产环境并发与性能治理计划.md` | 关键热点接口具备明确限流与降级策略 |
| 上游 429 / 5xx 观测与熔断策略 | 后端 + 文档 | 进行中 | 统一 client、日志与指标 | `生产环境并发与性能治理计划.md` | 上游限流、超时、错误不会直接无控制地放大本系统抖动 |

## 7. 可观测性与回写

| 事项 | 层级 | 当前状态 | 依赖 | 事实源 | 验收口径 |
|---|---|---|---|---|---|
| 关键运行时指标清单固化 | 后端 + 部署 + 文档 | 进行中 | 请求、SQL、任务、媒体、SSE | `生产环境并发与性能治理计划.md` | 至少有请求、慢 SQL、队列长度、轮询频率、媒体带宽、上游错误率指标清单 |
| 生产告警阈值初版整理 | 后端 + 部署 + 文档 | 进行中 | 指标方案、日志方案 | `生产环境并发与性能治理计划.md` | 对超时、错误率、慢请求、连接耗尽、队列堆积有初版告警规则 |
| 运行时治理结果回写纪律 | 文档 | 进行中 | 计划文档、进度文档、changelog | `功能模块Todo文档.md` | 每次完成一个运行时治理项后，同步回写计划、进度和 changelog |

当前进展：

- 已新增 `backend/app/services/http_client.py` 作为统一上游 HTTP client 门面，按 `provider / model / media` 三类 profile 统一承接连接池、keepalive、基础并发槽位与错误分类，不再让高频服务层各自临时创建 `httpx.AsyncClient`
- `backend/app/services/image_gen.py`、`video_gen.py`、`media_storage.py`、`minimax_voice_runtime.py`、`llm.py`、`minimax_voice_catalog.py`、`tts.py` 与 `composition_export.py` 已接入 `upstream_async_client(...)`；当前业务服务层内残留的直接 `httpx.AsyncClient(...)` 已收口到统一门面自身
- 已新增 `docs/plans/生产环境容量预算基线.md`，把当前默认 `WORKERS=2`、长任务 Worker `1` 个进程、数据库池 `pool_size=5 + max_overflow=10`、Redis 运行时职责与上游 HTTP 并发预算统一留仓，避免后续继续“凭感觉加 worker”
- 已新增 `backend/app/services/media_fetch.py`，并将 `assets.py`、`projects.py`、`subjects.py`、`storyboards.py`、`creation.py`、`workbench.py` 中用于打包下载和媒体导出的远程抓取 helper 切到统一 `media` profile，不再在这些热点路由里各自临时创建 `httpx.AsyncClient`
- 已新增 `backend/scripts/loadtest_runtime_baseline.py` 与 `docs/runbooks/runtime-loadtest.md`，为 `auth/me`、任务列表、资产列表、分镜列表、媒体访问提供首轮轻量压测入口；当前脚本已可在真实环境输出 Markdown 格式基线结果，下一步只差你手工执行并把结果落仓
- 已在 `backend/app/services/http_client.py` 增加 `app.upstream` 统一失败日志 helper，当前会按 `profile / operation / category / retryable / status_code / context` 输出上游失败结构化字段；`backend/app/services/minimax_voice_runtime.py` 与 `backend/app/utils/connection_tester.py` 已接入该口径，其中 `connection_tester.py` 也已切到统一 `upstream_async_client(...)`，当前 `backend/app` 下残留的直接 `httpx.AsyncClient(...)` 仅剩统一门面自身
- 已新增 `docs/runbooks/runtime-observability.md`，把当前已落地的 `app.request`、`app.sql`、`app.upstream`、`app.background_runtime` 和 Nginx `/uploads/` 日志统一整理为第一版运行时指标清单，并给出 API `5xx`、慢请求、慢 SQL、上游 `timeout/429/5xx`、Redis 队列长度、`/uploads/` 异常率的初版告警阈值；当前仍以日志巡检和手工告警为主，后续需结合真实压测结果再校正阈值
- 已新增 `docs/runbooks/runtime-sse.md`，把当前真实 SSE 端点、前端自动降级消费、代理层去缓冲要求和回退策略统一留仓；同时 `backend/nginx/miiooai.conf` 已为 `/api/llm/chat/stream` 与 `/api/projects/{project_id}/episodes/{episode_id}/generate/stream` 增加专用 SSE location，显式关闭 `proxy_buffering` 和 `proxy_cache`，避免流式响应被 Nginx 缓冲。当前长任务主链路仍明确保持 `GenTask + 轮询`，不把 SSE 混入长任务主承载
- 已新增 `docs/plans/热点查询索引审计-2026-06-14.md`，把任务列表、资产列表、通知列表、项目概览和默认模型选择等热点读路径的索引现状、主要风险和后续治理顺序留仓；同时新增 Alembic 迁移 `backend/alembic/versions/ab9f1c2d3e45_add_query_audit_indexes.py`，先补 `notifications`、`gen_tasks`、`assets`、`model_configs`、`subjects`、`compositions` 这几条低风险高收益的复合索引，为后续继续做分页稳定性和深分页治理提供基础
- 已继续把 `backend/app/routers/creation.py` 中最明显的两处内存过滤改为 SQL 下推：`list_creation_images(...)` 当前已把来源、会话、镜头、分类、收藏、搜索词过滤和总数统计统一下推到数据库，并保留原有分页返回结构；`list_creation_tasks(...)` 也已改为按 `user_id + task_type + status + params.session_id + params.shot_id` 直接在 SQL 层过滤，不再先查全量任务再在 Python 中逐条筛选。这样创作页在图片资产和创作任务积累后，不会再因后端先全量加载再切片而放大数据库和应用层压力
- 已继续把 `notifications` 从固定最近 50 条升级为标准分页：`backend/app/routers/notifications.py` 当前已按 `created_at desc, id desc` 稳定倒序分页返回，并补入 `total / has_more / page / page_size`；`frontend/src/api/user.js` 已兼容新响应结构并继续为旧消费点默认返回数组，`frontend/src/components/NotificationCenterModal.jsx` 也已接入“加载更多”。当前通知列表已经不再停留在截断式读取，但 `tasks / assets` 的更深层分页治理仍待继续推进
- 已继续把 `tasks / assets` 的基础分页口径标准化：`backend/app/routers/tasks.py` 与 `backend/app/routers/assets.py` 当前都已从“仅返回数组”升级为“稳定倒序 + `list / total / has_more / limit / offset`”，其中任务列表按 `created_at desc, id desc` 返回，资产列表按现有业务语义继续区分普通资产与回收站排序；`frontend/src/api/assets.js` 与 `frontend/src/api/composition.js` 也已兼容新响应结构，并继续向现有调用方默认返回数组。这样后续如果继续做“加载更多”或 cursor/keyset，不用再先回头改一轮接口契约
- 已继续把 `assets` 深分页推进到兼容式 cursor/keyset：`backend/app/routers/assets.py` 当前已新增 `cursor` 查询参数与 `next_cursor / nextCursor` 返回字段，普通资产列表按 `created_at desc, id desc` 生成游标，回收站列表按 `deleted_at desc, created_at desc, id desc` 生成游标；`frontend/src/api/assets.js` 也已兼容新字段。当前旧调用点仍可继续走数组或 `offset/limit`，后续页面若需要“加载更多”或避免深分页扫描，可渐进切到 cursor 口径
- 已继续把 `assets` 的前端高频消费点接到 `next_cursor`：`frontend/src/api/assets.js` 中的 `apiGetProjectAssets(...)` 当前已开始在内部自动追下一页游标，因此 `AssetsPage` 与 `EditPage` 拉项目资产时不再停留在“只读第一页”的旧口径；`frontend/src/components/AssetPickerModal.jsx` 也已在项目资产拉取链路内部接入 `next_cursor`，在不改弹窗视觉和交互的前提下，改为渐进翻完整个项目资产列表
- 已继续把 `tasks` 深分页推进到兼容式 cursor/keyset：`backend/app/routers/tasks.py` 当前已新增 `cursor` 查询参数与 `next_cursor / nextCursor` 返回字段，任务列表按 `created_at desc, id desc` 生成游标；`frontend/src/api/composition.js` 也已兼容新字段。当前旧调用点仍可继续走数组或 `offset/limit`，后续若需要避免深分页扫描或补“加载更多”，可直接渐进切到 cursor 口径
- 已继续把 `tasks` 的前端真实消费点接到 `next_cursor`：`frontend/src/api/composition.js` 当前已新增 `apiGetLatestCompositionExportTask(...)`，会按 `next_cursor` 渐进读取项目任务列表，并匹配当前成片的最新 `composition_export` 任务；`frontend/src/pages/EditPage.jsx` 中成片导出状态轮询也已优先改为读取项目任务列表，仅在任务终态或未命中时才回退刷新成片详情。这样剪辑页导出轮询已不再只依赖反复拉取成片列表，任务分页治理开始进入真实页面消费阶段
- 已完成一轮热点列表排序稳定性复查：`backend/app/routers/compositions.py`、`audio_clips.py`、`video_clips.py`、`episodes.py`、`subjects.py`、`storyboards.py`、`projects.py` 与 `workbench.py` 当前已继续补齐最终 `id` 次排序键或等价稳定排序，覆盖成片列表、项目配音/视频片段、分集、主体、分镜作用域、项目概览聚合和工作台媒体结果等高频读路径。这样在同时间戳、同分镜序号或同集数编号并存时，接口返回顺序仍保持确定，不再依赖数据库偶发返回顺序
- 已继续补齐剩余带业务排序的高频列表稳定性：`backend/app/routers/creation.py` 当前已为创作会话列表、创作镜头列表/重排回读、创作视频作品分页和创作音频作品分页补齐最终 `id` 次排序键；`backend/app/routers/voices.py` 与 `backend/app/routers/reference_audio_library.py` 也已为音色列表、系统音色库和参考音频库列表补齐 `id` 兜底。这样当前生产性能治理里最常见的高频列表，已大多具备“主排序 + 最终唯一键”的稳定返回口径
- 已完成低频管理类与辅助列表的排序稳定性总复查：`backend/app/routers/storyboards.py`、`subjects.py`、`models.py`、`providers.py`、`user_styles.py`、`exports.py`、`community_qr_config.py` 与 `api_config_banner.py` 当前也已为资源包打包、主体候选图/参考图辅助读取、共享管理员模型读取、服务商列表、用户视觉风格列表、导出准备资产列表以及单条配置读取补齐最终唯一键或等价稳定排序。这样本轮“排序稳定性主线”的代码收口已基本完成
- 已继续推进 `tasks` 的前端共享适配层：`frontend/src/api/tasks.js` 当前已新增共享任务门面，统一收口单任务详情读取、项目任务列表分页归一、`next_cursor` 回退搜索与成片导出任务匹配；`frontend/src/api/storyboard.js` 与 `subject.js` 的分镜/主体任务轮询也已切到该门面。这样当前前端侧并不是把所有轮询都硬改成列表扫描，而是优先走单任务详情，只有在任务不存在或需要兼容分页口径时才回退项目任务列表，既开始真实消费 `tasks` 的新分页能力，又避免无谓放大轮询成本
- 已继续收口任务视图模型事实源：`frontend/src/api/composition.js` 中重复的 `normalizeTaskListPayload(...)` 与 `normalizeGenTask(...)` 已移除，当前统一以 `frontend/src/api/tasks.js` 作为任务列表归一、任务视图模型与回退读取逻辑的唯一事实源，避免后续 `composition` 再与 `storyboard / subject` 分叉维护两套任务适配代码
- 已继续推进 `creation` 专用任务适配层：`frontend/src/api/creation.js` 当前已新增 `getCreationTaskUrl(...)`、`fetchCreationTaskJson(...)` 与 `pollCreationTask(...)`，统一承接图片/视频/音频任务状态请求、非 2xx 判错与轮询骨架；`apiGenerateCreation(...)` 内部的图片生成和视频生成也已改为复用这套 helper。这样 `creation` 自己的任务链不需要硬并到泛用 `tasks.js`，同时又把原来散落在局部函数里的轮询逻辑收口到了 API 适配层
- 已继续完善真实环境验证落仓模板：新增 `docs/runbooks/runtime-result-templates.md`，当前已统一提供迁移核验、搜索 `EXPLAIN`、压测结果与阈值回写四类结果模板；`docs/runbooks/runtime-verification.md`、`production-deploy.md` 与 `README.md` 也已补入对应入口。这样后续你手工执行真实环境迁移、索引核验、压测和阈值判断后，可以直接按模板落到 `docs/plans/`，减少每轮验证后再临时组织结果结构的成本
- 已继续把搜索链路推进到数据库索引增强：新增 Alembic 迁移 `backend/alembic/versions/bc3d4e5f6a78_add_trgm_search_indexes_for_assets_projects.py`，当前已为 `assets.name / prompt` 与 `projects.name / description` 补上 `pg_trgm + GIN` 索引，并在迁移中确保 `pg_trgm` 扩展启用。这样现有 `ILIKE '%keyword%'` 查询语义无需改动，就能先降低高频模糊搜索在生产环境下的扫描成本
- 已继续把剩余搜索链路补齐到同一治理口径：新增 Alembic 迁移 `backend/alembic/versions/cd4e5f6a7b89_add_trgm_search_indexes_for_voice_audio.py`，当前已为 `voices.name / style / emotions`、`reference_audio_library_items.name / description / emotion` 与 `audio_clips.text` 补上 `pg_trgm + GIN` 索引。这样 `voices`、参考音频库和创作音频文本搜索也无需改现有 `ILIKE '%keyword%'` 语义，就能先降低生产环境下的模糊搜索扫描成本
- 已新增 `docs/runbooks/runtime-verification.md`，把索引迁移执行、`EXPLAIN (ANALYZE, BUFFERS)`、轻量压测、日志采集和阈值回写收口为同一套生产验证闭环。当前仓内已经具备执行手册和结果模板，下一步只差你在真实环境按该手册执行，并把结果落到 `docs/plans/runtime-search-explain-YYYY-MM-DD.md` 与 `docs/plans/runtime-loadtest-baseline-YYYY-MM-DD.md`

## 8. 建议推进顺序

1. 共享状态 Redis 化
2. 长任务运行时拆分
3. 页面直连请求与轮询收口
4. `/uploads` 静态流量剥离
5. 数据库容量预算与压测
6. SSE / 上游调用治理
7. 指标、告警与长期回写
