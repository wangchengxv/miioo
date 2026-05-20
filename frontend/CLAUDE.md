# miioo 项目上下文

## 产品定位
AIGC 影视化工作流产品，面向影视创作者。当前阶段：业务页面开发中。

## 技术栈
- React 19 + Tailwind CSS v4 + Vite 8
- 仅深色主题，无浅色切换
- Token 通过 `@theme` 注册在 `src/index.css`

---

## Git 推送方式

本机无 SSH key，使用 GitHub Personal Access Token 推送：

```bash
git push https://wangchengxv:<token>@github.com/wangchengxv/miioo.git <branch>
```

---

## 开发核心规则

### 优先级（从高到低）
1. 设计稿代码 → 完全按设计稿复刻，不自行发挥
2. Token 替换 → 颜色/圆角/字号必须替换为 token 类名
3. 组件文档规范 → `design-system/components/` 下对应文档
4. frontend-design 插件 → 无设计稿代码时，用于制定视觉与间距规则

### 样式规则
- 颜色必须用 Token 类名，禁止硬编码（无对应 token 时除外）
- 圆角用 `rounded-medium`，字号用 `text-font-size-14` 等 token
- 有设计稿代码时，直接复刻设计稿代码里的间距数值
- **设计稿类名转换**：贴入的设计稿代码中，Tailwind 默认数字缩写必须转换为具体 px 数值，例如：`gap-4` → `gap-[16px]`、`pt-4` → `pt-[16px]`、`pb-3` → `pb-[12px]`、`px-4` → `px-[16px]`、`w-25` → `w-[100px]`、`h-25` → `h-[100px]`、`size-10` → `w-[40px] h-[40px]`，不得保留 Tailwind 默认缩写

### 常用 Token 对照
```
bg-[#161616]   → bg-neutral-200
bg-[#111111]   → bg-neutral-400（页面底色）
bg-[#090909]   → bg-neutral-500（工具栏）
bg-[#00000033] → bg-black-20
bg-[#FFFFFF1A] → bg-white-10
text-white     → 保留
```

### 间距规则
- 有设计稿代码时，直接复刻设计稿代码里的间距数值
- 没有设计稿代码时，必须先调用 frontend-design 插件制定间距规则，拿到具体数值后再开始写代码，不可自行估算间距

### 文件结构
```
src/api/          接口函数（按模块命名：project.js、user.js 等）
src/components/   通用组件
src/layouts/      页面框架（侧边栏、顶栏）
src/pages/        业务页面
```
- 组件文件名大驼峰：`ProjectCard.jsx`
- 每个组件只做一件事，复杂组件拆分子组件

### 开发前必读
- `design-system/tokens.md` — 所有可用 token
- 对应组件文档 `design-system/components/xxx.md`

---

**需求不清晰时，必须先向 Suzy 确认再动手。**

---

## 视觉分隔规范

- 极少使用分割线（divider / border-bottom 横线）
- 用间距区分层级和模块，不用横线做视觉分隔
- 弹窗内同样适用：模块间用间距，不加横线

---

## 当前进度

详细进度见 `PROJECT.md`。

- 首页 ✅ 已完成
- 项目列表页 ✅ 已完成
- 项目工作流 — 全局设定 ✅ 已完成
- 项目工作流 — 剧本 ✅ 已完成（单剧本工作区；InputCard 700px；AI 思考/流式；左侧剧集目录；查看/编辑双态；Tiptap 富文本；左右联动定位）
- 项目工作流 — 主体 ✅ 已完成（角色/场景/道具卡片，步骤解锁回调）
- 项目工作流 — 分镜 ✅ 已完成（分镜卡片列表；集数选择；批量下载；镜头查看器；Toggle 开关；资产关联 chars/scenes/props；生成视频弹窗含 radio 生成方式选择器 + 首尾帧快捷块）
- 通用组件 — AssetPickerModal ✅ 项目切换下拉 + 音频分页支持（accept='audio' 时显示音频/配音专属分页）
- API 层重构 ✅ 已完成（2026-05-20）— 新建 src/api/ 目录，stub 函数从页面/组件迁移至 auth.js / user.js / project.js / storyboard.js / subject.js
- 下一阶段：剪辑成片页面开发（feat/library 分支）

---

## API 规范

### 函数封装规则
所有与后端的数据交互，必须封装在 `src/api/` 目录下的对应模块文件中。
页面和组件里禁止直接写 fetch/axios 请求，也禁止硬编码假数据。
文件按功能模块命名：`project.js`、`user.js`、`comic.js` 等。

### 开发流程
1. 每次新建页面前，先确认需要哪些数据，去 `src/api/` 建好对应函数
2. 接口未就绪时，函数内部返回假数据，加 `// TODO: 替换为真实接口` 注释
3. 接口就绪后，只修改 `src/api/` 函数内部，页面代码不动

### 每次涉及数据读写时，自动检查以下场景
发现问题后**立即找 Suzy 确认接口字段和行为预期，确认后再补充逻辑**，不可自行假设接口：

1. **表单提交 / 确认操作** — 是否需要 `POST` 或 `PATCH` 接口？
2. **页面初始化数据** — 是否需要 `GET` 接口替换硬编码数组？
3. **删除操作** — 是否需要 `DELETE` 接口？
4. **文件上传** — `URL.createObjectURL` 仅本地预览，是否需要 `POST /upload`？
5. **AI 生成** — 生成按钮是否只创建本地占位，是否需要 `POST /generate`？
6. **模拟逻辑** — `Math.random()`、`console.log` stub、`Date.now()` 作为 ID 等，是否需要替换为真实接口？

### 当前待修复清单
详见 `API_AUDIT.md`，按 P0 → P1 → P2 → P3 顺序逐条修复，每条修复前找 Suzy 确认。
