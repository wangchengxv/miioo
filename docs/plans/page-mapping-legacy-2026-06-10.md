# Harness 页面到接口映射表

## 1. 文档定位

本文件用于把 `miioo/frontend` 的页面行为、`frontend/src/api` 适配层、`miioo/backend` 的真实接口能力，统一映射到同一张执行表里。

使用原则：

- 以前端页面行为为产品事实源
- 以后端真实 router 和 schema 为接口事实源
- 以前端 `src/api/` 作为唯一适配层
- 优先做“前端口径 -> 后端口径”的翻译，不优先改页面

关联文档：

- `HARNESS_DOC_INDEX.md`
- `CLAUDE.md`
- `AGENTS.md`
- `miioo/frontend/PROJECT.md`
- `miioo/frontend/API_AUDIT.md`
- `miioo/backend/BACKEND_API_DOC.md`
- 当前 `miioo/backend/BACKEND_API_DOC.md` 已升级为“契约严谨版 + 联调重排版”主文档；本表负责说明页面闭环如何消费这些接口事实，不再与主文档重复维护全量接口定义

## 2. 状态说明

| 状态 | 含义 |
|---|---|
| `已存在` | 前后端真实能力已经存在，主要做适配即可 |
| `可适配` | 后端能力基本够，但前端适配层还未完成 |
| `需补后端` | 后端真实接口或聚合能力不足 |
| `需补前端承接` | 页面缺少必要状态或错误反馈位置 |
| `高风险` | 若不先处理，会直接阻断主链路 |

## 2.1 使用方式

建议按下面顺序使用本文件：

1. 先看 `HARNESS_DOC_INDEX.md`，确认当前阶段和文档分工
2. 再按页面章节定位当前任务对应的闭环
3. 对照前端页面文件、`src/api/` 适配层和后端 router / schema / service / model 交叉核对
4. 任务完成后，只回写“当前判断 / 备注 / 新增映射 / 验收口径”，不要把后端全量接口定义重复抄回本文件

## 3. 全局关键映射

| 前端口径 | 后端口径 | 处理策略 |
|---|---|---|
| `desc` | `description` | 在 `src/api` 请求映射 |
| `ratio` | `aspect_ratio` | 在 `src/api` 请求映射 |
| `style` | `visual_style` | 在 `src/api` 请求映射 |
| `coverFile` | 先上传，再写 `cover_url` | 适配层编排上传 |
| `shot` / `shots` | `storyboard` / `storyboards` | 页面语义不变，API 层翻译 |
| `char` | `character` | 类型映射 |
| 集数标签 | `episode_id` | 建立 label <-> id 映射缓存 |
| `对话模型/图片模型/视频模型/配音模型` | `chat/image/video/voice` | 建立 tab 文案映射 |
| 本地 blob URL | 后端真实媒体 URL | blob 只用于临时预览，不得替代持久化 URL |
| 本地参考视频/音频文件 | 先上传为受管 `/uploads/...`，再由后端转换为上游可访问公网 URL | 页面不直接把本地文件交给外部视频模型 |

## 4. 页面映射

## 4.1 登录

| 项目 | 内容 |
|---|---|
| 页面/组件 | `Home.jsx` / `LoginModal.jsx` / `AccountMenu.jsx` |
| 用户动作 | 发送验证码、手机号密码登录、手机号验证码登录、微信扫码登录、退出登录 |
| 前端入口 | `src/api/auth.js` |
| 当前前端口径 | `phone + code` 登录；`phone + password` 登录；`bindPhone()`；本地登录态切换 |
| 后端真实能力 | `POST /api/auth/send-code`、`POST /api/auth/verify-code-login`、`POST /api/auth/login`、`POST /api/auth/refresh`、`POST /api/auth/logout`、`GET /api/auth/wechat/qrcode`、`GET /api/auth/wechat/poll/{session_id}`、`POST /api/auth/wechat/confirm`、`GET /api/auth/me` |
| 请求映射 | `loginWithPhone(phone, code)` -> `/auth/verify-code-login`；`loginWithPassword(phone, password)` -> `/auth/login`；退出登录统一走 `/auth/logout` 并清理本地 token；统一请求层 `401` 时自动调用 `/auth/refresh` 并重试一次原请求 |
| 响应映射 | 统一归一成 `{ accessToken, refreshToken, tokenType }`，并提供当前用户拉取入口；刷新成功后回写本地 token 存储 |
| 冲突类型 | 命名冲突 + 能力缺失 |
| 当前判断 | `可适配` |
| 备注 | 手机号验证码登录、手机号密码登录、退出登录、首页恢复登录态已完成前端代码接入；前端请求层现已支持双 token 会话维持；首页未登录口径现已从“全入口拦截”收口为“定点触发登录”：允许匿名进入 `项目 / 创作` 一级页，`右上角登录按钮 / 左下角 API 图标 / 项目页新建项目 / 创作页 Guest CTA` 四个动作会统一拉起 `LoginModal`，登录成功后继续执行被拦截动作；`Home.jsx` 现已在登录态下持久化 `activeKey / activeProjectId / activeStep`，刷新后会先恢复会话再回到刷新前所在页面；认证接口的主事实源已统一回写 `miioo/backend/BACKEND_API_DOC.md`；`bind-phone` 当前后端无对应接口，微信绑定链路后续单独处理；验证码自动创建账号后暂无设置密码闭环 |

## 4.2 当前用户与通知

| 项目 | 内容 |
|---|---|
| 页面/组件 | `Home.jsx` / `AccountMenu.jsx` |
| 用户动作 | 首屏恢复登录态、读取用户信息、登录后访问通知中心、查看通知详情、标记已读 |
| 前端入口 | `src/api/user.js` |
| 当前前端口径 | `apiGetCurrentUser()`、`apiGetNotifications()`、`apiGetNotificationUnreadCount()`、`apiMarkNotificationRead()`、`apiMarkAllNotificationsRead()` |
| 后端真实能力 | `GET /api/auth/me`、`GET /api/notifications`、`GET /api/notifications/unread-count`、`PATCH /api/notifications/{notification_id}/read`、`POST /api/notifications/read-all` |
| 请求映射 | `apiGetCurrentUser()` 改接 `/api/auth/me`；通知列表和未读数分别走 `/api/notifications`、`/api/notifications/unread-count`；通知详情打开时写回单条已读；通知头部按钮写回全部已读；通知分类字段现统一按 `type=system_notice / creation_log / team_collab` 传递 |
| 响应映射 | 用户信息统一成 `id/name/nickname/phone/wechat/avatarUrl/hasApiConfigured`；通知统一成 `id/title/content/time/createdAt/unread/type/link` 视图模型，其中 `type` 前端主口径已收口为 `system_notice / creation_log / team_collab` |
| 冲突类型 | 命名冲突 + 响应归一化 |
| 当前判断 | `已存在` |
| 备注 | 当前用户与通知已完成前端代码接入；`Home.jsx` 现已对通知按钮增加登录门禁，未登录点击会直接拉起 `LoginModal`；登录后通知中心可读取真实列表、显示未读徽标，并支持单条已读与全部已读；通知分类字段已进一步收口为 `system_notice / creation_log / team_collab`，同时兼容历史旧值 `task_* / creation_* / workbench_* / team*` 的前端归类；`wechat` 并非后端 `me` 必然返回字段，前端现已改为“后端没值就不展示”，不再伪造“未绑定”；用户头像路径已在 `src/api/user.js` 统一标准化；`AccountMenu` 弹层主标题现已优先展示 `currentUser.name`，避免把 UUID 误当成用户名展示 |

## 4.3 个人信息

