# miioo 项目进度管理文档

> 最后更新：2026-05-27（创作页图片详情弹窗交互完成）

---

## 一、项目背景

**产品名称**：miioo

**产品定位**：AIGC 影视化工作流产品，面向影视创作者，通过 AI 辅助完成从剧本创作到成片剪辑的全流程工作。

**当前阶段**：前端页面开发期（Design System 建设完成，业务页面开发中）

**协作模式**：设计师 + AI 前端（Suzy）负责前端页面，后端同学负责接口开发，完成后双方对接联调。

**仓库地址**：https://github.com/wangchengxv/miioo.git

---

## 二、一级功能模块

| 模块 | 核心功能 | 开发状态 |
|------|----------|----------|
| 首页 | 开始创作主按钮、登录/个人中心、设置、消息、社群二维码、创作手册、API 配置、Logo | ✅ 已完成 |
| 项目 | 新建项目、项目列表（卡片式）、工作流（全局设定/剧本/主体/分镜/剪辑成片） | 开发中 |
| 创作 | AI 生图、AI 生视频（参考即梦 AI 交互模式） | 开发中 |
| 资产库 | 项目资产、创作资产，可编辑 | 待开发 |

### 项目工作流详细说明

```
项目工作流
├── 全局设定
│   ├── 项目概况（角色/场景/道具/剧情结构数量统计）
│   └── 模型配置（LLM / 图片 / 视频 / 音频模型）
├── 剧本        ← LLM 对话创作剧本、分集管理
├── 主体        ← AI 制作角色 / 场景 / 道具
├── 分镜        ← AI 生成可编辑分镜
└── 剪辑成片    ← 接入第三方开源剪辑工具
```

---

## 三、技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React | ^19.2.5 | UI 框架 |
| Tailwind CSS | ^4.2.4 | 样式，通过 `@theme` 注册 token |
| Vite | ^8.x | 构建工具 |
| @tailwindcss/vite | ^4.2.4 | Tailwind v4 Vite 插件 |

**主题**：仅深色主题，无浅色皮肤切换。

---

## 四、启动方式

```bash
# 克隆仓库
git clone https://github.com/wangchengxv/miioo.git
cd miioo

# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 构建生产包
npm run build

# 预览生产包
npm run preview
```

---

## 五、文件结构

```
miioo/
├── public/                    # 静态资源
├── src/
│   ├── assets/                # 图片、SVG 等资源
│   │   ├── hero.png
│   │   ├── home-bg.png
│   │   └── project-default-cover.png
│   ├── components/            # 通用组件
│   │   ├── PrimaryNav.jsx         # 左侧一级导航（expanded / compact / vertical）
│   │   ├── ApiConfigModal.jsx     # API 配置弹窗（多服务商，最多 9 张卡片）
│   │   ├── LoginModal.jsx         # 登录弹窗（手机号 / 微信扫码 / 绑定手机）
│   │   ├── AccountMenu.jsx        # 账户菜单 popup
│   │   ├── NewProjectModal.jsx    # 新建项目弹窗
│   │   ├── ProfileModal.jsx       # 个人资料弹窗
│   │   ├── BatchDownloadModal.jsx # 分镜批量下载弹窗
│   │   ├── ShotViewerModal.jsx    # 分镜镜头全屏查看弹窗
│   │   ├── Toggle.jsx             # 开关组件（分镜页使用）
│   │   └── LiquidGlassDefs.jsx    # 液态玻璃 SVG filter 定义
│   ├── layouts/               # 页面框架（侧边栏、顶栏）← 待建立
│   ├── pages/                 # 业务页面
│   │   ├── Home.jsx               # 首页 + 项目工作流 shell（导航、页面切换）
│   │   ├── ProjectList.jsx        # 项目列表页（卡片网格）
│   │   ├── GlobalSettings.jsx     # 工作流 — 全局设定
│   │   ├── ScriptPage.jsx         # 工作流 — 剧本（LLM 对话式创作）
│   │   ├── SubjectPage.jsx        # 工作流 — 主体（角色/场景/道具）
│   │   ├── StoryboardPage.jsx     # 工作流 — 分镜（分镜卡片、批量下载、镜头查看）
│   │   ├── ButtonShowcase.jsx     # 按钮组件展示页
│   │   └── InputShowcase.jsx      # 输入框组件展示页
│   ├── api/                   # 接口函数（按模块命名）
│   │   ├── request.js             # 统一请求层（authFetch / authFetchForm / clearTokens，含双 token 自动刷新）
│   │   ├── auth.js                # 登录/注册/登出
│   │   ├── user.js                # 用户信息/头像/注销
│   │   ├── project.js             # 项目增删改查
│   │   ├── config.js              # API 配置读写（apiGetApiConfig / apiSaveApiConfig / apiTestConnection）
│   │   ├── storyboard.js          # 分镜/镜头增删改生成
│   │   ├── subject.js             # 主体（角色/场景/道具）增删改生成
│   │   └── assets.js              # 资产库（项目资产/创作资产/详情）
│   │   └── creation.js            # 创作模块（模型列表/生成参数/提交生成）
│   ├── ref/                   # 设计稿参考代码（只读，不引入业务）
│   ├── App.jsx                # 根组件
│   ├── main.jsx               # 入口文件
│   └── index.css              # 全局样式 + Design Token 定义
├── design-system/             # 设计系统文档（AI 开发必读）
│   ├── tokens.md              # Token 完整说明 ← 开发前必读
│   ├── spacing.md             # 间距规范 ← 随写随更新
│   ├── motion.md              # 动效规范（待完成）
│   ├── patterns.md            # 交互模式（待完成）
│   └── components/            # 组件文档
│       ├── button.md
│       ├── input.md
│       ├── tag.md
│       ├── form.md
│       ├── modal.md
│       ├── select.md
│       ├── toast-notification.md
│       ├── tooltip.md
│       ├── checkbox-radio.md
│       └── tab.md
├── PROJECT.md                 # 本文档
├── package.json
└── vite.config.js
```

