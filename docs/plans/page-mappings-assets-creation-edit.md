# 页面映射：资产、创作与剪辑工作台

## 1. 资产库

| 项目 | 内容 |
|---|---|
| 页面/组件 | `AssetsPage.jsx` |
| 前端入口 | `src/api/assets.js` |
| 当前判断 | `已存在，本地库已修复，待联调` |
| 核心映射 | 扁平资产列表 -> 前端分桶；下载优先 `origin_url`，失败回退托管 `file_url`；回收站统一走 `deleted_only=true` |
| 当前结果 | 项目资产、创作资产、详情、收藏、删除、回收站、批量下载已接通 |
| 当前遗留 | 若后端未来补聚合接口，可进一步降低前端聚合复杂度 |

## 2. 创作页

| 项目 | 内容 |
|---|---|
| 页面/组件 | `CreationPage.jsx` + `components/creation/*` |
| 前端入口 | `src/api/creation.js` / `src/api/assets.js` |
| 当前判断 | `已存在，代码已打通，待真实账号联调` |
| 核心映射 | 本地素材先上传取 `uploaded_url`；参考素材对象由页面保持；官方配音模型改走 `/api/voices/official` |
| 当前结果 | 图片、视频、配音三条工作流，素材选择、详情弹窗、任务回流、模型能力约束已接通；`2026-06-11` 起普通用户在自身未配置 `voice` provider 时，也可共享复用管理员账号已启用的 `AI Ping / MiniMax-Speech-2.8-hd` 高清配音模型 |
| 当前遗留 | 待真实账号下验证 provider 选择、上传链路、任务终态、官方音色消费，以及“普通用户共享管理员 AI Ping 高清配音模型”口径下的实际配音成功率 |

## 3. 参考音频库

| 项目 | 内容 |
|---|---|
| 页面/组件 | 当前暂无直接页面入口 |
| 前端入口 | 后续建议 `src/api/referenceAudioLibrary.js` |
| 当前判断 | `后端已存在，前端暂未直接承接` |
| 核心映射 | 建议统一承接 `gender / age_group / language / emotion / tags / is_enabled / audio_file` |
| 当前遗留 | 若创作/配音页面需要接入，优先新增独立适配模块 |

## 5. 剪辑成片

| 项目 | 内容 |
|---|---|
| 页面/组件 | `EditPage.jsx` |
| 前端入口 | `src/api/composition.js` |
| 当前判断 | `已补最小可运行版，待真实联调` |
| 核心映射 | 成片工程走 `GET/POST/PATCH/DELETE /api/projects/{project_id}/compositions`；导出走 `POST /api/projects/{project_id}/compositions/{composition_id}/render`；任务状态通过 `/api/tasks?project_id=` 过滤 `composition_export` 承接 |
| 当前结果 | 已支持项目切换、成片草稿列表、新建草稿、轻量时间线保存、导出任务提交与结果回显；素材池当前已接到 `storyboards / audio_clips / video_clips / project assets`，自动时间线优先基于后端真实可导出的分镜图、项目视频和项目音频构建；当前还支持草稿 hydrate、片段开始时间/时长/轨道编辑、基础顺序调整和 `subtitle_style.entries` 保存 |
| 当前遗留 | 历史文档中的四区增强版、时间线工具层、更多素材池与属性区细节仍未完全恢复；当前先以“最小可运行导出链路 + 真实素材池 + 基础属性区”作为生产联调承接面 |

## 4. 当前关键阻塞摘要

1. `ApiConfigModal` 仍需继续做真实 key 联调
2. 分镜参考图与视频能力边界需要继续做模型实测
3. 资产聚合仍偏前端承担，后续可评估后端聚合接口
4. 创作页与分镜页的素材额度、参考模式动态收口仍需真实环境回归
5. 剪辑成片当前已补最小前端承接层，但增强版时间线与素材池仍需继续恢复
