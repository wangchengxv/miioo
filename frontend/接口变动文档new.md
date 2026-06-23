# 接口变动文档

## 2026-06-22

### 创作配音接口补齐 `@` 数字资产绑定与参考音频优先级语义

- 接口：
  - `POST /api/creation/audios/generate`
  - `POST /api/creation/audios/generate-async`
- 变动性质：未新增路由；扩展了既有创作配音请求体的绑定字段与后端执行语义。

本轮已稳定以下承接行为：

- 新增支持的请求字段：
  - `prompt_raw`
  - `prompt_resolved`
  - `mentions`
  - `attachments`
- 配音链路中的 `@资产` 当前只做“参考绑定”，不会进入最终送给 TTS 的 `text`
- `reference_audio_url` 当前按以下优先级确定：
  - 显式传入的 `reference_audio_url`
  - 被 `@` 的音频资产
  - 其余音频附件中的第一条可用音频
- `@图片 / @视频` 不会被当作 TTS 正文或伪装成上游多模态输入，但会作为绑定事实写入生成音频的 `metadata_json`
- 同步配音与长文本异步配音任务当前共用同一套绑定解析口径，生成后的音频资产 metadata 会统一记录：
  - `prompt_raw`
  - `prompt_resolved`
  - `mentions`
  - `asset_bindings`
  - `reference_audio_url`
  - `binding_mode=reference_only`
  - `spoken_text`

说明：

- 本轮的目标是把创作页视频里已经存在的 `@` 数字资产绑定能力复用到图片/配音，并正式补齐配音后端承接。
- 前端现有创作页视觉结构与主交流程不需要重做；变化点主要在于配音提交体、参考音频选择优先级以及音频历史记录 metadata 更完整。

### 主剧本对话续写改为追加新增分集，不再覆盖旧整稿

- 接口：
  - `POST /api/projects/{project_id}/script-workspace/chat`
- 变动性质：未新增路由、未新增请求字段；调整的是既有 `apply_to_script=true` 下，续写类指令的后端回写语义。

本轮已稳定以下承接行为：

- 当用户消息命中“续写 / 接着写 / 继续写 / 新增分集”等续写语义时：
  - 后端不再把模型结果直接覆盖当前主剧本整稿
  - 而是将新增内容追加到当前主剧本工作区末尾
- 当续写结果中的分集标题仍从 `第1集 / 第2集` 重新起号时：
  - 后端会按当前整稿已有最大集数自动顺延为后续分集编号后再写回
- 当用户消息命中“重写 / 改写 / 重做 / 优化整稿”等整稿替换语义时：
  - 仍保持既有覆盖行为，不会误走追加模式

说明：

- 本轮修复的是“项目-剧本”再次续写时新文本覆盖旧内容的问题，目标是让续写直接形成新增分集。
- 前端现有剧本页调用方式、请求体和视觉交互不需要调整；页面只需继续消费回写后的完整整稿即可。

### 主体角色多视图生成兼容 `three_view` 枚举但改为四视图提示词编排

- 接口：
  - `POST /api/projects/{project_id}/subjects/{subject_id}/generate-image`
- 变动性质：未新增路由、未新增请求字段、未变更前端现有“多视图”入口；本轮调整的是后端对既有 `generation_mode=three_view` 的提示词编排语义。

本轮已稳定以下承接行为：

- 前端仍可继续提交既有 `generation_mode=three_view`
- 后端当前会把该枚举解释为“角色多视图四视图参考板”，并在最终入模 prompt 中明确约束：
  - 面部特写
  - 正面全身
  - 侧面全身
  - 背面全身
- 四个视图会继续强约束：
  - 同一角色身份一致
  - 发型、五官、服装、材质、配饰一致
  - 纯白背景参考板
- `input_prompt` 回显机制保持不变：
  - 前端输入框仍优先显示用户原始输入
  - 后端增强后的四视图最终 prompt 不直接回显到前端

说明：

- 本轮是兼容型行为升级，不要求前端同步改接口枚举或页面交互。
- 若调用方此前依赖“`three_view` 一定对应三联图”的隐含假设，需要按新的“四视图参考板”语义理解生成结果。

### 资产列表与详情补充分镜分集时忽略非法 storyboard_id 脏数据

- 接口：
  - `GET /api/assets`
  - `GET /api/assets/{asset_id}`
- 变动性质：未新增路由、未新增字段；补的是现有资产读取接口在分镜分集回填阶段的容错语义。

本轮已稳定以下承接行为：

- 当资产 `metadata_json.storyboard_id` 是合法 UUID 时：
  - 继续按既有逻辑回填 `episode_label / episodeLabel`
- 当资产 `metadata_json.storyboard_id` 缺失、为空或是历史脏值时：
  - 后端会直接忽略该条回填，不再因为 UUID 解析失败把整个资产列表或详情接口打成 500
  - 该资产的 `episode_label / episodeLabel` 保持为空

说明：

- 本轮修复针对的是历史项目资产与导入脏数据场景，目标是避免单条坏 metadata 拖垮整页“项目资产”列表。
- 前端现有消费字段、页面视觉和交互不需要调整；变化点仅在于 `/api/assets` 与 `/api/assets/{asset_id}` 的后端回填逻辑更加健壮。

## 2026-06-19

### 任务轮询接口抬升 current_stage 与 partial_ready 顶层字段

- 接口：
  - `GET /api/tasks`
  - `GET /api/tasks/{task_id}`
  - `GET /api/tasks/video/{task_id}`
  - `GET /api/creation/videos/tasks/{task_id}`
- 变动性质：未新增路由，但把原本主要沉在 `params` 与视频任务结果里的运行时阶段字段抬升为轮询接口顶层字段。

