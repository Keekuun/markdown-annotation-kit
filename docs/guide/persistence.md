# 持久化

组件提供了多种方式来处理数据持久化。

## 使用 onPersistence 回调

最简单的方式是使用 `onPersistence` 回调，它会在数据变化时自动触发（带防抖）。

```tsx
import {
  MarkdownAnnotator,
  createDebouncedPersistence,
} from "markdown-annotation-kit";

function PersistenceExample() {
  const [markdown, setMarkdown] = useState("# 标题");
  const [annotations, setAnnotations] = useState([]);

  const handlePersistence = createDebouncedPersistence(async (data) => {
    await fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }, 1000);

  return (
    <MarkdownAnnotator
      value={markdown}
      onChange={setMarkdown}
      annotations={annotations}
      onAnnotationsChange={setAnnotations}
      onPersistence={handlePersistence}
      persistenceDebounce={1000}
    />
  );
}
```

## 使用工具函数

### 导出数据

```tsx
import { exportAnnotationData } from "markdown-annotation-kit";

const data = exportAnnotationData(markdown, annotations);
// data 包含 { markdown, annotations, marks }
```

### 导入数据

```tsx
import { importAnnotationData } from "markdown-annotation-kit";

const { markdown, annotations } = importAnnotationData(data);
```

## 本地存储示例

```tsx
import { useState, useEffect } from "react";
import {
  MarkdownAnnotator,
  exportAnnotationData,
  importAnnotationData,
} from "markdown-annotation-kit";

function LocalStorageExample() {
  const [markdown, setMarkdown] = useState("");
  const [annotations, setAnnotations] = useState([]);

  // 加载
  useEffect(() => {
    const saved = localStorage.getItem("annotation-data");
    if (saved) {
      const data = JSON.parse(saved);
      const { markdown: loadedMarkdown, annotations: loadedAnnotations } =
        importAnnotationData(data);
      setMarkdown(loadedMarkdown);
      setAnnotations(loadedAnnotations);
    }
  }, []);

  // 保存
  const handlePersistence = createDebouncedPersistence((data) => {
    localStorage.setItem("annotation-data", JSON.stringify(data));
  }, 500);

  return (
    <MarkdownAnnotator
      value={markdown}
      onChange={setMarkdown}
      annotations={annotations}
      onAnnotationsChange={setAnnotations}
      onPersistence={handlePersistence}
    />
  );
}
```

## 服务器保存示例

```tsx
import { createDebouncedPersistence } from "markdown-annotation-kit";

const handlePersistence = createDebouncedPersistence(async (data) => {
  try {
    const response = await fetch("/api/documents/123", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("保存失败");
    }
  } catch (error) {
    console.error("保存失败:", error);
    // 可以显示错误提示
  }
}, 1000);
```

## 简化版数据格式

如果不需要 `marks` 信息，可以使用简化版：

```tsx
import {
  exportSimplifiedAnnotationData,
  importSimplifiedAnnotationData,
} from "markdown-annotation-kit";

// 导出
const simplified = exportSimplifiedAnnotationData(markdown, annotations);
// { markdown, annotations }

// 导入
const { markdown, annotations } = importSimplifiedAnnotationData(simplified);
```