| 项目 | 内容 |
|---|---|
| 页面/组件 | `ProfileModal.jsx` / `AccountMenu.jsx` / `Home.jsx` |
| 用户动作 | 打开个人信息弹窗、修改用户名、上传头像、换绑手机号、绑定/解绑微信、注销账号 |
| 前端入口 | `src/api/user.js` |
| 当前前端口径 | 用户资料最小承接为 `name/nickname/avatarUrl/displayId/phone/wechat`，动作层继续走 `src/api/user.js` 聚合适配 |
| 后端真实能力 | `GET /api/auth/me`、`PATCH /api/users/me`、`POST /api/images/upload`、`POST /api/users/me/phone/rebind/send-code`、`POST /api/users/me/phone/rebind`、`POST /api/users/me/wechat/bind`、`DELETE /api/users/me/wechat`、`DELETE /api/users/me` |
| 请求映射 | 前端 `name` -> 后端 `nickname`；前端 `avatarUrl` -> 后端 `avatar_url`；头像先上传再保存用户资料；手机号换绑与微信绑定/解绑继续由 `src/api/user.js` 屏蔽后端字段细节 |
| 响应映射 | 统一归一为 `currentUser.name / nickname / avatarUrl / displayId / phone / wechat / phoneBound / wechatBound` 并同步账户菜单与资料弹窗 |
| 冲突类型 | 页面承接缺失 + 能力边界澄清 |
| 当前判断 | `已存在` |
| 备注 | `2026-06-04` 已完成个人资料第一版真实闭环：`ProfileModal.jsx` 已补齐“用户名修改二级弹窗、手机号换绑验证码确认、微信绑定/解绑确认、注销确认”四类动作，`src/api/user.js` 也已补用户名 50 字限制、敏感词/字符白名单校验、头像 5MB 限制，以及手机号换绑和微信绑定/解绑适配；`Home.jsx` / `AccountMenu.jsx` / `ProfileModal.jsx` 现统一优先展示后端返回的 `display_id`；当前遗留已收口为“微信 OAuth 账号级绑定”尚未扩成完整闭环，真实联调继续以人工验收为准 |

## 4.3 项目列表与新建项目

| 项目 | 内容 |
|---|---|
| 页面/组件 | `Home.jsx` / `ProjectList.jsx` / `NewProjectModal.jsx` |
| 用户动作 | 拉项目列表、新建项目、进入项目、后续重命名和删除 |
| 前端入口 | `src/api/project.js` `src/api/visualStyle.js` |
| 当前前端口径 | `name/desc/ratio/style/customStyleDesc/coverFile` |
| 后端真实能力 | `GET /api/projects`、`POST /api/projects`、`PATCH /api/projects/{project_id}`、`DELETE /api/projects/{project_id}`、`POST /api/images/upload`、`GET /api/user-styles/options` |
| 请求映射 | `desc -> description`、`ratio -> aspect_ratio`、`style -> visual_style`、`customStyleDesc -> visual_style(自由文本，仅当前项目)`、`coverFile -> /images/upload -> cover_url` |
| 响应映射 | 项目对象归一为前端项目卡片所需字段，并补充 `visual_style_label -> styleLabel`；视觉风格选项归一为卡片列表所需的 `value/label/prompt/isBuiltIn/isCustom` |
| 冲突类型 | 命名冲突 + 上传前置 + 页面承接缺失 |
| 当前判断 | `已存在` |
| 备注 | 项目列表读取、点击进入、重命名、删除已完成前端代码接入；`NewProjectModal.jsx` 的视觉风格已改为真实接口动态加载；`2026-06-08` 起新建项目里的“自定义风格”已从“用户级全局风格”收口为“项目内临时输入”：弹窗内仅展示内置风格 + 自定义入口，不再创建 `POST /api/user-styles` 记录；创建时会把本次输入直接写入当前项目的 `visual_style` 自由文本，因此新建另一个项目时自定义内容会重新为空；`2026-05-25` 已为 `2D悬疑动漫` 风格卡片补齐指定图片占位，当前优先显示本地资源图；`ProjectList.jsx` 已补齐无封面项目默认图兜底，空值或空白值统一回退到 `src/assets/project-default-cover.png`；`Home.jsx` 已将“再次点击项目卡片打开项目”的默认落点固定为 `项目总览`，避免沿用上一次项目的 step 状态；`2026-05-25` 起后端在项目创建/更新时会自动把外部 `cover_url` 下载转存到 `/uploads/projects/...`，避免项目长期依赖第三方封面外链；`2026-06-04` 已补首页未登录模板浏览闭环：`Home.jsx` 会在匿名态调用 `GET /api/project-templates`，`ProjectList.jsx` 以只读卡片展示模板案例并复用本地 `coverKey` 映射，项目 tab 内仅“新建项目”继续要求登录；同日已补登录后 `hasApiConfigured` 门禁：未配置 API 时，项目页点击“新建项目”不再直接打开 `NewProjectModal`，而是统一弹出现有 `ApiConfigModal`；待在真实登录态下联调验证列表回显、风格回显和删除结果 |

## 4.4 全局设定

| 项目 | 内容 |
|---|---|
| 页面/组件 | `GlobalSettings.jsx` |
| 用户动作 | 查看项目概况、修改项目基础信息、查看资产概况 |
| 前端入口 | `src/api/project.js` |
| 当前前端口径 | 页面仍主要吃 `Home.jsx` 透传状态 |
| 后端真实能力 | `GET /api/projects/{project_id}/overview`、`PATCH /api/projects/{project_id}` |
| 请求映射 | 基础字段仍用项目映射规则 |
| 响应映射 | `overview` 归一为前端统计卡片所需的 `asset_counts/storyboard_thumbnails/episode_progress` |
| 冲突类型 | 可适配 |
| 当前判断 | `已存在` |
| 备注 | `overview` 读取、项目名称/描述/封面自动保存、比例与风格真实回显已完成前端代码接入；项目响应现已携带 `visual_style_label` 以兼容内置/自定义风格展示；总览里的角色/场景/道具卡片已增加 `count > 0` 才允许跳入主体页对应 tab 的门禁，剧集结构在 `episode_progress.length > 0` 时可直接跳入分镜页并透传对应 `episode_id`；`2026-05-26` 起 `GlobalSettings.jsx` 会把资产概况计数回传给 `Home.jsx`，新项目默认仅启用 `项目总览 / 剧本`，当 `角色 / 场景 / 道具 / 剧集结构` 任一数量大于 `0` 时，顶部步骤条会自动开放 `主体 / 分镜 / 剪辑` 供用户自行点选跳转，且 `剪辑` 不再误回到总览承接；当前仍不依赖缺失的 `/settings` router |

## 4.5 API 配置弹窗