本轮已稳定以下任务态承接语义：

- 新增顶层响应字段：
  - `current_stage`
  - `currentStage`
  - `partial_ready`
  - `partialReady`
- 默认行为：
  - 通用任务详情 `GET /api/tasks/{task_id}` 与任务列表 `GET /api/tasks` 会直接从 `GenTask.params` 回填这组字段
  - 旧兼容接口 `GET /api/tasks/video/{task_id}` 也会同步返回这组字段，避免老调用方继续自行解析嵌套 `params`
  - 创作视频轮询 `GET /api/creation/videos/tasks/{task_id}` 会在 `queued / partial / completed / failed` 各阶段直接透出 `current_stage / partial_ready`

说明：

- 本轮没有改前端页面视觉，也没有新增新的业务路由；变化点是任务轮询接口不再要求调用方从 `params.current_stage` 或视频结果 metadata 间接推断阶段。
- 当前创作视频任务在创建时会初始化 `current_stage=queued`、`partial_ready=false`、`metadata_commit_status=pending`；进入 partial 后会按共享视频派生 metadata 自动更新为 `metadata_committing` 等中间阶段，完成后统一收口为 `completed + partial_ready=true`。

### 视频链路补入运行时阶段状态 metadata 写回

- 接口：
  - `GET /api/creation/tasks/{task_id}`
  - `GET /api/assets`
  - `GET /api/assets/{asset_id}`
  - `GET /api/projects/{project_id}/storyboards`
  - `GET /api/projects/{project_id}/storyboards/{storyboard_id}`
- 变动性质：未新增路由，也未新增页面层主字段；本轮补的是视频 metadata / 任务结果 / 分镜 `gen_params` 中的运行时阶段事实。

本轮已稳定以下运行时状态语义：

- 新增 metadata 字段：
  - `partial_ready`
  - `video_pipeline_stage`
  - `metadata_commit_status`
- 当前阶段含义：
  - `partial_ready=true`：`poster_url` 与 `preview_video_url` 已同时就绪，即使 HLS 还未完成，也可以安全开始详情回显
  - `video_pipeline_stage`：
    - 可能出现 `queued / preview_transcoding / poster_extracting / hls_packaging / metadata_committing / completed`
  - `metadata_commit_status`：
    - `pending` 表示当前仍处于任务 partial 或 metadata 最终提交前阶段
    - `ready` 表示当前共享派生 metadata 已完成最终写回

说明：

- 本轮没有改前端现有主响应模型，也没有改动页面视觉或交互；这组字段当前主要沉在 asset metadata、创作任务结果与分镜 `gen_params` 中，作为后续任务态与播放器策略升级的事实源。
- 当前最终 asset / 分镜落盘阶段会统一写成 `video_pipeline_stage=completed` 且 `metadata_commit_status=ready`；而独立创作视频的 partial 任务结果会保留 `poster_extracting / metadata_committing` 等中间状态，便于区分“已能看 preview”与“最终 metadata 已收口完成”。

### 视频链路补入真实 HLS 打包与 hlsUrl 主播放回写

- 接口：
  - `GET /api/assets`
  - `GET /api/assets/{asset_id}`
  - `GET /api/creation/videos`
  - `GET /api/creation/tasks/{task_id}`
  - `GET /api/projects/{project_id}/storyboards`
  - `GET /api/projects/{project_id}/storyboards/{storyboard_id}`
- 变动性质：未新增路由，但把 `hls_url / hlsUrl / available_qualities / availableQualities` 从“仅能承接上游返回”推进为“后端本地可生成单码率 HLS 并写回”。

本轮已稳定以下 HLS 承接语义：

- 开关：
  - 继续使用既有 `MEDIA_ENABLE_VIDEO_HLS`
- 默认行为：
  - `true`
  - 当视频已经落为托管 `/uploads/...` 且运行环境可用 `ffmpeg / ffprobe` 时，后端会在共享视频派生阶段生成单码率 HLS 主播放列表，并把 `hls_url / hlsUrl` 指向托管后的 `master.m3u8`
  - 同时会在 metadata 中补充 `hls_master_playlist / available_qualities / hls_variant_count / default_quality / hls_packaging_status`
- 关闭行为：
  - `false`
  - 后端停止尝试本地 HLS 打包，视频主播放继续按 `previewVideoUrl` 回退

说明：

- 当前首版只生成单码率 HLS，`available_qualities` 默认只返回 1 条质量信息。
- 本轮没有改前端消费顺序；详情播放仍按既定目标 `hlsUrl -> previewVideoUrl -> videoUrl` 兼容演进。
- 若云端未安装 `ffmpeg / ffprobe` 或 HLS 打包失败，后端会继续保留 `previewVideoUrl` 作为稳妥回退，同时在 metadata 中记录 `hls_packaging_status=failed`，不会阻断生成/上传主链路。

### 视频链路补入真实 previewVideoUrl 轻量转码开关

- 接口：
  - `GET /api/assets`
  - `GET /api/assets/{asset_id}`
  - `GET /api/creation/videos`
  - `GET /api/creation/tasks/{task_id}`
  - `GET /api/projects/{project_id}/storyboards`
  - `GET /api/projects/{project_id}/storyboards/{storyboard_id}`
- 变动性质：未新增字段名，但把 `preview_video_url / previewVideoUrl` 从“通常回落原始视频地址”推进为“优先返回托管的轻量 mp4 预览产物”。

本轮已稳定以下视频预览承接语义：

- 新增环境变量：
  - `MEDIA_ENABLE_VIDEO_PREVIEW_TRANSCODE`
