# 使用示例

本文档提供了 `markdown-annotation-kit` 的各种使用场景和示例代码。

## 目录

- [交互式演示](#交互式演示) - 🎯 **立即体验**
- [基础示例](#基础示例)
- [受控模式示例](#受控模式示例)
- [加载已保存的批注](#加载已保存的批注)
- [实时保存到服务器](#实时保存到服务器)
- [自定义样式](#自定义样式)
- [与状态管理库集成](#与状态管理库集成)
- [表单集成](#表单集成)

## 交互式演示

### 🎯 立即体验

直接在下方体验组件的所有功能：

<InteractiveDemo />

### 演示功能

在演示中，你可以：

- ✅ **选择文本** - 在 Markdown 内容中选择任意文本
- ✅ **添加批注** - 在弹出的输入框中输入批注内容
- ✅ **查看批注** - 在右侧侧边栏查看所有批注
- ✅ **编辑批注** - 点击批注卡片的编辑按钮修改内容
- ✅ **删除批注** - 点击批注卡片的删除按钮移除批注
- ✅ **双向锚定** - 点击高亮文本跳转到批注，点击批注跳转到文本
- ✅ **代码块批注** - 在代码块中选择代码进行批注

### 快捷键

- `Esc` - 取消添加批注
- `Cmd/Ctrl + Enter` - 快速确认添加批注

### 提示

- 选中文本后，会在文本上方弹出输入框
- 批注数据会自动保存到浏览器的 localStorage
- 可以查看页面底部的数据预览，了解数据结构

### 本地开发

如果想在本地运行完整的开发环境：

```bash
# 克隆仓库
git clone https://github.com/Keekuun/markdown-annotation-kit.git
cd markdown-annotation-kit

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 `http://localhost:5173` 即可体验完整的交互式演示功能。

---

## 基础示例

最简单的使用方式，组件内部管理状态。

```tsx
import { MarkdownAnnotator } from "markdown-annotation-kit";
import "markdown-annotation-kit/styles.css";

function BasicExample() {
  const markdown = `# 文档标题

这是一段可以批注的文本内容。

## 功能特性

- 支持文本选择
- 支持批注创建
- 支持双向锚定`;

  return (
    <div style={{ height: "100vh" }}>
      <MarkdownAnnotator defaultValue={markdown} />
    </div>
  );
}
```

## 受控模式示例

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

## 加载已保存的批注

从服务器加载已保存的批注数据。

```tsx
import { useState, useEffect } from "react";
import {
  MarkdownAnnotator,
  AnnotationItem,
  importAnnotationData,
} from "markdown-annotation-kit";
import "markdown-annotation-kit/styles.css";

function LoadSavedExample() {
  const [markdown, setMarkdown] = useState("");
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/load");
        const data = await response.json();
        const { markdown: loadedMarkdown, annotations: loadedAnnotations } =
          importAnnotationData(data);
        setMarkdown(loadedMarkdown);
        setAnnotations(loadedAnnotations);
      } catch (error) {
        console.error("加载失败:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <div>加载中...</div>;
  }

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

## 实时保存到服务器

使用持久化回调实时保存数据。

```tsx
import { useState } from "react";
import {
  MarkdownAnnotator,
  AnnotationItem,
  createDebouncedPersistence,
  exportAnnotationData,
} from "markdown-annotation-kit";
import "markdown-annotation-kit/styles.css";

function RealTimeSaveExample() {
  const [markdown, setMarkdown] = useState(`# 文档标题

这是一段可以批注的文本内容。`);

  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);

  const handlePersistence = createDebouncedPersistence(async (data) => {
    try {
      await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      console.log("保存成功");
    } catch (error) {
      console.error("保存失败:", error);
    }
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

## 自定义样式

通过 CSS 变量和类名自定义样式。

```tsx
import { MarkdownAnnotator } from "markdown-annotation-kit";
import "markdown-annotation-kit/styles.css";
import "./custom-styles.css";

function CustomStyleExample() {
  const markdown = `# 文档标题

这是一段可以批注的文本内容。`;

  return (
    <div style={{ height: "100vh" }}>
      <MarkdownAnnotator defaultValue={markdown} className="my-annotator" />
    </div>
  );
}
```

```css
/* custom-styles.css */
.my-annotator {
  --markdown-annotator-primary: #ff6b6b;
  --markdown-annotator-primary-hover: #ee5a5a;
}

.my-annotator .annotation-highlight {
  background-color: rgba(255, 107, 107, 0.1);
}
```

## 与状态管理库集成

与 Redux 或 Zustand 等状态管理库集成。

```tsx
import { useStore } from "./store";
import { MarkdownAnnotator } from "markdown-annotation-kit";
import "markdown-annotation-kit/styles.css";

function ZustandExample() {
  const { markdown, annotations, setMarkdown, setAnnotations } = useStore();

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

## 表单集成

在表单中使用组件。

```tsx
import { useState } from "react";
import {
  MarkdownAnnotator,
  AnnotationItem,
  exportAnnotationData,
} from "markdown-annotation-kit";
import "markdown-annotation-kit/styles.css";

function FormExample() {
  const [markdown, setMarkdown] = useState("");
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = exportAnnotationData(markdown, annotations);
    await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ height: "600px" }}>
        <MarkdownAnnotator
          value={markdown}
          onChange={setMarkdown}
          annotations={annotations}
          onAnnotationsChange={setAnnotations}
        />
      </div>
      <button type="submit">提交</button>
    </form>
  );
}
```