---

## 六、当前进度

### Design System 文档
- [x] tokens.md — Token 完整定义
- [ ] motion.md — 动效规范
- [ ] patterns.md — 交互模式

### 组件文档（design-system/components/）
- [x] Button 按钮
- [x] Input 输入框
- [x] Tag 标签
- [x] Form 表单布局
- [x] Modal 弹窗
- [x] Select 选择器
- [x] Toast & Notification 提示
- [x] Tooltip 提示气泡
- [x] Checkbox & Radio
- [x] Tab 标签页
- [x] Navigation 导航（PrimaryNav 组件，expanded / compact / vertical 三种变体）
- [x] Switch Button 开关按钮（API 配置 / 模型卡片开关场景）

### 业务页面（src/pages/）
- [x] 首页 — 顶部栏（Logo、创作手册按钮、登录按钮）
- [x] 首页 — 左侧一级导航（4个主导航按钮，vertical 变体，56×56，液态玻璃激活态）
- [x] 首页 — 左侧底部工具栏（4个图标按钮，compact 变体，32×32）
- [x] 首页 — 开始创作按钮（200×52，PulsingBorder 动效）
- [x] 首页 — 底部工具交互（社群二维码、消息中心、更多菜单 popup；API 按钮打开配置弹窗）
- [x] 首页 — 登录弹窗原型（手机号登录 / 微信扫码 / 绑定手机号）
- [x] 首页 — API 配置弹窗（推荐配置 / 多服务商卡片，最多 9 张，支持新增与编辑自定义服务商）
- [x] 首页 — 交互验收（API 配置多服务商新增与编辑已手动验证通过）
- [x] 首页 — 细节收尾（通知详情弹窗、更多菜单补充选项、浮窗点击外部收起等）
- [x] 项目列表页 — 架构调整（ProjectList 作为纯内容组件，Home.jsx 统一管理导航与页面切换）
- [x] 项目列表页 — 内容区（卡片网格、搜索、新建、重命名、删除）
- [x] 项目列表页 — 导航栏细节（gap、indicator radius、padding 收窄动画）
- [x] 项目列表页 — 卡片交互（悬停边框高亮、hover 遮罩、点击缩放动效、点击进入工作流）
- [x] 项目工作流 — 顶部工作流导航栏（进入项目后 headbar 替换为工作流专属布局：Logo + 右侧操作区 + 5步骤条绝对居中）
- [x] 项目工作流 — 步骤条交互（全局设定/剧本始终可点击；主体/分镜/剪辑无内容时禁用；激活步骤 PulsingBorder 高亮；高度统一 32px）
- [x] 项目工作流 — 步骤解锁逻辑（主体/分镜/剪辑步骤一旦有内容即永久解锁，不因内容清空而重新禁用）
- [x] 项目工作流 — 全局设定页面（项目概况统计卡片、模型配置区含对话/图片/视频/配音模型 tab 与模型卡片）
- [x] 项目工作流 — 剧本页面（单剧本工作区模型；InputCard 固定底部 700px；AI 思考动画 + 流式输出；左侧剧集目录（首发后常驻）；右侧剧本查看/编辑双态；编辑态富文本（Tiptap）+ 工具栏；左右联动滚动定位；定稿后解锁主体步骤）
- [x] 项目工作流 — 主体页面（角色/场景/道具卡片列表；有内容时触发步骤解锁回调）
- [x] 项目工作流 — 分镜页面（分镜卡片网格；集数切换；批量下载 BatchDownloadModal；镜头全屏查看 ShotViewerModal；Toggle 开关组件；从 Home 接收 chars/scenes/props 资产数据）
- [x] 项目工作流 — 全局设定细节修正（StatCard 标题/数值移至顶部渐变遮罩；跳转按钮移至右下角）
- [x] 项目工作流 — 全局设定资产概况卡片完善（2026-05-19）：
  - 剧集结构卡片：pending 状态数字颜色改为 `#FFFFFF99`（60% 白），集数标签字号 10px → 12px，容器始终可见，无数据时显示空状态图标
  - 角色/场景/道具卡片：有素材时展示 3×3 宫格（取 SubjectPage 定稿图 imageUrl，最多 9 张，均分父容器，gap 4px，圆角 4px，无图格子保留 `#FFFFFF08` 背景）；无素材时显示空状态图标
  - 标题和数量统计移至卡片内顶部（position: relative + zIndex: 1，grid 用 flex: 1 + minHeight: 0 填充剩余空间）
  - 点击场景/道具卡片直接跳转到主体页对应 Tab 激活态（onGoToSubject 接收 tab 参数）
  - 修复角色数量显示为 0 的 BUG：SubjectPage 挂载时通过 useEffect 将 INITIAL_CHARS 同步到 Home.jsx 的 sharedChars（仅当 externalChars 为 null 时触发）
- [x] 项目工作流 — 剧本流式动画 BUG 修复（离开页面再返回不再重播动画；streamingIndex 提升至 Home.jsx 持久化，通过 GlobalSettings → ScriptPage → ScriptPanel → AiStreamingContent 受控传递）
- [x] 前端 API 接入审查（2026-05-18）— 扫描全部页面和组件，找出所有硬编码数据和缺失接口调用，逐一补全参数传递逻辑并用 mock 函数占位；详见 `API_AUDIT.md`
- [x] 项目工作流 — 分镜页面 BUG 修复（2026-05-19）：
  - 黑屏修复：`AssetPickerModal` 组件被多处引用但从未定义，导致 React 渲染崩溃；添加占位实现解除黑屏（待后续接入真实资产选择逻辑）
  - 提示词输入框 `@` 标签颜色污染问题：同名但不同类型的标签（如场景和道具同名）会互相覆盖颜色；确认业务上保证 chars/scenes/props 之间不重名，原逻辑可正常工作，回滚至稳定版本
