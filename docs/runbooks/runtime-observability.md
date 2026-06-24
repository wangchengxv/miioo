# 运行时观测与告警基线

## 1. 目标

本手册用于固化当前生产运行时的第一版观测入口和初版告警阈值。

当前阶段目标不是一次性引入完整监控平台，而是先基于现有日志、Redis 和数据库能力，把“该看什么、何时告警、先查哪里”统一下来。

## 2. 当前已落地的观测源

- `app.request`
  - 来源：`backend/app/middleware/request_context.py`
  - 作用：记录请求完成日志和慢请求日志
  - 关键字段：`method`、`path`、`status_code`、`duration_ms`、`request_id`
- `app.sql`
  - 来源：`backend/app/database.py`
  - 作用：记录慢 SQL 和 SQL 执行失败
  - 关键字段：`duration_ms`、`statement`、`params`、`request_id`
- `app.upstream`
  - 来源：`backend/app/services/http_client.py`
  - 作用：记录 provider / model / media 上游失败
  - 关键字段：`profile`、`operation`、`category`、`retryable`、`status_code`、`context`
- `app.background_runtime`
  - 来源：`backend/app/services/background_runtime.py`
  - 作用：记录 Worker 启动、队列任务失败、任务被覆盖、Redis 队列异常
- `app.media_download`
  - 来源：`backend/app/services/media_download_audit.py`
  - 作用：记录统一受控下载入口和旧下载链路共享解析层的下载审计
  - 关键字段：`event`、`outcome`、`user_id`、`project_id`、`resource_id`、`storage_key`、`download_url`、`resolved_target`
- `Redis 队列`
  - 来源：`BACKGROUND_JOB_QUEUE_NAME`
  - 作用：观测长任务 backlog 和堆积

## 3. 当前配置基线

当前仓内已经存在的关键阈值配置：

- `SLOW_REQUEST_THRESHOLD_MS=1000`
- `SQL_SLOW_THRESHOLD_MS=300`
- `BACKGROUND_JOB_QUEUE_NAME=miioo:background-jobs`
- `UPSTREAM_HTTP_MAX_CONNECTIONS=100`
- `UPSTREAM_PROVIDER_MAX_CONCURRENCY=12`
- `UPSTREAM_MODEL_MAX_CONCURRENCY=8`
- `UPSTREAM_MEDIA_MAX_CONCURRENCY=16`

若要调整阈值，先同步：

- `backend/app/config.py`
- `backend/.env.example`
- 本手册和 `production-deploy.md`

## 4. 核心指标清单

### 4.1 请求层

| 指标 | 观测源 | 当前口径 | 初版用途 |
|---|---|---|---|
| 请求成功率 | `app.request` | 按 `status_code` 聚合 | 判断 API 是否进入异常窗口 |
| 请求 5xx 比例 | `app.request` | 统计 `status_code>=500` | 判断后端是否正在抖动 |
| 慢请求数量 | `app.request` | `duration_ms >= 1000` | 判断接口、数据库或上游是否拖慢整体响应 |
| 热点路径慢请求分布 | `app.request` | 按 `path` 聚合 | 定位任务列表、资产列表、分镜列表等热点接口 |

### 4.2 SQL 层

| 指标 | 观测源 | 当前口径 | 初版用途 |
|---|---|---|---|
| 慢 SQL 数量 | `app.sql` | `duration_ms >= 300` | 判断分页、排序、聚合查询是否开始退化 |
| SQL 执行失败数 | `app.sql` | `sql failed` | 判断数据库连接、SQL 语义或 schema 是否异常 |
| 高频慢 SQL 语句 | `app.sql` | 按 `statement` 聚合 | 作为索引补审和分页治理输入 |

### 4.3 上游调用层

| 指标 | 观测源 | 当前口径 | 初版用途 |
|---|---|---|---|
| 上游超时数量 | `app.upstream` | `category=timeout` | 判断 provider / model / media 是否超时放大 |
| 上游限流数量 | `app.upstream` | `status_code=429` | 判断上游额度或并发是否触顶 |
| 上游 5xx 数量 | `app.upstream` | `status_code=500/502/503/504` | 判断上游服务是否不稳定 |
| 上游错误按 profile 分布 | `app.upstream` | `profile=provider|model|media` | 判断问题集中在模型调用、媒体抓取还是基础 provider |
| 上游错误按 operation 分布 | `app.upstream` | `operation=...` | 快速定位具体业务动作 |

### 4.4 长任务与队列层

