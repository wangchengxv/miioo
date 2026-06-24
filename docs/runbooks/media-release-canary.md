# 媒体链路灰度发布手册

## 1. 适用范围

- 适用于 `MEDIA-BPLUS-10 / 20 / 30 / 40 / 50` 涉及媒体访问、任务运行时、视频交付和图片派生的渐进灰度发布。
- 适用于签名下载、对象存储预览、HLS、图片大图与现代格式等新链路的分批开启。
- 适用于当前仓库“部分能力已落设计与 Runbook、但大多数 feature flag 尚未真正落代码”的阶段，用作统一灰度顺序与止损规则。
- 第一轮若采用 `www.miiooai.com` 主域复用方案，默认把 `/media/origin/` 视为对象存储源站路径、把 `/media/cdn/` 视为预览/CDN 路径；灰度时不要和二级媒体域名混用。

## 2. 症状表现

- 新链路一开就出现大面积下载失败、预览失败或播放失败。
- 某批内部用户正常，放大到更多项目后开始异常。
- `previewUrl`、`posterUrl`、`downloadUrl`、`hlsUrl` 在新旧链路切换后表现不一致。
- 队列、上游、静态流量或下载审计在灰度放量后明显恶化。

## 3. 快速判断

先判断当前灰度属于哪一类：

- `功能开关灰度`
  - 例如是否启用签名下载、是否启用 HLS
- `字段消费灰度`
  - 例如播放器是否优先消费 `hlsUrl`
- `资源类型灰度`
  - 例如图片先灰度 `largeUrl`
- `用户/项目作用域灰度`
  - 先只对内部账号、测试项目生效

当前仓库建议的固定灰度顺序：

- `MEDIA-BPLUS-10`
  - 先灰度下载链路
  - 再灰度预览资源鉴权
  - 最后灰度对象存储替换
- `MEDIA-BPLUS-20`
  - 先灰度某一类媒体任务
  - 再扩大到全部媒体任务
- `MEDIA-BPLUS-30`
  - 先灰度 `previewVideoUrl`
  - 再灰度 `hlsUrl`
  - 最后灰度 `availableQualities`
- `MEDIA-BPLUS-40`
  - 先灰度 `largeUrl`
  - 再灰度 `AVIF`
  - 再灰度 `imageSources`

## 4. 核查命令

### 4.1 基础运行状态

```bash
./project_ops.sh status
./project_ops.sh check
```

### 4.2 下载链路

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

## 5. 灰度前准备

### 5.1 文档和入口

- 确认本轮改动已写入 `CHANGELOG.md`
- 确认对应专项 Runbook 已存在
- 确认你要观察的关键指标已经在 `runtime-observability.md` 中有口径

### 5.2 样本准备

- 至少准备 1 个内部账号
- 至少准备 1 个测试项目
- 每类媒体至少准备 1 到 3 个稳定样本：
  - 图片
  - 视频封面
  - 轻量预览视频
  - 下载地址
  - 若涉及 HLS，再补 playlist 样本
- 若本轮使用主域复用，还要额外准备：
  - 1 条 `/media/origin/<bucket>/<key>` 样本
  - 1 条 `/media/cdn/<bucket>/<key>` 样本
  - 1 条受控下载 token 样本，确认最终能跳到主域源站路径

### 5.3 放量原则

- 不做“一键全量”
- 先内部账号
- 再单项目
- 再少量真实项目
- 最后全量

## 6. 处理步骤

### 6.1 第一步：只对内部账号/测试项目开启

固定要求：

- 放量范围可明确圈定
- 出问题时可快速回到旧链路

若当前能力尚未 feature flag 化：

- 不要通过分散改代码临时硬切全量
- 优先限定到测试环境、内测项目或单独发布窗口

### 6.2 第二步：小流量观察

观察点：

- `app.media_download` 是否出现失败增长
- `/uploads/` 或未来 CDN 是否出现 404/5xx
- `app.upstream` 是否出现 timeout/429/5xx 放大
- `app.background_runtime` 是否出现任务堆积或失败增长

建议最少观察 15 到 30 分钟，或一个完整业务操作周期。

### 6.3 第三步：逐级放大

建议节奏：

1. 内部账号 + 单项目
2. 内部账号 + 多项目
3. 少量真实项目
4. 全量

