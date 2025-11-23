import { useState, useMemo, useCallback } from 'react';
import { MarkdownAnnotator, AnnotationItem, exportAnnotationData, ParsedMark } from '../src/index';
import './App.css';

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

type PreviewTab = 'markdown' | 'annotations' | 'both';

function App() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [annotations, setAnnotations] = useState<AnnotationItem[]>(DEFAULT_ANNOTATIONS);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [previewTab, setPreviewTab] = useState<PreviewTab>('both');
  const [marks, setMarks] = useState<ParsedMark[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const markdownPreview = useMemo(() => {
    return markdown;
  }, [markdown]);

  const annotationsJson = useMemo(() => {
    return JSON.stringify(annotations, null, 2);
  }, [annotations]);

  // 持久化回调 - 保存到 localStorage
  const handlePersistence = useCallback(
    (data: {
      markdown: string;
      annotations: AnnotationItem[];
      marks: ParsedMark[];
      cleanMarkdown: string;
    }) => {
      try {
        // 保存到 localStorage
        const storageKey = 'markdown-annotation-kit-data';
        const dataToSave = exportAnnotationData(data.markdown, data.annotations, data.marks, data.cleanMarkdown);
        localStorage.setItem(storageKey, dataToSave);
        setLastSaved(new Date());
        setMarks(data.marks);
        console.log('✅ 批注数据已自动保存到 localStorage');
      } catch (error) {
        console.error('❌ 保存批注数据失败:', error);
      }
    },
    []
  );

  // 手动保存按钮
  const handleManualSave = useCallback(() => {
    try {
      const dataToSave = exportAnnotationData(markdown, annotations, marks, markdown.replace(/<mark_\d+>|<\/mark_\d+>/g, ''));
      
      // 保存到 localStorage
      localStorage.setItem('markdown-annotation-kit-data', dataToSave);
      
      // 同时提供下载功能
      const blob = new Blob([dataToSave], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `markdown-annotations-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setLastSaved(new Date());
      console.log('✅ 批注数据已保存并下载');
    } catch (error) {
      console.error('❌ 保存批注数据失败:', error);
      alert('保存失败，请查看控制台');
    }
  }, [markdown, annotations, marks]);

  // 加载保存的数据
  const handleLoadSaved = useCallback(() => {
    try {
      const storageKey = 'markdown-annotation-kit-data';
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.markdown) setMarkdown(data.markdown);
        if (data.annotations) setAnnotations(data.annotations);
        if (data.marks) setMarks(data.marks);
        console.log('✅ 已加载保存的批注数据');
        alert('已加载保存的批注数据');
      } else {
        alert('没有找到保存的数据');
      }
    } catch (error) {
      console.error('❌ 加载批注数据失败:', error);
      alert('加载失败，请查看控制台');
    }
  }, []);

  return (
    <div className="dev-app">
      {/* 头部信息 */}
      <header className="dev-app-header">
        <div className="dev-app-header-content">
          <div>
            <h1 className="dev-app-title">
              <span className="dev-app-icon">📝</span>
              Markdown Annotation Kit
            </h1>
            <p className="dev-app-subtitle">
              开发预览 - 选中文本添加批注，查看实时效果
            </p>
          </div>
          <div className="dev-app-stats">
            <div className="dev-app-stat">
              <span className="dev-app-stat-label">批注数量</span>
              <span className="dev-app-stat-value">{annotations.length}</span>
            </div>
            {lastSaved && (
              <div className="dev-app-stat" style={{ opacity: 0.8 }}>
                <span className="dev-app-stat-label">最后保存</span>
                <span className="dev-app-stat-value" style={{ fontSize: '12px' }}>
                  {lastSaved.toLocaleTimeString()}
                </span>
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={handleManualSave}
                className="dev-app-save-button"
                title="保存批注数据到本地并下载 JSON 文件"
              >
                💾 保存
              </button>
              <button
                onClick={handleLoadSaved}
                className="dev-app-save-button"
                title="从 localStorage 加载保存的批注数据"
              >
                📂 加载
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <div className="dev-app-main">
        <MarkdownAnnotator
          value={markdown}
          onChange={setMarkdown}
          annotations={annotations}
          onAnnotationsChange={setAnnotations}
          onPersistence={handlePersistence}
          persistenceDebounce={500}
        />
      </div>

      {/* 底部数据预览 - 可折叠 */}
      <div className={`dev-app-preview ${previewVisible ? 'dev-app-preview-visible' : ''}`}>
        <div className="dev-app-preview-header">
          <div className="dev-app-preview-tabs">
            <button
              className={`dev-app-preview-tab ${previewTab === 'markdown' ? 'active' : ''}`}
              onClick={() => setPreviewTab('markdown')}
            >
              Markdown
            </button>
            <button
              className={`dev-app-preview-tab ${previewTab === 'annotations' ? 'active' : ''}`}
              onClick={() => setPreviewTab('annotations')}
            >
              批注数据
            </button>
            <button
              className={`dev-app-preview-tab ${previewTab === 'both' ? 'active' : ''}`}
              onClick={() => setPreviewTab('both')}
            >
              全部
            </button>
          </div>
          <button
            className="dev-app-preview-toggle"
            onClick={() => setPreviewVisible(!previewVisible)}
            aria-label={previewVisible ? '收起预览' : '展开预览'}
          >
            {previewVisible ? '▼' : '▲'}
          </button>
        </div>
        {previewVisible && (
          <div className="dev-app-preview-content">
            {(previewTab === 'markdown' || previewTab === 'both') && (
              <div className="dev-app-preview-panel">
                <div className="dev-app-preview-panel-header">
                  <span className="dev-app-preview-panel-icon">📄</span>
                  <span className="dev-app-preview-panel-title">当前 Markdown（包含标签）</span>
                  <span className="dev-app-preview-panel-badge">
                    {markdown.length} 字符
                  </span>
                </div>
                <textarea
                  readOnly
                  value={markdownPreview}
                  className="dev-app-preview-textarea"
                  spellCheck={false}
                />
              </div>
            )}
            {(previewTab === 'annotations' || previewTab === 'both') && (
              <div className="dev-app-preview-panel">
                <div className="dev-app-preview-panel-header">
                  <span className="dev-app-preview-panel-icon">💬</span>
                  <span className="dev-app-preview-panel-title">批注数据（JSON）</span>
                  <span className="dev-app-preview-panel-badge">
                    {annotations.length} 条
                  </span>
                </div>
                <pre className="dev-app-preview-code">
                  {annotationsJson}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