- 默认行为：
  - `true`
  - 当视频已经落为托管 `/uploads/...` 且运行环境可用 `ffmpeg / ffprobe` 时，后端会在视频派生阶段优先生成轻量 mp4 预览，并把 `preview_video_url / previewVideoUrl` 指向该预览产物
  - 同时会在 metadata 中补充 `preview_codec / preview_bitrate / preview_duration / preview_width / preview_height / transcode_profile / preview_transcode_status`
- 关闭行为：
  - `false`
  - 后端停止尝试生成轻量 mp4 预览，`preview_video_url / previewVideoUrl` 继续回退为原始视频地址
  - 现有 `poster_url / hls_url / download_url` 字段语义保持不变

说明：

- 本轮没有新增新的路由，也没有改动现有响应字段名；变化点是既有 `previewVideoUrl` 的真实来源优先级。
- 当前首版只接入共享视频派生入口，因此独立创作视频、创作镜头视频、分镜生成视频和分镜上传视频都会自动承接该能力；前端页面层仍继续只消费既有字段，无需改视觉或交互。
- 若云端未安装 `ffmpeg / ffprobe` 或转码失败，后端会继续保留原视频作为 `previewVideoUrl` 回退，同时在 metadata 中记录 `preview_transcode_status=failed` 或 `disabled`，不会阻断整条生成/上传链路。

### 视频链路补入 hlsUrl 与 HLS 灰度开关

- 接口：
  - `GET /api/assets`
  - `GET /api/assets/{asset_id}`
  - `GET /api/creation/videos`
  - `GET /api/creation/tasks/{task_id}`
  - `GET /api/projects/{project_id}/storyboards`
  - `GET /api/projects/{project_id}/storyboards/{storyboard_id}`
- 变动性质：为视频主响应补入 `hls_url / hlsUrl` 与 `available_qualities / availableQualities` 字段，并为该组字段补入真实 feature flag。

本轮已稳定以下视频承接语义：

- 新增环境变量：
  - `MEDIA_ENABLE_VIDEO_HLS`
- 新增响应字段：
  - `hls_url`
  - `hlsUrl`
  - `available_qualities`
  - `availableQualities`
- 默认行为：
  - `true`
  - 当视频 metadata 中存在 `hls_url` 或 `available_qualities` 时，资产、创作视频、分镜视频等共享视频视图模型的主读取接口会对外返回该组字段
- 关闭行为：
  - `false`
  - 共享视频视图模型会统一停止下发 `hls_url / hlsUrl / available_qualities / availableQualities`
  - 现有 `poster_url / preview_video_url / download_url` 语义保持不变

说明：

- 本轮没有新增新的路由，也没有改变既有 `preview_video_url / previewVideoUrl` 的回退逻辑；`hlsUrl` 当前属于增量增强字段，允许为空。
- 当前 `preview_ready / previewReady` 会按“`hlsUrl` 或 `previewVideoUrl` 任一存在即为可预览”计算，从而兼容“已具备 HLS 主播但轻量 mp4 仍未补齐”的渐进状态。
- `MEDIA_ENABLE_VIDEO_HLS` 当前先接在共享 resolver 与视图模型层，作用是统一控制视频主响应是否对外暴露 HLS 播放地址与清晰度清单；它不等于已经完成完整 HLS 打包流水线，本轮也没有改动前端视觉或播放器 UI。
- 本轮继续补充了生成写回语义：若上游视频生成结果已返回 `hls_url / available_qualities`，后端会在创作视频、分镜视频的落盘写库阶段把这组字段继续沉到 asset metadata、分镜 `gen_params` 与视频任务结果里，避免字段只在瞬时上游响应中存在、刷新后又丢失。
- 本轮继续补充了上游解析语义：`backend/app/services/video_gen.py` 现已统一从 provider 提交响应和任务轮询结果里提取 `preview_video_url / hls_url / hls_master_playlist / available_qualities`，并透传给后续创作任务结果、资产 metadata 与分镜写回链路，避免 `video_url` 被误当成 HLS 地址或预览/HLS 字段在服务层中途丢失。

### 图片链路补入 largeUrl 与大图灰度开关

- 接口：
  - `GET /api/assets`
  - `GET /api/assets/{asset_id}`
  - `GET /api/creation/images`
  - `GET /api/projects/{project_id}/subjects`
  - `GET /api/projects/{project_id}/subjects/{subject_id}`
  - `GET /api/projects/{project_id}/storyboards`
  - `GET /api/projects/{project_id}/storyboards/{storyboard_id}`
- 变动性质：为图片主响应补入 `large_url / largeUrl` 大图预览字段，并为该字段补入真实 feature flag。

本轮已稳定以下图片承接语义：

- 新增环境变量：
  - `MEDIA_ENABLE_IMAGE_LARGE_VARIANT`
- 新增响应字段：
  - `large_url`
  - `largeUrl`
- 默认行为：
  - `true`
  - 当图片 metadata 中存在 `large_url` 时，资产、创作、主体、分镜等共享图片视图模型的主读取接口会对外返回该字段
- 关闭行为：
  - `false`
  - 共享图片视图模型会统一停止下发 `large_url / largeUrl`
  - 现有 `thumbnail_url / preview_url / download_url` 语义保持不变

说明：

- 本轮没有改动既有字段名，也没有改变现有 `thumbnail_url / preview_url / download_url` 的消费语义；只是把大图预览字段正式补入主读取接口。
- `largeUrl` 当前只对图片类响应生效，不影响视频/音频字段，也不改变下载链路。
- 当前 `largeUrl` 仍属于增量字段：若 metadata 中没有 `large_url`，即使开关开启，接口也允许继续返回空值。
- 这样后续前端若要承接“放大查看 / 高清细节图”，可以统一走 `largeUrl -> previewUrl` 的顺序，而不必继续在页面层猜测大图来源。