- [x] 项目工作流 — 剧本页面响应式修复（2026-05-19）：屏幕宽度 < 1240px 时 InputCard 宽度跟随剧本框收缩（`width: min(700px, 100%)`，移除 `flexShrink: 0`）
- [x] 项目工作流 — 分镜页面优化（2026-05-19）：
  - 工具栏批量生成按钮合并：原「批量生成分镜图」+「批量生成分镜视频」两个按钮合并为单个「批量生成」按钮，点击打开 BatchImageModal
  - 分镜卡片媒体列空状态悬停按钮优化：移除「本地上传」按钮，仅保留单个蓝色 AI 生成按钮（图片列显示「创作图片」，视频列显示「创作视频」），带 slideUpBounce 弹入动画
  - 集数切换器宽度稳定：新增 `measureRef` 隐藏 span 动态测量最长集数文本宽度，切换开/关状态时容器宽度不再跳变
- [x] 通用组件 — AssetPickerModal 项目切换下拉（2026-05-19）：
  - 原「这是项目名称」静态 UI 改为真实可交互下拉菜单
  - 新增 `projects`（项目名数组）、`activeProject`（当前选中）、`onProjectChange`（切换回调）三个 prop
  - 下拉列表通过 `createPortal` 渲染到 `document.body`，`position: fixed` 锚定触发按钮下方，点击外部自动关闭
  - 当前选中项右侧显示蓝色勾（`#2DC3E1`），悬停行背景 `#FFFFFF0F`，触发按钮打开时背景加深至 `#FFFFFF1A`，箭头图标旋转 180°
- [x] 项目工作流 — 生成分镜视频弹窗定稿（2026-05-19）：
  - 删除原「首尾帧生视频」/「多参生视频」Tab 分页，改为 radio 单选器「生成方式」（全能参考 / 首尾帧 / 多图参考）
  - 全能参考字段：选择模型、参考主体、参考图、参考视频、参考音频、时长、分辨率、音效
  - 首尾帧字段：选择模型、首帧图（含「使用当前分镜图」快捷块）、尾帧图可选（含「使用下一分镜图」快捷块）、时长、分辨率、音效
  - 多图参考字段：选择模型、参考主体、参考图、时长、分辨率、音效
  - 新增 `FrameUploadSlot` 组件：在标准双通道上传容器旁增加快捷块，有分镜图时显示缩略图（72×40，默认 60% 透明度，hover 100%）+ 文字，点击直接填入；无分镜图时显示灰色占位图标（不可点击）
  - `setVideoPanel` 调用时同步传入 `nextShot`，`GenerateVideoPanel` 接收 `nextShot` prop 用于尾帧快捷块
- [x] 通用组件 — AssetPickerModal 音频支持（2026-05-19）：
  - 新增 `PROJECT_SUB_TABS_AUDIO = ['音频']`、`CREATIVE_SUB_TABS_AUDIO = ['配音']` 常量
  - `accept === 'audio'` 时仅显示音频相关分页，屏蔽图片/视频分页
  - mock 数据补充 `audio` / `dubbing` 数组；`SUB_TAB_KEY_MAP` 新增 `'音频': 'audio'`、`'配音': 'dubbing'`
  - `AssetCard` 音频类型显示音符 SVG 占位图标
  - `PanelUploadSlot` accept 映射修复：`audio/*` 正确传递 `accept='audio'` 给 AssetPickerModal（原先漏判导致音频 tab 不显示）
- [x] API 层重构（2026-05-20）— 将各页面/组件顶部内联的 API stub 函数统一迁移至 `src/api/` 模块：
  - 新建 `src/api/auth.js`：`sendVerificationCode`、`loginWithPhone`、`bindPhone`（来自 LoginModal）、`apiLogout`（来自 AccountMenu）
  - 新建 `src/api/user.js`：`apiUpdateUser`、`apiUploadAvatar`、`apiDeleteAccount`（来自 ProfileModal）
  - 新建 `src/api/project.js`：`apiUpdateProject`（来自 GlobalSettings）
  - 新建 `src/api/storyboard.js`：`apiUpdateShotFinalized`（来自 ShotViewerModal）+ `apiUploadFile`、`apiGenerateImage`、`apiGenerateVideo`、`apiCreateShot`、`apiUpdateShot`、`apiDeleteShot`、`apiReorderShots`（来自 StoryboardPage）
  - 新建 `src/api/subject.js`：`apiCreateSubject`、`apiUpdateSubject`、`apiDeleteSubject`、`apiGenerateSubjectImage`、`apiBatchGenerate`、`apiGetEpisodes`、`apiGetModels`（来自 SubjectPage，含 MOCK_EPISODES 常量迁移）
  - 7 个原文件改为 import 引用，stub 函数块已删除