| 项目 | 内容 |
|---|---|
| 页面/组件 | `ApiConfigModal.jsx` |
| 用户动作 | 读取配置、测试连接、创建服务商、启停模型、推荐一键配置 |
| 前端入口 | `src/api/config.js` |
| 当前前端口径 | `apiGetApiConfig()` / `apiSaveApiConfig()` / `apiTestConnection()` 对外仍保持单模块 API，但内部已改为聚合编排 |
| 后端真实能力 | `GET /api/providers`、`POST /api/providers`、`PATCH /api/providers/{provider_id}`、`DELETE /api/providers/{provider_id}`、`POST /api/providers/{provider_id}/test`、`POST /api/providers/oneclick-setup`、`POST /api/providers/aiping-setup`、`POST /api/providers/minimax-setup`、`POST /api/providers/vidu-setup`、`POST /api/providers/volcengine-setup`、`POST /api/providers/fal-setup`、`GET /api/models`、`POST /api/models`、`PATCH /api/models/{model_id}`、`DELETE /api/models/{model_id}` |
| 请求映射 | `OneLinkAI` 通过 `oneclick-setup` 建立/更新主服务商；`MiniMax / AI Ping / Vidu / Volcengine / fal` 各自走内置 setup；其中 `MiniMax` 使用 `api_key + base_url`，`Volcengine` 使用 `ark_api_key + voice_api_key` 双凭证，`fal` 当前固定使用官方 `https://api.fal.ai`；自定义服务商走 `providers` CRUD；模型卡片走 `models` CRUD；弹窗关闭或子弹窗保存时执行一次全量同步 |
| 响应映射 | 归一成前端当前 state：`mainConfigured/onelinkEnabled/minimaxEnabled/aipingEnabled/viduEnabled/volcengineEnabled/falEnabled/*ModelsByTab/customProviders` |
| 冲突类型 | 结构冲突 |
| 当前判断 | `已存在` |
| 备注 | 已完成真实聚合适配，移除 `Math.random()` 测试 mock、写死模型数 `23`、写死日期 `2026-01-01` 和“仅保存在本地浏览器”的旧说明；`2026-05-25` 已为 `OneLinkAI` 一键预置补齐 `豆包·Seedance 2.0 Fast`，并把后端 `model_capabilities.py` 的 Seedance 2.0 系列能力基座更新为官方教程口径；`2026-06-02` 起 `OneLinkAI` 的 Seedance 2.0 Fast 统一收口到新模型 ID `doubao-seedance-2-0-fast`，后端预置、能力映射与视频出站请求层已同步兼容旧值 `doubao-seedance-2.0-fast-v1 / doubao-seedance-2.0-fast / doubao-seedance-2.0-fast-260128`，避免历史模型记录或旧选择值继续透传失效；同日 `OneLinkAI` 视频预置模型曾扩展到 `veo-3.1-generate-preview`，当前能力口径收口为 `文生 / 图生 / 首尾帧 / 多参考图引导`，并沿用 OneLinkAI Gemini 兼容地址执行；但按当前联调策略，Veo 入口已先在 `backend/app/services/onelink_presets.py` 注释隐藏，后续需启用时再恢复该预置项，不新增新的 provider 类型；`2026-05-25` 进一步排查 API 测试连接 `401`，确认本地库 `api_providers` 当前仅有 1 条 `OneLinkAI` 记录，不存在重复 provider 脏数据，但该记录中的 API Key 已被历史流程写成脱敏掩码值，后端现已对“数据库保存的是脱敏 API Key”给出明确错误提示，前端 OneLink 配置弹窗也不再把掩码 key 回填到可编辑输入框；`2026-05-27` 已把 `OneLinkAI` 一键预置中的 Kling 主模型统一为视频 `video-kling-v3 / video-kling-v3-omni` 与图像 `image-kling-v3 / image-kling-v3-omni`；同日已继续保留旧 Kling 模型值兼容归一化，历史 `kling-v2-6 / kling-v1 / kling-v1-6 / kling-video-o1 / kling-v2-1 / kling-image-o1 / kling-v2` 最终都会收口到上述 4 个真实模型名，避免历史模型记录失效；`2026-06-01` 已把 `Volcengine` 升级为第四张 built-in provider 卡片；同日已继续把 `MiniMax` 收口为第五张 built-in provider 卡片，前端聚合层与弹窗已支持 `MiniMax API Key / Base URL` 最小承接，并同步官方 `speech-2.8-hd / speech-2.8-turbo / speech-2.6-hd / speech-2.6-turbo` 预置模型；`2026-06-03` 已完成 `fal` 第二阶段最小闭环：前端 `ApiConfigModal.jsx` 已把 `fal` 接为第六张 built-in provider 卡片，聚合层与保存/测试流程已纳入 `falProviderId / falEnabled / falModelsByTab`；后端 `POST /api/providers/fal-setup`、`GET /api/models` 与运行时同步扩展到 `fal-ai/flux/dev`、`fal-ai/flux/schnell`、`fal-ai/stable-video`、`fal-ai/wan-flf2v` 四个官方预置；其中 `flux/dev` 已放开 `1-4` 张文生图输出，`wan-flf2v` 已支持首尾帧视频生成；后端 `GET /api/models` 已新增 `provider_type / provider_name`，供下游入口按真实模型归属识别供应商；`GET /api/voices/official` 现已支持 `provider=minimax|volcengine` 双官方音色源，创作页会优先按模型真实 `providerType` 选择官方音色模式，不再只靠模型名猜供应商；`2026-06-04` 已新增 API 配置内置卡片展示管理：后端补 `api_config_card_visibility` 配置表与 `/api/api-config/card-visibility` 读写接口，管理员可按卡片维度切换 `OneLinkAI / MiniMax / AI Ping / Volcengine / Vidu / fal` 六张 built-in provider 的展示状态，普通用户打开弹窗时只看到管理员允许展示的卡片；当前 Volcengine voice 若真实环境仍要求额外 `appid`，可先在 `Voice API Key` 字段填写 JSON 凭证，待你实测确认最终口径；后续还需继续迁移残余固定 OneLink 的旧调用面 |

## 4.6 剧本与分集

| 项目 | 内容 |
|---|---|
| 页面/组件 | `ScriptPage.jsx` |
| 用户动作 | 创建分集、生成剧本、流式输出、保存剧本、上传文档、从当前分集一键提取主体 |
| 前端入口 | `src/api/episode.js` |
| 当前前端口径 | 页面保持现有工作区 UI，但状态已升级为真实 episode 对象数组 + 当前 `episode_id` |
| 后端真实能力 | `GET /api/projects/{project_id}/episodes`、`POST /api/projects/{project_id}/episodes`、`PATCH /api/projects/{project_id}/episodes/{episode_id}`、`DELETE /api/projects/{project_id}/episodes/{episode_id}`、`POST /api/projects/{project_id}/episodes/{episode_id}/generate`、`POST /api/projects/{project_id}/episodes/{episode_id}/generate/stream`、`POST /api/projects/{project_id}/episodes/{episode_id}/upload`、`GET /api/projects/{project_id}/script-workspace`、`POST /api/projects/{project_id}/script-workspace/chat`、`POST /api/projects/{project_id}/script-workspace/split-preview`、`POST /api/projects/{project_id}/script-workspace/finalize`、`GET /api/projects/{project_id}/script-workspace/history`、`POST /api/projects/{project_id}/subjects/extract?episode_id=` |
| 请求映射 | 发送 prompt 时若当前集已有内容，先创建下一集；当项目还没有正式分集时，整稿生成链路切到 `script-workspace/chat -> split-preview/finalize`；底部模型按钮读取 `GET /api/models?category=chat`，优先展示 `isDefault=true` 的默认文本模型名称，并在流式生成或整稿生成时透传真实 `model_id`；若用户在当前页保存了 API 配置，`Home.jsx -> GlobalSettings.jsx -> ScriptPage.jsx` 会触发一次模型列表刷新并强制回填新的默认文本模型；底部集数入口支持固定选项与自定义正整数，前端统一收口为 `episodeCount`，并由 `src/api/projectScript.js` 映射到 `episode_count` 同时透传给 `script-workspace/chat`、`split-preview`、`finalize`；流式生成和上传都落到当前 `episode_id`；`generate/stream` 遇到 `401` 时会先走 `/api/auth/refresh` 再重试一次流式请求；保存编辑内容时统一走 `PATCH`；点击“开始提取主体”时先按需保存编辑中的剧本，再调用 `subjects/extract`，成功后回写当前分集 `status: extracted` |
| 响应映射 | 后端 episode 对象归一为 `{ id, title, episodeNumber, content, status }`；左侧目录吃 `title`，右侧编辑器吃 `content` |
| 冲突类型 | 能力接线缺失 + ID/标签差异 |
| 当前判断 | `已存在` |
| 备注 | 已新增 `src/api/episode.js` 并完成真实接线；`ScriptPage.jsx` 不再依赖 `setTimeout` mock，也不再通过 markdown 标题反推分集列表；`2026-05-24` 已修正底部对话模型选择器，避免按钮展示和真实请求模型脱节；`2026-05-24` 已补齐“开始提取主体”按钮真实调用与错误承接；`2026-05-24` 已修复 OneLink OpenAI 兼容网关映射，避免 `subjects/extract` 命中 `api.onelinkai.cloud/v1/chat/completions` 返回 404；`2026-05-24` 已补齐剧本流式 SSE 的 token 自动刷新；`2026-06-01` 已补齐剧本页底部“选择集数”闭环：当项目还没有正式分集时，发送创意会改走 `script-workspace/chat -> finalize` 的整稿生成链路，前端新增 `apiChatProjectScript()` 承接主剧本生成；“自动适应 / 1集 / 3集 / 5集 / 10集” 选择会透传到 `episode_count`，用于约束后端自动拆分正式分集；编辑态点击“定稿”时的 `split-preview / finalize` 也会继续复用当前集数选择；`2026-06-08` 已继续收口目标集数透传：固定集数与自定义正整数都会统一映射为 `episode_count` 透传到 `script-workspace/chat`，后端 chat 阶段也会把该数字注入模型上下文，尽量按对应集数输出 `第1集 / 第2集 / ...` 结构；`2026-06-09` 已继续补齐底部模型按钮默认模型刷新：用户在 API 配置弹窗切换默认 `chat` 模型并保存后，剧本页底部模型按钮会立即回显新的默认文本模型；同日“开始提取主体”已从同步整包返回改为 `GenTask + gen_task_items` 任务制，前端改为轮询 `/api/tasks/{task_id}` 并在任务进行中实时刷新主体结果；同日已继续把 `partial` 纳入轮询终态，避免子项部分失败时页面仍无限轮询；自定义集数仅允许 `1-200`；待在真实 API Key 环境下联调验证整稿生成、自动拆分和主体后续承接链路 |

