# miioo 项目进度管理文档

> 最后更新：2026-05-08

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
| 首页 | 开始创作主按钮、登录/个人中心、设置、消息、社群二维码、创作手册、API 配置、Logo | 待开发 |
| 项目 | 新建项目、项目列表（卡片式）、工作流（全局设定/剧本/主体/分镜/剪辑成片） | 待开发 |
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
│   ├── components/            # 通用组件（Button、Input 等）← 待建立
│   ├── layouts/               # 页面框架（侧边栏、顶栏）← 待建立
│   ├── pages/                 # 业务页面
│   │   ├── Home.jsx           # 首页（开发中）
│   │   ├── ButtonShowcase.jsx # 按钮组件展示页（已有）
│   │   └── InputShowcase.jsx  # 输入框组件展示页（已有）
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
- [ ] Navigation 导航

### 业务页面（src/pages/）
- [x] 首页（布局完成，待交互）
- [ ] 项目列表页
- [ ] 项目工作流 — 全局设定
- [ ] 项目工作流 — 剧本
- [ ] 项目工作流 — 主体
- [ ] 项目工作流 — 分镜
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

---

## 十、快速上手（新成员）

1. 克隆仓库，`npm install`，`npm run dev`
2. 读 `design-system/tokens.md`，了解所有可用的样式类名
3. 读 `design-system/components/` 下对应组件文档，了解组件写法规范
4. 从 main 新建功能分支，开始开发
5. 有疑问看本文档，或查看已有页面 `src/pages/` 作为参考
