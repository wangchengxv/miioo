# Tab 标签页组件

> 参考 `design-system/tokens.md` 获取所有 token 的完整定义和色值。
> 字体：`AlibabaPuHuiTi 2_55 Regular` / `Alibaba PuHuiTi 2.0` / `system-ui` / `sans-serif`。

---

## 一、组件概述

Tab 用于在同一区域内切换不同内容视图，目前只有一种样式：文字 + 下划线激活指示器。

---

## 二、规范

| 属性 | 值 |
|---|---|
| 字号 | `font-size-14` |
| Tab 间距 | `gap-[24px]`（24px）|
| 激活态字重 | `font-weight-medium` |
| 普通态字重 | `font-weight-regular` |
| 激活指示器 | 下划线，高度 `h-0.5`，宽度与文字等宽，颜色 `text-text-primary`（白色） |
| 激活态文字色 | `text-text-primary` |
| 悬停态文字色 | `text-text-primary` |
| 普通态文字色 | `text-text-secondary` |

---

## 三、代码示例

```jsx
import { useState } from "react";

const FONT = "'AlibabaPuHuiTi 2_55 Regular','Alibaba PuHuiTi 2.0',system-ui,sans-serif";

function TabItem({ label, active, onClick }) {
  return (
    <div
      className="flex flex-col items-center gap-[4px] cursor-pointer"
      onClick={onClick}
    >
      <span
        className={`text-font-size-14 ${
          active
            ? "text-text-primary font-font-weight-medium"
            : "text-text-secondary font-font-weight-regular hover:text-text-primary"
        }`}
        style={{ fontFamily: FONT }}
      >
        {label}
      </span>
      {/* 激活指示器 */}
      {active && (
        <div className="h-0.5 bg-text-primary rounded-full self-stretch" />
      )}
    </div>
  );
}

function Tabs({ tabs, defaultIndex = 0 }) {
  const [active, setActive] = useState(defaultIndex);

  return (
    <div className="flex flex-col gap-0">
      {/* Tab 列表 */}
      <div className="flex items-start gap-[24px]">
        {tabs.map((tab, index) => (
          <TabItem
            key={index}
            label={tab.label}
            active={active === index}
            onClick={() => setActive(index)}
          />
        ))}
      </div>
      {/* 内容区 */}
      <div className="mt-[16px]">
        {tabs[active]?.content}
      </div>
    </div>
  );
}

/* 使用示例 */
export default function TabDemo() {
  return (
    <div className="p-[32px] bg-surface-content-area">
      <Tabs
        tabs={[
          { label: "active", content: <div className="text-text-primary">第一页内容</div> },
          { label: "hover", content: <div className="text-text-primary">第二页内容</div> },
          { label: "normal", content: <div className="text-text-primary">第三页内容</div> },
        ]}
      />
    </div>
  );
}
```

---

## 四、使用禁忌

- Tab 数量建议不超过 5 个，过多时考虑用 Select 下拉替代
- Tab 文字保持简短，建议不超过 6 个字
- 不可在 Tab 内嵌套 Tab
