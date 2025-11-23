# 受控与非受控模式

组件支持两种使用模式：受控模式和非受控模式。

## 非受控模式

使用 `defaultValue` 和 `defaultAnnotations`，组件内部管理状态。

```tsx
<MarkdownAnnotator
  defaultValue="# 标题\n\n这是内容。"
  defaultAnnotations={[]}
/>
```

### 适用场景

- 简单的展示场景
- 不需要实时保存数据
- 表单提交时一次性获取数据

### 获取数据

在非受控模式下，可以通过 ref 或表单提交时获取数据：

```tsx
import { useRef } from "react";
import { exportAnnotationData } from "markdown-annotation-kit";

function UncontrolledExample() {
  const [markdown, setMarkdown] = useState("# 标题");
  const [annotations, setAnnotations] = useState([]);

  const handleSubmit = () => {
    const data = exportAnnotationData(markdown, annotations);
    // 提交数据
  };

  return (
    <MarkdownAnnotator
      defaultValue={markdown}
      defaultAnnotations={annotations}
      onChange={setMarkdown}
      onAnnotationsChange={setAnnotations}
    />
  );
}
```

---

## 受控模式

使用 `value`、`onChange`、`annotations`、`onAnnotationsChange`，由外部管理状态。

```tsx
const [markdown, setMarkdown] = useState("# 标题\n\n这是内容。");
const [annotations, setAnnotations] = useState([]);

<MarkdownAnnotator
  value={markdown}
  onChange={setMarkdown}
  annotations={annotations}
  onAnnotationsChange={setAnnotations}
/>
```

### 适用场景

- 需要实时保存到服务器
- 需要与其他组件同步状态
- 需要实现撤销/重做功能
- 需要验证或转换数据

---

## 混合模式

可以只对 Markdown 或批注列表使用受控模式。

### 只控制 Markdown

```tsx
const [markdown, setMarkdown] = useState("# 标题");

<MarkdownAnnotator
  value={markdown}
  onChange={setMarkdown}
  defaultAnnotations={[]}
/>
```

### 只控制批注列表

```tsx
const [annotations, setAnnotations] = useState([]);

<MarkdownAnnotator
  defaultValue="# 标题"
  annotations={annotations}
  onAnnotationsChange={setAnnotations}
/>
```

---

## 选择建议

- **简单场景**：使用非受控模式
- **复杂场景**：使用受控模式
- **需要实时保存**：使用受控模式 + `onPersistence`
- **表单场景**：可以使用混合模式

