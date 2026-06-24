# 本地开发手册

## 1. 目录

- 前端：`miioo/frontend`
- 后端：`miioo/backend`

## 2. 启动前必读

- 根级：`CLAUDE.md`、`AGENTS.md`
- 当前阶段：`HARNESS_DOC_INDEX.md`、`docs/plans/current-roadmap.md`
- 前端：`miioo/frontend/PROJECT.md`
- 后端：`miioo/backend/BACKEND_API_DOC.md`

## 3. 前端启动

```bash
cd miioo/frontend
npm install
npm run dev
```

- 当前 `frontend/vite.config.js` 已固定开发态监听 `0.0.0.0`，同局域网设备可直接访问你电脑的 `5173` 端口。
- 若需要让同局域网同事直接走你本机后端，请在 `frontend/.env.local` 中写入：

```bash
VITE_API_BASE_URL=http://你的局域网IP:8000
```

- 例如本机当前局域网地址若为 `10.20.100.79`，则前端访问地址为 `http://10.20.100.79:5173`，前端接口基地址应配置为 `http://10.20.100.79:8000`。

## 4. 后端启动

仓库根目录一键入口：

```bash
./start_backend.sh
```

可选模式：

```bash
./start_backend.sh stable
./start_backend.sh reload
./start_backend.sh db
./start_backend.sh public
./start_backend.sh public-db
./start_backend.sh stop-public
```

- `start_backend.sh` 是新的仓库根目录统一入口，适合你在项目根目录直接一键启动后端。
- 默认 `./start_backend.sh` 等价于进入 `backend/` 后执行 `./start.sh`。
- `./start_backend.sh stable` 会强制关闭热重载，适合 Trae / IDE 终端里稳定启动。
- `./start_backend.sh reload` 会强制开启热重载，适合普通系统终端开发。
- `./start_backend.sh db` 会复用 `backend/脚本/start_db_and_server.sh`，先检查/启动本地 PostgreSQL，再启动后端。
- `./start_backend.sh public` 会先以稳定模式在后台拉起后端，再自动执行 `backend/tunnel.sh` 打开 Cloudflare 公网隧道，适合需要把本地 `/uploads/...` 素材直接暴露给外部视频模型匿名回源的场景。
- `./start_backend.sh public-db` 会先检查/启动本地 PostgreSQL，再在后台拉起后端并自动打开 Cloudflare 公网隧道，适合“数据库可能还没起 + 还要公网地址”的一键启动场景。
- `./start_backend.sh stop-public` 会停止本地 Cloudflare / LocalTunnel 进程，并清理 `.runtime` 下的临时公网地址文件；当你准备切回云端固定域名，或不再需要本地公网回源时，优先使用这条命令收口。
- `public / public-db` 模式下，后端日志会落到 `backend/.runtime/backend_public.log`；按 `Ctrl+C` 关闭的是当前隧道，不会停止已在后台运行的后端。
- 若本地 PostgreSQL 未启动，`./start_backend.sh` 与 `backend/start.sh` 现在会明确打印 `alembic current` 的数据库连接失败原因，并提示直接改用 `./start_backend.sh db` 或 `./脚本/start_db_and_server.sh`。
- `backend/脚本/start_db_and_server.sh` 与 `backend/脚本/start_线上.sh` 现已统一先回到 `backend/` 根目录，再加载 `backend/_runtime_bootstrap.sh`；因此从仓库根目录通过 `./start_backend.sh db` 转调时，不会再出现 `backend/脚本/_runtime_bootstrap.sh: No such file or directory`。
- `./start_backend.sh db` 现已支持自动清理陈旧的 `postmaster.pid`：当数据目录里残留的 PID 不存在，或 PID 对应进程并不是 `postgres/postmaster` 时，脚本会先移除 stale 锁文件，再重试拉起本地 PostgreSQL。典型场景就是日志提示 `postmaster.pid already exists`，但实际 PID 已被系统其他进程复用。
- 当前所有后端启动入口在真正执行 `uvicorn` 前，都会先检查 `8000` 端口是否已被监听。若本地已有后端进程在跑，脚本会直接打印当前监听进程并退出 0，不再抛 `ERROR: [Errno 48] Address already in use`。

后端目录原生入口：

```bash
cd miioo/backend
./start.sh
```

