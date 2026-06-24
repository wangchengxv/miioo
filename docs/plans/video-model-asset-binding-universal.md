# 视频模型数字资产绑定通用化方案

**日期**：2026-06-11  
**状态**：设计中  
**目标**：在不破坏 Seedance 2.0 现有能力的前提下，为其他视频模型扩展数字资产绑定能力

---

## 一、当前架构分析

### 1.1 Seedance 2.0 数字资产绑定现状

**支持的资产类型**：
- `reference_video_url` — 参考视频（动作迁移）
- `reference_audio_url` — 参考音频（音频驱动）
- `first_frame_url` / `last_frame_url` — 首尾帧图片
- `attachments[]` — 通用资产绑定数组（支持图片/视频/音频）
- `subjects[]` — 主体参考（多张图片）
- `multiframe_segments[]` — 多帧分段控制

**数据流**：
```
前端请求
  ↓ reference_video_url (公网 HTTPS URL)
后端路由 (creation.py)
  ↓ 透传给 video_gen_service
video_gen_service.generate()
  ↓ _prepare_seedance_reference_media_url() 处理
OneLink AI
  ↓ 下载参考资产并生成
返回结果
```

**关键特性**：
- ✅ 前端负责拼接完整公网 URL
- ✅ 后端透传，不做 URL 重写
- ✅ 支持 `asset_id` 到 `url` 的自动解析（`reference_video_asset_id` → `reference_video_url`）
- ✅ Seedance 专属处理：`_prepare_seedance_reference_media_url()` 会将本地 URL 转为公网可访问地址

### 1.2 其他视频模型现状

根据代码分析，当前支持的视频模型包括：

| 模型系列 | 模型 ID 示例 | 当前资产绑定能力 |
|---------|------------|----------------|
| **Seedance** | `doubao-seedance-2.0` | ✅ 完整支持（视频/音频/图片） |
| **Vidu** | `vidu-1.0`, `vidu-1.5` | ⚠️ 仅支持图片参考（`subjects[]`, `multiframe_segments[]`） |
| **Kling** | `kling-v1`, `kling-v1-pro` | ⚠️ 仅支持图片参考（`first_frame_url`, `last_frame_url`） |
| **Runway** | `runway-gen3` | ⚠️ 仅支持图片参考（`image_url`） |
| **Luma** | `luma-dream-machine` | ⚠️ 仅支持图片参考 |
| **Pika** | `pika-1.0` | ⚠️ 仅支持图片参考 |
| **Veo** | `veo-2` | ⚠️ 需确认能力（代码中有 `_generate_veo` 方法） |
| **FAL (Stable Video, Wan FLF2V, Kling)** | `fal-*` | ⚠️ 通过 FAL 代理，能力需单独确认 |

---

## 二、通用化需求分析

### 2.1 业务需求

1. **用户期望**：在创作页选择任意视频模型时，都能绑定数字资产（如角色参考视频、场景参考音频）
2. **产品一致性**：不同模型的资产绑定入口应保持 UI 一致，降低学习成本
3. **能力差异透明化**：当某个模型不支持某类资产时，前端需明确提示

### 2.2 技术约束

1. **上游模型能力不同**：
   - Seedance 支持视频/音频参考
   - Vidu 主要支持多主体图片参考
   - Kling/Runway/Luma 主要支持单张或首尾帧图片
   - 不是所有模型都支持参考视频

2. **参数映射差异**：
   - Seedance 使用 `reference_video_url`
   - Vidu 使用 `subjects[].images[]`
   - Kling 使用 `first_frame_url` / `last_frame_url`
   - 需要模型适配层统一映射

3. **媒体处理差异**：
   - Seedance 需要公网 URL（通过 `_prepare_seedance_reference_media_url` 处理）
   - 其他模型可能支持 data URI（图片 base64）
   - 视频/音频需要特殊处理（大文件、格式转换）

---

## 三、通用化架构设计

### 3.1 设计原则

1. **向下兼容**：Seedance 2.0 现有能力不受影响
2. **能力发现**：通过模型配置声明各模型支持的资产类型
3. **统一接口**：前端使用统一的 `attachments[]` 数组传递资产，后端按模型映射到不同参数
4. **渐进增强**：优先支持图片参考（大部分模型都支持），逐步扩展视频/音频

