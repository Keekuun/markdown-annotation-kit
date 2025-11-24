# 类型定义

## AnnotationItem

批注项的数据结构。

```typescript
type AnnotationItem = {
  id: number; // 批注 ID，必须唯一，通常为正整数
  note: string; // 批注内容文本
};
```

### 属性说明

- `id: number` - 批注的唯一标识符。组件会自动生成递增的 ID，但也可以手动指定。ID 必须与 Markdown 中的 `<mark_N></mark_N>` 标签中的 `N` 对应。
- `note: string` - 批注的文本内容。

### 示例

```typescript
const annotation: AnnotationItem = {
  id: 1,
  note: "这是一个重要的说明",
};
```

---

## MarkdownAnnotatorProps

组件的完整 Props 类型定义。

```typescript
type MarkdownAnnotatorProps = {
  defaultValue?: string;
  value?: string;
  onChange?: (markdown: string) => void;
  defaultAnnotations?: AnnotationItem[];
  annotations?: AnnotationItem[];
  onAnnotationsChange?: (annotations: AnnotationItem[]) => void;
  onPersistence?: (data: {
    markdown: string;
    annotations: AnnotationItem[];
    marks: ParsedMark[];
    cleanMarkdown: string;
  }) => void | Promise<void>;
  persistenceDebounce?: number;
  className?: string;
};
```

### 属性说明

- `onPersistence` - 批注数据变化时的持久化回调。接收的数据包含 `markdown`、`annotations`、`marks` 和 `cleanMarkdown`，但不包含 `version`、`createdAt`、`updatedAt` 等元数据字段。

---

## AnnotationData

持久化数据的完整结构。

```typescript
interface AnnotationData {
  markdown: string;
  annotations: AnnotationItem[];
  marks: ParsedMark[];
  cleanMarkdown: string;
  version: string;
  createdAt: number;
  updatedAt: number;
}
```

### 属性说明

- `markdown: string` - 包含 `<mark_N></mark_N>` 标签的原始 Markdown 内容
- `annotations: AnnotationItem[]` - 批注列表
- `marks: ParsedMark[]` - 解析后的标记位置信息
- `cleanMarkdown: string` - 清理后的 Markdown 内容（不包含标签）
- `version: string` - 版本号，用于兼容性检查
- `createdAt: number` - 创建时间戳
- `updatedAt: number` - 更新时间戳

---

## ParsedMark

解析后的标记位置信息。

```typescript
type ParsedMark = {
  id: number; // 标记 ID
  start: number; // 在 clean markdown 中的起始位置
  end: number; // 在 clean markdown 中的结束位置
};
```

---

## SimplifiedAnnotationData

简化版的持久化数据结构（不包含 Markdown 内容）。

```typescript
interface SimplifiedAnnotationData {
  annotations: AnnotationItem[];
  marks: ParsedMark[];
  version: string;
  updatedAt: number;
}
```

### 属性说明

- `annotations: AnnotationItem[]` - 批注列表
- `marks: ParsedMark[]` - 解析后的标记位置信息
- `version: string` - 版本号，用于兼容性检查
- `updatedAt: number` - 更新时间戳