- [x] API 接口补全（2026-05-20）— 在 `src/api/` 各模块补充缺失的读取类接口，并将页面硬编码数据替换为 API 调用：
  - `src/api/project.js` 新增 `apiCreateProject`、`apiGetProjects`；Home.jsx 新建项目改为调用 `apiCreateProject`，项目列表初始化改为 `apiGetProjects`
  - `src/api/user.js` 新增 `apiGetCurrentUser`、`apiGetNotifications`；Home.jsx AccountMenu 的用户信息改为从 `apiGetCurrentUser` 加载
  - 新建 `src/api/config.js`：`apiTestConnection`、`apiSaveApiConfig`；ApiConfigModal.jsx 测试连接和保存配置改为调用真实 stub，移除 `Math.random()` mock
  - `src/api/storyboard.js` 新增 `apiGetShots`；StoryboardPage 镜头列表改为 `useEffect` + `apiGetShots(episode)` 加载，初始值从 `INITIAL_SHOTS` 改为 `[]`
  - SubjectPage 生成图片按钮 `onClick` 解注释，正式调用 `apiGenerateSubjectImage`
  - StoryboardPage `EPISODES` 常量回退为 `[]`；BatchImageModal / BatchVideoModal 模型选项改为 `useEffect` + `apiGetModels()` 动态加载
  - 新建 `src/api/assets.js`：`apiGetAssetDetail`、`apiGetShotDetail`、`apiGetShotVideoDetail`、`apiGetCreativeDays`、`apiGetProjectAssets`；AssetsPage.jsx 全部 MOCK_* 常量替换为 API 调用（ProjectAssetsPanel、CreativeAssetsPanel、AssetCard 详情弹窗均改为按需加载）
  - 修复 AssetsPage.jsx 编辑过程中 `handleStar` 函数声明被误删导致的 parse error
- [x] 通用组件 — ProfileModal 交互补全（2026-05-20）：
  - 输入框（用户名/手机号/微信）补全 hover 状态：鼠标悬停时描边从 `rgba(255,255,255,0.1)` 变为 `rgba(255,255,255,0.2)`，hover 事件挂在外层 wrapper 上（含 label 区域）
  - 头像可编辑：点击头像弹出系统文件选择窗口，限制格式为 jpg/jpeg/png/gif/webp
  - 头像上传接入 `apiUploadAvatar`（`src/api/user.js`），上传成功后弹窗内实时更新头像显示；mock 返回 `{ avatarUrl: null }` 时保持默认 SVG 头像
  - `Avatar` 组件支持 `src` prop：有 URL 时渲染 `<img>`，无 URL 时渲染默认 SVG
  - `ProfileModal` 内部维护 `avatarUrl` state（初始 null），AccountMenu 头像同步待真实接口就绪后处理
- [x] 通用组件 — ApiConfigModal 模型列表接入 API 规范（2026-05-20）：
  - `createDefaultState()` 中 `onelinkModelsByTab` 硬编码模型列表已清空，移入 `src/api/config.js` 的 mock 数据
  - `src/api/config.js` 新增 `apiGetApiConfig()`（mock 返回完整配置含预置模型列表，TODO: GET /api-config）
  - `ApiConfigModal` 打开时调用 `apiGetApiConfig()` 初始化 state（mainConfigured / onelinkEnabled / onelinkApiKey / onelinkModelsByTab / customProviders）
  - 真实接口就绪后只需修改 `config.js` 的 `apiGetApiConfig` 函数，页面代码不动
- [x] 创作页开发启动（2026-05-21，feat/project 分支）：
  - 新建 `src/api/creation.js`，包含三个 stub 函数：
    - `apiGetCreationModels(genType)` — 按生成类型返回可用模型列表（TODO: GET /creation/models）
    - `apiGetCreationParams(genType, model)` — 按类型+模型返回生成参数配置（TODO: GET /creation/params）
    - `apiGenerateCreation(params)` — 提交生成请求（TODO: POST /creation/generate）
  - `CreationPage.jsx` 删除所有硬编码选项常量（`MODEL_OPTIONS`、`RATIO_OPTIONS`、`VIDEO_RATIO_OPTIONS` 等 8 个），改为后端驱动
  - `model` 状态提升至 `CreationPage`，genType 切换时重新请求模型列表并重置 model 为第一项
  - model 变化时请求参数配置（`creationParams`），通过 `CreationEmptyState` → `InputCard` 逐层传入
  - `InputCard` 内部 `useEffect` 监听 `creationParams` 变化，自动重置各参数选中值为第一项
  - `ModelSelector`、`ParamsSelector`、`RefModeSelector`、`VideoParamsSelector` 全部改为接收 `options` props，不再内部硬编码
  - `RatioIcon` 组件签名从 `{ ratio, selected }` 改为 `{ rw, rh, selected }`，直接接收宽高比数值
  - 所有参数行加 `flexWrap: 'wrap'`，支持后端返回任意数量选项（不限制为固定 N 个）
  - InputCard 宽度从 700px 改为 800px
  - 两个 `useEffect` 均使用 `cancelled` flag 防止竞态条件（组件卸载或依赖变化时取消旧请求）
- [x] 通用组件 — ProfileModal 样式对齐 + 交互补全（2026-05-22）：
  - 样式全面对齐设计稿：背景色 `#161616`、边框 `0.555556px`、header padding `16px 24px`、avatar section padding `24px`、字段行 padding `12px 24px` gap `8px`、label 宽度 `44px`
  - 微信行改为只读 `WechatUnboundRow`（未绑定）/ `WechatBoundRow`（已绑定）两态，未绑定时显示绿色「去绑定」链接，点击进入微信绑定二维码流程
  - 微信绑定流程：`WechatBindView` 子视图，展示二维码（`apiGetWechatQrCode`），每 2 秒轮询绑定状态（`apiPollWechatBind`），扫码后显示「确认中」遮罩，绑定成功后返回个人信息视图并更新昵称
  - 手机号行改为 `PhoneRow`，右侧显示号码 + 「解绑」按钮（`UnlinkButton`，hover 变红）
  - 微信解绑调用 `apiUnbindWechat`，解绑后切回未绑定态
  - 头像上传：点击头像弹出文件选择，选中后立即用 `createObjectURL` 本地预览，同时调 `apiUploadAvatar`；接口返回真实 URL 后替换并释放 object URL
  - 用户名实时更新：输入框修改时同步更新 avatar section 的显示名称（`{nameVal || userName}`）
  - 注销账号行：左侧「注销账号」为普通灰色文字，右侧「永久删除账号及所有数据」为红色可点击按钮，hover/pressed 有背景色反馈
  - `src/api/user.js` 新增 `apiGetWechatQrCode`、`apiPollWechatBind`、`apiUnbindWechat` 三个 stub 函数
