# 统一媒体下载与签名链路排障手册

## 1. 适用范围

- 适用于 `GET /api/media/downloads/{token}` 统一受控下载入口。
- 适用于旧单资源下载、批量 ZIP 下载在服务端复用 `resolve_verified_download_target_from_url(...)` 的链路。
- 适用于当前首版“应用日志级下载审计”排障，不覆盖对象存储直签与独立审计表。

## 2. 症状表现

- 前端或手工请求命中 `downloadUrl` 后返回 `401 / 403 / 404`。
- `downloadUrl` 打开后未跳转真实文件，或跳转后仍下载失败。
- 旧单资源下载、批量 ZIP 下载突然开始大量失败。
- 用户反馈“同一资源可预览但无法下载”。

## 3. 快速判断

先用统一巡检入口判断问题大类：

```bash
./project_ops.sh media-audit 200
```

常见 outcome 含义：

- `redirected`：统一受控下载入口校验通过，并已返回真实目标地址。
- `resolved`：旧下载接口在服务端成功完成受控目标解析。
- `passthrough`：当前链路仍走旧直连地址，没有命中受控下载 token。
- `invalid_token`：token 无效、签名不一致或已过期。
- `forbidden`：当前登录用户与 token 中 `user_id` 不一致。
- `not_found`：token 可解，但落到的真实下载目标不存在。
- `rejected`：链路被服务端主动拒绝，通常是解析规则或资源语义不满足要求。

## 4. 核查命令

### 4.1 下载审计摘要

```bash
./project_ops.sh media-audit 300
```

若要同时看 `web` 和 `worker`：

```bash
MEDIA_AUDIT_TARGET=all ./project_ops.sh media-audit 300
```

### 4.2 查看原始下载审计日志

```bash
./project_ops.sh logs web 300 | grep "app.media_download"
```

### 4.3 只看失败类 outcome

```bash
./project_ops.sh logs web 300 | grep "app.media_download" | grep -E "outcome=(invalid_token|forbidden|not_found|rejected)"
```

### 4.4 确认统一下载入口是否被命中

```bash
./project_ops.sh logs web 300 | grep "/api/media/downloads/"
```

### 4.5 核查后端基础可用性

```bash
./project_ops.sh status
./project_ops.sh check
```

## 5. 常见根因

### 5.1 `invalid_token`

- `MEDIA_DOWNLOAD_TOKEN_SECRET` 在不同进程或不同环境不一致。
- token 生成后停留过久，超过 `MEDIA_DOWNLOAD_TOKEN_EXPIRE_SECONDS`。
- 历史缓存、复制出来的旧 `downloadUrl` 仍在被复用。

### 5.2 `forbidden`

- 当前下载用户和签名时绑定的 `user_id` 不是同一个账号。
- 测试时复制了别人的 `downloadUrl` 直接访问。

### 5.3 `not_found`

- token 可解，但 `storage_key` 对应的真实文件不存在。
- `/uploads/...` 路径与 metadata 中的托管 key 不一致。
- 旧资源 metadata 脏口径导致解析后指向已失效文件。

### 5.4 `rejected`

- 目标 URL 不属于当前允许的受控下载语义。
- 资源字段被错误地当成下载地址，例如把预览地址或错误媒体类型塞进下载链路。

### 5.5 `passthrough` 比例异常升高

- 某些旧接口仍在回退原始直连 URL，还未正式切到统一 token 下载。
- 视图模型或打包前解析链没有命中 `downloadUrl`。

## 6. 处理步骤

### 6.1 先确认故障范围

- 若 `invalid_token` 大量出现：优先查签名配置与过期时间。
- 若 `forbidden` 集中在个别账号：优先查登录态和用户切换。
- 若 `not_found / rejected` 集中在少量资源：优先查资源元数据和真实文件。

### 6.2 排查签名配置

- 核查 `MEDIA_DOWNLOAD_TOKEN_SECRET` 是否在当前 web 进程使用的 `.env` 中稳定配置。
- 若近期改过密钥或过期时间，先确认是否已执行重启并加载新配置：

```bash
./project_ops.sh restart web
```

### 6.3 排查真实资源是否存在

- 从失败日志中定位 `storage_key`、`resource_id`、`resolved_target`。
- 若目标仍是 `/uploads/...`，到服务器核查对应文件是否真实存在。
- 若资源是历史数据，继续核查 metadata 中 `download_url / origin_url / file_url` 的落点是否一致。

### 6.4 排查旧接口是否仍在旁路

- 若审计里长期只出现 `passthrough`，说明该链路还没真正走统一 token 解析。
- 优先核查当前接口是不是仍直接回退 `origin_url / file_url`，或前端/调用方还在使用历史下载入口。

### 6.5 复核失败是否已消退

```bash
./project_ops.sh media-audit 200
```

若失败 outcome 不再继续增长，再进行真实环境手工下载验证。

## 7. 回滚步骤

### 7.1 当前回滚原则

- 当前下载链路已补入首个独立开关 `MEDIA_ENABLE_SIGNED_DOWNLOAD`，默认保持开启；若灰度或回滚需要恢复旧直链语义，可先关闭该开关再观察 `media-audit` 与真实下载表现。
- 若统一受控下载链路引发主链路故障，优先按版本回滚，而不是现场继续扩散改动。

### 7.2 回滚动作

1. 记录当前失败日志样本与 `resource_id / storage_key / outcome`。
2. 回滚到上一版稳定后端发布版本。
3. 重启 Web 进程：

```bash
./project_ops.sh restart web
./project_ops.sh check
```

4. 继续保留旧单资源下载接口作为兼容入口，不在故障窗口继续扩大新的受控下载接线范围。

## 8. 验证步骤

- `./project_ops.sh media-audit 200` 中失败类 outcome 不再持续增加。
- 统一受控下载入口出现新的 `redirected`。
- 旧单资源下载或批量 ZIP 下载出现新的 `resolved`。
- 用户在真实环境手工验证下载恢复正常。

## 9. 需要回写的文档

- 若对外接口契约、响应语义或状态码有变化，更新：
  - `backend/BACKEND_API_DOC.md`
  - `接口变动文档.md`
- 每轮处理完成后至少检查：
  - `docs/plans/module-progress.md`
  - `docs/plans/项目进度文档.md`
  - `CHANGELOG.md`
