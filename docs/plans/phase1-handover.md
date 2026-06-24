# Phase 1 进度交付文档

**交付日期**：2026-06-11  
**任务**：视频模型资产绑定通用化 - Phase 1 基础设施搭建  
**状态**：✅ 已完成 95%（代码与文档已收口，单元测试已通过，待真实接口联调）

---

## 一、已完成工作

### 1.1 模型能力配置系统扩展

**文件**：`backend/app/services/model_capabilities.py`

**新增函数**：

#### 1.1.1 `get_model_asset_binding_capabilities(model: str) -> dict`

获取模型的资产绑定能力配置，返回格式：

```python
{
    "reference_video": {
        "enabled": bool,           # 是否支持参考视频
        "max_count": int,          # 最大数量
        "max_duration_seconds": int | None,
        "supported_formats": ["mp4", "mov"],
        "notes": str | None,
    },
    "reference_audio": { ... },    # 参考音频能力
    "reference_image": { ... },    # 参考图片能力
    "first_last_frame": { ... },   # 首尾帧能力
    "subjects": { ... },           # 多主体能力（Vidu）
    "multiframe": { ... },         # 多帧分段能力
    "total_attachments": { ... },  # 总数限制
}
```

**特点**：
- ✅ 从现有 `get_model_capabilities()` 提取并聚合资产相关能力
- ✅ 统一各模型的资产能力声明格式
- ✅ 无需修改数据库，直接基于代码配置

#### 1.1.2 `validate_asset_bindings(...) -> dict`

验证资产绑定是否符合模型能力，核心功能：

**输入格式支持**：
- ✅ 旧格式：`reference_video_url`, `reference_audio_url`, `first_frame_url`, `last_frame_url`
- ✅ 新格式：`attachments[]` 统一数组
- ✅ Asset ID：`reference_video_asset_id`, `reference_image_asset_ids[]`
- ✅ 混合格式：同时支持旧格式 + 新格式，自动合并去重

**验证规则**：
- ✅ 检查模型是否支持某类资产（视频/音频/图片）
- ✅ 检查资产数量是否超出限制
- ✅ 检查总附件数是否超限
- ✅ 自动去重（相同 URL 或 asset_id）
- ✅ Attachments 优先级高于旧格式参数

**返回格式**：
```python
{
    "video_refs": [
        {
            "url": str | None,
            "asset_id": str | None,
            "role": str,           # reference, motion, etc.
            "source": str,         # attachments, legacy_param, legacy_asset_id
            "asset_name": str | None,
        }
    ],
    "audio_refs": [...],
    "image_refs": [...],
    "total_count": int,
    "capabilities": dict,
}
```

### 1.2 模型能力查询接口

**文件**：`backend/app/routers/models.py`

**新增路由**：`GET /api/models/{model_id}/asset-capabilities`

```python
@router.get(
    "/{model_id}/asset-capabilities",
    summary="获取模型资产绑定能力",
    description="返回指定模型支持的资产类型和限制，用于前端动态显示资产绑定入口。",
)
async def get_model_asset_capabilities(
    model_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ...
```

**响应示例**：
```json
{
  "model": "doubao-seedance-2.0",
  "model_name": "Seedance 2.0",
  "category": "video",
  "asset_capabilities": {
    "reference_video": {
      "enabled": true,
      "max_count": 1,
      "supported_formats": ["mp4", "mov"],
      "notes": "支持参考视频动作迁移"
    },
    "reference_audio": {
      "enabled": true,
      "max_count": 1,
      "supported_formats": ["mp3", "wav"],
      "notes": "支持参考音频驱动"
    },
    "reference_image": {
      "enabled": true,
      "max_count": 7,
      "roles": ["character", "scene", "prop", "reference"]
    }
  }
}
```

**权限验证**：
- ✅ 查询模型是否存在且用户有权限
- ✅ 返回 404 如果模型不存在

### 1.3 单元测试

**文件**：`backend/tests/test_model_asset_capabilities.py`

**测试覆盖**：

#### 模型能力查询测试
- ✅ Seedance 2.0 完整能力
- ✅ 主体参考模型能力（不支持视频/音频）
- ✅ Kling 首尾帧能力（不支持视频/音频）