### 3.2 数据模型设计

#### 3.2.1 前端统一请求格式（已有）

```typescript
// 前端已有的统一格式
interface CreationVideoGenerateRequest {
  prompt: string;
  model: string;
  
  // 统一资产绑定入口（优先使用）
  attachments?: CreationAssetBinding[];
  
  // 兼容旧格式（Seedance 专用，保持向下兼容）
  reference_video_url?: string;
  reference_audio_url?: string;
  first_frame_url?: string;
  last_frame_url?: string;
  
  // 资产 ID 自动解析（推荐使用）
  reference_video_asset_id?: string;
  reference_audio_asset_id?: string;
  first_frame_asset_id?: string;
  last_frame_asset_id?: string;
  reference_image_asset_ids?: string[];
}

interface CreationAssetBinding {
  asset_id?: string;          // 资产 ID（后端自动解析为 URL）
  asset_type: "image" | "video" | "audio";
  url?: string;               // 直接传递 URL（已拼接 PUBLIC_BASE_URL）
  role?: string;              // 资产角色：character、scene、prop、reference、motion
  source?: string;            // 来源标识
}
```

#### 3.2.2 模型能力配置

**新增数据库字段**：`model_config.metadata_json`

```json
{
  "asset_capabilities": {
    "reference_video": {
      "enabled": true,
      "max_count": 1,
      "max_duration_seconds": 10,
      "supported_formats": ["mp4", "mov"],
      "notes": "支持动作迁移"
    },
    "reference_audio": {
      "enabled": true,
      "max_count": 1,
      "max_duration_seconds": 30,
      "supported_formats": ["mp3", "wav"],
      "notes": "支持音频驱动"
    },
    "reference_image": {
      "enabled": true,
      "max_count": 7,
      "roles": ["character", "scene", "prop"],
      "notes": "支持主体参考和多帧控制"
    },
    "first_last_frame": {
      "enabled": true,
      "notes": "支持首尾帧控制"
    }
  }
}
```

**预置配置示例**：

```python
# backend/app/services/model_capabilities.py

MODEL_ASSET_CAPABILITIES = {
    "doubao-seedance-2.0": {
        "reference_video": {"enabled": True, "max_count": 1},
        "reference_audio": {"enabled": True, "max_count": 1},
        "reference_image": {"enabled": True, "max_count": 7},
        "first_last_frame": {"enabled": True},
    },
    "vidu-1.5": {
        "reference_video": {"enabled": False},
        "reference_audio": {"enabled": False},
        "reference_image": {"enabled": True, "max_count": 7, "roles": ["character"]},
        "first_last_frame": {"enabled": False},
    },
    "kling-v1-pro": {
        "reference_video": {"enabled": False},
        "reference_audio": {"enabled": False},
        "reference_image": {"enabled": True, "max_count": 2},
        "first_last_frame": {"enabled": True},
    },
    "runway-gen3": {
        "reference_video": {"enabled": False},
        "reference_audio": {"enabled": False},
        "reference_image": {"enabled": True, "max_count": 1},
        "first_last_frame": {"enabled": False},
    },
}
```

### 3.3 后端处理流程

#### 3.3.1 参数验证与能力检查

