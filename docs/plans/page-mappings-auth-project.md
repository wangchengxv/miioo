# 页面映射：身份、项目与全局设定

## 1. 登录

| 项目 | 内容 |
|---|---|
| 页面/组件 | `Home.jsx` / `LoginModal.jsx` / `AccountMenu.jsx` |
| 前端入口 | `src/api/auth.js` |
| 当前判断 | `可适配` |
| 核心映射 | `phone + code -> /auth/verify-code-login`；`phone + password -> /auth/login`；`401 -> refresh -> retry` |
| 当前结果 | 验证码登录、密码登录、退出登录、登录态恢复已接通；未登录入口已收口为定点触发登录；`2026-06-11` 已补齐登录成功后的当前用户立即刷新，避免资料弹窗手机号等字段延迟到整页刷新后才回显 |
| 当前遗留 | `bind-phone` 仍无后端接口；微信绑定链路未完全闭环 |

## 2. 当前用户与通知

| 项目 | 内容 |
|---|---|
| 页面/组件 | `Home.jsx` / `AccountMenu.jsx` |
| 前端入口 | `src/api/user.js` |
| 当前判断 | `已存在` |
| 核心映射 | `/api/auth/me` 归一为 `id/name/nickname/phone/wechat/avatarUrl/hasApiConfigured`；通知归一为 `system_notice / creation_log / team_collab` |
| 当前结果 | 当前用户、通知列表、未读数、单条已读、全部已读已接通；登录成功回调现会主动补拉 `/api/auth/me` 同步 `phone / wechat / avatar_url / display_id` |
| 当前遗留 | 团队协作通知仍以前端预留承接为主 |

## 3. 个人信息

| 项目 | 内容 |
|---|---|
| 页面/组件 | `ProfileModal.jsx` / `AccountMenu.jsx` |
| 前端入口 | `src/api/user.js` |
| 当前判断 | `已存在` |
| 核心映射 | `name -> nickname`；`avatarUrl -> avatar_url`；头像先上传再保存资料 |
| 当前结果 | 用户名修改、头像上传、手机号换绑、微信绑定/解绑、注销账号第一版闭环已接通 |
| 当前遗留 | 微信 OAuth 账号级绑定仍待真实场景收口 |

## 4. 项目列表与新建项目

| 项目 | 内容 |
|---|---|
| 页面/组件 | `Home.jsx` / `ProjectList.jsx` / `NewProjectModal.jsx` |
| 前端入口 | `src/api/project.js` / `src/api/visualStyle.js` |
| 当前判断 | `已存在` |
| 核心映射 | `desc -> description`；`ratio -> aspect_ratio`；`style -> visual_style`；`coverFile -> upload -> cover_url` |
| 当前结果 | 列表读取、新建、删除、重命名、模板浏览与风格动态加载已接通 |
| 当前遗留 | 待在真实登录态下继续验证列表回显、风格回显和删除结果 |

## 5. 全局设定

| 项目 | 内容 |
|---|---|
| 页面/组件 | `GlobalSettings.jsx` |
| 前端入口 | `src/api/project.js` |
| 当前判断 | `已存在` |
| 核心映射 | overview 归一为 `asset_counts / storyboard_thumbnails / episode_progress` |
| 当前结果 | 项目概况、基础信息自动保存、比例/风格回显与步骤解锁已接通 |
| 当前遗留 | 继续以真实项目数据验证 overview 各分组回显 |

## 6. API 配置弹窗

| 项目 | 内容 |
|---|---|
| 页面/组件 | `ApiConfigModal.jsx` |
| 前端入口 | `src/api/config.js` |
| 当前判断 | `已存在` |
| 核心映射 | 聚合 `providers + models + setup` 接口，统一归一为前端配置状态 |
| 当前结果 | OneLinkAI、MiniMax、AI Ping、Vidu、Volcengine、fal 与自定义 provider 已接入 |
| 当前遗留 | 仍需真实 API Key 场景做联调验收 |