### 预览链路补入对象存储灰度开关

- 接口：
  - `GET /api/assets`
  - `GET /api/assets/{asset_id}`
  - `GET /api/creation/images`
  - `GET /api/creation/videos`
  - `GET /api/creation/audios`
  - `GET /api/projects/{project_id}/subjects`
  - `GET /api/projects/{project_id}/subjects/{subject_id}`
  - `GET /api/projects/{project_id}/storyboards`
  - `GET /api/projects/{project_id}/storyboards/{storyboard_id}`
- 变动性质：不新增路径和字段，但为共享媒体视图模型里的预览地址解析补入真实 feature flag，允许对象存储/CDN 预览链路按开关灰度和回退。

本轮已稳定以下预览承接语义：

- 新增环境变量：
  - `MEDIA_ENABLE_OBJECT_STORAGE_PREVIEW`
- 默认行为：
  - `true`
  - 当媒体对象描述命中 `storage_mode=object_storage` 且存在对象存储/CDN 预览地址时，`preview_url / previewUrl / preview_video_url / previewVideoUrl` 继续优先返回该预览入口
- 关闭行为：
  - `false`
  - 共享解析层 `resolve_preview_url(...)` 会停止优先消费对象存储/CDN 预览地址
  - 预览字段回退到既有 `origin_url / source_url / file_url` 旧链路

说明：

- 本轮没有新增新的响应字段，也没有修改现有字段名；页面仍继续消费既有 `preview_url / previewUrl / preview_video_url / previewVideoUrl`。
- 本轮变化点在于共享媒体解析层正式补上“对象存储预览可灰度、可回退”的真实配置开关，因此图片和视频的预览链路都能通过同一个配置项切回旧预览口径，而不需要临时改页面或散落改多个路由。
- 当前该开关主要影响通过 `backend/app/services/media_view_models.py` 统一生成的媒体字段；也就是说，资产、创作、主体、分镜等共享同一套媒体视图模型的读取接口会一起遵循这条预览灰度规则。
- 本轮未新增新的路由，也未改变下载链路；`MEDIA_ENABLE_SIGNED_DOWNLOAD` 仍继续只负责 `downloadUrl` 的受控下载回退。

### 统一媒体受控下载入口上线

- 接口：
  - `GET /api/media/downloads/{token}`
- 变动性质：新增统一媒体受控下载入口，并开始让部分媒体响应中的 `download_url / downloadUrl` 平滑切到短时 token 路由。

本轮已稳定以下语义：

- 新增统一受控下载路径：
  - `GET /api/media/downloads/{token}`
- 当前下载 token 最小绑定信息：
  - `user_id`
  - `project_id`
  - `resource_id`
  - `storage_key`
  - `access_level`
  - `issued_at`
  - `expires_at`
  - `nonce`
- 当前首版校验与返回语义：
  - token 无效或过期：`401`
  - 当前登录用户与 token 中 `user_id` 不一致：`403`
  - 目标下载资源不存在：`404`
  - 校验成功后返回 `302` 跳转到真实媒体地址

本轮同步收口的字段承接：

- `GET /api/assets`
- `GET /api/assets/{asset_id}`
- `GET /api/creation/images`
- `GET /api/creation/videos`
- `GET /api/creation/audios`
- `GET /api/projects/{project_id}/subjects`
- `GET /api/projects/{project_id}/subjects/{subject_id}`
- `GET /api/projects/{project_id}/storyboards`
- `GET /api/projects/{project_id}/storyboards/{storyboard_id}`

说明：

- 本轮没有改前端字段名，页面仍继续消费 `download_url / downloadUrl`，只是其底层地址开始逐步从“原始地址直出”切到受控路由。
- 本轮没有删除老的流式下载接口，例如：
  - `GET /api/assets/{asset_id}/download`
  - `GET /api/creation/videos/{video_id}/download`
  - `GET /api/creation/audios/{audio_id}/download`
  - `GET /api/projects/{project_id}/subjects/{subject_id}/images/{image_id}/download`
- 当前首版主要完成三件事：
  - 统一下载 token 签发与校验
  - 统一受控下载路由
  - 让媒体视图模型和资产/创作/主体/分镜响应可返回受控 `downloadUrl`
- 本轮继续补充：
  - `GET /api/assets/{asset_id}/download`
  - `GET /api/creation/images/{image_id}/download`
  - `GET /api/creation/videos/{video_id}/download`
  - `GET /api/creation/audios/{audio_id}/download`
  - `GET /api/projects/{project_id}/subjects/{subject_id}/images/{image_id}/download`
  - `GET /api/projects/{project_id}/storyboards/{storyboard_id}/download-video`
  - `GET /api/projects/{project_id}/workbench/images/{image_id}/download`
  这些单资源下载接口当前内部已复用同一套“受控下载目标解析”逻辑：接口对外仍返回附件流，但其真实读取目标已经优先与新的 token 受控下载链路保持一致，从而兼顾旧前端下载方式和新下载治理链路。其中 `GET /api/assets/{asset_id}/download` 仍保留 `prefer_origin` 查询参数语义，只是在服务端先走统一 `download_url` 解析与受控目标校验，再按 `prefer_origin=true/false` 决定原始地址与当前托管地址的尝试顺序。