```python
# backend/app/services/model_capabilities.py

def get_model_asset_capabilities(model: str) -> dict:
    """获取模型的资产绑定能力"""
    return MODEL_ASSET_CAPABILITIES.get(model, {})

def validate_asset_bindings(
    model: str,
    attachments: list[dict],
    reference_video_url: str | None,
    reference_audio_url: str | None,
    first_frame_url: str | None,
    last_frame_url: str | None,
) -> dict:
    """
    验证资产绑定是否符合模型能力
    返回标准化的资产绑定结构
    """
    capabilities = get_model_asset_capabilities(model)
    
    # 统计各类资产数量
    video_refs = []
    audio_refs = []
    image_refs = []
    
    # 兼容旧格式
    if reference_video_url:
        video_refs.append({"url": reference_video_url, "role": "reference"})
    if reference_audio_url:
        audio_refs.append({"url": reference_audio_url, "role": "reference"})
    if first_frame_url:
        image_refs.append({"url": first_frame_url, "role": "first_frame"})
    if last_frame_url:
        image_refs.append({"url": last_frame_url, "role": "last_frame"})
    
    # 解析 attachments
    for att in attachments or []:
        if att["asset_type"] == "video":
            video_refs.append(att)
        elif att["asset_type"] == "audio":
            audio_refs.append(att)
        elif att["asset_type"] == "image":
            image_refs.append(att)
    
    # 能力校验
    if video_refs and not capabilities.get("reference_video", {}).get("enabled"):
        raise ValueError(f"模型 {model} 不支持参考视频")
    if audio_refs and not capabilities.get("reference_audio", {}).get("enabled"):
        raise ValueError(f"模型 {model} 不支持参考音频")
    
    video_cap = capabilities.get("reference_video", {})
    if len(video_refs) > video_cap.get("max_count", 0):
        raise ValueError(f"模型 {model} 最多支持 {video_cap['max_count']} 个参考视频")
    
    return {
        "video_refs": video_refs,
        "audio_refs": audio_refs,
        "image_refs": image_refs,
    }
```

#### 3.3.2 模型适配层

```python
# backend/app/services/video_gen.py

class VideoGenService:
    
    def _map_assets_to_model_params(
        self,
        model: str,
        validated_assets: dict,
    ) -> dict:
        """
        将统一的资产绑定映射到模型专属参数
        """
        video_refs = validated_assets["video_refs"]
        audio_refs = validated_assets["audio_refs"]
        image_refs = validated_assets["image_refs"]
        
        if self._is_seedance_model(model):
            # Seedance: 直接映射
            return {
                "reference_video_url": video_refs[0]["url"] if video_refs else None,
                "reference_audio_url": audio_refs[0]["url"] if audio_refs else None,
                "first_frame_url": next((img["url"] for img in image_refs if img.get("role") == "first_frame"), None),
                "last_frame_url": next((img["url"] for img in image_refs if img.get("role") == "last_frame"), None),
                "attachments": video_refs + audio_refs + image_refs,
            }
        
        elif self._is_vidu_model(model):
            # Vidu: 图片资产映射到 subjects
            subjects = []
            for img in image_refs:
                role = img.get("role", "character")
                subjects.append({
                    "name": role,
                    "images": [img["url"]],
                })
            return {
                "subjects": subjects,
            }
        
        elif self._is_kling_model(model):
            # Kling: 首尾帧映射
            first_frame = next((img["url"] for img in image_refs if img.get("role") == "first_frame"), None)
            last_frame = next((img["url"] for img in image_refs if img.get("role") == "last_frame"), None)
            # 如果没有明确角色，取前两张
            if not first_frame and image_refs:
                first_frame = image_refs[0]["url"]
            if not last_frame and len(image_refs) > 1:
                last_frame = image_refs[1]["url"]
            return {
                "first_frame_url": first_frame,
                "last_frame_url": last_frame,
            }
        
        elif self._is_runway_model(model):
            # Runway: 单张参考图
            return {
                "image_url": image_refs[0]["url"] if image_refs else None,
            }
        
        else:
            # 默认：尝试通用参数
            return {
                "reference_video_url": video_refs[0]["url"] if video_refs else None,
                "reference_audio_url": audio_refs[0]["url"] if audio_refs else None,
                "image_url": image_refs[0]["url"] if image_refs else None,
            }
```

#### 3.3.3 修改 `generate()` 方法

