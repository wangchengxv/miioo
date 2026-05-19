# miioo 项目进度管理文档

> 最后更新：2026-05-19（生成分镜视频弹窗定稿；首尾帧快捷按钮；AssetPickerModal 音频支持）

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
| 创作 | AI 生图、AI 生视频（参考即梦 AI 交互模式） | 待开发 |
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
- [ ] 项目工作流 — 剪辑成片
- [ ] 创作页（生图/生视频）
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
