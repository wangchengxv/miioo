# 运行时生产验证闭环

## 1. 目标

本手册用于把当前并发与性能治理的代码成果，收口成一套可在真实环境手工执行的验证闭环。

本轮验证重点覆盖：

- 执行 Alembic 迁移，确认热点索引与 `pg_trgm` 扩展真实落地
- 对热点搜索与分页链路执行 `EXPLAIN (ANALYZE, BUFFERS)`
- 执行轻量压测并把结果落仓
- 根据真实结果决定是否回写告警阈值、索引审计结论和后续治理项

## 2. 适用范围

本手册适用于当前已落仓的生产性能治理成果：

- 热点查询复合索引迁移
- `pg_trgm + GIN` 搜索索引迁移
- 首轮热点读链路压测脚本
- 第一版运行时日志、指标与告警阈值

当前不包含：

- 浏览器自动化联调
- 新监控平台接入
- 大规模正式压测平台替代

## 3. 执行前准备

执行前请确认：

- 已能连接真实 PostgreSQL
- 已能执行 Alembic 迁移
- 已有可用生产或准生产 Bearer Token
- 已知可用的 `PROJECT_ID`
- 已知一条可访问的真实 `MEDIA_URL`
- 已能查看后端日志、Nginx `/uploads/` 日志和 Redis

建议提前准备：

- `ACCESS_TOKEN`
- `PROJECT_ID`
- `MEDIA_URL`
- `BASE_URL=https://www.miiooai.com`

## 4. 迁移执行顺序

建议按以下顺序执行：

1. `ab9f1c2d3e45_add_query_audit_indexes.py`
2. `bc3d4e5f6a78_add_trgm_search_indexes_for_assets_projects.py`
3. `cd4e5f6a7b89_add_trgm_search_indexes_for_voice_audio.py`

示例命令：

```bash
cd backend
alembic upgrade head
```

若只需核对当前版本，可执行：

```bash
cd backend
alembic current
alembic heads
```

## 5. 迁移后检查

### 5.1 校验 `pg_trgm` 扩展

```sql
SELECT extname
FROM pg_extension
WHERE extname = 'pg_trgm';
```

期望结果：

- 返回 `pg_trgm`

### 5.2 校验新增索引存在

```sql
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = current_schema()
  AND indexname IN (
    'ix_notifications_user_created_id_desc',
    'ix_notifications_user_read_created_id_desc',
    'ix_gen_tasks_user_status_created_id_desc',
    'ix_gen_tasks_user_project_created_id_desc',
    'ix_assets_user_project_deleted_created_id_desc',
    'ix_assets_name_trgm',
    'ix_assets_prompt_trgm',
    'ix_projects_name_trgm',
    'ix_projects_description_trgm',
    'ix_voices_name_trgm',
    'ix_voices_style_trgm',
    'ix_voices_emotions_trgm',
    'ix_reference_audio_items_name_trgm',
    'ix_reference_audio_items_description_trgm',
    'ix_reference_audio_items_emotion_trgm',
    'ix_audio_clips_text_trgm'
  )
ORDER BY tablename, indexname;
```

期望结果：

- 所有计划内索引都可查询到
- `GIN` 索引应带 `gin_trgm_ops`

## 6. 搜索链路 `EXPLAIN / ANALYZE`

### 6.1 推荐执行口径

统一使用：

```sql
EXPLAIN (ANALYZE, BUFFERS)
<实际查询 SQL>;
```

建议优先验证以下链路：

- `assets.name / prompt`
- `projects.name / description`
- `voices.name / style / emotions`
- `reference_audio_library_items.name / description / emotion`
- `audio_clips.text`

### 6.2 示例 SQL 模板

资产搜索：

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, name, prompt
FROM assets
WHERE user_id = '<USER_ID>'
  AND is_deleted = false
  AND (
    name ILIKE '%关键词%'
    OR prompt ILIKE '%关键词%'
  )
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

项目搜索：

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, name, description
FROM projects
WHERE user_id = '<USER_ID>'
  AND (
    name ILIKE '%关键词%'
    OR description ILIKE '%关键词%'
  )
ORDER BY updated_at DESC, id DESC
LIMIT 20;
```

音色搜索：

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, name, style, emotions
FROM voices
WHERE is_custom = false
  AND is_enabled = true
  AND (
    name ILIKE '%关键词%'
    OR style ILIKE '%关键词%'
    OR emotions ILIKE '%关键词%'
  )
ORDER BY sort_order ASC, name ASC
LIMIT 20;
```

参考音频搜索：

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, name, description, emotion
FROM reference_audio_library_items
WHERE is_enabled = true
  AND (
    name ILIKE '%关键词%'
    OR description ILIKE '%关键词%'
    OR emotion ILIKE '%关键词%'
  )