```python
async def generate(
    self,
    prompt: str,
    api_key: str,
    base_url: str = "https://api.onelinkai.cloud",
    model: str = "doubao-seedance-2.0",
    # ... 其他参数保持不变 ...
    
    # 新增：统一资产绑定入口
    attachments: list[dict] | None = None,
    
    # 保留：向下兼容 Seedance 专用参数
    reference_video_url: str | None = None,
    reference_audio_url: str | None = None,
    first_frame_url: str | None = None,
    last_frame_url: str | None = None,
    # ...
) -> dict:
    # 1. 验证与标准化资产绑定
    validated_assets = validate_asset_bindings(
        model=model,
        attachments=attachments,
        reference_video_url=reference_video_url,
        reference_audio_url=reference_audio_url,
        first_frame_url=first_frame_url,
        last_frame_url=last_frame_url,
    )
    
    # 2. 映射到模型专属参数
    model_params = self._map_assets_to_model_params(model, validated_assets)
    
    # 3. 根据模型调用对应生成方法
    if self._is_seedance_model(model):
        return await self._generate_seedance(
            prompt=prompt,
            api_key=api_key,
            base_url=base_url,
            model=model,
            **model_params,  # 使用映射后的参数
            # ... 其他参数 ...
        )
    elif self._is_vidu_model(model):
        return await self._generate_vidu(
            prompt=prompt,
            api_key=api_key,
            base_url=base_url,
            model=model,
            **model_params,
            # ...
        )
    # ... 其他模型 ...
```

---

## 四、前端改造方案

### 4.1 能力发现接口

**新增接口**：`GET /api/models/{model_id}/asset-capabilities`

```python
@router.get(
    "/models/{model_id}/asset-capabilities",
    summary="获取模型资产绑定能力",
    description="返回指定模型支持的资产类型和限制。",
)
async def get_model_asset_capabilities(
    model_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    model = await resolve_user_model(
        db=db,
        user_id=user.id,
        category="video",
        requested_model=model_id,
        fallback_model=model_id,
    )
    capabilities = get_model_asset_capabilities(model)
    return {
        "model": model,
        "asset_capabilities": capabilities,
    }
```

### 4.2 前端 UI 适配

```typescript
// frontend/src/components/VideoGeneration/AssetBindingPanel.tsx

interface AssetCapabilities {
  reference_video?: { enabled: boolean; max_count: number };
  reference_audio?: { enabled: boolean; max_count: number };
  reference_image?: { enabled: boolean; max_count: number; roles?: string[] };
  first_last_frame?: { enabled: boolean };
}

function AssetBindingPanel({ model }: { model: string }) {
  const [capabilities, setCapabilities] = useState<AssetCapabilities | null>(null);
  
  useEffect(() => {
    // 获取模型能力
    fetch(`/api/models/${model}/asset-capabilities`)
      .then(res => res.json())
      .then(data => setCapabilities(data.asset_capabilities));
  }, [model]);
  
  return (
    <div>
      {capabilities?.reference_video?.enabled && (
        <AssetUploader
          type="video"
          label="参考视频"
          maxCount={capabilities.reference_video.max_count}
          onUpload={(asset) => addAttachment({ asset_id: asset.id, asset_type: "video", role: "reference" })}
        />
      )}
      
      {capabilities?.reference_audio?.enabled && (
        <AssetUploader
          type="audio"
          label="参考音频"
          maxCount={capabilities.reference_audio.max_count}
          onUpload={(asset) => addAttachment({ asset_id: asset.id, asset_type: "audio", role: "reference" })}
        />
      )}
      
      {capabilities?.reference_image?.enabled && (
        <AssetUploader
          type="image"
          label="参考图片"
          maxCount={capabilities.reference_image.max_count}
          onUpload={(asset) => addAttachment({ asset_id: asset.id, asset_type: "image", role: "character" })}
        />
      )}
      
      {!capabilities && <Skeleton />}
    </div>
  );
}
```

---

## 五、实施路线图

### Phase 1：基础设施（1-2 天）
- [ ] 新增模型能力配置系统（`model_capabilities.py`）
- [ ] 实现 `validate_asset_bindings()` 验证函数
- [ ] 新增 `/api/models/{model_id}/asset-capabilities` 接口
- [ ] 编写单元测试

### Phase 2：Vidu 模型适配（1 天）
- [ ] 实现 Vidu 资产映射逻辑（`_map_assets_to_model_params`）
- [ ] 修改 `_generate_vidu()` 支持统一资产绑定
- [ ] 测试 Vidu 多主体图片参考

### Phase 3：Kling/Runway 模型适配（1 天）
- [ ] 实现 Kling 首尾帧映射
- [ ] 实现 Runway 单图参考映射
- [ ] 测试各模型图片参考能力

