# Miioo Design Skill 交接文档

## 项目背景
影视AI工作流产品，面向C端和B端用户。
技术栈：React + Tailwind CSS v4 + Vite。
仅深色主题，无浅色皮肤切换。

---

## 文件结构

```
src/
  index.css                   ← 所有 token 的 CSS 变量定义

design-system/
  tokens.md                   ← Token 完整说明，AI 调用必读
  motion.md                   ← 待完成
  patterns.md                 ← 待完成
  components/
    button.md                 ← 已完成
    input.md                  ← 已完成
    tag.md                    ← 已完成
    form.md                   ← 已完成
    modal.md                  ← 已完成
    select.md                 ← 已完成
    toast-notification.md     ← 已完成
    tooltip.md                ← 已完成
    checkbox-radio.md         ← 已完成
    tab.md                    ← 已完成
```

---

## 开始工作前必读

1. 先读 `design-system/tokens.md`，了解所有可用的 Tailwind 类名和 token 含义
2. 如需参考已有组件的写法规范，读对应的组件文档
3. 如需新增或修改 token，需同步更新 `src/index.css` 和 `tokens.md`

---

## 组件文档写作规范

每个组件文档包含：组件概述、尺寸规范、状态说明、代码示例、使用禁忌。
代码示例必须使用 `tokens.md` 中定义的 Tailwind 类名，不可使用硬编码色值。
字体统一使用：`'AlibabaPuHuiTi 2_55 Regular','Alibaba PuHuiTi 2.0',system-ui,sans-serif`

---

## 进度

### Design System 文档
- [x] tokens.md
- [ ] motion.md
- [ ] patterns.md

### 组件文档
- [x] Button 按钮（Accent / Primary / Secondary / Danger，大小两种尺寸）
- [x] Input 输入框（单行 / 多行 / 小尺寸，五种状态）
- [x] Tag 标签（Scene / Character / Prop，纯展示）
- [x] Form 表单布局（label + 输入框上下结构，字段间距规范）
- [x] Modal 弹窗（大/小两种宽度，Header + Body + Footer 结构）
- [x] Select 选择器（Input触发型 / 自由触发型，含分组和图标规则）
- [x] Toast & Notification 提示（自动消失轻提示 / 需手动关闭通知）
- [x] Tooltip 提示气泡
- [x] Checkbox & Radio 复选框和单选框
- [x] Tab 标签页
- [ ] Navigation 导航
