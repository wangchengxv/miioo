# 媒体链路专项回滚手册

## 1. 适用范围

- 适用于 `MEDIA-BPLUS-10 / 20 / 30 / 40 / 50` 引入新媒体交付链路后的专项回滚。
- 适用于签名下载、对象存储预览、视频 HLS、图片大图与现代格式、媒体任务运行时等媒体专项能力。
- 适用于当前仓库“部分治理能力已落文档与脚本，但多数 feature flag 尚未真正落代码”的阶段，用作统一止血与回退动作手册。
- 第一轮若采用 `www.miiooai.com` 主域复用方案，本手册默认同时覆盖 `/media/origin/`、`/media/cdn/` 与受控下载最终跳转路径的回退。

## 2. 症状表现

- 新链路发布后，`downloadUrl`、`previewUrl`、`posterUrl`、`hlsUrl` 大面积失败。
- 批量 ZIP 下载、单资源下载或预览链路突然开始大量 `401 / 403 / 404 / 5xx`。
- HLS 开启后播放器主链路不可用，回退也失败。
- 图片大图、现代格式或 CDN 预览切换后，页面出现大面积空白、旧缓存或错图。
- Worker、队列、上游失败或静态流量错误在发布后明显放大。

## 3. 快速判断

先判断当前要走哪一类回滚：

- `配置回滚`
  - 适用于 feature flag、字段消费顺序、代理配置切换后异常
- `流量回滚`
  - 适用于新域名、CDN、对象存储回源或新路径分发异常
- `代码回滚`
  - 适用于下载校验逻辑、任务运行时代码、HLS 打包逻辑发布后异常
- `数据与缓存回滚`
  - 适用于 metadata、派生产物、CDN 缓存或任务状态未同步回退

当前专项回滚与总入口关系：

