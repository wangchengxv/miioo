# 前端 API 接入审查报告

> 生成日期：2026-05-18  
> 审查范围：`src/pages/` + `src/components/`  
> 目的：找出所有"数据写死"或"应调接口但未调"的位置，逐一修复

---

## P0 — 核心业务流程（直接影响功能可用性）

### 1. 新建项目 — `NewProjectModal.jsx` + `Home.jsx`

**问题：**
- `NewProjectModal.jsx` `handleConfirm` 只通过回调传数据，无 `POST /projects`
- `Home.jsx` `onConfirm` 只取 `name`，丢弃 `style / ratio / desc / coverFile`
- `handleProjectCreated` 用 `Date.now()` 生成本地 ID，无持久化

**缺失接口：** `POST /projects`  
**涉及字段：** `name`, `desc`, `ratio`, `style`, `customStyleDesc`, `coverFile`  
**状态：** ✅ 字段已补全，接口调用已用 TODO 注释占位（`Home.jsx:1157`）

---

### 2. 登录 / 注册 — `LoginModal.jsx`

**问题：**
- 发送验证码：无 `POST /auth/send-code`
- 手机号登录：无 `POST /auth/login`
- 微信扫码：直接调 `onScanSuccess`，跳过真实 OAuth 流程
- 绑定手机：无 `POST /auth/bind-phone`

**缺失接口：** `POST /auth/send-code`、`POST /auth/login`、`POST /auth/bind-phone`  
**状态：** ✅ mock 函数已占位，参数传递逻辑已补全（`LoginModal.jsx:164-186`）

---

### 3. 主体页面（角色/场景/道具）— `SubjectPage.jsx`

**问题：**
- `INITIAL_CHARS`：6 条角色数据硬编码，无 `GET /subjects/chars`
- `MOCK_EPISODES`：12 条集数硬编码，无 `GET /episodes`
- `MOCK_PROPS = []`：道具为空数组占位
- 生成按钮：只创建本地占位对象，无 `POST /generate`
- 批量生成：`console.log('batch generate', params)` stub
- 增删改角色/场景/道具：只更新本地 state，无 `POST/PATCH/DELETE /subjects/*`
- 模型选项：`['Doubao-Seed-2.0-Pro', ...]` 硬编码，无 `GET /models`

**缺失接口：** `GET /subjects/*`、`POST/PATCH/DELETE /subjects/*`、`POST /generate`、`GET /models`  
**状态：** ✅ API stub 函数已占位（`SubjectPage.jsx:846-888`），增删改生成均已接入 mock

---

### 4. 分镜页面 — `StoryboardPage.jsx`

**问题：**
- 图片/视频上传：`URL.createObjectURL` 仅本地预览，无 `POST /upload`
- 生成图片/视频：只创建本地占位对象，无 `POST /generate`
- 镜头增删改排序：只更新本地 state，无 `PATCH/DELETE /shots/:id`
- 模型选项（`BatchImageModal` / `BatchVideoModal`）：硬编码
- `PARAM_OPTIONS`（镜头类型/运镜/角度/构图/时长）：硬编码

**缺失接口：** `POST /upload`、`POST /generate`、`PATCH/DELETE /shots/:id`  
**状态：** ✅ API stub 函数已占位（`StoryboardPage.jsx:7-52`），增删改生成均已加 TODO 注释

---

## P1 — 用户数据（影响个人信息持久化）

### 5. 个人资料 — `ProfileModal.jsx`

**问题：**
- 保存编辑：无 `PATCH /users/me`
- 头像上传：空 stub，无 `POST /users/me/avatar`
- 注销账号：无 `DELETE /users/me`

**缺失接口：** `PATCH /users/me`、`POST /users/me/avatar`、`DELETE /users/me`  
**状态：** ✅ API stub 函数已占位（`ProfileModal.jsx:3-20`），关闭时保存、注销时删除均已接入 mock

