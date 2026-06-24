# SSE 运行约束

## 1. 目标

本手册用于明确当前仓库中 `SSE` 的真实使用边界、代理层要求、前端消费方式和回退策略。

当前结论：

- `SSE` 只用于少量流式文本输出场景
- 长任务主承载仍然是 `GenTask + 轮询`
- 不把 `SSE` 当成当前生产长任务运行时的统一替代方案

## 2. 当前边界

### 2.1 当前真实 SSE 端点

| 接口 | 当前状态 | 用途 |
|---|---|---|
| `/api/llm/chat/stream` | 已使用 `text/event-stream` | 通用 LLM 流式聊天 |
| `/api/projects/{project_id}/episodes/{episode_id}/generate/stream` | 已使用 `text/event-stream` | 分集剧本流式生成 |

### 2.2 当前非 SSE 但前端支持降级的接口

| 接口 | 当前状态 | 说明 |
|---|---|---|
| `/api/projects/{project_id}/script-workspace/chat` | 当前仍是普通 JSON | 前端 `apiChatScriptWorkspaceStream(...)` 会优先按流式读取，但若响应不是 `text/event-stream`，会自动降级为普通 JSON |

### 2.3 明确不走 SSE 的主链路

- 图片生成
- 分镜图片生成
- 分镜视频生成
- 创作图片 / 视频 / 配音
- 成片导出
- 通用长任务中心

这些链路继续遵循：

- `GenTask`
- 后端提交任务
- 前端轮询状态
- 终态回填结果

原因：

- 这些能力通常持续时间长、状态复杂、可取消/可重试需求明显
- 当前仓库已围绕 `background_runtime + Worker + 轮询` 建立了主运行时模型
- 计划事实已明确：`SSE` 只作为增强候选，不替代当前主承载

## 3. 当前实现事实

### 3.1 后端

- `backend/app/routers/llm.py`
  - `/chat/stream` 返回 `StreamingResponse(..., media_type="text/event-stream")`
- `backend/app/routers/episodes.py`
  - `/{episode_id}/generate/stream` 返回 `StreamingResponse(..., media_type="text/event-stream")`
- `backend/app/services/llm.py`
  - 通过 `client.stream(...)` 向上游模型读取流式响应
  - 当前仅转发 `data: ` 开头的行，并追加 `\n\n`

### 3.2 前端

- `frontend/src/api/subject.js`
  - `apiChatScriptWorkspaceStream(...)` 支持：
    - 优先按 `text/event-stream` 读取
    - 后端非流式时自动回退到普通 JSON
  - `apiBatchGenerateStream(...)` 同样具备 `text/event-stream` 兼容与非流式降级
- `frontend/src/pages/ScriptPage.jsx`
  - 使用 `AbortController` 在重复请求、组件卸载或客户端兜底超时时主动取消
  - 客户端已有超时兜底，不完全依赖代理层或后端先超时

## 4. SSE 数据约束

当前仓库中 SSE 数据流应遵循以下最小约束：

- `Content-Type` 必须为 `text/event-stream`
- 服务端按 `data: <payload>\n\n` 输出
- 若是流结束，优先输出：
  - `data: [DONE]\n\n`
- 若是流内错误，优先输出：
  - `data: {"error":"..."}` + 双换行
- 前端只把 `text/event-stream` 当成真实 SSE，其他类型一律按普通响应处理

## 5. 代理层要求

`SSE` 最容易被代理缓冲、读超时和中间层连接策略破坏。

生产环境至少满足：

- `proxy_http_version 1.1`
- `proxy_buffering off`
- `proxy_cache off`
- `add_header X-Accel-Buffering no`
- `proxy_read_timeout` 足够长
- `proxy_send_timeout` 足够长

当前仓库中的推荐口径：

- `proxy_read_timeout 1800s`
- `proxy_send_timeout 1800s`

如果只提高超时但不关闭代理缓冲，前端通常会出现：

- 长时间无增量输出
- 直到服务端结束才一次性收到整段内容
- 误判为“后端没流式返回”

## 6. Nginx 推荐配置

当前仓库已在 `backend/nginx/miiooai.conf` 中提供 SSE 专用 location。

建议重点核查：

```nginx
location ~ ^/api/(llm/chat/stream|projects/[^/]+/episodes/[^/]+/generate/stream)$ {
    proxy_pass http://127.0.0.1:8000;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_buffering off;
    proxy_cache off;
    add_header X-Accel-Buffering no;
    proxy_connect_timeout 60s;
    proxy_read_timeout 1800s;
    proxy_send_timeout 1800s;
}
```

如果后续新增 SSE 端点，必须同步：

- `backend/nginx/miiooai.conf`
- 本手册
- `production-deploy.md`

## 7. 客户端要求

前端消费 SSE 时至少遵守：

- 发起新流请求前取消上一条未结束请求
- 页面卸载时调用 `AbortController.abort()`
- 客户端保留兜底超时，不完全依赖 Nginx/后端
- 遇到非 `text/event-stream` 响应时，优先按普通 JSON 回退

当前不建议：

- 把长任务结果流式输出当成唯一真相
- 在页面层自行实现多套 SSE 解析器
- 在组件内部散落重复的读取、超时和取消逻辑

## 8. 观测与告警建议

SSE 相关问题优先看：

- `app.request`
  - 看 `/api/llm/chat/stream`
  - 看 `/api/projects/.../episodes/.../generate/stream`
- `app.upstream`
  - 看流式上游模型是否出现 `timeout / 429 / 5xx`
- Nginx access / error log
  - 关注 `499 / 504`

当前建议重点关注的 SSE 异常信号：

- 单 SSE 路径 5 分钟窗口 `504 >= 3`
- 单 SSE 路径 5 分钟窗口 `499 >= 10`
- `app.upstream` 中流式模型 `category=timeout >= 5`
- 前端频繁触发客户端超时或主动中断

## 9. 回退策略

当 SSE 链路不稳定时，按以下顺序回退：

1. 先确认 Nginx 是否关闭了 SSE 路径缓冲
2. 再确认后端响应头是否真实返回 `text/event-stream`
3. 再确认上游模型是否在持续输出增量 chunk
4. 若当前接口支持非流式回退，则前端自动走普通 JSON
5. 若属于长任务主链路，继续走 `GenTask + 轮询`，不要临时改成 SSE 承载

## 10. 当前缺口

- 当前仓库尚未形成独立的 SSE 在线连接数统计
- 当前尚未给 SSE 单独拆日志 logger，仍主要依赖 `app.request`、`app.upstream` 和 Nginx 日志
- `script-workspace/chat` 前端虽已支持流式读取，但后端尚未切到真实 SSE；是否要升级为真实流式，需单独评估，不应与长任务运行时治理混为一谈
