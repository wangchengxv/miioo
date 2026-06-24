# 运行时压测基线

## 1. 目标

本手册用于在真实环境中对当前生产运行时的热点读链路做第一轮轻量压测。

当前脚本入口：

- `backend/scripts/loadtest_runtime_baseline.py`

当前脚本覆盖的基线场景：

- `auth_me`：`GET /api/auth/me`
- `tasks_list`：`GET /api/tasks?limit=50`
- `assets_list`：`GET /api/assets?limit=100`
- `storyboards_list`：`GET /api/projects/{project_id}/storyboards?limit=100`
- `media_fetch`：媒体地址访问链路

## 2. 使用前提

- 由你在真实环境手工执行，不在本地假数据环境得出结论
- 已拿到可用 Bearer Token
- 若要测试分镜列表，需提供真实 `PROJECT_ID`
- 若要测试媒体访问，需提供真实 `MEDIA_URL`

## 3. 基本命令

在 `backend/` 目录执行：

```bash
python3 scripts/loadtest_runtime_baseline.py \
  --base-url https://www.miiooai.com \
  --token "$ACCESS_TOKEN"
```

默认会跑：

- `auth_me`
- `tasks_list`
- `assets_list`

## 4. 扩展场景

带项目分镜列表：

```bash
python3 scripts/loadtest_runtime_baseline.py \
  --base-url https://www.miiooai.com \
  --token "$ACCESS_TOKEN" \
  --project-id "$PROJECT_ID"
```

带媒体链路探测：

```bash
python3 scripts/loadtest_runtime_baseline.py \
  --base-url https://www.miiooai.com \
  --token "$ACCESS_TOKEN" \
  --media-url "/uploads/creation/sessions/xxx/shots/yyy/uploads/example.mp4"
```

只跑指定场景：

```bash
python3 scripts/loadtest_runtime_baseline.py \
  --base-url https://www.miiooai.com \
  --token "$ACCESS_TOKEN" \
  --scenario tasks_list \
  --scenario assets_list
```

## 5. 推荐参数

首轮建议从保守值开始：

- `--requests 50`
- `--concurrency 10`
- `--timeout 15`
- `--warmup 3`

如果首轮稳定，再逐步提高到：

- `--requests 100`
- `--concurrency 20`

不要在未确认数据库、Redis 和 Nginx 余量时直接把并发拉太高。

## 6. 结果落仓

可直接输出到 Markdown 文件：

```bash
python3 scripts/loadtest_runtime_baseline.py \
  --base-url https://www.miiooai.com \
  --token "$ACCESS_TOKEN" \
  --project-id "$PROJECT_ID" \
  --media-url "$MEDIA_URL" \
  --report-file "../docs/plans/runtime-loadtest-baseline-2026-06-14.md"
```

脚本会输出：

- 请求数
- 成功率
- 吞吐 `req/s`
- `avg / p50 / p95 / p99 / max` 延迟
- 状态码分布
- Top 错误

建议统一落仓到：

- `docs/plans/runtime-loadtest-baseline-YYYY-MM-DD.md`

建议至少保留以下字段：

- 环境信息：时间、环境、`base_url`
- 压测参数：`requests / concurrency / timeout / warmup`
- 场景范围：本次实际跑了哪些 `scenario`
- 每个场景的 `success_rate / req/s / p50 / p95 / p99 / max`
- 状态码分布
- Top 错误
- 结论：是否通过、瓶颈位置、下一步动作

## 7. 结果解读建议

- `success_rate < 99%`：先看状态码分布和 Top 错误，不急着继续加压
- `p95` 明显高于 `p50`：优先排查数据库分页、慢 SQL、上游超时或媒体回源
- 媒体链路如果大量出现 `404/403`：优先核查 `/uploads` 持久化、Nginx `alias` 和访问权限
- 列表链路如果 `p95` 明显偏高：优先回到对应热点接口做索引、排序稳定性和返回体审计

## 8. 当前限制

- 当前脚本先覆盖热点读链路，不直接压短信发送、任务创建、取消、重试等写路径
- 当前脚本目标是先形成第一轮“可执行基线”，不是替代正式压测平台
- 若后续要扩展为更长时间窗口或更复杂流量模型，再评估是否引入 `k6` 或 `locust`

## 9. 执行后回写

压测完成后，建议同步执行以下动作：

1. 将结果文件落到 `docs/plans/runtime-loadtest-baseline-YYYY-MM-DD.md`
2. 回看 `app.request / app.sql / app.upstream` 与 Nginx `/uploads/` 日志，确认高延迟或错误来源
3. 若 `p95 / p99` 明显高于预期，回写到 [热点查询索引审计-2026-06-14.md](file:///Users/xingyi/Documents/222222/docs/plans/热点查询索引审计-2026-06-14.md) 或相关专项文档
4. 若现有告警阈值明显偏松或偏紧，按 [runtime-observability.md](file:///Users/xingyi/Documents/222222/docs/runbooks/runtime-observability.md) 的回写说明调整阈值
5. 同步更新 `docs/plans/module-progress.md`、`docs/plans/项目进度文档.md` 与 `CHANGELOG.md`