每次放大前都要重新看：

- `./project_ops.sh media-audit 200`
- `./project_ops.sh media-delivery <样本地址>`
- `./project_ops.sh status`

### 6.4 第四步：记录灰度结果

至少记录：

- 灰度能力
- 生效范围
- 开始时间
- 观察指标
- 是否继续放量
- 是否触发回滚

## 7. 常见根因

### 7.1 没有作用域收敛

- 新链路一上来就影响全量项目
- 没有内部账号/测试项目缓冲层

### 7.2 新旧字段消费顺序不一致

- 后端已产出新字段
- 但前端/播放器仍优先消费旧字段
- 或部分页面已切新字段、部分页面仍走旧字段

### 7.3 只有链路切换，没有观测入口

- 开了新链路，但没有同步看下载审计、静态链路、上游失败和队列

### 7.4 没有止损条件

- 明明已经出现失败增长，仍继续放量

## 8. 止损条件

满足任一条件，就应暂停继续放量，并优先回退：

- `downloadUrl` 大面积失效
- `previewVideoUrl` 与 `hlsUrl` 同时失效
- `app.media_download` 失败类 outcome 在 5 分钟窗口明显升高
- `/uploads/` 或未来 CDN 大面积 `404 / 5xx`
- Redis 队列持续积压且 Worker 无法恢复消费
- 上游 timeout/429/5xx 明显高于灰度前基线

## 9. 回滚步骤

### 9.1 当前回滚原则

- 先停放量
- 再回退开关、字段消费顺序或流量入口
- 最后才考虑代码版本回滚

### 9.2 回滚动作

1. 记录当前灰度范围和异常样本
2. 关闭开关或恢复旧链路选择顺序
3. 若涉及媒体域名、CDN 或 Nginx 路由，恢复旧分发路径
4. 执行：

```bash
./project_ops.sh check
./project_ops.sh media-audit 200
./project_ops.sh media-delivery <media-url>
```

5. 确认恢复后再决定是否需要版本回滚

### 9.3 若当前还没有 feature flag

- 优先按版本回滚
- 不要在故障窗口继续加临时补丁扩大改动面

## 10. 验证步骤

- 内部账号和测试项目已恢复或稳定
- 关键样本的 `downloadUrl / previewUrl / posterUrl / hlsUrl` 行为符合预期
- `media-audit` 失败类 outcome 未持续增加
- 队列长度、上游失败、静态链路错误率回到可接受范围
- 你在真实环境手工联调时确认主链路无新增阻塞

## 11. 需要回写的文档

- 每轮灰度完成后至少检查：
  - `docs/plans/module-progress.md`
  - `docs/plans/项目进度文档.md`
  - `CHANGELOG.md`
- 若引入了真实 feature flag、对外字段消费顺序或交付策略有变化，再更新：
  - `backend/BACKEND_API_DOC.md`
  - `接口变动文档.md`

## 12. 当前限制

- 当前仓库已把 `MEDIA_ENABLE_SIGNED_DOWNLOAD`、`MEDIA_ENABLE_OBJECT_STORAGE_PREVIEW`、`MEDIA_ENABLE_IMAGE_LARGE_VARIANT`、`MEDIA_ENABLE_VIDEO_PREVIEW_TRANSCODE` 和 `MEDIA_ENABLE_VIDEO_HLS` 接到后端真实代码层，可作为第一批真实灰度/回退开关使用
- 其中 `MEDIA_ENABLE_VIDEO_PREVIEW_TRANSCODE` 用于控制视频落盘阶段是否尝试生成轻量 mp4 预览，并决定 `previewVideoUrl` 优先指向派生产物还是原始视频
- 其中 `MEDIA_ENABLE_VIDEO_HLS` 现已进一步控制视频落盘阶段是否尝试生成单码率 HLS 主播放列表，并决定详情播放能否优先切到 `hlsUrl`
- 当前手册已不再只是抽象灰度规则，但除下载链路、对象存储预览链路、图片大图链路和轻量 mp4 预览链路外，大多数媒体能力仍需后续继续落地真实开关
- 后续若真正落地 feature flag，需要继续补：
  - 开关配置项
  - 默认值
  - 生效范围
  - 快速关闭命令
