# Markdown Annotation Kit

一个功能强大的 React 组件库，用于在 Markdown 文档中添加批注功能。支持文本选择、批注创建、双向锚定和标签回显等核心功能。

## ✨ 特性

- 📝 **文本选择批注** - 选中任意文本即可添加批注
- 🔗 **双向锚定** - 点击批注卡片定位到原文，点击高亮文本定位到批注
- 🏷️ **标签系统** - 使用 `<mark_N></mark_N>` 标签持久化批注数据
- 🔄 **标签回显** - 自动识别并回显已保存的批注标签
- 🎨 **美观界面** - 现代化的 UI 设计，流畅的交互体验
- 📦 **TypeScript 支持** - 完整的类型定义
- 🎯 **受控/非受控模式** - 支持两种使用方式
- ⚡ **轻量级** - 无额外依赖，基于 react-markdown

## 📦 安装

```bash
# npm
npm install markdown-annotation-kit

# pnpm
pnpm add markdown-annotation-kit

# yarn
yarn add markdown-annotation-kit
```

## 🚀 快速开始

### 基础用法

```tsx
import { MarkdownAnnotator } from 'markdown-annotation-kit';

function App() {
  const markdown = `# 文档标题

这是一段可以批注的文本内容。`;

  return (
    <MarkdownAnnotator
      defaultValue={markdown}
    />
  );
}
```

### 受控模式

```tsx
import { useState } from 'react';
import { MarkdownAnnotator } from 'markdown-annotation-kit';

function App() {
  const [markdown, setMarkdown] = useState('# 文档标题\n\n这是一段可以批注的文本内容。');
  const [annotations, setAnnotations] = useState([]);

  return (
    <MarkdownAnnotator
      value={markdown}
      onChange={setMarkdown}
      annotations={annotations}
      onAnnotationsChange={setAnnotations}
    />
  );
}
```

### 加载已保存的批注

```tsx
import { MarkdownAnnotator } from 'markdown-annotation-kit';

function App() {
  // 从服务器加载的数据
  const markdownWithTags = `# 文档标题

这是<mark_1>一段已经标记的文本</mark_1>内容。`;

  const savedAnnotations = [
    { id: 1, note: '这是第一个批注' }
  ];

  return (
    <MarkdownAnnotator
      defaultValue={markdownWithTags}
      defaultAnnotations={savedAnnotations}
    />
  );
}
```

## 📖 API 文档

### MarkdownAnnotator

主要的批注组件。

#### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `defaultValue` | `string` | `""` | 非受控模式下的默认 Markdown 内容 |
| `value` | `string` | - | 受控模式下的 Markdown 内容 |
| `onChange` | `(markdown: string) => void` | - | Markdown 内容变化时的回调函数 |
| `defaultAnnotations` | `AnnotationItem[]` | `[]` | 非受控模式下的默认批注列表 |
| `annotations` | `AnnotationItem[]` | - | 受控模式下的批注列表 |
| `onAnnotationsChange` | `(annotations: AnnotationItem[]) => void` | - | 批注列表变化时的回调函数 |
| `className` | `string` | - | 自定义 CSS 类名 |

#### 类型定义

```typescript
type AnnotationItem = {
  id: number;      // 批注 ID，必须唯一
  note: string;    // 批注内容
};

type MarkdownAnnotatorProps = {
  defaultValue?: string;
  value?: string;
  onChange?: (markdown: string) => void;
  defaultAnnotations?: AnnotationItem[];
  annotations?: AnnotationItem[];
  onAnnotationsChange?: (annotations: AnnotationItem[]) => void;
  className?: string;
};
```

## 🎯 使用场景

### 1. 文档评审

团队协作评审技术文档，添加修改建议和意见。

```tsx
<MarkdownAnnotator
  value={documentContent}
  onChange={handleDocumentChange}
  annotations={reviewComments}
  onAnnotationsChange={handleCommentsChange}
/>
```

### 2. 学习笔记

在学习过程中对重点内容添加批注和笔记。

```tsx
<MarkdownAnnotator
  defaultValue={studyMaterial}
  defaultAnnotations={myNotes}
/>
```

### 3. 代码审查

对文档中的设计说明添加疑问和建议。

```tsx
<MarkdownAnnotator
  value={designDoc}
  onChange={saveDesignDoc}
  annotations={reviewNotes}
  onAnnotationsChange={saveReviewNotes}
/>
```

## 🔧 工作原理

### 标签格式

组件使用 `<mark_N></mark_N>` 标签来标记批注文本，其中 `N` 是批注的唯一 ID。

**示例：**
```markdown
这是<mark_1>一段被标记的文本</mark_1>内容。
```

### 数据流

1. **输入** - 组件接收包含 `<mark_N>` 标签的 Markdown 字符串
2. **解析** - 自动解析标签，提取批注位置和 ID
3. **渲染** - 将标记的文本以下划线高亮显示
4. **交互** - 用户可以选择文本添加新批注，或点击已有批注进行编辑/删除

### 双向锚定

- **从原文到批注**：点击高亮文本，自动滚动到对应的批注卡片
- **从批注到原文**：点击批注卡片，自动滚动到原文中的对应位置

## 💡 最佳实践

### 1. 数据持久化

推荐使用受控模式，方便将数据保存到服务器：

```tsx
const handleMarkdownChange = async (newMarkdown: string) => {
  setMarkdown(newMarkdown);
  await saveToServer({ markdown: newMarkdown });
};

const handleAnnotationsChange = async (newAnnotations: AnnotationItem[]) => {
  setAnnotations(newAnnotations);
  await saveToServer({ annotations: newAnnotations });
};
```

### 2. ID 管理

批注 ID 应该由组件自动生成，确保唯一性。如果需要自定义 ID，请确保：

- ID 为正整数
- 每个批注的 ID 唯一
- ID 与标签中的 ID 对应

### 3. 样式定制

组件使用内联样式，如需自定义样式，可以通过 `className` 属性添加自定义类名，然后使用 CSS 覆盖默认样式。

## 🛠️ 开发

```bash
# 克隆仓库
git clone <repository-url>

# 安装依赖
pnpm install

# 构建
pnpm build

# 类型检查
pnpm typecheck
```

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📝 更新日志

### 0.1.0

- ✨ 初始版本发布
- ✨ 支持文本选择批注
- ✨ 支持双向锚定
- ✨ 支持标签回显
- ✨ 支持批注编辑和删除