## 4.7 主体

| 项目 | 内容 |
|---|---|
| 页面/组件 | `SubjectPage.jsx` |
| 用户动作 | 拉集数、拉主体、创建/编辑/删除主体、上传参考图、生成主体图、批量生成 |
| 前端入口 | `src/api/subject.js` |
| 当前前端口径 | `char/scene/prop`、集数标签、`imageUrl`、批量生成模型下拉 |
| 后端真实能力 | `GET /api/projects/{project_id}/episodes`、`GET /api/projects/{project_id}/subjects`、`POST /api/projects/{project_id}/subjects`、`PATCH /api/projects/{project_id}/subjects/{subject_id}`、`DELETE /api/projects/{project_id}/subjects/{subject_id}`、`POST /api/projects/{project_id}/subjects/extract`、`POST /api/projects/{project_id}/subjects/{subject_id}/reference-images/upload`、`POST /api/projects/{project_id}/subjects/{subject_id}/reference-images/bind`、`POST /api/projects/{project_id}/subjects/{subject_id}/generate-image`、`GET /api/projects/{project_id}/subjects/{subject_id}/images/{image_id}/download`、`POST /api/projects/{project_id}/subjects/batch-generate`、`GET /api/models?category=image`、`GET /api/voices` |
| 请求映射 | `char -> character`；集数字符串 -> `episode_id`；模型查询参数 `type -> category` |
| 响应映射 | 后端 `subject` 归一为前端卡片对象；后端 `SubjectImageResponse` 归一为右侧候选图与主图状态；相对媒体路径统一拼接后端域名 |
| 冲突类型 | 命名冲突 + ID/标签差异 + 上传前置 |
| 当前判断 | `已存在` |
| 备注 | 已完成真实 episodes/models/subjects/voices 接线，主体页按 `projectId + episode_id` 拉取角色/场景/道具，并支持创建、编辑、删除、生成图、主图切换、批量生成；新建主体不再默认写入“待定”，主体编辑面板不再预填提示词/比例/分辨率/生成方式，音色列表改读真实 `GET /api/voices`；`2026-05-24` 已修复 OneLink OpenAI 兼容接口网关，主体提取不再错误命中 `api.onelinkai.cloud/v1/chat/completions`；`2026-05-25` 已补齐候选图 hover 下载，改走主体图片下载接口，避免按钮点击无反应；`2026-05-25` 已修复主体页 `新增 / 添加角色` 按钮无响应，创建时会自动补齐后端必填 `name` 并在成功后直接打开编辑面板；`2026-05-25` 已修复 `subject.js` 媒体 URL 归一化对 `blob:` / `data:` 本地预览地址的误处理，避免主体图片被拼成错误的后端 URL；主体候选图与参考图现支持直接点击弹窗预览，定稿动作保留在候选图左上角复选框；主体参考图上传/绑定 UI 现已接通真实 `GET /subjects/{subject_id}`、`POST /reference-images/upload`、`POST /reference-images/bind`，不再只保存本地 `blob` 预览；`2026-05-27` 起主体页图片模型改为消费 `image-kling-v3 / image-kling-v3-omni` 的真实模型名口径，页面会继续按图片能力表动态收敛参考图数量、生成数量与说明文案；`2026-06-03` 已把主体提取 prompt 升级为“剧本拆解主体 skills 层”版本，抽取时会先做剧情分段，再按角色/场景/道具三类执行细化识别、去重归并与重要度判断，同时后端已开始承接角色 `age/gender/background`、场景 `scene_type/time/atmosphere`、道具 `importance` 等已有字段，减少“只提到名字但细节落不下来”的情况；`2026-06-05` 已继续补齐主体页批量生成的页面承接：点击“批量生成角色/场景/道具”后不再只是发请求，页面会同步承接生成中状态、等待批量接口结果、刷新当前分集主体列表，并对全成功 / 部分失败 / 全失败给出真实 toast 反馈；`2026-06-08` 已继续收口主体页角色卡片音色来源：初始化音色标签与选择弹窗统一改读用户侧真实可用音色接口 `GET /api/voices`，不再混用后台管理口径 `GET /api/voices/library`；`2026-06-09` 已继续把单主体生成图和批量生成图切到任务制：`generate-image / batch-generate` 现在都会先返回任务对象，页面侧通过 `/api/tasks/{task_id}` 轮询并在任务进行中实时刷新受影响主体卡片；同日已继续收口 `partial` 终态与错误提示：任务现在会在部分完成时正常停轮询并回显成功/失败数量，不再因为子项失败卡住页面 |

## 4.8 分镜

