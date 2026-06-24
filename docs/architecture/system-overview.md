# 系统架构总览

## 1. 目标

当前项目不是从零搭建的新仓库，而是在已有前端页面、后端接口和大量联调文档基础上，持续做前后端闭环打通与 Harness 化治理。

因此架构目标不是“推翻重做”，而是：

- 保留现有产品 UI 与页面语义
- 用前端 `src/api/` 适配层承接字段翻译与编排
- 用后端 router/service/model 承接真实业务能力
- 用 Harness 文档系统承接决策、计划、进度和运行手册

## 2. 仓库结构

```text
repo-root/
├── AGENTS.md
├── CLAUDE.md
├── CHANGELOG.md
├── HARNESS_DOC_INDEX.md
├── HARNESS_PAGE_API_MAPPING.md
├── HARNESS_P0_BACKLOG.md
├── HARNESS_P0_HISTORY.md
├── docs/
│   ├── architecture/
│   ├── decisions/
│   ├── plans/
│   ├── runbooks/
│   └── generated/
└── miioo/
    ├── frontend/
    └── backend/
```

## 3. 运行分层

### 3.1 页面层

目录：`miioo/frontend/src/pages/`、`miioo/frontend/src/components/`

职责：

- 承接产品交互、视觉结构、页面状态
- 维持既有页面语义与工作流顺序
- 不直接感知后端字段命名差异

### 3.2 前端适配层

目录：`miioo/frontend/src/api/`

职责：

- 完成 `前端口径 -> 后端口径` 请求映射
- 完成 `后端响应 -> 页面视图模型` 归一化
- 承担上传前置、模型分类翻译、任务轮询封装

### 3.3 后端接口层

目录：`miioo/backend/app/routers/`

职责：

- 暴露稳定路由、状态语义、错误信息
- 在必要时提供兼容字段和聚合接口
- 保障生成任务、上传下载、持久化能力

### 3.4 后端服务与模型层

目录：`miioo/backend/app/services/`、`miioo/backend/app/models/`、`miioo/backend/app/schemas/`

职责：

- 实现生成、拆解、转存、任务推进等核心逻辑
- 对数据库结构和外部模型调用保持稳定封装

### 3.5 文档治理层

目录：根级 Harness 文档 + `docs/`

职责：

- 记录事实源、约束、阶段目标、决策与经验
- 把“聊天里说过”转成“仓库里留痕”
- 让 AI Agent 与人工协作有统一入口

## 4. 核心数据流

```text
页面交互
  -> frontend/src/api
  -> backend router
  -> backend service
  -> model/db/task runtime
  -> backend router response
  -> frontend/src/api normalize
  -> 页面状态回显
```

## 5. 生成任务流

当前生成型链路统一收口为任务制优先：

- 主体提取
- 智能分镜
- 主体图片生成
- 批量主体图生成
- 创作页长时任务
- 剪辑导出任务

统一原则：

- 页面不等待整包同步返回
- 后端先返回 `taskId`
- 前端通过 `/api/tasks/{task_id}` 轮询承接进行中、成功、失败、部分完成
- 文档回写到 `HARNESS_PAGE_API_MAPPING.md` 和 `HARNESS_P0_BACKLOG.md`
