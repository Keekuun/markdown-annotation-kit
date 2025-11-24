# 使用示例

本文档提供了 `markdown-annotation-kit` 的各种使用场景和示例代码。

## 目录

- [基础示例](#基础示例)
- [受控模式示例](#受控模式示例)
- [加载已保存的批注](#加载已保存的批注)
- [实时保存到服务器](#实时保存到服务器)
- [自定义样式](#自定义样式)
- [与状态管理库集成](#与状态管理库集成)
- [表单集成](#表单集成)

## 基础示例

最简单的使用方式，组件内部管理状态。

```tsx
import { MarkdownAnnotator } from 'markdown-annotation-kit';

function BasicExample() {
  const markdown = `# 文档标题

这是一段可以批注的文本内容。

## 功能特性

- 支持文本选择
- 支持批注创建
- 支持双向锚定`;

  return (
    <div style={{ height: '100vh' }}>
      <MarkdownAnnotator defaultValue={markdown} />
    </div>
  );
}
```

## 受控模式示例

使用受控模式，完全控制组件状态。

```tsx
import { useState } from 'react';
import { MarkdownAnnotator, AnnotationItem } from 'markdown-annotation-kit';

function ControlledExample() {
  const [markdown, setMarkdown] = useState(`# 文档标题

这是一段可以批注的文本内容。`);

  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);

  return (
    <div style={{ height: '100vh' }}>
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

从服务器或本地存储加载已保存的批注数据。

```tsx
import { useEffect, useState } from 'react';
import { MarkdownAnnotator, AnnotationItem } from 'markdown-annotation-kit';

function LoadSavedExample() {
  const [markdown, setMarkdown] = useState('');
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟从服务器加载数据
    const loadData = async () => {
      try {
        const response = await fetch('/api/document/123');
        const data = await response.json();
        
        setMarkdown(data.markdown); // 包含 <mark_N> 标签的 Markdown
        setAnnotations(data.annotations); // 批注列表
      } catch (error) {
        console.error('加载失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div style={{ height: '100vh' }}>
      <MarkdownAnnotator
        defaultValue={markdown}
        defaultAnnotations={annotations}
      />
    </div>
  );
}
```

## 实时保存到服务器

每次批注变化时自动保存到服务器。推荐使用 `onPersistence` 属性，它已经内置了防抖功能。

```tsx
import { useState } from 'react';
import { MarkdownAnnotator, AnnotationItem } from 'markdown-annotation-kit';

function AutoSaveExample() {
  const [markdown, setMarkdown] = useState(`# 文档标题

这是一段可以批注的文本内容。`);

  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [saving, setSaving] = useState(false);

  const handlePersistence = async (data) => {
    setSaving(true);
    try {
      await fetch('/api/document/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markdown: data.markdown,
          annotations: data.annotations,
          marks: data.marks,
          cleanMarkdown: data.cleanMarkdown,
        }),
      });
      console.log('保存成功');
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      {saving && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          padding: '8px 16px',
          backgroundColor: '#2563eb',
          color: 'white',
          borderRadius: '4px',
          zIndex: 10000
        }}>
          保存中...
        </div>
      )}
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

**注意**: `onPersistence` 会在批注添加、编辑或删除时自动触发，并且已经内置了防抖功能。你只需要提供一个回调函数即可，无需手动实现防抖逻辑。

## 自定义样式

通过 className 和 CSS 自定义组件样式。

```tsx
import { MarkdownAnnotator } from 'markdown-annotation-kit';
import './CustomStyles.css';

function CustomStyleExample() {
  const markdown = `# 文档标题

这是一段可以批注的文本内容。`;

  return (
    <div style={{ height: '100vh' }}>
      <MarkdownAnnotator
        defaultValue={markdown}
        className="custom-annotator"
      />
    </div>
  );
}
```

**CustomStyles.css:**

```css
.custom-annotator {
  /* 自定义根容器样式 */
  background-color: #f5f5f5;
}

.custom-annotator .annotation-highlight {
  /* 自定义高亮文本样式 */
  background-color: rgba(255, 235, 59, 0.3) !important;
  text-decoration: underline;
  text-decoration-color: #ff9800;
}

/* 自定义侧边栏样式 */
.custom-annotator > div:last-child {
  background-color: #ffffff;
  border-left: 2px solid #2563eb;
}
```

## 与状态管理库集成

### Redux 集成

```tsx
import { useSelector, useDispatch } from 'react-redux';
import { MarkdownAnnotator } from 'markdown-annotation-kit';
import { updateMarkdown, updateAnnotations } from './store/documentSlice';

function ReduxExample() {
  const dispatch = useDispatch();
  const markdown = useSelector((state: any) => state.document.markdown);
  const annotations = useSelector((state: any) => state.document.annotations);

  return (
    <div style={{ height: '100vh' }}>
      <MarkdownAnnotator
        value={markdown}
        onChange={(newMarkdown) => dispatch(updateMarkdown(newMarkdown))}
        annotations={annotations}
        onAnnotationsChange={(newAnnotations) => 
          dispatch(updateAnnotations(newAnnotations))
        }
      />
    </div>
  );
}
```

### Zustand 集成

```tsx
import { MarkdownAnnotator } from 'markdown-annotation-kit';
import { useDocumentStore } from './store/documentStore';

function ZustandExample() {
  const { markdown, annotations, setMarkdown, setAnnotations } = useDocumentStore();

  return (
    <div style={{ height: '100vh' }}>
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

将组件集成到表单中，与其他表单字段一起提交。

```tsx
import { useState, FormEvent } from 'react';
import { MarkdownAnnotator, AnnotationItem } from 'markdown-annotation-kit';

function FormExample() {
  const [title, setTitle] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const formData = {
      title,
      markdown,
      annotations,
    };

    try {
      const response = await fetch('/api/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('提交成功！');
      }
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
        <label>
          文档标题:
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ marginLeft: '10px', padding: '8px', width: '300px' }}
          />
        </label>
      </div>
      
      <div style={{ flex: 1, minHeight: 0 }}>
        <MarkdownAnnotator
          value={markdown}
          onChange={setMarkdown}
          annotations={annotations}
          onAnnotationsChange={setAnnotations}
        />
      </div>

      <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb' }}>
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          提交文档
        </button>
      </div>
    </form>
  );
}
```

## 只读模式

通过禁用交互实现只读模式（需要自定义实现）。

```tsx
import { MarkdownAnnotator } from 'markdown-annotation-kit';

function ReadOnlyExample() {
  const markdown = `# 文档标题

这是<mark_1>一段已标记的文本</mark_1>内容。`;

  const annotations = [
    { id: 1, note: '这是第一个批注' }
  ];

  return (
    <div style={{ height: '100vh' }}>
      <MarkdownAnnotator
        defaultValue={markdown}
        defaultAnnotations={annotations}
        className="read-only-annotator"
      />
    </div>
  );
}
```

**只读样式 CSS:**

```css
.read-only-annotator {
  pointer-events: none; /* 禁用所有交互 */
}

.read-only-annotator .annotation-highlight {
  cursor: default; /* 移除手型光标 */
}
```

## 多语言支持

结合 i18n 库实现多语言支持。

```tsx
import { useTranslation } from 'react-i18next';
import { MarkdownAnnotator } from 'markdown-annotation-kit';

function I18nExample() {
  const { t } = useTranslation();

  const markdown = t('document.content');

  return (
    <div style={{ height: '100vh' }}>
      <MarkdownAnnotator defaultValue={markdown} />
    </div>
  );
}
```

## 错误处理

添加错误边界和错误处理逻辑。

```tsx
import { Component, ReactNode } from 'react';
import { MarkdownAnnotator } from 'markdown-annotation-kit';

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>出错了，请刷新页面重试</div>;
    }

    return this.props.children;
  }
}

function ErrorHandlingExample() {
  const markdown = `# 文档标题

这是一段可以批注的文本内容。`;

  return (
    <ErrorBoundary>
      <div style={{ height: '100vh' }}>
        <MarkdownAnnotator defaultValue={markdown} />
      </div>
    </ErrorBoundary>
  );
}
```

## 性能优化

对于大型文档，使用 React.memo 和 useMemo 优化性能。

```tsx
import { memo, useMemo } from 'react';
import { MarkdownAnnotator, AnnotationItem } from 'markdown-annotation-kit';

const OptimizedAnnotator = memo(({ markdown, annotations }: {
  markdown: string;
  annotations: AnnotationItem[];
}) => {
  // 使用 useMemo 缓存处理后的数据
  const processedMarkdown = useMemo(() => {
    // 如果有预处理逻辑，在这里执行
    return markdown;
  }, [markdown]);

  return (
    <div style={{ height: '100vh' }}>
      <MarkdownAnnotator
        value={processedMarkdown}
        annotations={annotations}
      />
    </div>
  );
});

function PerformanceExample() {
  const [markdown, setMarkdown] = useState('');
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);

  return (
    <OptimizedAnnotator
      markdown={markdown}
      annotations={annotations}
    />
  );
}
```

## 完整应用示例

一个完整的文档编辑应用示例。

```tsx
import { useState, useEffect } from 'react';
import { MarkdownAnnotator, AnnotationItem } from 'markdown-annotation-kit';