| 项目 | 内容 |
|---|---|
| 页面/组件 | `StoryboardPage.jsx` / `ShotViewerModal.jsx` |
| 用户动作 | 拉某集分镜、增删改排序、生成图、上传图、生成视频、批量下载 |
| 前端入口 | `src/api/storyboard.js` |
| 当前前端口径 | 页面仍保留 `shot/shots` UI 语义，但已由 `src/api/storyboard.js` 翻译到真实 `storyboards` |
| 后端真实能力 | `GET /api/projects/{project_id}/storyboards?episode_id=`、`POST /api/projects/{project_id}/storyboards`、`PATCH /api/projects/{project_id}/storyboards/{storyboard_id}`、`DELETE /api/projects/{project_id}/storyboards/{storyboard_id}`、`POST /api/projects/{project_id}/storyboards/reorder`、`POST /api/projects/{project_id}/storyboards/generate`、`POST /api/projects/{project_id}/storyboards/{storyboard_id}/generate-image`、`POST /api/projects/{project_id}/storyboards/{storyboard_id}/upload-image`、`POST /api/projects/{project_id}/storyboards/{storyboard_id}/upload-video`、`POST /api/projects/{project_id}/storyboards/{storyboard_id}/generate-video`、`POST /api/projects/{project_id}/storyboards/download/images`、`POST /api/projects/{project_id}/storyboards/download/videos` |
| 请求映射 | `shot -> storyboard`；`episodeId -> episode_id`；排序参数统一为 `ordered_ids`；分镜图/视频上传走业务上传接口；定稿状态写入 `gen_params.video_finalized` |
| 响应映射 | 后端 storyboard 对象归一为前端镜头卡片字段，包括 `params/mainRefs/storyboardImage/storyboardVideo/genParams` |
| 冲突类型 | 命名冲突 + 上传流风险 + 任务语义风险 |
| 当前判断 | `已存在` |
| 备注 | 已完成真实列表、CRUD、排序、分镜图上传、分镜视频上传、分镜图生成、分镜视频生成、定稿回刷，并将生成面板资产选择器接到真实项目/创作资产；分镜图生成现已支持 `reference_images` 并回退使用 storyboard 已保存参考图；`StoryboardPage.jsx` 已移除默认项目名、默认分集文案和默认分辨率预选，当前改为无值不展示、无选择不自动填充；`2026-05-25` 已将分镜视频生成面板的 `时长 / 分辨率` 改为消费视频模型 `capabilities` 动态收敛，前端会显式提交 `reference_mode`，后端 `generate-video` 现优先消费前端透传的 `reference_mode`，不再只依赖服务端推断；同日起分镜视频结果和首尾帧参考图在写库前会先自动托管到本地 `/uploads/storyboards/...`，不再静默保留第三方临时 URL；`2026-05-25` 已补齐分镜视频生成第一阶段参考链路：前端 `apiGenerateVideo()` 会显式透传 `reference_images`，后端 `storyboards.py` 会真实消费 `参考主体 / 参考图`，并修正 `full / last_frame` 模式下参考帧被过早裁掉的问题；`2026-05-27` 起后端 `video_gen.py` 已按 OneLinkAI Kling 兼容文档把 Kling 视频主模型统一为 `video-kling-v3 / video-kling-v3-omni`，其中 `video-kling-v3` 会按输入素材自动分发到 `text2video / image2video / multi-image2video`，`video-kling-v3-omni` 固定走 `omni-video`；历史 `kling-v2-6 / kling-v1 / kling-v1-6 / kling-video-o1` 仍保留兼容归一化；同日起分镜页参考模式已按模型语义融合：Kling 文生视频展示为“文生视频”，Kling 视频 Omni 展示为“参考视频驱动”，Kling 多图参考视频只保留“多图参考”入口，不再错误沿用 Seedance 的首尾帧语义；`2026-06-02` 已完成 Veo 运行时接入，但当前已先在 `onelink_presets.py` 注释隐藏 Veo 预置入口，因此分镜视频面板暂不会暴露 `veo-3.1-generate-preview` 供选择；若后续重新开放，现有单镜头生成视频面板仍可继续复用 `generation_mode / attachments / 首尾帧 / ratio / resolution / duration`，且 Veo 的图生 / 首尾帧 / 多参考图模式统一限制为 `8` 秒，运行时按 OneLinkAI Gemini 兼容 `predictLongRunning + operations` 执行；同日已补 `storyboards.py` 对历史 `video_resolution` 的兼容收口：当用户切到 `doubao-seedance-2-0-fast` 等能力较窄模型、但分镜仍残留旧的 `1080P` 等历史分辨率时，后端会先按当前模型能力重算有效分辨率，再进入统一校验与上游请求，避免旧缓存参数绕过校验后在 OneLinkAI `r2v` 阶段报 `InvalidParameter`；同日分镜页任务1结构化字段的下拉选项集也已按最新产品口径更新，当前 `景别 / 运镜 / 拍摄角度 / 构图` 仅在前端展示层替换可选值，不影响既有 `framing / cameraMotion / angle / composition` 的接口映射与落库字段；`2026-06-05` 已继续把“视频参考素材如何交给外部模型”这件事写成显式集成事实：页面侧只负责上传或选择资产对象，参考视频/音频若来自本地文件，必须先落为受管 `/uploads/...`，再由后端按 `PUBLIC_BASE_URL`、公网探活与必要重托管规则转换成上游可访问 URL；当前云端 HTTP 域名仍允许临时试跑，但正式环境目标口径仍是固定 `HTTPS` 域名，并预留 `UPSTREAM_MEDIA_REQUIRE_HTTPS` 供后续切严格模式；`2026-06-09` 已继续清理分镜图片生成链路的一次性 `7777/event` 调试注入，移除 `storyboards.py` 与 `image_gen.py` 中阻断启动和干扰运行的临时代码，恢复后端可启动状态，后续真实联调再回到图片生成业务本身排查；`2026-06-09` 已继续补齐“生成图片历史”承接：`src/api/storyboard.js` 现会把 `gen_params.generated_images[].url` 统一标准化为可访问媒体地址，`StoryboardPage.jsx` 的图片生成面板也已接通卡片下载按钮，修复 `/uploads/...` 相对路径导致的预览失败与下载无响应问题；同日又继续在页面层补了一层媒体 URL 兜底，当前图片卡片展示、点击放大和预览弹窗都会先统一标准化 URL，避免历史状态里残留的相对路径继续导致放大查看失效 |
补充：`2026-06-09` 已继续补齐分镜页“旁白配音 -> 全局应用”闭环。当前按钮不再只是改本地 `globalVoiceParams`；点击后会把当前角色语速/音量同步应用到当前集内同角色旁白条目，并通过 `src/api/storyboard.js -> PATCH /api/projects/{project_id}/storyboards/{storyboard_id}` 持久化到 `gen_params.narration_segments / gen_params.global_voice_params`，刷新后仍可回显。

补充：`2026-06-09` 已继续把“开始智能分镜”切到任务制：`POST /api/projects/{project_id}/storyboards/generate` 现在会先返回 `GenTask`，后端按 `story beat` chunk 持续写入 `storyboards`；前端通过 `/api/tasks/{task_id}` 轮询任务状态，并在任务进行中实时刷新分镜结果，不再等待整包返回。

补充：`2026-06-09` 已继续收口任务终态承接：主体页“开始智能分镜”轮询现在已把 `partial` 视为终态之一，任务部分完成时会停止轮询并直接提示成功/失败分段数量，避免因为个别子项失败导致前端一直等待。

补充：`2026-06-09` 已继续补齐分镜页视频时长“自动匹配”承接：`StoryboardPage.jsx` 里的单镜头视频生成面板与批量生成分镜视频弹窗，当前都会优先读取后端分镜提取后落库的 `duration`；若当前模型不支持该秒数，前端继续复用 `resolveVideoSelection()` 自动收敛到兼容时长后再提交 `generate-video`，避免“自动匹配”仍停留在占位文案或直接把非法时长打给后端。

## 4.8.1 分镜提取迁移专项

| 项目 | 内容 |
|---|---|
| 页面/组件 | `ScriptPage.jsx` / `SubjectPage.jsx` / `StoryboardPage.jsx` |
| 用户动作 | 从正式分集触发“开始智能分镜”或后续“重新提取分镜”，得到可编辑结构化分镜和可继续生成的最终提示词 |
| 参考实现 | `huobao-drama-master` 中 `script_rewriter -> extractor -> storyboard_breaker` 三段式 Agent 链路 |
| `miioo` 当前前端口径 | `apiGenerateStoryboardsFromEpisode(projectId, episodeId, model?)`，列表页以 `description / params / lightShadow / ambientSound / narration / imagePrompt / genParams` 承接 |
| `miioo` 当前后端能力 | `project_script_service.py` 负责整稿拆分，`subject_extract.py` 负责主体提取，`storyboard_gen.py` 负责直接 LLM 拆镜，`routers/storyboards.py` 负责落库、媒体生成与 CRUD |
| 当前代码事实 | `miioo` 已有 `camera_angle / composition / lighting / ambient_sound / voiceover / gen_params` 持久化字段，但 `storyboard_gen.py` 当前稳定产出仍主要是 `content / shot_type / camera / duration / image_prompt / characters / scene / props / beat_refs` |
| 新目标口径 | 在现有分镜页上补“任务1 结构化抽取层 + 任务2 组合提示词层”，其中任务2 建议先放 `gen_params.composed_prompt_*` |
| 请求映射 | 前端仍保持 `shot` 页面语义；后端在生成阶段补齐 `lighting / ambient_sound / voiceover / camera_angle / composition`，并把任务2 自动稿落入 `gen_params.composed_prompt_auto` 等字段 |
| 响应映射 | `src/api/storyboard.js` 继续把后端 storyboard 归一成前端 `description / params / lightShadow / ambientSound / narration / imagePrompt / genParams`，并新增 `composedPromptAuto / composedPromptManual / composedPromptDirty / composedPromptSourceVersion` 的前端可消费字段 |
| 冲突类型 | `B 类结构冲突 + C 类能力缺失 + D 类页面承接缺失` |
| 当前判断 | `进行中` |
| 建议处理层 | 先补 `miioo/backend/app/services/storyboard_gen.py` 与 `routers/storyboards.py`，再补 `frontend/src/api/storyboard.js` 与 `StoryboardPage.jsx` 最小承接 |
| 分阶段建议 | `SBX-01` 迁移契约梳理；`SBX-02` 后端结构化抽取字段补齐；`SBX-03` 任务2 自动稿/人工稿落库与版本控制；`SBX-04` 分镜页任务1/任务2 UI 承接；`SBX-05` 分镜图/视频/配音入口统一读取 `manual > auto > imagePrompt/description` |
| 备注 | `huobao-drama-master` 的优势不是“多一个接口”，而是把“剧本改写 / 主体抽取 / 分镜拆解”拆成连续能力链，并通过工具层把数据库写入作为单一事实源；`miioo` 当前虽未完全 Agent 化，但 `SBX-02` 已完成第一版：`storyboard_gen.py` 已开始产出 `camera_angle / composition / lighting / ambient_sound / voiceover`，`routers/storyboards.py` 已在 AI 生成时真实写库；同时 `SBX-03` 第一版也已启动，分镜生成/新增/更新会写入 `gen_params.composed_prompt_auto / composed_prompt_source_version`，前端 `src/api/storyboard.js` 已归一化 `composedPrompt*` 字段；分镜图/视频生成入口现已优先读取 `manual > auto > image_prompt > content`。`2026-06-05` 已继续补“开始智能分镜”闭环：单集生成若发现当前分集已有分镜，会直接返回当前列表而不是继续追加重复分镜；首次成功生成后会同步把分集状态推进到 `storyboarded`，前端 `Home.jsx` 也会立刻回写本地 `scriptEpisodes`，让工作流状态与真实数据保持一致。当前剩余重点转为 `StoryboardPage.jsx` 的任务2 展示、人工稿编辑状态承接和更多下游入口统一消费。 |

