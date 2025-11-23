# 工具函数

## exportAnnotationData

导出完整的批注数据。

```typescript
function exportAnnotationData(
  markdown: string,
  annotations: AnnotationItem[]
): AnnotationData;
```

### 参数

- `markdown: string` - 包含 `<mark_N></mark_N>` 标签的 Markdown 内容
- `annotations: AnnotationItem[]` - 批注列表

### 返回值

返回包含 `markdown`、`annotations` 和 `marks` 的完整数据对象。

### 示例

```typescript
import { exportAnnotationData } from "markdown-annotation-kit";

const data = exportAnnotationData(markdown, annotations);
// 保存到服务器
await saveToServer(data);
```

---

## importAnnotationData

导入完整的批注数据。

```typescript
function importAnnotationData(data: AnnotationData): {
  markdown: string;
  annotations: AnnotationItem[];
};
```

### 参数

- `data: AnnotationData` - 完整的批注数据

### 返回值

返回包含 `markdown` 和 `annotations` 的对象。

### 示例

```typescript
import { importAnnotationData } from "markdown-annotation-kit";

const data = await loadFromServer();
const { markdown, annotations } = importAnnotationData(data);
```

---

## exportSimplifiedAnnotationData

导出简化版的批注数据（不包含 marks）。

```typescript
function exportSimplifiedAnnotationData(
  markdown: string,
  annotations: AnnotationItem[]
): SimplifiedAnnotationData;
```

### 参数

- `markdown: string` - 包含 `<mark_N></mark_N>` 标签的 Markdown 内容
- `annotations: AnnotationItem[]` - 批注列表

### 返回值

返回包含 `markdown` 和 `annotations` 的简化数据对象。

---

## importSimplifiedAnnotationData

导入简化版的批注数据。

```typescript
function importSimplifiedAnnotationData(
  data: SimplifiedAnnotationData
): {
  markdown: string;
  annotations: AnnotationItem[];
};
```

### 参数

- `data: SimplifiedAnnotationData` - 简化版的批注数据

### 返回值

返回包含 `markdown` 和 `annotations` 的对象。

---

## createDebouncedPersistence

创建防抖的持久化回调函数。

```typescript
function createDebouncedPersistence(
  callback: (data: AnnotationData) => void,
  delay?: number
): (data: AnnotationData) => void;
```

### 参数

- `callback: (data: AnnotationData) => void` - 持久化回调函数
- `delay?: number` - 防抖延迟时间（毫秒），默认 500

### 返回值

返回防抖后的回调函数。

### 示例

```typescript
import { createDebouncedPersistence, exportAnnotationData } from "markdown-annotation-kit";

const debouncedSave = createDebouncedPersistence((data) => {
  // 保存到服务器
  saveToServer(data);
}, 1000);

// 在组件中使用
<MarkdownAnnotator
  value={markdown}
  annotations={annotations}
  onPersistence={debouncedSave}
/>
```

