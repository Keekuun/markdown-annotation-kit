# 受控模式示例

使用受控模式，完全控制组件状态。

```tsx
import { useState } from "react";
import { MarkdownAnnotator, AnnotationItem } from "markdown-annotation-kit";
import "markdown-annotation-kit/styles.css";

function ControlledExample() {
  const [markdown, setMarkdown] = useState(`# 文档标题

这是一段可以批注的文本内容。`);

  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);

  return (
    <div style={{ height: "100vh" }}>
      <MarkdownAnnotator
        value={markdown}
        onChange={setMarkdown}
        annotations={annotations}
        onAnnotationsChange={setAnnotations}
      />
    </div>
  );
}
```

## 说明

- 使用 `value` 和 `annotations` 控制数据
- 通过 `onChange` 和 `onAnnotationsChange` 监听变化
- 适合需要与服务器同步的场景