## 4.8.2 剪辑成片增强迁移

| 项目 | 内容 |
|---|---|
| 页面/组件 | `EditPage.jsx` + `components/edit/*` |
| 用户动作 | 进入剪辑页、加载分镜/资产/音视频片段、自动生成或恢复时间线、追加素材、调整顺序、修改时长、编辑字幕、保存草稿、提交导出、轮询状态、查看结果文件 |
| 前端入口 | `src/api/composition.js` + `src/lib/composition.js` |
| 当前前端口径 | 页面保持 `visual/audio/subtitle` 三轨语义，`EditPage.jsx` 负责状态编排，复杂字段继续由适配层与工具层承接 |
| 后端真实能力 | `GET /api/projects/{project_id}/audio-clips`、`GET /api/projects/{project_id}/video-clips`、`GET/POST/PATCH /api/projects/{project_id}/compositions`、`POST /api/projects/{project_id}/compositions/{composition_id}/render`、`GET /api/tasks?project_id=`、`POST /api/exports/prepare` |
| 请求映射 | 页面初始化并行拉取 `storyboards/assets/audio-clips/video-clips/compositions/tasks/export-files`；无草稿时由 `src/lib/composition.js` 自动生成时间线，有草稿时优先 hydrate；保存统一走 `serializeCompositionPayload()`，将 `subtitle entries` 挂入 `subtitle_style.entries`；导出前若有脏修改，先 silent save 再调用 `render` |
| 响应映射 | `src/api/composition.js` 统一归一 `composition / composition task / export files`；`src/lib/composition.js` 继续归一 `timeline / subtitle entries / linked audios / status meta`；页面只消费 `statusLabel / failureReasons / exportFiles / linkedAudios / totalDuration` 等派生状态 |
| 冲突类型 | `B 类结构冲突 + D 类页面承接缺失` |
| 当前判断 | `已存在，已增强` |
| 备注 | `2026-06-09` 已继续把剪辑成片从“轻剪辑首版”增强到“项目内在线编辑版”：`EditPage.jsx` 当前已采用四区结构承接素材池、预览区、时间线区、属性/导出区；`src/api/composition.js` 已新增 composition export 任务归一化、失败原因提取与导出文件列表收口；`src/lib/composition.js` 已补齐时长修改、片段复制、linked audio / subtitle 收集、状态元信息汇总等工具函数；`TimelinePanel.jsx` 现支持顺序调整、时长修改、复制、删除和字幕编辑；新增 `ClipInspectorPanel.jsx`、`ExportSettingsPanel.jsx`，并将 `RenderResultPanel.jsx` 收口为“状态 + 失败原因 + 文件列表”；`StoryboardPage.jsx` 的“开始剪辑”入口也已放宽为“有分镜图或分镜视频都可进入”，不再强依赖已生成视频。当前仍未纳入重型拖拽时间线、自动转写字幕、AI Voice、Pexels、复杂动画/转场/裁剪。 |

## 4.9 资产库

| 项目 | 内容 |
|---|---|
| 页面/组件 | `AssetsPage.jsx` |
| 用户动作 | 拉项目列表、拉项目资产、查看详情、查看创作日历、收藏/删除/下载/批量操作 |
| 前端入口 | `src/api/assets.js` |
| 当前前端口径 | `chars/scenes/props/storyboard_img/storyboard_video/audio/final` 等前端分桶结构 |
| 后端真实能力 | `GET /api/assets`、`GET /api/assets/{asset_id}`、`GET /api/assets/{asset_id}/download?prefer_origin=`、`PATCH /api/assets/{asset_id}`、`DELETE /api/assets/{asset_id}`、`POST /api/assets/batch-delete`、`POST /api/assets/{asset_id}/restore`、`POST /api/assets/restore`、`GET /api/creation/images`、`GET /api/creation/videos`、`GET /api/creation/audios`、对应 favorite / delete / download / batch-download 接口 |
| 请求映射 | 适配层需把扁平资产列表分桶成前端页面需要的结构；项目资产单体下载统一走 `GET /api/assets/{asset_id}/download?prefer_origin=true`，优先取 `metadata.origin_url`，失败时回退托管 `file_url`；创作资产主列表继续由 `creation/images|videos|audios` 三域接口并行聚合；回收站统一改走 `GET /api/assets?deleted_only=true`，并按 `scope=project|creation` 切换项目/创作回收站 |
| 响应映射 | `asset_type/category/subject_id/file_url/thumbnail_url` -> 前端卡片结构 |
| 冲突类型 | 结构冲突 + 聚合能力不足 |
| 当前判断 | `已存在，本地库已修复，待联调` |
| 备注 | `AssetsPage.jsx` 已进入参考稿 1:1 第一阶段重构：当前页面已支持 `项目资产 / 创作资产` 双视图、左侧项目列表、项目重命名/删除/ZIP 下载、项目资产分类 tabs、创作资产按时间分组、图片详情弹窗、通用资产详情弹窗、项目资产名称/描述编辑、收藏/定版/删除/下载/批量删除/批量下载；`2026-05-25` 已在批量操作栏补齐 `下载` 按钮并放在 `删除` 前，项目资产按选中项逐个下载，创作资产继续复用真实 `batch-download` 接口；`2026-05-25` 已补删除确认弹窗与回收站闭环：删除改为移入回收站，前端已支持项目/创作双回收站查看与恢复；`2026-05-25` 已补齐项目资产单体下载接口，资产库详情里的 `下载原图`、项目资产批量下载、回收站单项下载现统一走 `apiDownloadAsset()`，优先下载原始地址并回退托管文件；`2026-05-25` 已将收藏 / 取消收藏反馈统一切到与 API 配置弹窗一致的顶部浮层成功提示；`src/api/assets.js` 已新增 `apiGetAssets(params)`、`apiRestoreAsset()`、`apiBatchRestoreAssets()`、`apiDownloadAsset()`；`2026-05-25` 已排查并修复本地数据库迁移状态损坏：清理 `alembic_version` 中不存在的脏版本 `c3d4e5f6a7b8` 后，已执行 `alembic upgrade c9d0e1f2a3b4`，`assets.is_deleted / deleted_at` 已成功落库，`/api/assets` 已恢复正常响应；当前仍建议后端后续评估是否补 `project assets overview / creative days` 聚合接口以降低前端聚合复杂度 |

## 4.10 创作页