#### 资产绑定验证测试
- ✅ 有效绑定通过验证
- ✅ Attachments 格式解析
- ✅ 自动去重逻辑
- ✅ 不支持的资产类型拒绝
- ✅ 超出数量限制拒绝
- ✅ 混合格式合并
- ✅ 空绑定处理
- ✅ 仅 asset_id（无 URL）解析

#### 集成测试
- ✅ Seedance 2.0 真实场景
- ✅ 主体参考模型真实场景（拒绝视频）

**测试用例总数**：15 个
**测试结果**：`python3 -m pytest tests/test_model_asset_capabilities.py -v -rA` 全部通过（15 passed）

---

## 二、代码变更清单

### 2.1 新增文件
- ✅ `backend/tests/test_model_asset_capabilities.py` — 单元测试（15 个测试用例）

### 2.2 修改文件
- ✅ `backend/app/services/model_capabilities.py`
  - 新增 `get_model_asset_binding_capabilities()` 函数（约 60 行）
  - 新增 `validate_asset_bindings()` 函数（约 180 行）
  
- ✅ `backend/app/routers/models.py`
  - 导入 `get_model_asset_binding_capabilities`
  - 新增 `GET /api/models/{model_id}/asset-capabilities` 路由（约 40 行）

### 2.3 保留文件（未修改）
- ✅ `backend/app/routers/creation.py` — 视频生成路由（待 Phase 2 改造）
- ✅ `backend/app/services/video_gen.py` — 视频生成服务（待 Phase 2 改造）
- ✅ 所有其他现有代码保持不变

---

## 三、待完成工作（剩余真实联调）

### 3.1 API 接口测试（预计 15 分钟）

```bash
# 启动后端
./start.sh

# 测试接口（需先登录获取 token）
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/models/doubao-seedance-2.0/asset-capabilities

# 预期返回 JSON 包含 asset_capabilities 字段
```

### 3.2 真实场景验证重点

- 确认登录用户对目标模型有访问权限
- 确认响应中的 `asset_capabilities` 与当前模型能力表一致
- 确认前端联调时可据此动态展示素材入口和数量限制

---

## 四、接力指南

### 4.1 验证 Phase 1 完成度

```bash
# 1. 检查代码是否已提交
cd /Users/xingyi/Documents/222222/backend
git status

# 2. 运行测试
pytest tests/test_model_asset_capabilities.py -v

# 3. 启动后端测试接口
./start.sh
# 另一个终端：
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/models/doubao-seedance-2.0/asset-capabilities
```

### 4.2 Phase 2 工作计划

**任务**：Vidu 模型适配（首版已完成，剩真实联调）

**已完成文件**：
- `backend/app/services/video_gen.py`
  - 已新增 `_map_assets_to_model_params()` 函数
  - 已修改 `generate()` 方法，调用 `validate_asset_bindings()` 后统一做模型参数映射
  - 已补 Vidu / HappyHorse 参考图角色归一化，支持从统一 `attachments[]` 推导首帧、尾帧与参考图

- `backend/app/services/model_capabilities.py`
  - 已修改 `validate_video_request()`，支持基于 `attachments[]` 推断 `first_frame / start_end / multiframe` 所需的有效参考图字段

- `backend/tests/test_video_asset_mapping.py`
  - 已新增 Phase 2 映射测试，覆盖 Kling 首帧附件、Vidu 多帧起始图、Vidu 首尾帧回退映射、HappyHorse 图生视频回退映射

- `backend/app/routers/creation.py`
  - 已新增 `_validated_asset_bindings_to_attachments()`，把统一资产校验结果稳定转换为任务参数与回写元数据
  - 已让 `generate_creation_video()` 与 `_run_creation_video_task()` 优先使用 `validate_video_request()` 产出的标准化 `first_frame_url / last_frame_url / reference_video_url / reference_audio_url / attachments`
  - 已补镜头视频同步生成的元数据回写，创作视频列表可继续统一展示 `generation_mode / reference_mode / prompt_resolved / asset_bindings`

**当前结果**：
1. 已在 `video_gen.py` 中实现 `_map_assets_to_model_params()` 映射逻辑
2. 已修改 `generate()` 方法，在调用模型前先验证和映射资产
3. 已补统一资产绑定到 Vidu / Kling / HappyHorse 的关键回退逻辑
4. 已完成 `creation.py` 路由层与任务元数据收口，避免标准化资产结果在任务创建和回写阶段丢失
5. 已通过本地测试：`python3 -m pytest tests/test_model_asset_capabilities.py tests/test_video_asset_mapping.py tests/test_creation_video_asset_bindings.py -v -rA` → `21 passed`
6. 待你在真实环境继续验证 Vidu / Kling 的实际上游返回是否符合预期