- 本轮继续补充的批量 ZIP 下载接口：
  - `POST /api/projects/{project_id}/assets/download`
  - `POST /api/projects/{project_id}/workbench/images/batch-download`
  - `POST /api/creation/videos/batch-download`
  - `POST /api/creation/audios/batch-download`
  - `POST /api/projects/{project_id}/storyboards/download/images`
  - `POST /api/projects/{project_id}/storyboards/download/videos`
  - `POST /api/projects/{project_id}/storyboards/download/bundle`
  这些批量下载接口当前也已开始复用同一套“受控下载目标解析”逻辑：接口对外仍返回 ZIP 文件流，但在真正读取单个资源前，会优先尝试统一媒体解析后的 `download_url`，若该地址已切到 `/api/media/downloads/{token}`，则先在服务端完成 token 校验、当前用户校验与真实下载目标解析，再继续打包读取。这样批量下载与单资源下载当前已经开始共享同一条底层下载治理链路；其中 `storyboards` 的资源包下载仍保留原有 ZIP 目录结构、文件命名与 `manifest.json` 中的 `source_url` 语义，仅内部真实读取目标切到统一受控解析链。
- 当前还没有把所有业务下载入口都切到统一受控路由，也还没有落地对象存储签名直出；这些属于下一阶段继续收口事项。当前下载审计已经作为应用日志级能力接入统一受控下载入口与共享受控目标解析层，并新增对应巡检脚本与排障 Runbook，便于后续继续承接 `MEDIA-BPLUS-50` 的观测治理。
- 本轮继续补充：
  - `GET /api/media/downloads/{token}`
  - `backend/app/services/media_download_runtime.py`
  统一受控下载入口与共享受控目标解析层当前已补上首版“下载审计”能力：不会新增对外响应字段，但会在应用日志中统一记录 `event / outcome / user_id / project_id / resource_id / access_level / storage_key / download_url / resolved_target` 等字段。当前 `GET /api/media/downloads/{token}` 的 302 跳转链路，以及旧单资源/批量 ZIP 下载在内部复用 `resolve_verified_download_target_from_url(...)` 的解析链路，都会自动落这组审计日志，从而为后续 `MEDIA-BPLUS-50` 的观测、告警与下载行为排查提供统一事实源。本轮仍未落地对象存储直签，也未把下载审计沉到独立数据库表。

## 2026-06-18

### 分镜生成比例默认跟随项目比例

- 接口：
  - `POST /api/projects/{project_id}/storyboards/{storyboard_id}/generate-image`
  - `POST /api/projects/{project_id}/storyboards/{storyboard_id}/generate-video`
- 变动性质：收口分镜图/分镜视频生成时的比例默认值来源，统一以项目创建时保存的 `aspect_ratio` 作为业务事实源。

本轮已稳定以下请求与默认语义：

- 分镜图：
  - 前端继续显式透传 `aspect_ratio`
  - 若请求未显式传 `aspect_ratio / aspectRatio`，后端自动回退当前项目 `aspect_ratio`
- 分镜视频：
  - 前端显式透传 `ratio`
  - 若请求未显式传 `ratio`，后端按 `storyboard.gen_params.ratio -> project.aspect_ratio -> "16:9"` 的顺序兜底

说明：

- 此前分镜页进入 `StoryboardPage` 时已经能从项目详情拿到 `activeProject.aspect_ratio`，并用于单镜头/批量分镜图生成；但分镜视频链路没有继续透传项目比例，后端默认值也仍优先回退到硬编码 `16:9`，导致 `9:16` 项目在视频生成场景下可能继续按错误比例承接。
- 当前前端 `StoryboardPage.jsx` 已将项目比例统一收口为单一事实源，同时为批量分镜视频和单镜头分镜视频请求补齐 `ratio` 透传；后端 `storyboards.py` 也已为图片与视频生成接口补上项目级比例兜底，避免未来某个入口漏传时再次退回随意默认值。
- 本轮不新增新的接口字段、不改现有接口路径，也不在分镜图/分镜视频弹窗中新增比例选择 UI；仅修正现有接口在缺省比例场景下的默认承接语义。

### 资产与创作视频下载优先级收口

- 接口：
  - `GET /api/assets/{asset_id}/download`
  - `GET /api/creation/videos/{video_id}/download`
  - `POST /api/creation/videos/batch-download`
- 变动性质：修正视频下载链路的源地址优先级，避免资产库与创作视频下载误回退到预览/托管文件。

本轮已稳定以下下载语义：

- 资产下载优先级：
  - `metadata_json.download_url`
  - `metadata_json.origin_url`
  - `file_url`
- 创作视频单个/批量下载优先级：
  - `metadata_json.download_url`
  - `metadata_json.origin_url`
  - `file_url`

说明：

- 此前资产库“创作资产-视频”详情弹窗和相关下载入口虽然已经接到真实 blob 下载接口，但后端下载实现里仍优先读取 `origin_url` 或直接读取 `file_url`，当视频资产只有 `download_url` 指向原始母版、而 `file_url` 指向预览/托管版本时，会出现“页面能看视频，但下载下来的不是原画文件”的偏差。
- 当前 `GET /api/assets/{asset_id}/download` 已改为优先尝试 `metadata_json.download_url`，其次再尝试 `origin_url` 与当前托管 `file_url`，并对重复 URL 做去重，保证资产库视频详情弹窗、卡片下载和其它复用资产下载接口的入口都优先命中原始下载地址。
- `GET /api/creation/videos/{video_id}/download` 与 `POST /api/creation/videos/batch-download` 也已同步改为同一优先级顺序，避免创作页或创作资产历史链路继续把视频预览文件当作最终下载文件。

### 创作视频刷新恢复与媒体分层闭环

