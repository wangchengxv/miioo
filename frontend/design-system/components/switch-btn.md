# Switch Button 开关按钮

> 参考 `design-system/tokens.md` 获取已存在 token。当前开关按钮没有单独 token 分组，样式基于现有语义 token 组合实现。
> 字体：`AlibabaPuHuiTi 2_55 Regular` / `Alibaba PuHuiTi 2.0` / `system-ui` / `sans-serif`。

---

## 一、组件概述

Switch Button 用于在两个明确状态之间切换，当前仅用于 API 服务商配置卡片、模型卡片这类即时开关场景。

| 属性 | 值 |
|---|---|
| 宽度 | 56px（`w-14`） |
| 高度 | 24px（由 `size-4` + `p-[4px]` 组成） |
| 圆角 | `rounded-full` |
| 内边距 | 4px（`p-[4px]`） |
| 指示器尺寸 | 16x16（`size-4`） |
| 字号 | 12px（`text-xs/4`） |

---

## 二、状态规范

### 2.1 开启 On

- 容器：`bg-surface-toolbar` + `shadow-[inset_0px_0px_0px_1px_var(--color-white-8)]`
- 文字：`text-status-success`
- 指示器：`bg-status-success` + `border border-stroke-accent`
- 布局：`justify-between` + `gap-[2px]`

### 2.2 关闭 Off

- 容器：`bg-surface-toolbar` + `shadow-[inset_0px_0px_0px_1px_var(--color-white-8)]`
- 文字：`text-text-hint`
- 指示器：`bg-white-8`
- 布局：`gap-[0px]`

> 默认文案为 "开启 / 关闭"。如模型启用场景，可只覆写开启态文案为 "启用"。

---

## 三、代码示例

```jsx
function SwitchBtn({ on, onClick, onLabel = '开启', offLabel = '关闭' }) {
  if (on) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-14 shrink-0 items-center justify-between gap-[2px] rounded-full bg-surface-toolbar p-[4px] shadow-[inset_0px_0px_0px_1px_var(--color-white-8)]"
      >
        <div
          className="flex-1 text-center text-xs/4 text-status-success"
          style={{ fontFamily: "'AlibabaPuHuiTi_2_55_Regular','Alibaba_PuHuiTi_2.0',system-ui,sans-serif" }}
        >
          {onLabel}
        </div>
        <div className="size-4 shrink-0 rounded-full border border-solid border-stroke-accent bg-status-success [outline:1px_solid_var(--color-stroke-outline)]" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-14 shrink-0 items-center gap-[0px] rounded-full bg-surface-toolbar p-[4px] shadow-[inset_0px_0px_0px_1px_var(--color-white-8)]"
    >
      <div className="size-4 shrink-0 rounded-full bg-white-8" />
      <div
        className="flex-1 text-center text-xs/4 text-text-hint"
        style={{ fontFamily: "'AlibabaPuHuiTi_2_55_Regular','Alibaba_PuHuiTi_2.0',system-ui,sans-serif" }}
      >
        {offLabel}
      </div>
    </button>
  );
}
```

---

## 四、使用禁忌

- 只用于二元开关，不用于多选
- 同一行内不要混用不同宽度的开关
- 文案保持简短，建议 2 个字以内
- 危险操作不要直接用开关，改用确认按钮或确认弹窗
