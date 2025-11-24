# MarkdownAnnotator

主要的批注组件。

## 导入

```typescript
import { MarkdownAnnotator } from "markdown-annotation-kit";
```

## Props

### `defaultValue?: string`

非受控模式下的默认 Markdown 内容。

- **类型**: `string`
- **默认值**: `""`
- **说明**: 当未提供 `value` 时，组件使用此值作为初始内容。支持包含 `<mark_N></mark_N>` 标签的 Markdown 字符串。

**示例：**

```tsx
<MarkdownAnnotator defaultValue="# 标题\n\n这是<mark_1>一段文本</mark_1>。" />
```

---

### `value?: string`

受控模式下的 Markdown 内容。

- **类型**: `string`
- **说明**: 当提供此属性时，组件进入受控模式。必须配合 `onChange` 使用。

**示例：**

```tsx
const [markdown, setMarkdown] = useState("# 标题");

<MarkdownAnnotator value={markdown} onChange={setMarkdown} />
```

---

### `onChange?: (markdown: string) => void`

Markdown 内容变化时的回调函数。

- **类型**: `(markdown: string) => void`
- **参数**:
  - `markdown: string` - 更新后的 Markdown 内容，包含 `<mark_N></mark_N>` 标签
- **说明**: 仅在受控模式下使用。当用户添加、删除批注时触发。

**示例：**

```tsx
const handleChange = (newMarkdown: string) => {
  console.log("Markdown 已更新:", newMarkdown);
  // 保存到服务器
  saveToServer(newMarkdown);
};

<MarkdownAnnotator value={markdown} onChange={handleChange} />
```

---

### `defaultAnnotations?: AnnotationItem[]`

非受控模式下的默认批注列表。

- **类型**: `AnnotationItem[]`
- **默认值**: `[]`
- **说明**: 当未提供 `annotations` 时，组件使用此值作为初始批注列表。

**示例：**

```tsx
const initialAnnotations = [
  { id: 1, note: "这是第一个批注" },
  { id: 2, note: "这是第二个批注" },
];

<MarkdownAnnotator defaultAnnotations={initialAnnotations} />
```

---

### `annotations?: AnnotationItem[]`

受控模式下的批注列表。

- **类型**: `AnnotationItem[]`
- **说明**: 当提供此属性时，组件进入受控模式。必须配合 `onAnnotationsChange` 使用。

**示例：**

```tsx
const [annotations, setAnnotations] = useState([]);

<MarkdownAnnotator
  annotations={annotations}
  onAnnotationsChange={setAnnotations}
/>
```

---

### `onAnnotationsChange?: (annotations: AnnotationItem[]) => void`

批注列表变化时的回调函数。

- **类型**: `(annotations: AnnotationItem[]) => void`
- **参数**:
  - `annotations: AnnotationItem[]` - 更新后的批注列表
- **说明**: 仅在受控模式下使用。当用户添加、编辑、删除批注时触发。

**示例：**

```tsx
const handleAnnotationsChange = (newAnnotations: AnnotationItem[]) => {
  console.log("批注已更新:", newAnnotations);
  // 保存到服务器
  saveToServer({ annotations: newAnnotations });
};

<MarkdownAnnotator
  annotations={annotations}
  onAnnotationsChange={handleAnnotationsChange}
/>
```

---

### `onPersistence?: (data: {...}) => void | Promise<void>`

持久化回调函数。

- **类型**: `(data: { markdown: string; annotations: AnnotationItem[]; marks: ParsedMark[]; cleanMarkdown: string }) => void | Promise<void>`
- **参数**:
  - `data.markdown: string` - 包含 `<mark_N></mark_N>` 标签的原始 Markdown 内容
  - `data.annotations: AnnotationItem[]` - 批注列表
  - `data.marks: ParsedMark[]` - 解析后的标记位置信息
  - `data.cleanMarkdown: string` - 清理后的 Markdown 内容（不包含标签）
- **说明**: 当批注数据发生变化时触发，支持防抖。回调函数可以返回 `Promise<void>` 以支持异步操作。

**示例：**

```tsx
const handlePersistence = async (data) => {
  // 保存到服务器
  await saveToServer({
    markdown: data.markdown,
    annotations: data.annotations,
    marks: data.marks,
    cleanMarkdown: data.cleanMarkdown,
  });
};

<MarkdownAnnotator
  value={markdown}
  annotations={annotations}
  onPersistence={handlePersistence}
  persistenceDebounce={500}
/>
```

---

### `persistenceDebounce?: number`

持久化防抖延迟时间（毫秒）。

- **类型**: `number`
- **默认值**: `500`
- **说明**: 控制 `onPersistence` 回调的防抖延迟时间。

---

### `className?: string`

自定义 CSS 类名。

- **类型**: `string`
- **说明**: 添加到组件根元素的类名，可用于自定义样式。

**示例：**

```tsx
<MarkdownAnnotator className="my-custom-class" />
```