- [x] 通用组件 — ProfileModal 手机号解绑换绑流程（2026-05-22）：
  - 点击「解绑」按钮弹出弹窗1「手机号解绑」：显示当前手机号 + 验证码输入框（60 秒倒计时），点击「下一步」调 `apiVerifyPhoneCode` 验证旧手机验证码
  - 验证通过后弹出弹窗2「更换手机号」：新手机号输入框（格式校验 `^1\d{10}$`）+ 验证码输入框，点击「绑定」调 `apiRebindPhone`，绑定成功后更新弹窗内手机号显示
  - 两步弹窗通过 `phoneUnbindStep` 状态机（null → 'step1' → 'step2' → null）驱动，zIndex 70 叠在 ProfileModal（zIndex 60）之上
  - 取消任意步骤不修改手机号，完整绑定新手机才算解绑成功（符合「解绑旧号必须先绑新号」业务规则）
  - 按钮样式遵循 button.md 规范：取消用 Secondary 单层结构（token 类 `hover:bg-btn-primary-bg-hover active:bg-btn-primary-bg-active`），确认/绑定用 Primary 双层渐变边框
  - 输入框样式遵循 input.md 规范：hover/focus/wrong 三态边框 + focus 青色发光阴影，内嵌「获取」按钮为 Secondary 小尺寸（h-[24px] rounded-[6px] px-[8px]）
  - `src/api/user.js` 新增 `apiSendPhoneCode`、`apiVerifyPhoneCode`、`apiRebindPhone` 三个 stub 函数
  - 所有 Tailwind 数字缩写转换为具体 px 值：`h-9` → `h-[36px]`、`h-6` → `h-[24px]`、`p-px` → `p-[1px]`
- [x] 通用组件 — ProfileModal 细节收尾（2026-05-22）：
  - WechatBindView 二维码与提示文字位置对调：二维码图片在上，「请使用微信扫码」/「请在微信端确认」文字在下
  - 用户名字段改为点击编辑模式：默认展示态（文字 + 铅笔图标），点击铅笔图标切换为输入框并自动 focus，失焦后回到展示态
  - 输入框 hover/focus 状态补全：hover 时描边切换为 `input-border-hover`，focus 时切换为 `input-border-focus` + 青色发光阴影
  - DeleteConfirmDialog 样式对齐 AssetsPage 删除确认弹窗：宽 360px、背景 `#161616`、`boxShadow: '#00000099 0px 8px 32px'`、标题+描述竖排左对齐、右上角关闭按钮、操作按钮右对齐 gap 12px
  - DeleteConfirmDialog 按钮交互补全：取消用 Secondary token（`hover:bg-btn-primary-bg-hover active:bg-btn-primary-bg-active`），确认注销用 Danger token（`hover:bg-btn-danger-bg-hover active:bg-btn-danger-bg-active`）
- [x] 认证层重构 — 双 Token 自动刷新（2026-05-25）：
  - 新建 `src/api/request.js`：统一请求封装，`authFetch` 收到 401 时自动调 `POST /api/auth/refresh` 换新 token 并重放原请求；刷新失败则清除双 token 并触发全局 `auth:logout` 事件；Promise 锁防止并发请求同时触发多次刷新；`authFetchForm` 用于 FormData 上传场景
  - `auth.js` 登录函数同时保存 `access_token` + `refresh_token`，导出 `clearTokens`（同时清除两个 token）
  - 6 个 API 文件（`user.js`、`project.js`、`config.js`、`storyboard.js`、`assets.js`、`subject.js`）删除各自重复的 `authHeaders()` 函数，统一改用 `authFetch` / `authFetchForm`
  - `Home.jsx` 登出改用 `clearTokens()`，新增监听 `auth:logout` 事件自动弹出登录框（处理 token 静默过期场景）
  - mock 模式不受影响：`VITE_USE_MOCK=true` 时所有函数在 mock 分支直接 return，不走 `authFetch`
- [x] 创作页 — 参考模式修正（2026-05-25）：
  - 根本原因：mock 数据将参考模式误写为内容类型（全部参考/角色参考/风格参考/场景参考），实际上是视频生成的技术模式
  - `src/api/creation.js` mock 数据改为正确三种：`all`（全能参考）、`frame`（首尾帧）、`multi`（智能多帧），去掉 `desc` 字段
  - 后端根据前端选择的模型决定返回哪 1/2/3 种，前端只渲染，不硬编码数量
  - `CreationPage.jsx` 补上 `REF_MODE_ICON_FRAME_SELECTED` 和 `REF_MODE_ICON_MULTI_SELECTED` 白色图标，修正 `REF_MODE_ICON_MAP` 使选中态与默认态图标正确区分
- [x] 通用组件 — DotsLoading 加载动画全局应用（2026-05-25）：
  - 提取三点跳动动画为独立组件 `DotsLoading`（`src/components/DotsLoading.jsx`），props：`size`、`color`、`gap`
  - 主体页 `ImageItem` 生成等待状态：替换原灰色占位 div，改用 `<DotsLoading size={4} color="#2DC3E1" gap={3} />`
  - 分镜页 `ImgItem` 和 `VideoItem` 生成等待状态：替换原 `SpinnerIcon`，改用 `<DotsLoading size={4} color="#2DC3E1" gap={3} />`
  - 颜色统一使用品牌蓝 `#2DC3E1`（`--color-brand-main`）