- 总入口仍是 [release-rollback.md](file:///Users/xingyi/Desktop/迭代一版/docs/runbooks/release-rollback.md)
- 本手册负责媒体专项的命令级步骤和判断口径

## 4. 核查命令

### 4.1 进程与基础状态

```bash
./project_ops.sh status
./project_ops.sh check
```

### 4.2 下载与预览链路

```bash
./project_ops.sh media-audit 200
./project_ops.sh media-delivery <media-url>
```

### 4.3 日志观察

```bash
./project_ops.sh logs web 300
./project_ops.sh logs worker 300
```

### 4.4 队列与上游

```bash
redis-cli LLEN miioo:background-jobs
./project_ops.sh logs worker 300 | grep "app.background_runtime"
./project_ops.sh logs web 300 | grep "app.upstream"
```

### 4.5 静态资源与公网链路

```bash
bash backend/scripts/check_uploads_access.sh /uploads/某条样本文件
```

## 5. 常见根因

### 5.1 配置切换未完全生效

- 新旧环境变量混用
- 应用未重启或代理未 reload
- 同一能力在多处配置了不同默认值

### 5.2 新旧链路同时生效但消费顺序错乱

- 后端已产出新字段，前端仍优先读旧字段
- HLS 与 `previewVideoUrl` 切换顺序不一致
- 下载入口和内部 ZIP 解析链路未同时回退

### 5.3 流量入口切换不完整

- 新媒体域名、CDN、Nginx upstream 只切了一半
- 源站已恢复，缓存或分发路径没恢复

### 5.4 回滚只动了代码，没动数据与缓存

- metadata 仍指向新对象
- HLS playlist 已回退，分片未回退
- CDN 缓存仍保留新链路内容

### 5.5 故障窗口继续扩散改动

- 出现明显失败后仍继续放量
- 现场叠加临时补丁导致回退路径更混乱

## 6. 处理步骤

### 6.1 第一步：先停放量

- 若本次是灰度发布，先停止继续放大范围
- 先固定故障窗口，不要继续扩大影响面

### 6.2 第二步：保留证据

至少保留：

- 异常样本 URL
- `media-audit` 最近输出
- `web / worker` 最近日志
- 当前发布版本、配置差异、发布时间

### 6.3 第三步：按类型选择回滚

优先顺序建议：

1. 配置回滚
2. 流量回滚
3. 数据与缓存回滚
4. 代码回滚

原因：

- 先回最轻量、最快止血的层
- 不要一上来直接做代码版本回退

## 7. 回滚步骤

### 7.1 配置回滚

适用场景：

- 签名下载开关切换后异常
- HLS 主播放切换后异常
- 图片现代格式、大图、预览鉴权切换后异常

动作：

1. 关闭开关或恢复旧的 resolver / getter 选择顺序
2. 恢复旧环境变量或旧配置文件
3. 重启 Web / Worker 或 reload 代理

常用动作：

```bash
./project_ops.sh restart web
./project_ops.sh restart worker
./project_ops.sh check
```

### 7.2 流量回滚

适用场景：

- 新媒体域名/CDN 回源异常
- 新 Nginx 路由、upstream、路径分发异常
- 对象存储预览链路局部异常

动作：

1. 恢复旧域名或旧路径分发
2. 恢复旧 Nginx upstream / 路由规则
3. 停止新增对象写入，必要时切回本地托管路径
4. reload Nginx
5. 若首轮使用 `www.miiooai.com` 主域复用，优先把 `/media/origin/`、`/media/cdn/` 恢复到旧回源或直接下线，再确认 `/uploads/` 老链路仍可读

常用动作：

```bash
./project_ops.sh nginx-test
./project_ops.sh nginx-reload
./project_ops.sh media-delivery <media-url>
```

### 7.3 代码回滚

适用场景：

- 下载校验逻辑误杀
- 任务中心代码变更导致主链路失败
- HLS 打包代码发布后大面积失败

动作：

1. 明确回滚目标版本
2. 保留当前版本日志与异常样本
3. 回滚代码版本
4. 重启相关进程
5. 执行基础检查

回滚后最少执行：

```bash
./project_ops.sh restart all
./project_ops.sh check
./project_ops.sh media-audit 200
```

### 7.4 数据与缓存回滚

适用场景：

- metadata 仍指向新链路
- CDN 或浏览器缓存仍命中新资源
- HLS playlist、分片和派生产物版本不一致
- 任务状态、产物状态仍残留新口径

动作：

1. 恢复旧 metadata 或旧字段值
2. 必要时清理错误派生产物
3. 对 CDN 或缓存层做失效
4. 对 HLS 必须整体回退 playlist + 分片
5. 必要时人工修正任务状态

当前对应参考手册：

- [media-cdn-invalidation.md](file:///Users/xingyi/Desktop/迭代一版/docs/runbooks/media-cdn-invalidation.md)
- [media-storage-migration.md](file:///Users/xingyi/Desktop/迭代一版/docs/runbooks/media-storage-migration.md)

## 8. 验证步骤

回滚完成后至少验证：

- `./project_ops.sh status` 正常
- `./project_ops.sh check` 正常
- `./project_ops.sh media-audit 200` 失败类 outcome 不再持续增长
- `./project_ops.sh media-delivery <media-url>` 返回旧链路预期结果
- 队列长度、上游失败、静态链路错误率回到回滚前可接受范围
- 你在真实环境手工联调时确认主链路恢复

## 9. 需要回写的文档

- 每轮媒体专项回滚完成后至少检查：
  - `docs/plans/module-progress.md`
  - `docs/plans/项目进度文档.md`
  - `CHANGELOG.md`
- 若本次回滚涉及：
  - 对外字段消费顺序变化
  - 接口返回语义回退
  - feature flag 默认值变化
  - 交付域名或路径策略回退

则继续更新：

- `backend/BACKEND_API_DOC.md`
- `接口变动文档.md`

## 10. 当前限制

- 当前大多数媒体 feature flag 还没有真正接入代码层，因此很多“配置回滚”在现阶段仍需要通过版本回退或恢复旧配置顺序来完成
- 当前还没有统一的媒体回滚脚本，首版主要依赖 `project_ops.sh`、`media-audit`、`media-delivery`、Nginx reload 和现有 Runbook
- 后续若真正把 feature flag 和对象存储/CDN 接入运行代码，需要继续补：
  - 开关级快速关闭命令
  - 对象/缓存清理脚本
  - 任务状态批量修正脚本