- 接口：
  - `GET /api/creation/videos`
  - `GET /api/creation/tasks/{task_id}`
  - `GET /api/creation/sessions/{session_id}/shots`
  - `GET /api/projects/{project_id}/subjects`
  - `GET /api/projects/{project_id}/subjects/{subject_id}`
  - `GET /api/projects/{project_id}/subjects/{subject_id}/images`
  - `GET /api/projects/{project_id}/storyboards`
  - `GET /api/projects/{project_id}/storyboards/{storyboard_id}`
  - `POST /api/projects/{project_id}/storyboards/{storyboard_id}/generate-image`
  - `POST /api/projects/{project_id}/storyboards/{storyboard_id}/generate-video`
  - `POST /api/projects/{project_id}/storyboards/{storyboard_id}/upload-image`
  - `POST /api/projects/{project_id}/storyboards/{storyboard_id}/upload-video`
- 变动性质：把创作页视频“刷新后丢失 / 部分用户一直拿不到结果”和创作、主体、分镜三模块的图片/视频回显，统一收口为“卡片压缩预览 + 详情查看/下载原资源”的正式链路。

本轮已稳定以下字段与承接语义：

- 图片统一媒体字段：
  - `thumbnail_url / thumbnailUrl`
  - `preview_url / previewUrl`
  - `download_url / downloadUrl`
  - `preview_ready / previewReady`
- 视频统一媒体字段：
  - `poster_url / posterUrl`
  - `preview_video_url / previewVideoUrl`
  - `download_url / downloadUrl`
  - `preview_ready / previewReady`
- 创作视频刷新恢复语义：
  - 前端提交视频任务后会先保留本地 pending task 记录，页面刷新后先恢复 pending 卡片
  - 任务终态后再强刷真实 `GET /api/creation/videos` 历史结果与 `shots` 数据，不再把仅存在于内存里的临时结果当最终事实

说明：

- 本轮明确不做上传前压缩；上传和模型生成仍保留原始资源。
- 压缩只服务于回显层：图片卡片优先使用 `thumbnail_url`，详情查看优先使用 `preview_url`，下载继续使用 `download_url` 或原图；视频卡片优先使用 `poster_url + preview_video_url`，下载继续使用 `download_url`。
- `backend/app/routers/storyboards.py` 当前已把分镜图片/视频的媒体分层正式写入 `StoryboardResponse`，并在上传、生成、详情、列表链路中统一返回；前端 `src/api/mediaAdapters.js`、`src/api/subject.js`、`src/api/storyboard.js` 已同步收口这些字段。
- 创作页视频当前必须继续按“`taskId -> 轮询 -> 真实历史/镜头刷新`”承接；若页面只展示提交后本地内存卡片而未刷新真实历史，视为链路不完整。
- 本轮实现收口补充：后端图片压缩预览与视频 poster 的派生逻辑已统一收口到 `backend/app/services/media_derivative_pipeline.py`，前端创作页也已改为和主体页、分镜页共用 `frontend/src/utils/mediaPresentation.js` 的 getter 语义；因此“卡片压缩预览、详情预览/播放、下载原件”的回显链不再由单个页面各自维护。

### 登录与资料页微信真实链路打通

- 接口：
  - `GET /api/auth/wechat/qrcode`
  - `GET /api/auth/wechat/poll/{session_id}`
  - `POST /api/auth/wechat/confirm`
  - `POST /api/auth/wechat/callback/complete`
  - `GET /api/users/me/wechat/qrcode`
  - `GET /api/users/me/wechat/poll/{ticket}`
  - `POST /api/users/me/wechat/bind`
- 变动性质：把原先开发态占位的微信扫码登录与资料页绑定链路收口为真实微信开放平台扫码授权，并保留旧手工绑定接口作为兼容入口。

本轮已新增或稳定以下状态与字段语义：

- 登录二维码返回：
  - `qr_code_value`：真实微信开放平台授权 URL
  - `session_id`
  - `expires_in`
  - `status`
- 登录轮询新增/稳定状态：
  - `pending`
  - `scanned`
  - `need_bind_mobile`
  - `confirmed`
  - `expired`
  - `error`
- 登录轮询新增返回：
  - `bind_token`
  - `message`
  - `access_token`
  - `refresh_token`
- 新增回调完成接口请求体：
  - `code`
  - `state`
- 资料页绑定二维码返回：
  - `ticket`
  - `qr_code_value`
  - `expires_in`
  - `status`
- 资料页绑定轮询新增返回：
  - `wechat_nickname`
  - `message`

说明：

- 当 `WECHAT_LOGIN_ENABLED=true` 且微信开放平台配置完整时，`GET /api/auth/wechat/qrcode` 与 `GET /api/users/me/wechat/qrcode` 均会返回真实微信开放平台授权 URL，前端负责渲染二维码。
- 新增 `POST /api/auth/wechat/callback/complete` 供前端首页或兼容回调页调用，用于把微信开放平台回调的 `code/state` 交回后端完成真实授权处理；当前默认生产回调地址已进一步收口为 `https://miiooai.com/`，由首页直接承接 `code/state`，从而绕开 `/wx/callback` 与 `/wx/callback/index.html` 在未发布、未做 SPA 回退或 Nginx 未命中静态文件时直接返回 `404 Not Found` 的风险。
- 若扫码微信已绑定账号，登录轮询会直接进入 `confirmed` 并返回 token；若扫码微信尚未绑定账号，则会进入 `need_bind_mobile`，再由 `POST /api/auth/wechat/confirm` 承接手机号验证码校验、账号补绑与微信自动绑定。
- 资料页微信绑定不再走前端假轮询；当前真实主链路改为 `GET /api/users/me/wechat/qrcode` + `GET /api/users/me/wechat/poll/{ticket}`，扫码成功后会直接把当前登录账号与真实微信身份绑定，并更新资料页绑定状态。
- `POST /api/users/me/wechat/bind` 当前仅作为兼容保留的手工绑定入口，资料页不再默认使用该接口承接真实扫码绑定。