- [x] 项目工作流 — 生成图片/视频 Toast 反馈补全（2026-05-25）：
  - 主体页 `EditSubjectPanel`：新增 toast 状态 + `showToast` 函数 + `createPortal` 渲染；生成图片 onClick 加 try/catch/finally，成功显示「图片生成成功」，失败显示「图片生成失败」并移除占位项
  - 分镜页 `GenerateImagePanel`：新增 `onShowToast` prop，`handleGenerate` 加 try/catch/finally，成功/失败分别触发对应 toast；移除原 `onGenerate` 回调中的 `showToast` 调用
  - 分镜页 `GenerateVideoPanel`：同上，成功显示「视频生成成功」，失败显示「视频生成失败」
  - 分镜页 Toast JSX 补充 error 图标（红色 SVG），位置统一为 `top: 25vh` 居中
  - Toast 规范：`bg-toast-bg`、`backdrop-blur-[20px]`、`rounded-medium`、`px-[16px] py-[8px]`、`gap-[8px]`、2500ms 自动消失
- [x] 创作页 — InputCard `@` 引用文件功能（2026-05-25）：
  - 将 `InputCard` 内 `<textarea>` 替换为 `contenteditable div`，支持 inline 富文本标签插入
  - 输入 `@` 时弹出文件选择下拉菜单（200px 宽，`#1D1E1E` 背景，`border #FFFFFF0D`，`box-shadow #00000066 0px 4px 16px`）
  - 下拉菜单列出已上传文件，每行含 24×24 缩略图 + 文件名（`line-clamp-1`），激活行背景 `#FFFFFF0D`
  - `@` 后继续输入可实时过滤文件列表；按 `Escape` 关闭菜单
  - 点击文件后在光标处插入蓝色标签（`background: #1B6FEB33; color: #5B9CF6`），同时删除 `@query` 文本
  - 标签名称截断规则：主名最多9字符超出用 `…` 截断，后缀完整保留（如 `这里是图片名…1.jpg`）
  - 标签 `contentEditable=false`，不可编辑；发送时 `innerText` 读取纯文本（标签名称作为文本一部分）
  - Placeholder 用绝对定位 span 实现（`hasContent` state 控制显隐）
- [x] 创作页 — 图片生成结果展示区（2026-05-25）：
  - 新增 `CreationResultState` 组件：生成后替换 `CreationEmptyState`，顶部可滚动展示历史生成结果，底部 InputCard 绝对定位固定
  - 新增 `ImageResultCard` 组件（固定 `320×180`，`flexShrink: 0`）：loading 态显示 shimmer 骨架屏动画，done 态显示图片，error 态显示「生成失败」
  - Shimmer 动画通过 `ensureShimmerStyle()` 动态注入 `@keyframes creation-shimmer` CSS，避免全局样式污染
  - 卡片横排展示（`display: flex; flexDirection: row; flexWrap: wrap; gap: 16px`），超出宽度自动换行
  - `generations` state 数组管理多次生成历史，每次生成追加一组 cards（先 loading 后 done/error）
  - `apiGenerateCreation` mock 模式：2s 延迟 + picsum 占位图，支持 `VITE_USE_MOCK=true` 本地验证
- [x] 创作页 — 图片区滚动布局定稿（2026-05-25）：
  - `CreationResultState` 重构：`generations.flatMap()` 展平所有批次为单一卡片列表，消除分批分组渲染
  - 图片区 `flex: 1 + minHeight: 0 + overflowY: auto`，高度自动撑满剩余空间，内容超出时内部滚动
  - InputCard 移出滚动容器，改为 in-flow 布局（`flexShrink: 0`），不再使用 `position: absolute`
  - `useRef + useEffect` 监听 `allCards.length`，每次新卡片加入自动 `scrollTop = scrollHeight` 滚到最新
  - 修复 flex 链路上 5 处缺失的 `minHeight: 0`（`CreationPage.jsx` 3 处 + `Home.jsx` 2 处），确保 overflow 生效
- [x] 创作页 — 批量操作交互（2026-05-26）：
  - 新增 `CreationGhostBtn` / `CreationPlainBtn` 两个内部按钮组件（样式与 AssetsPage 的 GhostBtn/PlainBtn 对齐）
  - `CreationPage` 新增 `batchMode`、`selected`（Set）两个 state，新增 `exitBatch`、`selectAll`、`deleteSelected`、`downloadSelected`、`toggleSelect` 五个操作函数
  - 顶部操作栏条件渲染：普通态显示「批量操作」按钮，批量态显示「已选N项 / 全选 / 下载 / 删除 / 取消」行
  - `ImageResultCard` 批量模式下右上角显示复选框，选中态显示蓝色勾（`#2DC3E1`）；点击卡片切换选中，hover 遮罩批量模式下隐藏
  - `selectAll` 仅选中 done 状态（有图片）的卡片，loading/error 卡片不参与全选
  - 切换 tab / genType 时自动退出批量模式并清空选中