| 项目 | 内容 |
|---|---|
| 页面/组件 | `CreationPage.jsx` + `components/creation/*` |
| 用户动作 | 进入创作页、选择项目与素材、提交图片/视频/配音生成、查看结果、打开详情弹窗、收藏/删除/下载 |
| 前端入口 | `src/api/creation.js` + `src/api/assets.js` |
| 当前前端口径 | `image/video/audio` 三条创作链路 + 参考素材对象数组 |
| 后端真实能力 | `POST /api/creation/images/generate`、`GET /api/creation/tasks/{task_id}`、`GET /api/creation/images/{image_id}`、`POST /api/creation/videos/generate`、`GET /api/creation/videos/tasks/{task_id}`、`POST /api/creation/audios/generate`、`POST /api/creation/audios/generate-async`、`GET /api/creation/audios/tasks/{task_id}`、对应 list / favorite / delete / download / batch-download 接口 |
| 请求映射 | 参考图/首尾帧/参考视频/参考音频统一在页面层保留资产对象；本地素材先走创作上传接口拿 `uploaded_url`，再由适配层透传真实 `url` 给生成接口；项目资产与创作资产由 `AssetPickerModal` 统一返回资产对象；当所选配音模型属于官方音色模式时，`src/api/creation.js` 会改走 `/api/voices/official` 并透传 `provider`；配音链路继续保留页面口径 `voiceId`，由适配层承接 `providerVoiceId / cloneStatus / supportsGenerate`，并按文本长度自动分流同步或异步接口 |
| 响应映射 | 图片/视频/配音结果统一归一为 `name/url/thumbnailUrl/model/prompt/createdAt/liked|favorite` 等页面字段；图片详情弹窗额外承接 `category/source/referenceImages/sessionId/shotId` 等字段；上传接口统一归一为稳定 `uploaded_url` 供页面状态直接消费；配音任务接口统一归一为 `taskId/status/progress/result/error`，自定义音色统一归一为 `voiceId/providerVoiceId/cloneStatus/supportsGenerate/expiresAt/sourceAudioUrl` |
| 冲突类型 | 结构冲突 + 任务轮询语义 |
| 当前判断 | `已存在，代码已打通，待真实账号联调` |
| 备注 | `Home.jsx` 已正式挂入 `CreationPage.jsx`；`2026-05-24` 已完成第一阶段 1:1 页面重构，并继续拆分出 `components/creation/` 子组件目录。当前创作页已改为“顶部 tab + 中部 gallery + 底部 sticky prompt bar”的工作台结构，并承接图片/视频任务进度卡、图片/视频/配音结果卡、批量操作、预览弹窗、参考素材选择；图片 / 视频项目选择已支持“`不关联`”，资源库项目资产视图已支持“`未关联`”筛选；`2026-05-25` 已补底部创作类型 selector，三条输入条都可直接切换 `图片生成 / 视频生成 / 配音生成`；视频输入条已补 `全能参考 / 首尾帧 / 首帧参考 / 尾帧参考` selector，以及比例 / 分辨率 / 时长的汇总参数弹层选择；`2026-05-25` 已修复创作页图片资产选择弹窗项目数据源，弹窗现在会传入完整项目列表，并在打开/切换项目时按需拉取对应 `apiGetProjectAssets(projectId)`，未关联项目时也不再出现“选择项目”空壳；`2026-05-25` 已增强图片结果详情弹窗，点击图片后会按需请求 `GET /api/creation/images/{image_id}` 补齐详情字段，并在弹窗内承接复制提示词 / 收藏 / 下载 / 删除；`2026-05-26` 已对齐视频结果预览弹窗与资产库视频详情规则：`src/api/creation.js` 已补齐 `referenceMode / firstFrameUrl / lastFrameUrl` 归一化，创作页视频预览现已升级为双栏详情结构，支持展示提示词、模型、比例、分辨率、时长、参考模式、创建时间与首尾帧，并补齐 `复制提示词 / 下载 / 收藏 / 删除` 操作；创作页与资产库的视频详情播放器现统一启用 `autoPlay + muted + loop`；`2026-05-26` 已继续补齐创作上传素材入库口径：`apiUploadCreationImage()` 现支持透传 `project_id / session_id / shot_id / category / asset_name`，创作页本地上传素材时会附带当前项目 ID；后端 `POST /api/creation/images/upload` 会为该类资产写入 `import_source=user_upload` 与 `storage_mode=managed_upload`，资产页详情中的“入库方式”可显示“用户上传”；`2026-05-26` 已进一步补齐全能生视频的本地参考视频/音频上传能力：后端新增 `POST /api/creation/videos/upload`、`POST /api/creation/audios/upload`，前端 `src/api/creation.js` 新增 `apiUploadCreationVideo()`、`apiUploadCreationAudio()`，`VideoPromptBar` 当前支持“上传 / 资产”双入口，生成主链路仍保持只透传 `reference_video_url / reference_audio_url / 首尾帧 URL` 的结构化字段，不直接把原始文件提交到 `/api/creation/videos/generate`；`2026-05-26` 已继续按豆包官网语义弱化 `reference_mode=full` 对首尾帧的产品依赖：`full` 当前表示“可选多模态参考”，首帧、尾帧、参考视频、参考音频都可按需提供，也允许只输入 prompt 直接提交，前端输入条已补辅助提示，视频详情弹窗会回显 `全能参考（可选）`，后端 `model_capabilities.py` 与 `video_gen.py` 的说明也已同步这一共享语义；`2026-05-26` 已补 Seedance 对本地 / 私网参考图地址的收口兼容：即使前端先把 `/uploads/...` 标准化为 `http://localhost:8000/uploads/...` 或局域网 IP 绝对地址，后端 `video_gen.py` 现在也会识别为本地托管资源，再改写为可用公网 `PUBLIC_BASE_URL` 或回退为图片 `data:` URI，避免上游报 `resource download failed`；视频 / 音频参考若仍使用本地 / 私网地址，当前会返回更明确的 `PUBLIC_BASE_URL` 配置提示；创作页与资产页原先的 `NoticeBar` 普通提示条也已统一切到与 API 配置页一致的 `FloatingToast` 顶部浮层；`2026-05-25` 已将创作页收藏 / 取消收藏反馈统一切到与 API 配置弹窗一致的顶部浮层成功提示；`2026-05-25` 已补齐视频模型能力适配，创作页现在会按 `/api/models` 返回的 `capabilities` 动态收敛 `ratio / resolution / duration / reference_mode`，并在提交 `POST /api/creation/videos/generate` 前由 `src/api/creation.js` 统一标准化 `reference_mode / resolution / 首尾帧 / 参考视频 / 参考音频` 透传字段；同日起后端会把创作视频、创作镜头视频、配音结果及其首尾帧参考图优先托管到本地 `/uploads/creation/...`，落盘失败直接返回错误，不再保存第三方外链；`2026-05-25` 已继续统一后端 provider 语义：`video_gen_service.generate()` 现显式接收 `reference_mode`，Seedance provider 会按 `full / first_frame / last_frame / video_ref` 组织参考素材，创作镜头视频与项目视频片段入口也不再在路由层过早裁掉对应参考帧；`2026-05-25` 已按当前产品诉求移除创作页与分镜页的视频能力摘要文案展示，仅保留参数动态收敛与前后端校验；`2026-05-27` 已继续把 Kling 主模型口径统一到 `video-kling-v3 / video-kling-v3-omni / image-kling-v3 / image-kling-v3-omni`：创作页视频当前先选模型，再按能力展示“文生视频 / 首帧参考 / 多图参考 / 参考视频驱动”等实际能力，`reference_mode=video_ref` 也会真实透传 `reference_video_url`；图片模型列表已切到 `image-kling-v3 / image-kling-v3-omni`，创作页会按对应图像能力动态限制参考图数量和生成数量；`2026-06-01` 已进一步补齐 Volcengine 官方音色模式：当所选配音模型匹配 `doubao-seed-tts-*` 时，创作页会自动改走 `/api/voices/official?provider=volcengine`，并与现有 MiniMax 官方音色模式共用同一套最小 UI 承接；同日已继续补齐 `MiniMax 官方` provider-aware 配音链路：`/api/models` 已返回 `provider_type / provider_name`，`CreationPage.jsx` 与 `src/api/creation.js` 现会优先按模型真实 `providerType` 决定官方音色源与配音 payload，`MiniMax 官方` 和 `AI Ping MiniMax` 不再只靠模型名猜供应商；Volcengine 官方音色名称保留后端返回值，不再误走 MiniMax 中文名本地化；`2026-06-04` 已补首页匿名创作浏览闭环：未登录切到创作页时展示本地缺省图与登录 CTA，并由 `isGuest` 分支跳过创作 bootstrap 请求；同日已补已登录未配置 API 的最小门禁承接：点击创作页图片/视频/配音模型选择框时，若 `currentUser.hasApiConfigured=false`，不再展开空模型下拉，而是直接弹出现有 `ApiConfigModal`；`2026-06-08` 已继续统一创作页音色弹窗真实数据源：普通用户侧的 `全部 / 收藏 / 自定义` 视角统一改读 `GET /api/voices` 和 `GET /api/voices/official`，仅管理员维护系统音色库时才继续走 `GET /api/voices/library`，避免用户在音色按钮里看到后台管理口径与真实可用口径混用；当前前端已接通图片/视频/配音真实链路与任务轮询，待真实模型与真实账号环境验证 |

