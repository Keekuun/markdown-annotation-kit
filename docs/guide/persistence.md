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
import { exportAnnotationData, stripMarkTags } from "markdown-annotation-kit";

// 首先需要解析 marks
const parseResult = stripMarkTags(markdown);
const dataJson = exportAnnotationData(
  markdown,
  annotations,
  parseResult.marks,
  parseResult.clean
);
// dataJson 是 JSON 字符串，包含完整的 AnnotationData
```

### 导入数据

```tsx
import { importAnnotationData } from "markdown-annotation-kit";

const data = importAnnotationData(jsonString);
// data 是完整的 AnnotationData 对象，包含：
// { markdown, annotations, marks, cleanMarkdown, version, createdAt, updatedAt }
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
      const data = importAnnotationData(saved);
      setMarkdown(data.markdown);
      setAnnotations(data.annotations);
    }
  }, []);

  // 保存
  const handlePersistence = (data) => {
    const jsonString = JSON.stringify({
      markdown: data.markdown,
      annotations: data.annotations,
      marks: data.marks,
      cleanMarkdown: data.cleanMarkdown,
    });
    localStorage.setItem("annotation-data", jsonString);
  };

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

如果不需要 Markdown 内容，只需要批注和标记信息，可以使用简化版：

```tsx
import {
  exportSimplifiedAnnotationData,
  importSimplifiedAnnotationData,
  stripMarkTags,
} from "markdown-annotation-kit";

// 首先需要解析 marks
const parseResult = stripMarkTags(markdown);

// 导出（不包含 Markdown）
const simplifiedJson = exportSimplifiedAnnotationData(
  annotations,
  parseResult.marks
);
// simplifiedJson 是 JSON 字符串，包含 { annotations, marks, version, updatedAt }

// 导入
const simplified = importSimplifiedAnnotationData(simplifiedJson);
// simplified 包含 { annotations, marks, version, updatedAt }
```