---

### 6. 账户菜单 — `AccountMenu.jsx`

**问题：**
- 退出登录：无 `POST /auth/logout`
- 默认 props：`userName='user-name'`、`userId='miioo_user'` 硬编码

**缺失接口：** `POST /auth/logout`  
**状态：** ✅ apiLogout mock 已占位（`AccountMenu.jsx:3-9`）

---

### 7. 首页数据 — `Home.jsx`

**问题：**
- `projects` 初始化为 `[]`，无 `useEffect` 拉取项目列表
- 用户信息硬编码：`userName="Suzy"`、`userId="miioo_suzy"`、`phone="178 **** 0361"`、`wechat="suzylee"`
- `NOTIFICATION_ITEMS`：6 条通知硬编码

**缺失接口：** `GET /projects`、`GET /users/me`、`GET /notifications`  
**状态：** ✅ TODO 注释已标注（`Home.jsx:879`、`Home.jsx:778`）

---

### 8. 全局设定 — `GlobalSettings.jsx`

**问题：**
- 保存项目设置：无 `PATCH /projects/:id`
- 默认项目名硬编码

**缺失接口：** `PATCH /projects/:id`  
**状态：** ✅ apiUpdateProject mock 已占位（`GlobalSettings.jsx:3-9`），TODO 注释已标注

---

## P2 — 功能完整性

### 9. API 配置弹窗 — `ApiConfigModal.jsx`

**问题：**
- `testConnection`：`Math.random() > 0.4` 模拟成功/失败
- 保存配置：无 `POST /api-config`
- 硬编码：日期 "2026-01-01"、模型数量 23

**缺失接口：** `POST /api-config/test`、`POST /api-config`  
**状态：** ✅ testConnection 和 closeMain 均已加 TODO 注释（`ApiConfigModal.jsx:987`、`1007`）

---

### 10. 镜头查看器 — `ShotViewerModal.jsx`

**问题：**
- 镜头"定稿"状态：无 `PATCH /shots/:id` 保存

**缺失接口：** `PATCH /shots/:id`  
**状态：** ✅ apiUpdateShotFinalized mock 已占位（`ShotViewerModal.jsx:5-10`）

---

## P3 — 静态展示数据（低优先级）

### 11. 资产页面 — `AssetsPage.jsx`

**硬编码数据：**
- `MOCK_DETAIL`：资产详情（名称/描述/prompt/模型/比例/分辨率/生成时间/图片 URL）
- `MOCK_SHOT_DETAIL`：镜头详情
- `MOCK_SHOT_VIDEO_DETAIL`：视频详情（含外部 w3schools.com 视频 URL）
- `MOCK_PROJECTS`：4 个项目对象
- `CREATIVE_DAYS`：创作日历数据
- `MOCK_PROJECT_ASSETS`：按分类的资产映射

**状态：** ⬜ 待修复（等资产页面进入开发阶段）

---

## 修复顺序

按 P0 → P1 → P2 → P3 逐条推进，每条修复前找 Suzy 确认接口字段和行为预期。

| 顺序 | 条目 | 文件 |
|------|------|------|
| 1 | 新建项目 | `NewProjectModal.jsx` + `Home.jsx` |
| 2 | 登录/注册 | `LoginModal.jsx` |
| 3 | 主体页面 | `SubjectPage.jsx` |
| 4 | 分镜页面 | `StoryboardPage.jsx` |
| 5 | 个人资料 | `ProfileModal.jsx` |
| 6 | 账户菜单 | `AccountMenu.jsx` |
| 7 | 首页数据 | `Home.jsx` |
| 8 | 全局设定 | `GlobalSettings.jsx` |
| 9 | API 配置 | `ApiConfigModal.jsx` |
| 10 | 镜头查看器 | `ShotViewerModal.jsx` |
| 11 | 资产页面 | `AssetsPage.jsx` |
