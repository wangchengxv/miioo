# Seedance 2.0 集成经验总结

**完成日期**：2026-06-11  
**状态**：✅ 已打通全链路（参考视频 + 隧道部署 + 公网访问）

---

## 一、核心问题与解决方案

### 问题 1：参考视频公网地址 404
- **现象**：`http://api.chengxvblog.top/uploads/.../xxx.mp4` 返回 404
- **根因**：原域名隧道服务失效，`PUBLIC_BASE_URL` 配置过期
- **方案**：部署 Localtunnel 隧道服务，自动分配 HTTPS 公网地址

### 问题 2：HTTP vs HTTPS
- **风险**：生产环境使用 HTTP 不符合安全规范
- **方案**：隧道服务自动提供 HTTPS（`https://xxx.loca.lt`）

### 问题 3：本地测试环境公网暴露
- **需求**：本地开发时需临时公网访问能力
- **方案**：使用 Localtunnel（基于 npx，无需安装，即开即用）

---

## 二、Seedance 2.0 数字资产绑定架构

### 2.1 前端请求参数结构

```typescript
// frontend/src/api/creation/video.ts
interface VideoGenerationParams {
  prompt: string;
  model: string;  // "seedance-2.0"
  
  // 数字资产绑定
  reference_video?: string;  // 参考视频 URL（必须公网可访问）
  reference_strength?: number; // 参考强度 0-1
}
```

### 2.2 后端处理流程

**文件**：`backend/app/routers/creation/video.py`

```python
# 1. 接收前端参数
reference_video_url = params.reference_video  # 前端已拼接 PUBLIC_BASE_URL

# 2. 传递给 OneLink AI
onelink_params = {
    "model": "seedance-2.0",
    "prompt": params.prompt,
    "reference_video": reference_video_url,  # 直接透传公网 URL
    "reference_strength": params.reference_strength
}

# 3. OneLink AI 访问参考视频并生成
response = await onelink_client.generate(onelink_params)
```

### 2.3 媒体链路关键点

| 层级 | 职责 | 关键配置 |
|-----|------|---------|
| **前端** | 拼接完整公网 URL | `PUBLIC_BASE_URL + relative_path` |
| **后端** | 返回相对路径 | `/uploads/creation/sessions/.../xxx.mp4` |
| **隧道服务** | 公网暴露 | `https://xxx.loca.lt` → `http://localhost:8000` |
| **OneLink AI** | 下载参考视频 | 必须能访问 `PUBLIC_BASE_URL + relative_path` |

---

## 三、技术决策记录

### 决策 1：前端负责 URL 拼接
**原因**：
- 后端只管存储相对路径，不关心公网域名
- `PUBLIC_BASE_URL` 可能随部署环境变化（本地/测试/生产）
- 前端统一处理媒体 URL 拼接逻辑，便于切换 CDN

**实现**：`frontend/src/api/utils.ts` 提供 `resolveMediaUrl()` 工具函数

### 决策 2：后端不做 URL 重写
**原因**：
- 后端只是透传参数给 OneLink AI
- 避免后端与前端对 `PUBLIC_BASE_URL` 产生不一致理解
- 降低后端对媒体访问层的耦合

### 决策 3：使用 Localtunnel 而非 Ngrok/Frp
**原因**：
- 无需注册账号（Ngrok 需要）
- 基于 npx，无需安装（Frp 需要配置文件）
- 自动 HTTPS，适合本地测试

**权衡**：
- ⚠️ 域名随机分配，每次重启会变化（需重启后端更新 `.env`）
- ⚠️ 首次访问需手动确认（点击"Continue"）
- ⚠️ 不适合长期生产环境（建议用云服务器 + 固定域名）

---

## 四、部署清单

### 4.1 隧道服务部署

```bash
# 启动隧道（后台运行）
npx localtunnel --port 8000

# 输出示例
# your url is: https://pink-signs-shake.loca.lt
```

### 4.2 后端配置更新

```bash
# backend/.env
PUBLIC_BASE_URL=https://pink-signs-shake.loca.lt
UPSTREAM_MEDIA_REQUIRE_HTTPS=false  # 本地测试可关闭 HTTPS 强制校验
```

### 4.3 后端重启

```bash
cd backend
./start.sh
```

### 4.4 前端验证

```javascript
// 前端发起 Seedance 2.0 请求时
const response = await videoApi.generate({
  prompt: "舞蹈视频生成",
  model: "seedance-2.0",
  reference_video: "https://pink-signs-shake.loca.lt/uploads/.../xxx.mp4"
});
```

---

## 五、遗留问题与后续优化

### 5.1 遗留问题
✅ **已解决**：所有已知问题已修复

### 5.2 后续优化方向

#### 优化 1：生产环境固化域名
- **现状**：Localtunnel 域名随机分配
- **目标**：使用云服务器固定域名（如 `https://api.prod.example.com`）
- **方案**：Nginx 反向代理 + Let's Encrypt 证书

#### 优化 2：CDN 加速
- **现状**：隧道服务直连后端，带宽受限
- **目标**：媒体文件走 OSS + CDN
- **方案**：上传时同步到腾讯云 COS，`PUBLIC_BASE_URL` 指向 CDN 域名

#### 优化 3：参考视频缓存
- **现状**：OneLink AI 每次生成都重新下载参考视频
- **目标**：减少重复下载，提升响应速度
- **方案**：后端接收参考视频后先上传到 OneLink AI 的文件存储，返回 `file_id` 复用

---

## 六、关键代码位置

| 功能模块 | 文件路径 |
|---------|---------|
| 前端视频生成 API | `frontend/src/api/creation/video.ts` |
| 前端媒体 URL 工具 | `frontend/src/api/utils.ts` |
| 后端视频生成路由 | `backend/app/routers/creation/video.py` |
| 后端 OneLink AI 客户端 | `backend/app/services/onelink_client.py` |
| 隧道启动脚本 | `backend/tunnel-lt.sh` |
| 后端配置文件 | `backend/.env` |

---

## 七、经验教训

### 教训 1：公网 URL 验证要前置
- **问题**：联调时才发现参考视频 404
- **改进**：部署清单中明确要求先验证 `PUBLIC_BASE_URL` 可访问性

### 教训 2：HTTPS 不是可选项
- **问题**：原配置使用 HTTP，埋下安全隐患
- **改进**：开发环境也强制 HTTPS（通过隧道服务）

### 教训 3：隧道服务需持续运行
- **问题**：隧道服务意外停止导致生成任务全部失败
- **改进**：使用 systemd/pm2 管理隧道服务，自动重启

---

## 八、相关文档

- **后端 API 文档**：`backend/BACKEND_API_DOC.md`
- **前端项目文档**：`frontend/PROJECT.md`
- **架构决策记录**：`docs/decisions/`
- **项目进度跟踪**：`docs/plans/项目进度文档.md`

---

**总结**：Seedance 2.0 数字资产绑定能力已全链路打通，前端可通过 `reference_video` 参数传递参考视频公网 URL，后端透传给 OneLink AI 完成生成。核心架构点是"前端拼接 URL + 后端透传 + 隧道公网暴露"，该模式可复用到其他支持数字资产的视频模型。