ORDER BY sort_order ASC, created_at ASC
LIMIT 20;
```

创作音频文本搜索：

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, text, created_at
FROM audio_clips
WHERE user_id = '<USER_ID>'
  AND source = 'creation'
  AND text ILIKE '%关键词%'
ORDER BY created_at DESC
LIMIT 20;
```

### 6.3 结果记录要求

每条 SQL 至少记录：

- 查询用途
- 查询条件
- 计划节点类型
- 是否命中 `Bitmap Index Scan` / `Bitmap Heap Scan` / `Index Scan`
- `actual time`
- `rows`
- `buffers`
- 结论：命中 / 未命中 / 需继续分析

结果建议落仓为：

- `docs/plans/runtime-search-explain-YYYY-MM-DD.md`
- 可直接复制 [runtime-result-templates.md](file:///Users/xingyi/Documents/222222/docs/runbooks/runtime-result-templates.md) 的对应模板

## 7. 压测执行

压测入口继续使用 [runtime-loadtest.md](file:///Users/xingyi/Documents/222222/docs/runbooks/runtime-loadtest.md)。

首轮建议：

```bash
cd backend
python3 scripts/loadtest_runtime_baseline.py \
  --base-url "$BASE_URL" \
  --token "$ACCESS_TOKEN" \
  --project-id "$PROJECT_ID" \
  --media-url "$MEDIA_URL" \
  --requests 50 \
  --concurrency 10 \
  --timeout 15 \
  --warmup 3 \
  --report-file "../docs/plans/runtime-loadtest-baseline-YYYY-MM-DD.md"
```

若首轮稳定，再逐步提升：

- `--requests 100`
- `--concurrency 20`

## 8. 日志与指标采集

压测或验证过程中，至少同步采集：

- `app.request`
- `app.sql`
- `app.upstream`
- `app.background_runtime`
- Nginx `/uploads/` access/error log
- `redis-cli LLEN miioo:background-jobs`

建议同时参考 [runtime-observability.md](file:///Users/xingyi/Documents/222222/docs/runbooks/runtime-observability.md) 的阈值与巡检命令。

## 9. 结果落仓模板

若不想手工组织结构，可直接使用 [runtime-result-templates.md](file:///Users/xingyi/Documents/222222/docs/runbooks/runtime-result-templates.md)。

### 9.1 搜索验证结果

建议新建：

- `docs/plans/runtime-search-explain-YYYY-MM-DD.md`

建议结构：

```md
# 搜索链路 EXPLAIN 验证

## 环境信息
- 时间：
- 环境：
- 数据量概况：

## 资产搜索
- SQL：
- 计划摘要：
- 是否命中索引：
- actual time：
- buffers：
- 结论：

## 项目搜索
...
```

### 9.2 压测结果

建议新建：

- `docs/plans/runtime-loadtest-baseline-YYYY-MM-DD.md`

建议结构：

```md
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

## 场景结果
- auth_me：
- tasks_list：
- assets_list：
- storyboards_list：
- media_fetch：

## 结论
- 是否通过：
- 主要瓶颈：
- 下一步动作：
```

## 10. 通过 / 失败分支

### 10.1 迁移失败

- 先排查数据库权限、schema、扩展安装权限
- 未完成迁移前，不继续做 `EXPLAIN` 与压测

### 10.2 索引存在但 `EXPLAIN` 未命中

- 先核查查询是否与真实接口 SQL 形态一致
- 再核查过滤条件选择性是否过低
- 再判断是否需要补复合过滤索引或调整查询写法

### 10.3 压测 `p95` 偏高

- 先看 `app.sql`
- 再看 `app.request`
- 再看 `app.upstream`
- 若是媒体链路问题，再查 Nginx `/uploads/`

### 10.4 告警阈值不合理

- 以真实压测和真实日志结果为准
- 回写到 `runtime-observability.md`
- 阈值调整建议建议先落仓到 `docs/plans/runtime-threshold-review-YYYY-MM-DD.md`
- 同步回写 `项目进度文档.md`、`module-progress.md` 和 `CHANGELOG.md`

## 11. 回写清单

执行完成后，至少回写：

- `docs/plans/热点查询索引审计-2026-06-14.md`
- `docs/plans/todo-runtime-performance.md`
- `docs/plans/module-progress.md`
- `docs/plans/项目进度文档.md`
- `CHANGELOG.md`

## 12. 验收口径

本轮验证完成应满足：

- Alembic 迁移执行成功
- `pg_trgm` 扩展存在
- 计划内索引可查到
- 至少一组热点搜索 SQL 的 `EXPLAIN (ANALYZE, BUFFERS)` 结果落仓
- 至少一轮热点读链路压测结果落仓
- 是否需要调整告警阈值，有明确“保持 / 修改”结论