function DocumentEditor() {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState('');
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 加载文档
  useEffect(() => {
    const loadDocument = async () => {
      const id = new URLSearchParams(window.location.search).get('id');
      if (!id) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/documents/${id}`);
        const data = await response.json();
        
        setDocumentId(id);
        setMarkdown(data.markdown);
        setAnnotations(data.annotations || []);
      } catch (error) {
        console.error('加载失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, []);

  // 自动保存
  useEffect(() => {
    if (!documentId) return;

    const timer = setTimeout(async () => {
      setSaving(true);
      try {
        await fetch(`/api/documents/${documentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markdown, annotations }),
        });
      } catch (error) {
        console.error('保存失败:', error);
      } finally {
        setSaving(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [markdown, annotations, documentId]);

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      {saving && (
        <div style={{
          position: 'absolute',
          top: 10,
          right: 10,
          padding: '8px 16px',
          backgroundColor: '#10b981',
          color: 'white',
          borderRadius: '4px',
          zIndex: 10000
        }}>
          已保存
        </div>
      )}
      <MarkdownAnnotator
        value={markdown}
        onChange={setMarkdown}
        annotations={annotations}
        onAnnotationsChange={setAnnotations}
      />
    </div>
  );
}

export default DocumentEditor;
```

## 更多示例

更多使用场景和示例代码，请参考：

- [README.md](./README.md) - 项目介绍和快速开始
- [API.md](./API.md) - 完整的 API 文档