### 4.3 关键架构点

**数据流**：
```
前端请求（attachments[]）
  ↓
creation.py 路由接收
  ↓
validate_asset_bindings() 验证 ✅ 已完成
  ↓
_map_assets_to_model_params() 映射 ✅ 已完成
  ↓
video_gen_service.generate()
  ↓
模型专属方法（_generate_vidu, _generate_seedance, ...）
```

**兼容性保证**：
- ✅ 旧格式参数继续生效（`reference_video_url` 等）
- ✅ 新格式优先级更高（`attachments[]`）
- ✅ Seedance 2.0 现有功能不受影响

---

## 五、风险提示

### 5.1 测试可能失败的原因

1. **模型配置不匹配**
   - 症状：测试断言 `assert caps["reference_video"]["enabled"] is True` 失败
   - 原因：实际 `MODEL_CAPABILITIES` 中该模型未配置视频能力
   - 解决：调整测试预期或补充模型配置

2. **导入路径问题**
   - 症状：`ImportError: cannot import name 'get_model_asset_binding_capabilities'`
   - 原因：代码未保存或缓存问题
   - 解决：重启 Python 环境，清除 `__pycache__`

3. **数据库查询失败**
   - 症状：API 接口返回 500 错误
   - 原因：测试用户没有该模型权限
   - 解决：先调用 `/api/models` 确认用户有哪些模型

### 5.2 接力注意事项

1. **不要删除现有代码**
   - `creation.py` 和 `video_gen.py` 保持原样
   - 只在 Phase 2 时按计划改造

2. **优先修复测试**
   - 如果测试失败，先修复测试再继续 Phase 2
   - 测试是最直接的功能验证手段

3. **保持文档更新**
   - 每完成一个 Phase 更新 `docs/plans/module-progress.md`
   - 重要决策记录到 `docs/decisions/`

---

## 六、成果验收标准

### Phase 1 完成标准
- [x] `get_model_asset_binding_capabilities()` 实现
- [x] `validate_asset_bindings()` 实现
- [x] `GET /api/models/{model_id}/asset-capabilities` 接口实现
- [x] 单元测试编写（15 个用例）
- [x] 单元测试通过
- [ ] API 接口测试通过（待手动验证）

### Phase 2 目标（接力任务）
- [x] 实现 `_map_assets_to_model_params()` 函数
- [x] Vidu 模型资产映射逻辑
- [x] 修改 `generate()` 方法集成验证
- [ ] Vidu 端到端测试通过

---

## 七、快速命令参考

```bash
# 运行测试
cd backend
pytest tests/test_model_asset_capabilities.py -v

# 测试单个用例
pytest tests/test_model_asset_capabilities.py::TestValidateAssetBindings::test_valid_seedance_bindings -v

# 启动后端
./start.sh

# 查看 API 文档
open http://localhost:8000/docs

# 测试新接口
curl -X GET "http://localhost:8000/api/models/doubao-seedance-2.0/asset-capabilities" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 八、相关文档

- **设计文档**：`docs/plans/video-model-asset-binding-universal.md`
- **Seedance 经验**：`docs/plans/seedance-2.0-integration-summary.md`
- **后端 API 文档**：`backend/BACKEND_API_DOC.md`
- **模型能力配置**：`backend/app/services/model_capabilities.py`

---

## 九、联系与问题

如有疑问，可查看：
1. 设计文档中的"架构设计"部分
2. 单元测试中的用例，了解预期行为
3. `model_capabilities.py` 中的注释和类型标注

**核心思路**：
- 前端统一使用 `attachments[]` 传递资产
- 后端通过 `validate_asset_bindings()` 验证能力
- 通过 `_map_assets_to_model_params()` 映射到模型专属参数（Phase 2）

---

**总结**：Phase 1 基础设施已完成代码收口，`get_model_asset_binding_capabilities()`、`validate_asset_bindings()`、模型资产能力查询接口、测试与文档均已更新到当前代码事实。当前仅剩真实登录态下的新接口联调验证，验证通过后即可无缝进入 Phase 2 的模型适配工作。
