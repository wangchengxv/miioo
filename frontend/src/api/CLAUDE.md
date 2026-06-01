# API 开发规范

## 基本规则
- 所有数据交互封装在 `src/api/` 对应模块，页面/组件禁止直接写 fetch
- 需要登录态的接口统一用 `authFetch` / `authFetchForm`（从 `request.js` 引入），不得自行拼装 header

## Mock 开关模板
```js
export async function apiXxx(params) {
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return { ... }
  }
  return authFetch(`${import.meta.env.VITE_API_BASE_URL}/api/xxx`, {
    method: 'POST',
    body: JSON.stringify(params),
  })
}
```
- `VITE_USE_MOCK=true` 返回假数据，`false` 调真实接口
- 环境变量在 `.env.local`，不得提交 Git

## 数据读写检查清单
涉及以下场景时，**先找 Suzy 确认接口字段，再动手**：
1. 表单提交 / 确认操作 — 是否需要 POST / PATCH？
2. 页面初始化 — 是否需要 GET 替换硬编码数组？
3. 删除操作 — 是否需要 DELETE？
4. 文件上传 — `createObjectURL` 仅本地预览，是否需要 POST /upload？
5. AI 生成 — 是否需要 POST /generate？
6. 模拟逻辑 — `Math.random()`、`Date.now()` 作为 ID，是否需要替换？

## 待修复清单
详见 `API_AUDIT.md`，按 P0 → P1 → P2 → P3 修复，每条前找 Suzy 确认。
