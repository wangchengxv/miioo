# Seedream 5.0 图片生成官方能力补全（OneLinkAI 透传）

> 完成日期：2026-06-22 · 主线：前后端联调/生产化收口

## 背景

`doubao图片模型.md` 已更新为官方 Seedream 5.0 完整文档。对照后发现既有豆包图片链路只透传了官方参数子集，缺失：组图上限（被硬卡 4）、`output_format`、`response_format`、`tools` 联网搜索、`optimize_prompt_options`、`stream` 流式输出。本次按官方文档补全，请求地址/请求头/APIKey/模型 ID 全部沿用代码既有的 OneLinkAI 透传配置（`https://api.onelinkai.cloud` → `/volc/api/v3/images/generations`、`Authorization: Bearer`、模型 `doubao-seedream-5.0-lite`）。

模型 ID 说明：官方原生 ID `doubao-seedream-5-0-260128` 由 OneLinkAI 映射为 `doubao-seedream-5.0-lite`，代码继续使用后者。

## 改动清单

### 后端

- `backend/app/routers/creation.py`
  - `CreationImageGenerateRequest` / `CreationShotImageGenerateRequest`：count 三字段上限由 `le=4` 放开到 `le=15`；新增 `output_format`/`response_format`/`web_search`/`optimize_prompt`/`sequential_image_generation`/`stream` 字段。
  - 新增 `_resolve_and_create_image_task()`：解析模型/参数并建 `GenTask`，供后台任务与流式路由共用。
  - 新增 `_persist_one_creation_image()`：单张图片落地（转存/缩略图/建 Asset/更新镜头）辅助，非流式与流式共用。
  - 新增流式路由 `POST /api/creation/images/generate/stream`（SSE：`event: task/image/done/error`），GenTask 同步落库，断流可回退轮询。
  - 任务派发 kwargs 与 `_run_creation_image_task` 透传新参数到 `image_gen_service.generate(...)`。
- `backend/app/services/image_gen.py`
  - `generate()` 新增可选参数 `output_format`/`response_format`/`web_search`/`optimize_prompt_mode`/`sequential_image_generation`。
  - 抽出 `_build_doubao_payload()` 统一构造豆包请求体（`output_format`/`tools` 仅 5.0-lite 透传；`max_images` 取请求数量；默认仍 png+url）。
  - 新增 `supports_stream()` 与 `generate_stream()`（`client.stream` + `aiter_lines` 解析官方 SSE，逐张 yield）。
- `backend/app/services/model_capabilities.py`
  - `_build_image_capability()` 新增声明字段：`supported_output_formats`/`supported_response_formats`/`supports_web_search`/`supports_optimize_prompt`/`supports_stream`。
  - 5.0-lite 声明全部新能力；4.5/4.0 声明 response_format/optimize_prompt/stream（不含 output_format/web_search，仅 5.0-lite）。

### 前端

- `frontend/src/utils/modelAdapter.js`：count 上限 `Math.min(...,4)` 放开到 `15`；`getImageModelParamsFromCap` 返回 `outputFormats`/`responseFormats`/`supportsWebSearch`/`supportsOptimizePrompt`/`supportsStream`。
- `frontend/src/config/imageModelCapabilities.js`：5.0-lite/4.5/4.0 的 `features` 增加对应能力声明。
- `frontend/src/api/creation.js`：`submitCreationImageGeneration` body 增加新参数；新增 `streamCreationImageGeneration()` SSE 客户端（解析 `event:`/`data:`，非 event-stream/4xx 自动降级抛 `streamUnsupported`）。
- `frontend/src/pages/CreationPage.jsx`：新增 `OptionToggle`/`OptionPills` 控件（格式/返回/优化/联网/流式，仅能力支持时显示）；新增图片状态与默认值；`runImageStream` 逐张追加卡片；`runGeneration` 在豆包+流式开启时走流式，失败降级 submit+poll。

## 默认值与兼容

- `output_format` 默认 png（沿用现状），`response_format` 默认 url，`stream` 默认开启（失败自动降级轮询）。
- 组图 `max_images` 取用户选择 count（非永远 15）；count+参考图≤15 由 `validate_image_request` 兜底。
- 其它图片模型调用方（subjects/storyboards/workbench/tasks）因新参数均有默认值，行为不变。

## 验证

- 后端单测 `backend/tests/test_image_gen_doubao_seedream5.py`（5 例全过）：新参数透传、lite-only 门控、默认值、流式 SSE 解析、supports_stream。
- 既有 `test_image_gen_kling.py`/`test_onelink_presets.py`/`test_model_selection.py` 通过。
- 前端 `vite build` 通过，eslint 0 error。
- 待真机联调确认：OneLinkAI 是否对 `/volc/api/v3/images/generations` 透传 `stream:true`（若不支持，前端自动降级，A/C 不受影响）。

## 风险

- 流式依赖 OneLinkAI 透传 SSE，未真机实测；已做自动降级兜底。
- count 放开到 15 后计费/时延上升，前端可后续加提示。