## 2026-06-17

### 创作模块补齐视频/配音真实承接字段

- 接口：
  - `POST /api/creation/videos/generate`
  - `POST /api/creation/audios/generate`
  - `POST /api/creation/audios/generate-async`
- 变动性质：补齐创作视频作用域字段承接，修正创作图片/视频水印字段口径，并让创作配音真正消费参考音频来源。

本轮已补齐或稳定以下请求语义：

- `POST /api/creation/videos/generate` 新增稳定承接：
  - `session_id`
  - `shot_id`
  - `project_id`
- `POST /api/creation/audios/generate`
- `POST /api/creation/audios/generate-async`
  已稳定承接：
  - `reference_audio_url`

说明：

- 独立创作视频此前虽然前端会先创建 `shot`，但提交到后端的视频任务没有真正带上 `session_id / shot_id / project_id`，导致任务和最终视频资产无法稳定归属到当前创作上下文；当前后端已正式接住这 3 个字段，并把它们沉到 `GenTask.params` 与视频资产 `metadata_json` 中。
- 创作图片/视频的单次生成水印开关此前前端误传为 `watercolor`，后端真实字段为 `watermark`；当前前端已统一改回 `watermark`，本次生成的水印开关不再退回 provider 默认值。
- 创作配音此前虽然前端允许从“音频作品”页签选择历史音频并提交 `reference_audio_url`，但后端同步/异步配音链路并不会真实消费；当前后端会优先按 `reference_audio_url` 回查创作音频记录，解析其原始音色上下文后再进入 TTS 生成，从而让“音频作品作为参考来源”不再停留在 UI 预留态。
- 创作页长文本配音前端此前只按文本长度自动切异步，而后端异步接口实际仅支持 `MiniMax` 官方 voice 模型；当前前端已按 provider 类型与后端能力对齐，只有 `MiniMax` 长文本才自动走异步接口，其它 provider 会前置提示用户切模型或缩短文本。

### 0. 账号管理补充管理员账号列表与手机号审计字段

