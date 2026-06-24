# 运行时迁移与索引核验结果

## 环境信息
- 时间：`2026-06-15`
- 环境：云主机初始化数据库
- 执行方式：手工终端执行
- 数据库实例：`postgresql://miioofd@localhost:5432/miioofd`

## 本轮背景
- 云主机目录已确认为 `/www/wwwroot/www.chengxvblog.top/backend`
- 服务器原有 `.venv` 为从 macOS 环境拷贝的失效虚拟环境，`python/pip/alembic` 的解释器路径均指向本地机绝对路径，无法在 Linux 正常使用
- 重建 Linux 本机 `.venv` 后，已恢复项目依赖安装与 Alembic 可执行能力

## 执行命令
```bash
cd /www/wwwroot/www.chengxvblog.top/backend
./.venv/bin/alembic current
./.venv/bin/alembic heads
./.venv/bin/alembic upgrade head
./.venv/bin/alembic stamp head
./.venv/bin/alembic current

psql "postgresql://miioofd:miioo_dev_2026@localhost:5432/miioofd" -c 'SELECT version_num FROM alembic_version;'
psql "postgresql://miioofd:miioo_dev_2026@localhost:5432/miioofd" -c "SELECT extname FROM pg_extension WHERE extname = 'pg_trgm';"
psql "postgresql://miioofd:miioo_dev_2026@localhost:5432/miioofd" -c "
SELECT tablename, indexname
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
"
```

## 迁移结果
- `alembic heads`：`cd4e5f6a7b89`
- 首次 `alembic current`：输出 `cd4e5f6a7b89 (head)`，但 `alembic_version` 表为空
- 直接执行 `alembic upgrade head` 失败：命中初始化迁移 `096c39d0f051_init_tables.py`，报错 `relation "users" already exists`
- 原因判断：当前数据库已是“已导入初始化结构但未写入 Alembic 版本号”的状态，不适合再次从 `init tables` 全量重放
- 处理方式：执行 `./.venv/bin/alembic stamp head`
- 处理后结果：`alembic_version.version_num = cd4e5f6a7b89`

## pg_trgm 扩展核验
- SQL：`SELECT extname FROM pg_extension WHERE extname = 'pg_trgm';`
- 返回结果：`pg_trgm`
- 是否通过：通过

## 索引核验
- SQL：按运行手册查询 16 个目标索引
- 返回结果：16 个目标索引全部存在
- 已确认索引：
  - `ix_notifications_user_created_id_desc`
  - `ix_notifications_user_read_created_id_desc`
  - `ix_gen_tasks_user_status_created_id_desc`
  - `ix_gen_tasks_user_project_created_id_desc`
  - `ix_assets_user_project_deleted_created_id_desc`
  - `ix_assets_name_trgm`
  - `ix_assets_prompt_trgm`
  - `ix_projects_name_trgm`
  - `ix_projects_description_trgm`
  - `ix_voices_name_trgm`
  - `ix_voices_style_trgm`
  - `ix_voices_emotions_trgm`
  - `ix_reference_audio_items_name_trgm`
  - `ix_reference_audio_items_description_trgm`
  - `ix_reference_audio_items_emotion_trgm`
  - `ix_audio_clips_text_trgm`
- 是否全部存在：通过
- `gin_trgm_ops`：本轮通过索引命名与迁移落地核验确认索引已建成；后续仍建议在真实业务库补一轮 `indexdef` 级别抽查

## EXPLAIN 补充记录
- 本轮仅在初始化库上额外抽查了一条 `assets` 搜索 SQL
- 结果摘要：命中 `Index Scan using ix_assets_user_deleted_created_id_desc on assets`
- 结论：在当前极小样本量下，优化器优先使用用户维度复合索引完成过滤与排序；由于初始化库数据量极小，尚不足以判断 `pg_trgm` 索引在真实搜索流量下的命中策略

## 结论
- 是否通过：部分通过
- 已通过项：
  - Linux 本机 `.venv` 已重建成功
  - Alembic 版本状态已与现有初始化库结构对齐到 `cd4e5f6a7b89`
  - `pg_trgm` 扩展存在
  - 16 个目标索引全部存在
- 异常项：
  - 当前数据库是“已存在表结构但缺少 `alembic_version` 记录”的初始化库，不能直接重放 `init tables`
  - 当前数据库数据量极小，不适合继续做搜索链路命中策略验证和压测结论判断
- 下一步动作：
  - 切换到有真实业务数据的目标库
  - 在目标库继续执行 `EXPLAIN (ANALYZE, BUFFERS)` 核验 `assets / projects / voices / reference_audio_library_items / audio_clips`
  - 在目标库执行首轮 `requests=50`、`concurrency=10` 的轻量压测