- `backend/start.sh` 现会在 `.venv` 缺失时自动创建本地虚拟环境并安装 `requirements.txt`，适合作为默认开发启动入口。
- `backend/start.sh` 与 `backend/start_db_and_server.sh` 现会在启动服务前自动比对 `alembic current/head`；若本地数据库落后于仓库最新迁移，会先自动执行 `alembic upgrade head`，避免新增字段或索引未落库时把登录、资料等链路直接打挂。
- `backend/start_db_and_server.sh`、`backend/start_线上.sh`、`backend/start_prod.sh` 与 `backend/start_worker.sh` 现也已切到同一套启动 bootstrap：都会自动选择受支持的 `Python 3.12 / 3.11 / 3.10`、在 `.venv` 缺失或版本不兼容时自动重建，并在虚拟环境缺少关键依赖时自动补装 `requirements.txt`，不再要求手工先 `source .venv/bin/activate`。
- 本地后端当前优先使用 `Python 3.12 / 3.11 / 3.10` 创建 `.venv`；若系统默认 `python3` 是 `3.14+`，启动脚本会优先回退到较低受支持版本，因为当前 `pillow-avif-plugin==1.5.2` 在 `Python 3.14` 下构建会失败。
- `backend/start.sh` 与 `backend/start_db_and_server.sh` 当前新增 `BACKEND_DEV_RELOAD` 开关，支持 `auto / on / off` 三种模式，默认值为 `auto`。
- `backend/start_线上.sh` 当前默认等价于 `BACKEND_DEV_RELOAD=on` 的开发热重载入口，但同样复用上述 bootstrap；若你显式传入 `BACKEND_DEV_RELOAD=off`，它也会退回稳定模式。
- 默认 `auto` 行为：普通本地终端仍按 `uvicorn --reload` 启动；若检测到 `Trae sandbox` 这类已知会卡住 `watchfiles` 子进程的受限终端环境，则会自动关闭 `--reload`，改为稳定模式启动，避免出现“父进程还在、端口却一直起不来”的假重启现象。
- 若你明确需要强制热重载，可显式执行 `BACKEND_DEV_RELOAD=on ./start.sh`；若你只想稳定启动，也可显式执行 `BACKEND_DEV_RELOAD=off ./start.sh`。
- 若你需要手动排查虚拟环境或依赖安装问题，再使用下面这组命令：

```bash
cd miioo/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --reload-dir app --reload-exclude '.venv/*' --reload-exclude '.venv/**' --reload-exclude '__pycache__/*' --reload-exclude '*.pyc'
```

- 当前后端开发脚本与手动启动命令都监听 `0.0.0.0:8000`，局域网设备可直接访问 `http://你的局域网IP:8000`。
- 若你在 Trae / 受限 IDE 终端里排查启动问题，优先使用 `./start.sh` 让脚本自动判定是否关闭 `--reload`；只有在普通系统终端中，才建议手动执行带 `--reload` 的 `uvicorn` 命令。
- 若你需要一并拉起本地 PostgreSQL 并验证数据库连接，可执行 `./start_db_and_server.sh`；若你只是想快速拿到公网 HTTPS 地址，可执行 `./tunnel.sh`（Cloudflare）。现在更推荐直接使用 `./start_backend.sh public` 或 `./start_backend.sh public-db` 一步完成“后端启动 + 公网隧道”；当前视频生成链路也会优先读取 `.runtime/*_public_url` 中的活跃隧道地址，因此公共隧道重开后通常不再要求为了参考视频地址重新手工重启一次后端。
- 若启动时自动迁移失败，并提示当前数据库可能是“已有初始化表结构但 `alembic_version` 为空”的历史库，请先按提示手工执行 `./.venv/bin/alembic stamp head`，再执行 `./.venv/bin/alembic upgrade head`。

## 5. 联调要求

- 页面事实以现有 UI 为准
- 请求翻译统一在 `frontend/src/api/`
- 真实联调由你手工执行，文档只负责提供检查项与回写位置

## 6. 每次任务完成后至少回写

- `HARNESS_PAGE_API_MAPPING.md`
- `HARNESS_P0_BACKLOG.md`
- `docs/plans/module-progress.md`
- `CHANGELOG.md`
- `miioo/frontend/PROJECT.md`
