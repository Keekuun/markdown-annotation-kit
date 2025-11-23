# 自定义样式示例

通过 CSS 变量和类名自定义样式。

```tsx
import { MarkdownAnnotator } from "markdown-annotation-kit";
import "markdown-annotation-kit/styles.css";
import "./custom-styles.css";

function CustomStyleExample() {
  const markdown = `# 文档标题

这是一段可以批注的文本内容。`;

  return (
    <div style={{ height: "100vh" }}>
      <MarkdownAnnotator defaultValue={markdown} className="my-annotator" />
    </div>
  );
}
```

```css
/* custom-styles.css */
.my-annotator {
  --markdown-annotator-primary: #ff6b6b;
  --markdown-annotator-primary-hover: #ee5a5a;
}

.my-annotator .annotation-highlight {
  background-color: rgba(255, 107, 107, 0.1);
}
```

## 说明

- 使用 CSS 变量覆盖主题颜色
- 使用 `className` 添加自定义类名
- 通过 CSS 覆盖默认样式

