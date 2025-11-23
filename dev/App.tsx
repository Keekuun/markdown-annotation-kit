import { useState, useMemo } from 'react';
import { MarkdownAnnotator, AnnotationItem } from '../src/index';

const DEFAULT_MARKDOWN = `# Markdown 文档批注示例

## 功能特性

这是一个功能强大的 Markdown <mark_2>批注</mark_2>组件，支持以下特性：

- **文本选择批注** - 选中任意文本即可添加批注
- **双向锚定** - 点击批注卡片定位到原文，点击高亮文本定位到批注
- **标签系统** - 使用 \`<mark_N></mark_N>\` 标签持久化<mark_3>批注</mark_3>数据
- **标签回显** - 自动识别并回显已保存的批注标签

> 这个组件是用来在 Markdown 文档中添加批注功能的。

> 你可以选中任意文本，在弹出的浮窗中输入批注内容，点击确认即可。

> 你可以点击批注卡片定位到原文，点击高亮文本定位到批注。

> 你可以使用 \`<mark_N></mark_N>\` 标签持久化批注数据。

> 你可以自动识别并回显已保存的批注标签。

> 你可以使用 \`<mark_N></mark_N>\` 标签持久化批注数据。

## 使用说明

1. **添加批注**：选中任意文本，在弹出的浮窗中输入批注内容，点击确认即可。

2. **查看批注**：侧边栏会显示所有批注卡片，点击卡片可以定位到原文位置。

3. **编辑批注**：点击批注卡片上的"编辑"按钮，修改批注内容。

4. **删除批注**：点击批注卡片上的"删除"按钮，移除批注。

<mark_1>这段文本已经包含了一个示例批注标签</mark_1>，你可以看到它已经被高亮显示。

## 代码示例

\`\`\`typescript
import { MarkdownAnnotator } from 'markdown-annotation-kit';

function App() {
  return (
    <MarkdownAnnotator
      defaultValue="# 标题\\n\\n这是内容。"
    />
  );
}
\`\`\`

## 更多信息

查看 [README.md](../README.md) 了解更多使用方法和 API 文档。
`;

const DEFAULT_ANNOTATIONS: AnnotationItem[] = [
  {
    id: 1,
    note: '这是一个示例批注，展示标签回显功能。你可以编辑或删除这个批注。',
  },
  {
    id: 2,
    note: '批注2',
  },
  {
    id: 3,
    note: '批注3',
  },
];

function App() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [annotations, setAnnotations] = useState<AnnotationItem[]>(DEFAULT_ANNOTATIONS);

  const markdownPreview = useMemo(() => {
    return markdown;
  }, [markdown]);

  const annotationsJson = useMemo(() => {
    return JSON.stringify(annotations, null, 2);
  }, [annotations]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* 头部信息 */}
      <div
        style={{
          padding: '20px',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#1f2937' }}>
          Markdown Annotation Kit
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
          开发预览 - 选中文本添加批注，查看实时效果
        </p>
      </div>

      {/* 主内容区 */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <MarkdownAnnotator
          value={markdown}
          onChange={setMarkdown}
          annotations={annotations}
          onAnnotationsChange={setAnnotations}
        />
      </div>

      {/* 底部数据预览 */}
      <div
        style={{
          height: '200px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#ffffff',
          display: 'flex',
          gap: '20px',
          padding: '20px',
          overflow: 'auto',
        }}
      >
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>
            当前 Markdown（包含标签）
          </h3>
          <textarea
            readOnly
            value={markdownPreview}
            style={{
              width: '100%',
              height: '150px',
              padding: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace',
              resize: 'none',
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>
            批注数据（JSON）
          </h3>
          <pre
            style={{
              width: '100%',
              height: '150px',
              padding: '8px',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace',
              backgroundColor: '#f9fafb',
              overflow: 'auto',
              margin: 0,
            }}
          >
            {annotationsJson}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App;