### Phase 4：前端改造（2 天）
- [ ] 实现前端能力发现逻辑
- [ ] 改造 `AssetBindingPanel` 组件
- [ ] 更新创作页 UI，支持动态显示/隐藏资产绑定入口
- [ ] 前后端联调

### Phase 5：文档与监控（1 天）
- [ ] 更新 `backend/BACKEND_API_DOC.md`
- [ ] 更新 `frontend/PROJECT.md`
- [ ] 新增模型能力对照表文档
- [ ] 添加资产绑定失败监控告警

---

## 六、风险与缓解

### 风险 1：上游模型能力变化
**影响**：OneLink AI 更新模型能力后，本地配置可能过期  
**缓解**：
- 定期同步 OneLink AI 官方文档
- 添加降级逻辑：能力不匹配时回退到基础参数
- 错误信息中提示用户"模型能力已更新，请联系管理员"

### 风险 2：参数映射错误
**影响**：资产绑定后生成失败  
**缓解**：
- 每个模型独立测试用例
- 生成失败时记录完整请求参数到日志
- 添加参数映射 dry-run 模式（仅验证不实际生成）

### 风险 3：Seedance 能力回退
**影响**：改造过程中破坏 Seedance 2.0 现有功能  
**缓解**：
- 优先保留旧参数格式（`reference_video_url` 等）
- 新逻辑通过 `attachments` 入口，与旧逻辑并行
- 部署前回归测试 Seedance 所有已有场景

---

## 七、兼容性保证

### 7.1 后端兼容性

```python
# 兼容矩阵

# ✅ 旧前端 + 新后端
# 旧前端继续传递 reference_video_url，新后端通过 validate_asset_bindings 兼容

# ✅ 新前端 + 新后端
# 新前端传递 attachments[]，新后端优先解析 attachments

# ✅ Seedance 2.0 不受影响
# Seedance 专属逻辑保持不变，仅在 _map_assets_to_model_params 中统一处理
```

### 7.2 数据库兼容性

**不需要迁移**：
- 现有 `Asset` 表无需修改
- `model_config.metadata_json` 是 JSON 字段，直接扩展

**渐进式配置**：
- 未配置能力的模型使用默认值（基础图片参考）
- 管理员可通过后台逐步补充各模型能力配置

---

## 八、成功标准

### 功能标准
- [x] Seedance 2.0 现有能力不受影响（回归测试通过）
- [ ] Vidu 支持多主体图片参考绑定
- [ ] Kling 支持首尾帧图片绑定
- [ ] Runway 支持单张图片参考绑定
- [ ] 前端能根据模型动态显示/隐藏资产绑定入口

### 性能标准
- 资产绑定验证延迟 < 100ms
- 模型能力查询支持缓存（Redis）

### 用户体验标准
- 用户切换模型时，UI 自动调整可用资产类型
- 不支持的资产类型明确禁用并提示原因
- 资产绑定失败时给出清晰错误提示（如"该模型不支持参考视频"）

---

## 九、后续优化方向

1. **能力自动发现**：定期爬取 OneLink AI 文档，自动更新模型能力配置
2. **智能资产推荐**：根据 prompt 内容推荐合适的参考资产
3. **资产预处理**：自动裁剪/压缩/格式转换，提升上游接受率
4. **多模型组合**：先用 Seedance 提取动作，再用 Vidu 换主体
5. **资产复用优化**：相同资产多次使用时，后端缓存上传结果

---

## 十、相关文档

- **Seedance 2.0 集成总结**：`docs/plans/seedance-2.0-integration-summary.md`
- **后端 API 文档**：`backend/BACKEND_API_DOC.md`
- **模型能力参考**：`backend/app/services/model_capabilities.py`
- **前端项目文档**：`frontend/PROJECT.md`

---

**总结**：通过"能力配置 + 统一接口 + 模型适配层"的三层架构，可以在保持 Seedance 2.0 完整能力的前提下，为其他视频模型扩展数字资产绑定能力。核心思路是"前端统一、后端适配、能力透明"，让用户无感知地享受不同模型的资产绑定能力。