- [x] 创作页 — Bug 修复 & 功能补全（2026-05-26）：
  - `ImageDetailModal` 重复定义修复：删除旧的破损定义，保留一份完整实现
  - 卡片 hover 按钮背景修正：悬停时背景加深（`#000000B3`），而非变浅
  - `isImageFile()` 修复：URL 无扩展名时（如 picsum 链接）fallback 至 `file.name` 判断，修复「用作参考图」后显示文件名卡片而非缩略图的问题，同时修复重新编辑无法还原参考图的问题
  - `StarIcon` 支持 `strokeColor` prop：卡片列表默认纯白，详情弹窗底部按钮传 `rgba(255,255,255,0.6)` 60% 白
  - 详情弹窗去掉双层 `createPortal` 包裹，`ImageDetailModal` 自身已内部 portal，外层无需再包
  - `InputCard` 新增 `prefillVersion` / `prefillData` props，重新编辑时回填 prompt / 参考图 / ratio / resolution；「用作参考图」时仅回填图片文件
  - `src/api/creation.js` 新增 `apiSaveCreationAsset`（POST /api/users/me/creative-assets，mock 模式 localStorage）
  - `handleGenerate` 成功后逐图 fire-and-forget 调用 `apiSaveCreationAsset`，所有生成图片自动存入创作资产库，无需手动保存按钮
- [x] 创作页 — 分标签独立生成历史（2026-05-26）：
  - `generations` 拆分为 `generationsByTab: { image, video, dubbing }` 三个独立列表
  - `const generations = generationsByTab[activeTab]` 派生当前 tab 视图，所有下游组件不变
  - `handleGenerate` 调用时捕获 `currentTab`，异步回调更新正确 tab 切片，防止生成中途切 tab 写错
  - 效果：图片/视频/配音各自维护独立历史，切 tab 互不干扰；离开页面再回来三个 tab 均重置（已实时存入创作资产库）
- [x] 创作页 — 视频模型能力配置 + 音频过滤（2026-05-27）：
  - 新建 `src/config/imageModelCapabilities.js` 和 `videoModelCapabilities.js`：图片/视频模型完整能力表（分辨率、比例、时长、输入输出格式、特性开关等）
  - 新建 `src/config/index.js`：`getImageModelParams` / `getVideoModelParams` 工具函数，返回 UI 渲染所需参数（ratios / resolutions / durations / refModes / supportsAudio）
  - 视频模型音频能力明确：Seedance 2.0 支持音频输入（mp3/wav）和输出，Kling 3.0/O3/Vidu Q3 仅支持音频输出
  - 参考模式统一：所有视频模型支持「全能参考」和「首尾帧」两种模式
  - `CreationPage.jsx` 音频过滤逻辑：`uploadAllowedExts` 和 `assetPickerAccept` 根据 `creationParams.supportsAudio` 动态过滤音频文件，不支持音频输入的模型隐藏音频 Tab 和文件类型
  - 声音 toggle 所有视频模型均显示（控制音频输出，与音频输入能力无关）
- [x] 创作页 — InputCard 提示词优化 + 视频缩略图（2026-05-27）：
  - 图片 tab 提示词：「上传参考图，输入文字或 @ 主体，描述你想生成的图片」，`@` 字符用蓝色标签高亮
  - 视频 tab 提示词根据 refMode 动态切换：全能参考「上传最多12个参考素材、输入文字或 @ 参考内容，自由组合图、文、音、视频多元素」/ 首尾帧「输入文字，描述你想创作的画面内容」/ 智能多帧「请添加智能多帧分镜图」
  - 视频文件卡片改为缩略图样式：提取首帧（0.1s）通过 Canvas 转 base64，与图片卡片样式统一（100×100px）
- [x] 创作页 — 视频首尾帧上传组件（2026-05-27）：
  - 新增 `FrameUploader` 组件：首帧/尾帧双槽位上传（44×60px），支持本地上传和资产库选择，中间交换按钮
  - 每个槽位独立下拉菜单（从资产库选择/从本地上传），点击外部自动关闭
  - 已上传图片 hover 显示关闭按钮（右上角 -7px 偏移），点击删除图片
  - 交换按钮 hover 背景变化（`transparent` → `#FFFFFF0A`），图标颜色变化（`#515151` → `#FFFFFF99`）
  - `refMode === 'frame'` 时替换 `UploadPlaceholder`，状态独立管理（`firstFrameFile` / `lastFrameFile`），通过 `frameAssetTarget` 路由资产库选择结果
- [x] 创作页 — 图片详情弹窗交互完成（2026-05-27）：
  - 修复点击图片卡片无法弹出详情弹窗的问题：`ImageResultCard` 组件已有 `detailOpen` 状态和点击触发逻辑，但缺少条件渲染 `ImageDetailModal` 的代码
  - 删除重复组件 `src/components/CreationImageDetailModal.jsx`，使用 `CreationPage.jsx` 中已存在的 `ImageDetailModal` 组件（第 2660-2844 行）
  - 在 `ImageResultCard` 组件末尾添加条件渲染：`detailOpen` 为 true 时渲染 `ImageDetailModal`，传递图片数据和回调
  - 右侧信息面板布局优化：外层容器 `position: relative`，内容区 `flex: 1 + overflowY: auto + paddingBottom: 76px` 可滚动，底部按钮区 `position: absolute` 固定在底部，避免遮挡内容
  - 交互流程：点击图片卡片 → 弹出详情弹窗 → 左侧图片预览（70% 高度居中）+ 右侧参数信息可滚动 + 底部收藏/下载/删除按钮固定
- [ ] 项目工作流 — 剪辑成片
- [ ] 创作页（生视频）
- [ ] 资产库

---

## 七、开发规范

### 7.0 核心开发原则

1. **设计稿优先**：有设计稿代码时，完全按设计稿代码复刻，不自行发挥布局和间距。
2. **Token 关联**：设计稿代码中的颜色、间距，凡是能在 `index.css` 中找到对应 token 的，必须替换为 token 类名；找不到对应 token 的，保留原始值。
3. **间距文档**：每开发一个页面/区块，将实际使用的间距数据补充到 `design-system/spacing.md`，随写随更新。
4. **设计规范靠后**：`design-system/` 下的组件规范是参考，设计稿代码与规范冲突时，以设计稿为准。
5. **frontend-design 插件介入时机**：仅当没有设计稿代码示例、且需求以自然语言描述时，启用 `frontend-design` 插件辅助生成页面。插件与设计 skill 文件协作，优先级从高到低依次为：**Token（颜色/圆角/字号）> 组件文档规范 > frontend-design 插件风格 > 间距**。需求不清晰时，必须先向 Suzy 确认再动手。