| 指标 | 观测源 | 当前口径 | 初版用途 |
|---|---|---|---|
| 队列长度 | `redis-cli LLEN` | 读取 `BACKGROUND_JOB_QUEUE_NAME` | 判断 Worker 是否跟不上 |
| Worker 异常数量 | `app.background_runtime` | `queued background job failed` | 判断长任务执行链路是否异常 |
| 被覆盖任务数量 | `app.background_runtime` | `superseded queued background job detected` | 判断重复提交或任务键粒度是否仍需收紧 |
| Redis 队列就绪失败 | `app.background_runtime` | `redis ping failed` / ready 异常 | 判断运行时基础设施是否异常 |

### 4.5 媒体与静态流量层

| 指标 | 观测源 | 当前口径 | 初版用途 |
|---|---|---|---|
| `/uploads/` 访问异常率 | Nginx access/error log | 关注 `404/403/5xx` | 判断 Nginx alias、持久化目录或权限问题 |
| 受控下载成功率 | `app.media_download` | `outcome=redirected|resolved|passthrough` | 判断下载链路是否仍可稳定返回真实目标 |
| 受控下载失败率 | `app.media_download` | `outcome=invalid_token|forbidden|not_found|rejected` | 判断签名、鉴权和真实资源解析是否进入异常窗口 |
| 媒体抓取失败数 | `app.upstream` | `profile=media` | 判断导出、下载、打包时的回源失败 |
| 媒体链路 404 数 | Nginx + 业务反馈 | 按文件路径聚合 | 判断文件落盘和公网暴露是否一致 |

### 4.6 SSE 层

| 指标 | 观测源 | 当前口径 | 初版用途 |
|---|---|---|---|
| SSE 路径 499 数 | Nginx access log | 按流式路径聚合 | 判断客户端主动取消是否异常升高 |
| SSE 路径 504 数 | Nginx access/error log | 按流式路径聚合 | 判断代理层或上游超时 |
| 流式上游 timeout 数 | `app.upstream` | 按 `category=timeout` 且结合流式 `operation` 排查 | 判断模型流式输出是否超时 |
| SSE 慢请求分布 | `app.request` | 按流式路径聚合 `duration_ms` | 判断连接持续时间是否异常 |

## 5. 初版告警阈值

以下阈值先作为第一版基线，后续应根据真实压测和线上流量再校正。

### 5.1 请求层

| 指标 | Warning | Critical |
|---|---|---|
| API 5xx 比例 | 5 分钟窗口 `>= 1%` | 5 分钟窗口 `>= 3%` |
| 慢请求数 | 5 分钟窗口 `>= 20` | 5 分钟窗口 `>= 50` |
| 单接口慢请求 | 单路径 5 分钟窗口 `>= 10` | 单路径 5 分钟窗口 `>= 25` |

### 5.2 SQL 层

| 指标 | Warning | Critical |
|---|---|---|
| 慢 SQL 数 | 5 分钟窗口 `>= 20` | 5 分钟窗口 `>= 50` |
| SQL 执行失败 | 5 分钟窗口 `>= 3` | 5 分钟窗口 `>= 10` |

### 5.3 上游层

| 指标 | Warning | Critical |
|---|---|---|
| `category=timeout` | 5 分钟窗口 `>= 5` | 5 分钟窗口 `>= 15` |
| `status_code=429` | 5 分钟窗口 `>= 5` | 5 分钟窗口 `>= 20` |
| `status_code=502/503/504` | 5 分钟窗口 `>= 5` | 5 分钟窗口 `>= 15` |
| 单 `operation` 连续失败 | 连续 `>= 3` 次 | 连续 `>= 10` 次 |

### 5.4 队列层

| 指标 | Warning | Critical |
|---|---|---|
| Redis 队列长度 | `LLEN >= 20` 且持续 5 分钟 | `LLEN >= 50` 且持续 5 分钟 |
| Worker 任务失败 | 5 分钟窗口 `>= 3` | 5 分钟窗口 `>= 10` |
| 队列 ready / ping 异常 | 任意出现 1 次 | 连续出现或恢复失败 |

### 5.5 媒体层

| 指标 | Warning | Critical |
|---|---|---|
| `/uploads/` 5xx | 5 分钟窗口 `>= 5` | 5 分钟窗口 `>= 20` |
| `/uploads/` 404 | 单文件路径 5 分钟窗口 `>= 5` | 多文件路径同时出现且持续 5 分钟 |
| 受控下载失败 | 5 分钟窗口 `>= 5` | 5 分钟窗口 `>= 15` |
| `profile=media` 上游失败 | 5 分钟窗口 `>= 5` | 5 分钟窗口 `>= 15` |

### 5.6 SSE 层