- 接口：
  - `GET /api/users/admin/accounts`
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/verify-code-login`
  - `POST /api/auth/wechat/confirm`
- 变动性质：新增管理员账号管理列表接口，并为登录/注册链路补充账号手机号审计字段。

本轮已新增或稳定以下账号管理字段：

- `registered_phone`
- `last_login_phone`
- `last_login_at`

说明：

- `GET /api/users/admin/accounts` 仅管理员可调用，支持 `page / page_size / keyword` 分页与搜索。
- 列表会返回 `current_phone / registered_phone / last_login_phone / last_login_at`，供管理员查看用户注册手机号与最近登录手机号。
- `registered_phone` 用于记录账号注册或首次验证码建号时的手机号，不会因为后续换绑手机号自动被覆盖。
- `last_login_phone / last_login_at` 会在密码登录、验证码登录、微信扫码确认登录成功后更新。
- 本轮同时补了运行时 schema 兼容和 Alembic 迁移，避免本地旧库缺字段时阻断管理员页面接入。

### 0.1 账号管理补齐管理员写操作与状态筛选

- 接口：
  - `GET /api/users/admin/accounts`
  - `PATCH /api/users/admin/accounts/{user_id}`
- 变动性质：在既有管理员账号列表基础上，继续补齐传统后台账号管理所需的筛选与写操作闭环。

本轮新增或扩展内容：

- `GET /api/users/admin/accounts` 新增：
  - `is_active`
  - `is_admin`
- `PATCH /api/users/admin/accounts/{user_id}` 新增支持：
  - `nickname`
  - `phone`
  - `is_active`
  - `is_admin`

说明：

- 管理员现在可直接在控制台内按启用状态、管理员身份筛选账号。
- 管理员现在可直接修改目标账号昵称、手机号、启用状态与管理员状态，不再停留在只读查看。
- 更新手机号时会校验 `11` 位格式与唯一性，并同步保持 `is_phone_bound=true`。
- 后端会保护“至少保留一个启用中的管理员账号”，避免控制台误操作把最后一个管理员链路关掉。

### 1. 资产库接口补充分集展示字段

- 接口：
  - `GET /api/assets`
  - `GET /api/assets/{asset_id}`
- 变动性质：资产响应新增分镜资产专属展示字段。

本轮已在资产库响应中新增：

- `episode_label`
- `episodeLabel`

说明：

- 仅当资产可确认属于正式分集下的分镜图或分镜视频时返回值，例如 `第一集`、`第二集`。
- 非分镜资产或当前无法确认分集归属时，字段返回 `null`。
- 历史资产通过读取时批量补齐：后端会基于 `metadata_json.storyboard_id -> storyboards.episode_id -> episodes.episode_number` 回填 `episode_label`，不要求先执行数据库迁移。
- 新生成或新上传的分镜资产会在 `metadata_json` 中同步沉淀 `episode_id / episode_number / episode_title / episode_label`，避免后续资产消费端完全依赖跨表推断。

### 2. 方案 A 媒体分层字段正式进入页面主消费口径

- 相关接口：
  - `GET /api/creation/images`
  - `GET /api/creation/videos`
  - `GET /api/creation/audios`
  - `GET /api/assets`
  - `GET /api/assets/{asset_id}`
- 变动性质：字段语义正式启用，前端页面开始按“列表轻预览、详情预览、下载原件”消费；本轮主要更新前端消费口径与文档说明，不新增新的后端路径。

当前已经作为稳定字段语义使用的媒体字段如下：

- 图片：
  - `thumbnail_url / thumbnailUrl`
  - `preview_url / previewUrl`
  - `download_url / downloadUrl`
- 视频：
  - `poster_url / posterUrl`
  - `preview_video_url / previewVideoUrl`
  - `download_url / downloadUrl`
  - `preview_ready / previewReady`
- 音频：
  - `preview_url / previewUrl`
  - `download_url / downloadUrl`
  - `preview_ready / previewReady`

说明：

- 本轮不是新增全新接口，而是把前面已补入 `creation.py`、`assets.py` 与 `asset.py` schema 的媒体分层字段正式落实为前端默认消费事实源。
- 当前前端页面已开始按以下口径使用：
  - 列表卡片优先使用 `thumbnailUrl / posterUrl`
  - 详情预览优先使用 `previewUrl / previewVideoUrl`
  - 下载统一只使用 `downloadUrl`
- 若某类资源暂时没有独立派生产物，后端和前端适配层允许做兼容回退；但页面层不再直接把宽泛 `file_url / video_url` 同时当作列表预览、详情预览和下载地址使用。

### 3. 创作媒体与工作台图片默认分页口径收口

- 接口：
  - `GET /api/creation/images`
  - `GET /api/creation/videos`
  - `GET /api/creation/audios`
  - `GET /api/projects/{project_id}/workbench/images`
- 变动性质：默认分页参数收口，不改返回结构。

本轮已将以上接口的默认分页口径统一收口到“首屏 9 条”：

- `GET /api/creation/images`：`page_size` 默认值由 `20` 调整为 `9`
- `GET /api/creation/videos`：`page_size` 默认值由 `20` 调整为 `9`
- `GET /api/creation/audios`：`page_size` 默认值由 `18` 调整为 `9`
- `GET /api/projects/{project_id}/workbench/images`：`page_size` 默认值由 `20` 调整为 `9`

说明：

- 本次只调整默认值，不改变分页响应结构与字段命名。
- 现有前端主链路已显式传 `page_size=9`，本次后端调整主要用于堵住历史调用、漏传分页参数或旧运行链路回退到大页读取的问题。
- 当前仍保留原有最大页长上限，不在本轮额外收紧兼容上限。

### 4. 智能分镜批量任务接口补充

- 接口：`POST /api/projects/{project_id}/storyboards/generate-from-final-script`
- 变动性质：返回任务对象不变，但任务 `params` 语义明显增强，前端现按任务制真实承接“开始智能分镜”。

### 5. 任务参数新增/稳定输出字段

本轮已在批量分镜任务 `params` 中补齐并稳定以下字段：

- `source = "storyboard_generate_from_final_script"`
- `current_stage`
- `stage_label`
- `status_message`
- `script_status`
- `episode_count_requested`
- `split_mode`
- `overwrite_existing`
- `target_episode_ids`
- `queued_episode_numbers`
- `completed_episode_numbers`
- `failed_episode_numbers`
- `current_episode_id`
- `current_episode_number`
- `current_episode_title`
- `last_completed_episode_id`
- `last_completed_episode_number`
- `last_completed_episode_title`
- `total_storyboard_count`
- `warning_messages`

### 6. 任务结果字段说明

`results[]` 当前按分集级稳定返回：

- `episode_id`
- `episode_number`
- `title`
- `storyboard_count`
- `status`
- `error`

说明：

- `status=completed` 表示该分集分镜已成功写入
- `status=failed` 表示该分集失败，但整批任务不一定整体失败
- 前端分镜页现会直接消费这组结果做“部分完成 / 失败分集清单”展示

### 7. 阶段语义

当前批量分镜任务阶段统一为：

1. `queued`
2. `validating_final_script`
3. `finalizing_script`
4. `loading_subject_context`
5. `generating_episode_{n}`
6. `finalizing_results`
7. `completed / partial / failed`

新增说明：

- `stage_label` 供页面直接展示当前阶段中文语义
- `status_message` 供页面直接展示任务摘要，不再要求前端本地猜文案

### 8. 前端承接变化

前端已统一切到：

- 启动任务
- 获取 `taskId`
- 轮询任务状态
- 任务过程中持续刷新分集/分镜
- 终态后展示真实结果

影响文件：

- `frontend/src/api/storyboard.js`
- `frontend/src/pages/Home.jsx`
- `frontend/src/pages/SubjectPage.jsx`
- `frontend/src/pages/StoryboardPage.jsx`

### 9. 兼容说明

- 旧接口 `POST /api/projects/{project_id}/storyboards/generate` 仍保留，继续用于单集最小闭环生成。
- 当前“开始智能分镜”主入口已不再以前端同步消费单集返回值为主，而是统一走批量任务接口。
- 若页面仅消费旧的 `status / total_count / success_count / fail_count`，仍可兼容；但若要展示完整阶段语义、分集级失败原因和恢复能力，应消费本次新增字段。

### 10. 抽镜元信息沉淀说明

- 当前批量智能分镜在落库 `Storyboard` 时，会把与抽镜策略直接相关的元信息同步写入 `gen_params`，包括：
  - `beat_refs`
  - `story_beat_count`
  - `target_shot_count`
  - `episode_number`
  - `episode_title`
  - `generation_source`
- 作用：
  - 延续 `storyboard-extraction-logic.md` 中 story beat、目标镜头数与结构化抽镜思路
  - 让后续页面、排障与结果回查不再依赖服务内部隐式逻辑
- 说明：
  - 这组字段当前属于分镜记录补充元信息，不改变批量任务接口的响应结构
  - 前端分镜页当前主要消费任务字段做中间态展示；若后续需要解释“为什么这一集生成了这些镜头”，可继续读取分镜详情中的 `gen_params`
