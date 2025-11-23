# 持久化示例

使用持久化回调实时保存数据。

```tsx
import { useState } from "react";
import {
  MarkdownAnnotator,
  AnnotationItem,
  createDebouncedPersistence,
} from "markdown-annotation-kit";
import "markdown-annotation-kit/styles.css";

function PersistenceExample() {
  const [markdown, setMarkdown] = useState(`# 文档标题

这是一段可以批注的文本内容。`);

  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);

  const handlePersistence = createDebouncedPersistence(async (data) => {
    await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }, 1000);

  return (
    <div style={{ height: "100vh" }}>
      <MarkdownAnnotator
        value={markdown}
        onChange={setMarkdown}
        annotations={annotations}
        onAnnotationsChange={setAnnotations}
        onPersistence={handlePersistence}
        persistenceDebounce={1000}
      />
    </div>
  );
}
```

## 说明

- 使用 `onPersistence` 回调进行实时保存
- 使用 `createDebouncedPersistence` 创建防抖回调
- 适合需要自动保存的场景