| 指标 | Warning | Critical |
|---|---|---|
| 单 SSE 路径 `504` | 5 分钟窗口 `>= 3` | 5 分钟窗口 `>= 10` |
| 单 SSE 路径 `499` | 5 分钟窗口 `>= 10` | 5 分钟窗口 `>= 30` |
| 流式上游 `timeout` | 5 分钟窗口 `>= 5` | 5 分钟窗口 `>= 15` |

## 6. 日常巡检动作

### 6.1 请求与慢请求

```bash
grep "app.request" backend/logs/*.log | tail -n 200
grep "slow request" backend/logs/*.log | tail -n 100
```

### 6.2 慢 SQL

```bash
grep "app.sql" backend/logs/*.log | tail -n 200
grep "slow sql" backend/logs/*.log | tail -n 100
```

### 6.3 上游失败

```bash
grep "app.upstream" backend/logs/*.log | tail -n 200
grep "category=timeout" backend/logs/*.log | tail -n 100
grep "status_code=429" backend/logs/*.log | tail -n 100
```

### 6.4 长任务队列

```bash
redis-cli LLEN miioo:background-jobs
grep "app.background_runtime" backend/logs/*.log | tail -n 200
```

### 6.5 uploads 静态流量

```bash
grep "/uploads/" /var/log/nginx/access.log | tail -n 100
grep "/uploads/" /var/log/nginx/error.log | tail -n 100
```

### 6.6 统一受控下载链路

```bash
./project_ops.sh media-audit 200
./project_ops.sh logs web 300 | grep "app.media_download"
```

### 6.7 SSE 流式链路

```bash
grep "/api/llm/chat/stream" /var/log/nginx/access.log | tail -n 100
grep "/generate/stream" /var/log/nginx/access.log | tail -n 100
grep "app.upstream" backend/logs/*.log | grep "timeout" | tail -n 100
```

## 7. 异常时优先排查路径

- 请求层先抖动：
  - 先看 `app.request`
  - 再看 `app.sql`
  - 最后看 `app.upstream`
- 上游报错先抖动：
  - 先看 `app.upstream`
  - 再按 `profile` 判断是 `provider / model / media`
  - 若是 `media`，继续核查 Nginx `/uploads/`
- 长任务积压：
  - 先看 `redis-cli LLEN`
  - 再看 `app.background_runtime`
  - 再确认 Worker 进程数与 Redis 连通性
- 媒体下载或导出失败：
  - 先看 `./project_ops.sh media-audit 200`
  - 再看 `app.media_download` 的失败类 `outcome`
  - 先看 Nginx `/uploads/` 日志
  - 再看 `profile=media` 的 `app.upstream`
- SSE 流式异常：
  - 先看 Nginx 是否对 SSE 路径关闭了 `proxy_buffering`
  - 再看 Nginx `499 / 504`
  - 再看 `app.upstream` 是否有流式模型 timeout

## 8. 当前缺口

- 目前仍以日志和手工巡检为主，尚未接入正式 metrics backend
- 当前告警阈值为第一版经验基线，需在你完成真实环境压测后回写校正
- `SSE` 在线连接数当前仍未形成专门统计，现阶段只能通过 Nginx 和请求日志近似观察

## 9. 阈值回写说明

当你完成真实环境压测或 `EXPLAIN / ANALYZE` 验证后，建议按以下规则决定是否调整阈值：

- 若热点读链路在首轮压测中整体稳定，且 `p95` 明显低于当前慢请求告警门槛，可暂时保持现有阈值不动，只在结果文档中记录“本轮维持不变”
- 若热点读链路在正常压力下已经频繁触发 `slow request` 或 `slow sql`，应优先回写：
  - `SLOW_REQUEST_THRESHOLD_MS`
  - `SQL_SLOW_THRESHOLD_MS`
- 若上游模型或媒体链路在轻量压测下已频繁出现 `timeout / 429 / 5xx`，应优先回写：
  - `category=timeout`
  - `status_code=429`
  - `status_code=502/503/504`
  的告警阈值说明
- 若 Redis 队列长度在首轮验证期间已接近当前阈值，应结合真实 `LLEN` 峰值回写队列层阈值

回写时建议同步更新：

- `docs/plans/runtime-loadtest-baseline-YYYY-MM-DD.md`
- `docs/plans/runtime-search-explain-YYYY-MM-DD.md`
- `docs/plans/module-progress.md`
- `docs/plans/项目进度文档.md`
- `CHANGELOG.md`

若你明确判断“当前阈值无需调整”，也建议把“不调整”的结论和依据写入结果文档，避免后续重复判断。
