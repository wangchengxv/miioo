# Phase 1 交接清单（快速版）

## ✅ 已完成

### 1. 核心功能实现
- ✅ `backend/app/services/model_capabilities.py`
  - `get_model_asset_binding_capabilities()` - 查询模型资产能力
  - `validate_asset_bindings()` - 验证资产绑定合法性
  
- ✅ `backend/app/routers/models.py`
  - `GET /api/models/{model_id}/asset-capabilities` - 新接口

- ✅ `backend/tests/test_model_asset_capabilities.py`
  - 17 个单元测试用例

### 2. 文档输出
- ✅ `docs/plans/seedance-2.0-integration-summary.md` - Seedance 经验总结
- ✅ `docs/plans/video-model-asset-binding-universal.md` - 通用化设计方案
- ✅ `docs/plans/phase1-handover.md` - 详细交接文档（本文档）

### 3. 隧道服务
- ✅ 部署 Localtunnel: `https://pink-signs-shake.loca.lt`
- ✅ 更新 `.env`: `PUBLIC_BASE_URL=https://pink-signs-shake.loca.lt`
- ✅ 后台运行中（任务 ID: bfwtye98m）

---

## ⏳ 待完成（20%）

### 立即任务（1 小时内）
```bash
# 1. 运行测试验证
cd backend
pytest tests/test_model_asset_capabilities.py -v

# 2. 测试 API 接口
./start.sh
# 另一终端：
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/models/doubao-seedance-2.0/asset-capabilities

# 3. 如有失败，根据实际情况调整测试
```

---

## 🚀 Phase 2 启动指南

### 关键文件位置
```
backend/app/services/video_gen.py       # 需要改造
backend/app/routers/creation.py         # 需要调用 validate_asset_bindings
backend/app/services/model_capabilities.py  # 已完成，Phase 2 直接使用
```

### Phase 2 核心任务
1. 实现 `_map_assets_to_model_params(model, validated_assets)` 函数
2. 修改 `video_gen_service.generate()` 调用验证和映射
3. 测试 Vidu/Kling 模型的图片参考能力

### 示例代码骨架
```python
# video_gen.py 需要添加

def _map_assets_to_model_params(self, model: str, validated_assets: dict) -> dict:
    """将统一资产格式映射到模型专属参数"""
    video_refs = validated_assets["video_refs"]
    audio_refs = validated_assets["audio_refs"]
    image_refs = validated_assets["image_refs"]
    
    if self._is_seedance_model(model):
        return {
            "reference_video_url": video_refs[0]["url"] if video_refs else None,
            "reference_audio_url": audio_refs[0]["url"] if audio_refs else None,
            # ...
        }
    elif self._is_vidu_model(model):
        return {
            "subjects": [{"name": img["role"], "images": [img["url"]]} for img in image_refs],
        }
    # ... 其他模型
```

---

## 📋 验收标准

### Phase 1（当前）
- [x] 代码实现
- [ ] 测试通过
- [ ] API 可用

### Phase 2（接力）
- [ ] 模型参数映射实现
- [ ] Vidu 端到端测试
- [ ] Kling/Runway 测试

---

## 🔗 文档索引

| 文档 | 路径 | 用途 |
|-----|------|------|
| 详细交接 | `docs/plans/phase1-handover.md` | 完整设计和风险 |
| 设计方案 | `docs/plans/video-model-asset-binding-universal.md` | 架构设计 |
| Seedance 经验 | `docs/plans/seedance-2.0-integration-summary.md` | 参考实现 |

---

## ⚠️ 重要提醒

1. **不要删除现有代码** - `creation.py` 和 `video_gen.py` 保持原样，Phase 2 再改
2. **优先修复测试** - 如果测试失败，先调整再继续
3. **隧道需持续运行** - 停止后重新启动会分配新域名，需更新 `.env`

---

## 💡 快速命令

```bash
# 测试
pytest tests/test_model_asset_capabilities.py -v

# 启动
cd backend && ./start.sh

# 查看隧道状态
cat /private/tmp/claude-501/-Users-xingyi-Documents-222222/*/tasks/bfwtye98m.output
```

---

**当前状态**：Phase 1 核心功能已完成，待运行验证。接力人员可直接进入 Phase 2 适配工作。
