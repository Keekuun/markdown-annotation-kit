# 快速开始

## 基础使用

最简单的使用方式，组件内部管理状态：

```tsx
import { MarkdownAnnotator } from "markdown-annotation-kit";
import "markdown-annotation-kit/styles.css";

function App() {
  const markdown = `# 文档标题

这是一段可以批注的文本内容。

## 功能特性

- 支持文本选择
- 支持批注创建
- 支持双向锚定`;

  return (
    <div style={{ height: "100vh" }}>
      <MarkdownAnnotator defaultValue={markdown} />
    </div>
  );
}
```

## 使用步骤

1. **导入组件和样式**

```tsx
import { MarkdownAnnotator } from "markdown-annotation-kit";
import "markdown-annotation-kit/styles.css";
```

2. **准备 Markdown 内容**

```tsx
const markdown = `# 标题

这是内容。`;
```

3. **渲染组件**

```tsx
<MarkdownAnnotator defaultValue={markdown} />
```

## 添加批注

1. 在 Markdown 渲染区域选择文本
2. 选择完成后，在选区上方弹出输入框
3. 输入批注内容
4. 点击"确认"按钮

批注会自动保存，并在侧边栏显示。

## 查看批注

- 点击原文中的高亮文本，可以跳转到对应的批注卡片
- 点击侧边栏中的批注卡片，可以跳转到对应的文本位置

## 立即体验

想要立即体验组件功能？查看 [交互式演示](/examples/) 直接在文档中尝试标注功能！

<InteractiveDemo />

## 下一步

- 查看 [API 文档](/api/) 了解所有可用属性
- 查看 [示例](/examples/) 了解更多使用场景
- 查看 [指南](/guide/) 了解高级用法

