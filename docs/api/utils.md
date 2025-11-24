# 工具函数

## exportAnnotationData

导出完整的批注数据为 JSON 字符串。

```typescript
function exportAnnotationData(
  markdown: string,
  annotations: AnnotationItem[],
  marks: ParsedMark[],
  cleanMarkdown?: string
): string;
```

### 参数

- `markdown: string` - 包含 `<mark_N></mark_N>` 标签的 Markdown 内容
- `annotations: AnnotationItem[]` - 批注列表
- `marks: ParsedMark[]` - 标记位置信息
- `cleanMarkdown?: string` - 清理后的 Markdown 内容（可选，如果不提供会自动计算）

### 返回值

返回 JSON 字符串，包含完整的 `AnnotationData` 对象。

### 示例

```typescript
import { exportAnnotationData } from "markdown-annotation-kit";

const data = exportAnnotationData(markdown, annotations);
// 保存到服务器
await saveToServer(data);
```

---

## importAnnotationData

从 JSON 字符串导入完整的批注数据。

```typescript
function importAnnotationData(jsonString: string): AnnotationData;
```

### 参数

- `jsonString: string` - JSON 格式的批注数据字符串

### 返回值

返回完整的 `AnnotationData` 对象。

### 异常

如果 JSON 格式不正确或必需字段缺失，会抛出错误。

### 示例

```typescript
import { importAnnotationData } from "markdown-annotation-kit";

const data = await loadFromServer();
const { markdown, annotations } = importAnnotationData(data);
```

---

## exportSimplifiedAnnotationData

导出简化版的批注数据为 JSON 字符串（不包含 Markdown 内容）。

```typescript
function exportSimplifiedAnnotationData(
  annotations: AnnotationItem[],
  marks: ParsedMark[]
): string;
```

### 参数

- `annotations: AnnotationItem[]` - 批注列表
- `marks: ParsedMark[]` - 标记位置信息

### 返回值

返回 JSON 字符串，包含 `SimplifiedAnnotationData` 对象。

---

## importSimplifiedAnnotationData

从 JSON 字符串导入简化版的批注数据。

```typescript
function importSimplifiedAnnotationData(jsonString: string): SimplifiedAnnotationData;
```

### 参数

- `jsonString: string` - JSON 格式的简化批注数据字符串

### 返回值

返回 `SimplifiedAnnotationData` 对象。

### 异常

如果 JSON 格式不正确或必需字段缺失，会抛出错误。

---

## createDebouncedPersistence

创建防抖的持久化回调函数。

```typescript
function createDebouncedPersistence(
  callback: PersistenceCallback,
  delay?: number
): (data: AnnotationData) => void;
```

### 参数

- `callback: PersistenceCallback` - 持久化回调函数，类型为 `(data: AnnotationData) => void | Promise<void>`
- `delay?: number` - 防抖延迟时间（毫秒），默认 500

### 返回值

返回防抖后的回调函数，接收 `AnnotationData` 作为参数。

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

