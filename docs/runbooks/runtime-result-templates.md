# 运行时验证结果模板

## 1. 目标

本模板用于承接真实环境执行后的结果落仓，避免每次手工验证完成后再临时组织结构。

适用范围：

- Alembic 迁移执行结果
- `pg_trgm` 扩展与索引核验结果
- 热点搜索 SQL 的 `EXPLAIN (ANALYZE, BUFFERS)` 结果
- 轻量压测结果
- 阈值校正与后续动作记录

推荐与以下手册配合使用：

- [runtime-verification.md](file:///Users/xingyi/Documents/222222/docs/runbooks/runtime-verification.md)
- [runtime-loadtest.md](file:///Users/xingyi/Documents/222222/docs/runbooks/runtime-loadtest.md)
- [runtime-observability.md](file:///Users/xingyi/Documents/222222/docs/runbooks/runtime-observability.md)

## 2. 建议落仓文件

建议按本轮真实执行结果拆成以下文件：

- `docs/plans/runtime-migration-check-YYYY-MM-DD.md`
- `docs/plans/runtime-search-explain-YYYY-MM-DD.md`
- `docs/plans/runtime-loadtest-baseline-YYYY-MM-DD.md`
- `docs/plans/runtime-threshold-review-YYYY-MM-DD.md`

如果本轮执行量较小，也可以合并成单一文件：

- `docs/plans/runtime-verification-result-YYYY-MM-DD.md`

## 3. 迁移与索引核验模板

适用文件：

- `docs/plans/runtime-migration-check-YYYY-MM-DD.md`

````md
# 运行时迁移与索引核验结果

## 环境信息
- 时间：
- 环境：
- 执行人：
- 数据库实例：

## 执行命令
```bash
cd backend
alembic current
alembic heads
alembic upgrade head
alembic current
```

## 迁移结果
- upgrade 是否成功：
- current 是否到达 head：
- 失败信息：

## pg_trgm 扩展核验
- SQL：
- 返回结果：
- 是否通过：

## 索引核验
- SQL：
- 关键索引清单：
- 是否全部存在：
- 是否都包含 gin_trgm_ops：

## 结论
- 是否通过：
- 异常项：
- 下一步动作：
````

## 4. 搜索 EXPLAIN 模板

适用文件：

- `docs/plans/runtime-search-explain-YYYY-MM-DD.md`

````md
# 搜索链路 EXPLAIN 验证

## 环境信息
- 时间：
- 环境：
- 数据量概况：

## 资产搜索
- SQL：
- 查询用途：
- 计划摘要：
- 是否命中索引：
- 节点类型：
- actual time：
- rows：
- buffers：
- 结论：

## 项目搜索
- SQL：
- 查询用途：
- 计划摘要：
- 是否命中索引：
- 节点类型：
- actual time：
- rows：
- buffers：
- 结论：

## 音色搜索
- SQL：
- 查询用途：
- 计划摘要：
- 是否命中索引：
- 节点类型：
- actual time：
- rows：
- buffers：
- 结论：

## 参考音频搜索
- SQL：
- 查询用途：
- 计划摘要：
- 是否命中索引：
- 节点类型：
- actual time：
- rows：
- buffers：
- 结论：

## 创作音频文本搜索
- SQL：
- 查询用途：
- 计划摘要：
- 是否命中索引：
- 节点类型：
- actual time：
- rows：
- buffers：
- 结论：

## 总结
- 命中良好的链路：
- 未命中或效果一般的链路：
- 是否需要继续补索引：
- 是否需要改 SQL 形态：
````

### 4.1 判读速查

- 出现 `Bitmap Index Scan`、`Bitmap Heap Scan` 或 `Index Scan`，通常说明索引已参与执行计划
- 仍为 `Seq Scan` 不一定代表索引无效，需结合 `rows`、数据量、关键词选择性一起判断
- `actual time` 明显下降但仍为 `Seq Scan`，可能是数据量还不大，暂可记录为“待持续观察”
- 同一链路在不同关键词上表现差异很大时，应额外记录“高选择性关键词”和“低选择性关键词”两组样例

## 5. 压测结果模板

适用文件：

- `docs/plans/runtime-loadtest-baseline-YYYY-MM-DD.md`

````md
# 运行时压测基线结果

## 环境信息
- 时间：
- 环境：
- base_url：

## 压测参数
- requests：
- concurrency：
- timeout：
- warmup：
- scenario：

## 场景结果
- auth_me：
- tasks_list：
- assets_list：
- storyboards_list：
- media_fetch：

## 状态码分布
- 2xx：
- 4xx：
- 5xx：

## Top 错误
- 错误 1：
- 错误 2：
- 错误 3：

## 同步日志观察
- app.request：
- app.sql：
- app.upstream：
- app.background_runtime：
- nginx uploads：
- redis queue：

## 判读
- success_rate 是否达标：
- p95 / p99 是否可接受：
- 主要瓶颈：
- 是否继续加压：

## 下一步动作
- 回写到哪个专项文档：
- 是否需要调阈值：
- 是否需要补索引 / 限流 / 缓存：
````

### 5.1 判读速查

- `success_rate < 99%`：先停在当前档位，优先看状态码和 Top 错误
- `p95` 明显高于 `p50`：通常说明少量慢请求或慢 SQL 拖尾，需要查日志而不是直接继续加压
- `media_fetch` 单独抖动：优先查 `/uploads/`、Nginx 与媒体回源，不先归因到数据库
- `tasks_list / assets_list` 同时抖动：优先回看分页、排序、索引与 DB 连接压力

## 6. 阈值回写模板

适用文件：

- `docs/plans/runtime-threshold-review-YYYY-MM-DD.md`

````md
# 运行时阈值回写建议

## 环境信息
- 时间：
- 环境：
- 关联压测文件：
- 关联 EXPLAIN 文件：

## 当前阈值
- SLOW_REQUEST_THRESHOLD_MS：
- SQL_SLOW_THRESHOLD_MS：
- API 5xx Warning / Critical：
- 慢 SQL Warning / Critical：
- 上游 timeout Warning / Critical：
- 队列长度 Warning / Critical：

## 真实结果摘要
- 请求层：
- SQL 层：
- 上游层：
- 队列层：
- 媒体层：

## 调整建议
- 建议调整项 1：
- 原值：
- 建议值：
- 调整原因：

- 建议调整项 2：
- 原值：
- 建议值：
- 调整原因：

## 暂不调整项
- 项目：
- 原因：

## 最终结论
- 是否立即修改配置：
- 是否需要继续观察：
- 下一轮验证触发条件：
````

## 7. 最小落仓顺序

如果时间有限，建议至少按以下顺序完成：

1. `runtime-migration-check-YYYY-MM-DD.md`
2. `runtime-search-explain-YYYY-MM-DD.md`
3. `runtime-loadtest-baseline-YYYY-MM-DD.md`

阈值回写文件可在有了首轮真实结果后再补。
