# API 文档

本文档详细说明了 `markdown-annotation-kit` 的所有 API。

## 导出

### MarkdownAnnotator

主要的批注组件。

```typescript
import { MarkdownAnnotator } from 'markdown-annotation-kit';
```

### 类型导出

```typescript
import type { 
  MarkdownAnnotatorProps, 
  AnnotationItem 
} from 'markdown-annotation-kit';
```

## 组件 API

### MarkdownAnnotator

#### Props

##### `defaultValue?: string`

非受控模式下的默认 Markdown 内容。

- **类型**: `string`
- **默认值**: `""`
- **说明**: 当未提供 `value` 时，组件使用此值作为初始内容。支持包含 `<mark_N></mark_N>` 标签的 Markdown 字符串。

**示例：**
```tsx
<MarkdownAnnotator 
  defaultValue="# 标题\n\n这是<mark_1>一段文本</mark_1>。" 
/>
```

---

##### `value?: string`

受控模式下的 Markdown 内容。

- **类型**: `string`
- **说明**: 当提供此属性时，组件进入受控模式。必须配合 `onChange` 使用。

**示例：**
```tsx
const [markdown, setMarkdown] = useState('# 标题');

<MarkdownAnnotator 
  value={markdown}
  onChange={setMarkdown}
/>
```

---

##### `onChange?: (markdown: string) => void`

Markdown 内容变化时的回调函数。

- **类型**: `(markdown: string) => void`
- **参数**:
  - `markdown: string` - 更新后的 Markdown 内容，包含 `<mark_N></mark_N>` 标签
- **说明**: 仅在受控模式下使用。当用户添加、删除批注时触发。

**示例：**
```tsx
const handleChange = (newMarkdown: string) => {
  console.log('Markdown 已更新:', newMarkdown);
  // 保存到服务器
  saveToServer(newMarkdown);
};

<MarkdownAnnotator 
  value={markdown}
  onChange={handleChange}
/>
```

---

##### `defaultAnnotations?: AnnotationItem[]`

非受控模式下的默认批注列表。

- **类型**: `AnnotationItem[]`
- **默认值**: `[]`
- **说明**: 当未提供 `annotations` 时，组件使用此值作为初始批注列表。

**示例：**
```tsx
const initialAnnotations = [
  { id: 1, note: '这是第一个批注' },
  { id: 2, note: '这是第二个批注' }
];

<MarkdownAnnotator 
  defaultAnnotations={initialAnnotations}
/>
```

---

##### `annotations?: AnnotationItem[]`

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

##### `onAnnotationsChange?: (annotations: AnnotationItem[]) => void`

批注列表变化时的回调函数。

- **类型**: `(annotations: AnnotationItem[]) => void`
- **参数**:
  - `annotations: AnnotationItem[]` - 更新后的批注列表
- **说明**: 仅在受控模式下使用。当用户添加、编辑、删除批注时触发。

**示例：**
```tsx
const handleAnnotationsChange = (newAnnotations: AnnotationItem[]) => {
  console.log('批注已更新:', newAnnotations);
  // 保存到服务器
  saveToServer({ annotations: newAnnotations });
};

<MarkdownAnnotator 
  annotations={annotations}
  onAnnotationsChange={handleAnnotationsChange}
/>
```

---

##### `onPersistence?: (data: {...}) => void | Promise<void>`

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

##### `persistenceDebounce?: number`

持久化防抖延迟时间（毫秒）。

- **类型**: `number`
- **默认值**: `500`
- **说明**: 控制 `onPersistence` 回调的防抖延迟时间。设置为 0 表示不使用防抖。

---

##### `className?: string`

自定义 CSS 类名。

- **类型**: `string`
- **说明**: 添加到组件根元素的类名，可用于自定义样式。

**示例：**
```tsx
<MarkdownAnnotator 
  className="my-custom-class"
/>
```

---

## 类型定义

### AnnotationItem

批注项的数据结构。

```typescript
type AnnotationItem = {
  id: number;      // 批注 ID，必须唯一，通常为正整数
  note: string;    // 批注内容文本
};
```

**属性说明：**

- `id: number` - 批注的唯一标识符。组件会自动生成递增的 ID，但也可以手动指定。ID 必须与 Markdown 中的 `<mark_N></mark_N>` 标签中的 `N` 对应。
- `note: string` - 批注的文本内容。

**示例：**
```typescript
const annotation: AnnotationItem = {
  id: 1,
  note: '这是一个重要的说明'
};
```

---

### MarkdownAnnotatorProps

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

---

## 使用模式

### 非受控模式

使用 `defaultValue` 和 `defaultAnnotations`，组件内部管理状态。

```tsx
<MarkdownAnnotator
  defaultValue="# 标题\n\n这是内容。"
  defaultAnnotations={[]}
/>
```

**适用场景：**
- 简单的展示场景
- 不需要实时保存数据
- 表单提交时一次性获取数据

---

### 受控模式

使用 `value`、`onChange`、`annotations`、`onAnnotationsChange`，由外部管理状态。

```tsx
const [markdown, setMarkdown] = useState('# 标题\n\n这是内容。');
const [annotations, setAnnotations] = useState([]);

<MarkdownAnnotator
  value={markdown}
  onChange={setMarkdown}
  annotations={annotations}
  onAnnotationsChange={setAnnotations}
/>
```

**适用场景：**
- 需要实时保存到服务器
- 需要与其他组件同步状态
- 需要实现撤销/重做功能
- 需要验证或转换数据

