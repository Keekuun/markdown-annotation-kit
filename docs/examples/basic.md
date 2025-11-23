# 基础示例

最简单的使用方式，组件内部管理状态。

```tsx
import { MarkdownAnnotator } from "markdown-annotation-kit";
import "markdown-annotation-kit/styles.css";

function BasicExample() {
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

## 说明

- 使用 `defaultValue` 设置初始 Markdown 内容
- 组件内部管理批注状态
- 适合快速原型开发