**Token 替换规则（颜色）：**

```jsx
// 设计稿原始值 → token 类名
bg-[#00000033]   → bg-black-20        // Black Alpha 20%
bg-[#FFFFFF1A]   → bg-white-10        // White Alpha 10%
bg-[#161616]     → bg-neutral-200     // Neutral 200
bg-[#111111]     → bg-neutral-400     // Neutral 400（页面底色）
bg-[#090909]     → bg-neutral-500     // Neutral 500（工具栏）
text-white       → 保留（white-100 无对应语义 token）
```

**Token 替换规则（间距）：**

间距 token 在 `@theme` 中定义为 `--spacing-*`，Tailwind v4 中直接用数字类名（如 `p-4` = 16px）。设计稿导出的 Tailwind 类名本身已是正确值，无需替换，直接使用即可。

### 7.1 CSS / 样式规范

**颜色必须使用 Token 类名，禁止硬编码色值（无对应 token 时除外）。**

```jsx
// ✅ 正确
<div className="bg-neutral-400 text-text-primary rounded-medium">
<div className="bg-black-20">   {/* 有 token 时用 token */}

// ❌ 错误
<div className="bg-[#111111]">  {/* 有对应 token 时不允许硬编码 */}
<div style={{ background: '#131313' }}>
```

Token 定义在 `src/index.css` 的 `@theme {}` 中，Tailwind v4 自动将其转换为可用类名：
- 颜色：`bg-surface-card`、`text-text-primary`、`border-stroke-normal`、`bg-black-20`、`bg-white-10`
- 间距：直接用 Tailwind 数字类（`p-4`=16px、`gap-2`=8px）
- 圆角：`rounded-medium`
- 字号：`text-font-size-14`

开发前必读 `design-system/tokens.md`，了解所有可用类名。
间距参考 `design-system/spacing.md`。

### 7.2 字体规范

```css
font-family: 'AlibabaPuHuiTi 2_55 Regular', 'Alibaba PuHuiTi 2.0', system-ui, sans-serif;
```

### 7.3 组件规范

- 通用组件放 `src/components/`，按功能命名（如 `Button.jsx`、`InputField.jsx`）
- 页面文件放 `src/pages/`，按模块命名（如 `Home.jsx`、`ProjectList.jsx`）
- 布局框架放 `src/layouts/`（如侧边栏、顶栏）
- 组件文件名使用大驼峰：`ProjectCard.jsx`
- 每个组件只做一件事，复杂组件拆分为子组件

### 7.4 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | 大驼峰 | `ProjectCard.jsx` |
| 页面文件 | 大驼峰 | `ProjectList.jsx` |
| 普通函数/变量 | 小驼峰 | `handleSubmit` |
| CSS 类名 | 使用 Token，不自定义 | `bg-surface-card` |

---

## 八、Git 协作流程

### 分支结构

```
main              ← 稳定版本，只接受合并，不直接提交
  └── feat/home           ← 首页开发
  └── feat/project        ← 项目模块开发
  └── feat/creation       ← 创作模块开发
  └── feat/assets         ← 资产库开发
  └── feat/api-xxx        ← 后端接口联调（后端同学）
```

### 日常开发流程

```bash
# 1. 从 main 新建功能分支
git checkout main
git pull origin main
git checkout -b feat/home

# 2. 开发、提交
git add src/pages/Home.jsx src/components/xxx.jsx
git commit -m "feat: 完成首页布局和导航入口"

# 3. 推送分支
git push origin feat/home

# 4. 在 GitHub 上发起 Pull Request，合并进 main
```

### Commit 信息规范

```
feat: 新增功能
fix: 修复问题
style: 样式调整（不影响逻辑）
refactor: 代码重构
docs: 文档更新
```

### 什么时候发 PR？

以下情况适合发 PR 合并进 main：

- 一个完整页面开发完成（布局、交互、样式都到位）
- 一组相关组件开发完成（如完成了所有表单相关组件）
- 联调前：将前端分支合并进 main，后端同学基于 main 拉取最新代码
- 联调后：接口对接完成、功能验证通过

**不建议**把半成品合并进 main，分支上可以随时提交，但 PR 要等功能完整。

---

## 九、后端对接说明

- 前端页面开发完成后，与后端同学对接接口
- 对接时机：后端接口就绪后，双方在各自分支开发完成，发 PR 合并后联调
- 接口文档：待后端同学提供（补充链接）
- 对接时间节点：待定

### 前端 API 占位说明

前端已完成 API 接入审查（2026-05-18），所有缺失接口均已用 mock 函数占位，参数传递逻辑已补全。
后端接口就绪后，搜索以下关键词即可快速定位所有占位点：

```
[mock]                  — console.log 占位的 mock 函数
TODO: 替换为真实接口    — 需要替换为真实 fetch 调用的位置
```

详细清单见 `API_AUDIT.md`，按 P0 → P1 → P2 → P3 优先级排列。

---

## 十、快速上手（新成员）

1. 克隆仓库，`npm install`，`npm run dev`
2. 读 `design-system/tokens.md`，了解所有可用的样式类名
3. 读 `design-system/components/` 下对应组件文档，了解组件写法规范
4. 从 main 新建功能分支，开始开发
5. 有疑问看本文档，或查看已有页面 `src/pages/` 作为参考