---

### 混合模式

可以只对 Markdown 或批注列表使用受控模式。

**只控制 Markdown：**
```tsx
const [markdown, setMarkdown] = useState('# 标题');

<MarkdownAnnotator
  value={markdown}
  onChange={setMarkdown}
  defaultAnnotations={[]}
/>
```

**只控制批注列表：**
```tsx
const [annotations, setAnnotations] = useState([]);

<MarkdownAnnotator
  defaultValue="# 标题"
  annotations={annotations}
  onAnnotationsChange={setAnnotations}
/>
```

---

## 标签格式

组件使用 `<mark_N></mark_N>` 标签来标记批注文本。

### 标签规则

1. **格式**: `<mark_N>文本</mark_N>`，其中 `N` 是批注 ID
2. **ID 要求**: 必须为正整数，且唯一
3. **嵌套**: 标签不能嵌套，但可以相邻
4. **位置**: 标签可以出现在 Markdown 的任何位置

### 示例

**单个批注：**
```markdown
这是<mark_1>一段被标记的文本</mark_1>内容。
```

**多个批注：**
```markdown
这是<mark_1>第一段</mark_1>批注，这是<mark_2>第二段</mark_2>批注。
```

**相邻批注：**
```markdown
这是<mark_1>第一段</mark_1><mark_2>第二段</mark_2>批注。
```

---

## 交互行为

### 添加批注

1. 用户在 Markdown 渲染区域选择文本
2. 选择完成后，在选区上方弹出浮窗
3. 用户在浮窗中输入批注内容
4. 点击"确认"按钮后：
   - 组件自动生成新的批注 ID
   - 在 Markdown 中插入 `<mark_N></mark_N>` 标签
   - 原文中被标记的文本以下划线高亮显示
   - 侧边栏显示新的批注卡片

### 编辑批注

1. 点击批注卡片上的"编辑"按钮
2. 批注卡片进入编辑模式，显示文本输入框
3. 修改批注内容后点击"确认"
4. 批注内容更新，Markdown 中的标签保持不变

### 删除批注

1. 点击批注卡片上的"删除"按钮
2. 组件自动从 Markdown 中移除对应的 `<mark_N></mark_N>` 标签
3. 批注卡片从侧边栏移除
4. 原文中的高亮效果消失

### 双向锚定

**从原文到批注：**
- 点击原文中的高亮文本
- 侧边栏自动滚动到对应的批注卡片
- 批注卡片短暂高亮显示

**从批注到原文：**
- 点击侧边栏中的批注卡片
- 原文自动滚动到对应的位置
- 高亮文本短暂闪烁提示

---

## 注意事项

### ID 管理

- 组件会自动生成递增的批注 ID
- 新批注的 ID = max(现有批注 ID, 现有标签 ID) + 1
- 如果手动指定 ID，请确保唯一性

### 数据同步

- 在受控模式下，`value` 和 `annotations` 必须保持同步
- Markdown 中的标签 ID 必须与批注列表中的 ID 对应
- 删除批注时，组件会自动从 Markdown 中移除对应的标签

### 性能考虑

- 组件使用 `useMemo` 缓存解析结果
- 大量批注时，建议使用虚拟滚动（需要自行实现）
- 长文档建议分页加载

### 浏览器兼容性

- 需要支持 ES6+
- 需要支持 `getSelection` API
- 需要支持 `scrollIntoView` API

---

## 示例代码

### 完整示例

```tsx
import { useState } from 'react';
import { MarkdownAnnotator, AnnotationItem } from 'markdown-annotation-kit';

function App() {
  const [markdown, setMarkdown] = useState(`# 文档标题

这是一段可以批注的文本内容。`);
  
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);

  const handleMarkdownChange = async (newMarkdown: string) => {
    setMarkdown(newMarkdown);
    // 保存到服务器
    await fetch('/api/save', {
      method: 'POST',
      body: JSON.stringify({ markdown: newMarkdown })
    });
  };

  const handleAnnotationsChange = async (newAnnotations: AnnotationItem[]) => {
    setAnnotations(newAnnotations);
    // 保存到服务器
    await fetch('/api/save', {
      method: 'POST',
      body: JSON.stringify({ annotations: newAnnotations })
    });
  };

  return (
    <MarkdownAnnotator
      value={markdown}
      onChange={handleMarkdownChange}
      annotations={annotations}
      onAnnotationsChange={handleAnnotationsChange}
      className="my-annotator"
    />
  );
}
```

---

## 常见问题

### Q: 如何自定义样式？

A: 使用 `className` 属性添加自定义类名，然后使用 CSS 覆盖默认样式。组件使用内联样式，可以通过 `!important` 或更高的 CSS 优先级来覆盖。

### Q: 批注数据如何持久化？

A: 推荐使用受控模式，在 `onChange` 和 `onAnnotationsChange` 回调中保存数据到服务器。

### Q: 如何处理标签解析错误？

A: 组件会自动处理格式错误的标签。如果遇到问题，可以先用 `stripMarkTags` 函数（内部使用）验证标签格式。

### Q: 支持哪些 Markdown 特性？

A: 组件基于 `react-markdown`，支持所有标准 Markdown 语法，以及 GFM（GitHub Flavored Markdown）扩展。

### Q: 可以自定义批注 ID 吗？

A: 可以，但需要确保 ID 唯一，并且与 Markdown 中的标签 ID 对应。建议让组件自动生成 ID。

