# 数据库增量恢复手册

## 1. 适用场景

本手册适用于以下目标：

- 不清空云端现有数据库
- 只补当前仓库缺失的表结构、字段、索引
- 只补指定表的数据
- 避免把全量 `schema/full dump` 误执行成整库覆盖

不适用于以下场景：

- 想用本地数据库完整替换云端数据库
- 想导入带 `DROP / CREATE / ALTER` 的全量快照
- 想自动合并存在主键或唯一键冲突的历史业务数据

## 2. 当前脚本入口

已新增脚本：

- [incremental_restore_db.sh](file:///Users/xingyi/Desktop/迭代一版/backend/脚本/incremental_restore_db.sh)

脚本默认行为：

- 若未显式传入 `SOURCE_DATABASE_URL / TARGET_DATABASE_URL`
- 默认读取 `backend/.env` 中的 `DATABASE_URL`
- 默认把输出文件写到 `backend/sql/incremental/`

## 3. 推荐执行顺序

### 第一步：备份目标库

```bash
cd backend
bash ./脚本/incremental_restore_db.sh backup-target
```

执行结果：

- 生成一份目标数据库备份
- 文件形如：`backend/sql/incremental/target_backup_xxx.dump`

### 第二步：先补结构

```bash
cd backend
bash ./脚本/incremental_restore_db.sh migrate-target
```

执行结果：

- 对目标数据库执行 `alembic upgrade head`
- 只补仓库当前迁移里缺失的字段、表、索引
- 不清空已有业务数据

### 第三步：导出要补的数据表

例如只补 `api_providers` 和 `model_configs`：

```bash
cd backend
bash ./脚本/incremental_restore_db.sh export-data \
  -t public.api_providers \
  -t public.model_configs
```

执行结果：

- 生成一份仅含指定表数据的 SQL
- 文件形如：`backend/sql/incremental/incremental_api_providers_model_configs_xxx.sql`

### 第四步：将增量 SQL 导入目标库

```bash
cd backend
bash ./脚本/incremental_restore_db.sh apply-data \
  -f ./sql/incremental/incremental_api_providers_model_configs_xxx.sql
```

执行结果：

- 使用 `psql -v ON_ERROR_STOP=1` 执行增量 SQL
- 默认拒绝带 DDL 的 SQL 文件，防止误把全量快照当增量补丁执行

### 冲突时增加一步：先生成 merge SQL

若目标库里已经存在同主键或唯一键记录，不要直接导入原始 `INSERT` 文件，先把它转成可重复执行的 merge SQL：

```bash
cd backend
bash ./脚本/incremental_restore_db.sh build-merge \
  -f ./sql/incremental/incremental_api_providers_model_configs_xxx.sql
```

执行结果：

- 默认在同目录生成 `*_merge.sql`
- 通过 `_staging_` 临时表承接原始数据
- 后续按“存在则更新，不存在则插入”的方式合并到目标表

生成后再执行：

```bash
cd backend
bash ./脚本/incremental_restore_db.sh apply-data \
  -f ./sql/incremental/incremental_api_providers_model_configs_xxx_merge.sql
```

说明：

- `apply-data` 仍默认拒绝危险 DDL
- 仅对 `build-merge` 生成的 `_staging_` 临时表 SQL 自动放行

## 4. 针对当前配置的最短命令

若你当前 `backend/.env` 中已经是：

```env
DATABASE_URL=postgresql+asyncpg://miioofd:miioo_dev_2026@localhost:5432/miioofd
```

则可以直接执行：

```bash
cd /Users/xingyi/Desktop/迭代一版/backend

# 1. 先备份目标库
bash ./脚本/incremental_restore_db.sh backup-target

# 2. 先补结构
bash ./脚本/incremental_restore_db.sh migrate-target

# 3. 导出你要补的数据表
bash ./脚本/incremental_restore_db.sh export-data \
  -t public.api_providers \
  -t public.model_configs

# 4. 将生成的增量 SQL 导回目标库
bash ./脚本/incremental_restore_db.sh apply-data \
  -f ./sql/incremental/生成出来的文件名.sql
```

## 5. 什么时候不能直接 apply-data

以下场景不要直接执行 `apply-data`：

- 目标库里已经存在同主键数据
- 目标库里已经存在同唯一键数据
- 你拿到的是全量快照 SQL
- 你拿到的是包含 `CREATE / ALTER / DROP` 的结构脚本

原因：

- `export-data` 生成的是标准 `INSERT` 语句
- 若目标库已有同一条记录，通常会触发唯一键冲突

## 6. 冲突场景的正确做法

若你只是想“存在则更新，不存在则插入”，当前仓库已经提供：

- `backend/脚本/build_incremental_merge_sql.py`
- `backend/脚本/incremental_restore_db.sh build-merge`

当前已内置 5 张配置类表的 merge 规则：

- `public.api_providers`
- `public.model_configs`
- `public.api_config_banners`
- `public.api_config_card_visibility`
- `public.community_qr_configs`

其中：

- `api_config_card_visibility` 按 `card_key` 合并
- 其余 4 张表按 `id` 合并

## 7. 安全边界

当前脚本已做的保护：

- `backup-target` 先备份目标库
- `migrate-target` 只执行 Alembic 迁移，不导入全量 schema
- `export-data` 只导出 `data-only`
- `apply-data` 默认拒绝带 DDL 的 SQL 文件

当前脚本没有自动做的事情：

- 不自动做 UPSERT
- 不自动判断哪几张业务表存在唯一键冲突
- 不自动拆分“仅新增行”和“需更新旧行”的数据

## 8. 建议

若这次只是恢复配置类数据，优先补这些表：

- `public.api_providers`
- `public.model_configs`
- `public.api_config_banners`
- `public.api_config_card_visibility`
- `public.community_qr_configs`

若是业务数据表：

- 先小范围导出
- 先备份目标库
- 先在测试库验证
- 确认无唯一键冲突后再上正式库