补充说明：`2026-05-26` 已新增 [创作页@资产引用与统一上传契约草案.md](file:///Users/xingyi/Desktop/打通前后端/创作页@资产引用与统一上传契约草案.md)，用于约束 `@mention / attachments / asset_bindings / prompt_resolved` 等增量字段设计；同日已开始按该草案落地第一版代码实现，创作页视频输入区将由分散的 `首帧 / 尾帧 / 上传 / 资产` 入口收口为统一素材入口，前端透传 `mentions / *_asset_id / attachments`，后端负责把产品层 `@资产名` 编排为豆包要求的 `图片1 / 视频1 / 音频1`；视频详情弹窗也已补充 `promptRaw / promptResolved / assetBindings` 可视化回显，便于联调时直接核对模型最终入参。

补充说明：`2026-06-01` 已继续补齐 MiniMax 官方创作配音闭环：`backend/app/routers/creation.py` 已把 `POST /api/creation/audios/generate` 的同步文本上限收口到 `10000`，并新增 `POST /api/creation/audios/generate-async` 与 `GET /api/creation/audios/tasks/{task_id}`；`frontend/src/api/creation.js`、`src/pages/CreationPage.jsx` 与 `components/creation/CreationPromptBars.jsx` 已补齐 `providerVoiceId / cloneStatus / supportsGenerate` 承接，自定义音色只有在 `ready` 时可直接生成，`10000+` 字文案会自动切异步任务并在终态回流到创作音频列表。

补充说明：`2026-05-26` 已继续补齐“按模型能力动态显隐/禁用”的第一版收口。创作页统一素材入口现会按当前模型能力隐藏不支持的图片 / 视频 / 音频入口，素材卡片角色绑定下拉也会同步缩减；`CreationPage.jsx` 在切换模型后会自动清理 `videoAssetPool` 中不再受支持的旧素材类型，并把失效角色解绑，同时同步清空遗留的 `firstFrame / lastFrame / referenceVideo / referenceAudio` 状态，避免隐藏状态继续透传到后端。分镜页则继续保持参考模式自动缩减、失效模式自动回退和不支持参考素材自动清理的同类逻辑。

补充说明：`2026-06-02` 已继续把 `veo-3.1-generate-preview` 的代码能力收口进创作页视频统一模型链路。当前无需新增 Veo 专属输入区，页面继续复用既有 `generation_mode / reference_mode / attachments / 首尾帧 / ratio / resolution / duration` 提交口径；后端能力表已把 Veo 收口为 `文生 / 图生 / 首尾帧 / 多参考图引导`，其中图生、首尾帧、多参考图统一限制为 `8` 秒；前端 `src/api/modelCapabilities.js` 已补最小文案兜底，把 Veo 的 `reference_subjects` 展示为“多参考图引导”，避免误解为主体实体绑定。按当前联调策略，Veo 预置模型入口已先在 `backend/app/services/onelink_presets.py` 注释隐藏，后续若要重新开放，只需恢复该预置项。

## 4.11 参考音频库

| 项目 | 内容 |
|---|---|
| 页面/组件 | 当前 `miioo/frontend` 暂无直接页面入口 |
| 用户动作 | 未来可能在创作页、配音页或资产选择器中浏览 / 复用系统参考音频 |
| 前端入口 | 暂未新增；后续建议独立为 `src/api/referenceAudioLibrary.js` |
| 当前前端口径 | 暂无 |
| 后端真实能力 | `GET /api/reference-audio-library`、`POST /api/reference-audio-library`、`PATCH /api/reference-audio-library/{item_id}`、`DELETE /api/reference-audio-library/{item_id}` |
| 请求映射 | 若后续接入页面，建议继续让页面保留产品口径，在适配层统一承接 `gender / age_group / language / emotion / tags / is_enabled / audio_file` 等字段 |
| 响应映射 | 可归一为前端音频素材卡片字段：`id/name/audioUrl/previewUrl/gender/ageGroup/language/emotion/tags/enabled/sortOrder` |
| 冲突类型 | 页面入口缺失 |
| 当前判断 | `后端已存在，前端暂未直接承接` |
| 备注 | `reference-audio-library` 已正式进入 `miioo/backend/BACKEND_API_DOC.md` 主文档事实源；当前若创作/配音页面需要接入系统参考音频库，优先新增单独 API 适配模块，不建议直接在页面组件里写真实请求 |

## 5. 当前最关键阻塞

1. `ApiConfigModal` 契约模型完全不同
   - 必须改为聚合编排
2. 分镜参考图联调仍需做模型能力验证
   - 当前 `generate-image` 已消费参考图，但不同模型支持的参考图数量不同，需要确认页面提示与模型切换体验
3. 分镜视频 `@mention` 已接入第一版数字资产编排
   - 当前分镜页已支持在提示词内引用已选参考素材，并向后端透传 `mentions / attachments / *_asset_id`
   - 分镜视频详情弹窗现也已支持展示 `promptRaw / promptResolved / assetBindings`，便于直接核对模型最终入参
4. 资产聚合仍偏前端承担
   - 当前页面已可运行，但若后端后续补聚合接口，可进一步降低适配层复杂度
5. 视频模型能力约束已补第一版
   - 创作页与分镜页提交前现会校验 prompt 长度、图片/视频/音频参考素材数量与总素材数
   - 当前 `video-viduq3-pro`、`video-kling-v3`、`video-kling-v3-omni` 的能力边界按项目现有真实接入链路收口，不直接等同于厂商所有高级能力
6. 视频输入区实时额度提示已补第一版
   - 创作页与分镜页的视频输入区现会实时展示图片/视频/音频/总素材/提示词长度的已用与剩余额度
   - 当前属于前端提示增强层，模型真实边界仍以后端 `validate_video_request()` 为最终准绳
7. 视频素材入口与参考模式动态收口已补第一版
   - 创作页统一素材入口已按当前模型能力动态显隐，分镜页参考模式也会随模型自动缩减并在失效时自动回退
   - 创作页切模型后已自动清理不再受支持的旧素材类型与旧参考状态，剩余工作主要是等待真实环境联调验证体验

## 6. 建议落地顺序

1. 登录与当前用户
2. 项目列表与新建项目
3. 全局设定基础字段与 overview
4. 剧本与分集
5. 主体
6. 分镜
7. API 配置弹窗
8. 资产库
9. 创作页真实环境验收

## 7. 下一步动作

本映射表之后，执行顺序应转入：

- `HARNESS_P0_BACKLOG.md`
- 按 P0 清单逐个打通
- 每完成一项，同步更新本文件状态列与备注列

## 8. 最新补充（2026-06-08）

- 创作页配音节目语音库当前实际挂载的仍是 `VoiceLibraryPickerModal`，不是历史记录里提到的“重新挂回旧弹窗”
- 已按最小改动把该弹窗接到官网音色模式：当当前配音模型属于官方 provider 时，弹窗从固定 `/api/voices/library` 切到 `src/api/creation.js` 的 `apiGetCreationVoices({ source: 'official', provider, language })`
- 页面筛选交互继续保留，当前官网模式先保留语种筛选；确认后仍沿用前端 `voiceId`，由创作页适配层映射为后端真实 `voice_id`
- 当前最需要的真实验收是：`官方模型 -> 打开语音库 -> 官网音色筛选 -> 选中后提交配音 -> 后端收到真实 voice_id`
