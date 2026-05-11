# miioo 项目上下文

## 产品定位
AIGC 影视化工作流产品，面向影视创作者。当前阶段：业务页面开发中。

## 技术栈
- React 19 + Tailwind CSS v4 + Vite 8
- 仅深色主题，无浅色切换
- Token 通过 `@theme` 注册在 `src/index.css`

---

## 开发核心规则

### 优先级（从高到低）
1. 设计稿代码 → 完全按设计稿复刻，不自行发挥
2. Token 替换 → 颜色/圆角/字号必须替换为 token 类名
3. 组件文档规范 → `design-system/components/` 下对应文档
4. frontend-design 插件 → 无设计稿代码时，用于制定视觉与间距规则
5. `design-system/spacing.md` → 优先级最低，以后不作为前端页面间距实现依据

### 样式规则
- 颜色必须用 Token 类名，禁止硬编码（无对应 token 时除外）
- 所有间距（padding、margin、gap 等）一律使用数值，不引用 spacing token
- 有设计稿代码时，直接复刻设计稿代码里的间距数值
- 没有设计稿代码时，先通过 frontend-design 插件制定间距规则，再开始实现
- 圆角用 `rounded-medium`，字号用 `text-font-size-14` 等 token

### 常用 Token 对照
```
bg-[#161616]   → bg-neutral-200
bg-[#111111]   → bg-neutral-400（页面底色）
bg-[#090909]   → bg-neutral-500（工具栏）
bg-[#00000033] → bg-black-20
bg-[#FFFFFF1A] → bg-white-10
text-white     → 保留
```

### 文件结构
```
src/components/   通用组件
src/layouts/      页面框架（侧边栏、顶栏）
src/pages/        业务页面
```
- 组件文件名大驼峰：`ProjectCard.jsx`
- 每个组件只做一件事，复杂组件拆分子组件

### 开发前必读
- `design-system/tokens.md` — 所有可用 token
- 对应组件文档 `design-system/components/xxx.md`
- `design-system/spacing.md` — 仅保留作历史参考，不作为前端页面间距实现依据

---

## 当前任务（首页）
- [x] 顶部栏、左侧导航、底部工具栏
- [x] 开始创作按钮（PulsingBorder 动效）
- [x] 底部弹出菜单（社群二维码、消息中心、更多菜单）
- [x] 登录弹窗、API 配置弹窗
- [ ] 交互验收与细节收尾

**需求不清晰时，必须先向 Suzy 确认再动手。**
