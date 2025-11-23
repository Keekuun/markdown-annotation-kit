# 自定义样式

组件提供了多种方式来自定义样式。

## CSS 变量

组件使用 CSS 变量来定义主题颜色，你可以覆盖这些变量：

```css
.markdown-annotator-container {
  --markdown-annotator-primary: #ff6b6b;
  --markdown-annotator-primary-hover: #ee5a5a;
  --markdown-annotator-primary-active: #dd4a4a;
  --markdown-annotator-primary-light: rgba(255, 107, 107, 0.1);
  --markdown-annotator-bg: #ffffff;
  --markdown-annotator-bg-secondary: #fafafa;
  --markdown-annotator-text-primary: #111827;
  --markdown-annotator-text-secondary: #374151;
  --markdown-annotator-border: #e5e7eb;
}
```

## 类名覆盖

使用 `className` 属性添加自定义类名：

```tsx
<MarkdownAnnotator className="my-annotator" defaultValue={markdown} />
```

然后使用 CSS 覆盖样式：

```css
.my-annotator .annotation-highlight {
  background-color: rgba(255, 107, 107, 0.1);
  text-decoration: none;
  border-bottom: 2px solid #ff6b6b;
}

.my-annotator .markdown-annotator-sidebar {
  background-color: #f5f5f5;
}
```

## 完整样式覆盖示例

```css
/* 自定义主题 */
.my-annotator {
  /* 主色调 */
  --markdown-annotator-primary: #6366f1;
  --markdown-annotator-primary-hover: #4f46e5;
  --markdown-annotator-primary-active: #4338ca;
  --markdown-annotator-primary-light: rgba(99, 102, 241, 0.1);

  /* 背景色 */
  --markdown-annotator-bg: #ffffff;
  --markdown-annotator-bg-secondary: #f8fafc;
  --markdown-annotator-bg-tertiary: #f1f5f9;

  /* 文字颜色 */
  --markdown-annotator-text-primary: #0f172a;
  --markdown-annotator-text-secondary: #334155;
  --markdown-annotator-text-tertiary: #64748b;

  /* 边框颜色 */
  --markdown-annotator-border: #e2e8f0;
}

/* 自定义高亮样式 */
.my-annotator .annotation-highlight {
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(99, 102, 241, 0.1) 50%,
    transparent 100%
  );
  text-decoration: none;
  padding: 2px 4px;
  border-radius: 3px;
}

.my-annotator .annotation-highlight:hover {
  background: rgba(99, 102, 241, 0.2);
}

/* 自定义侧边栏 */
.my-annotator .markdown-annotator-sidebar {
  border-left: 2px solid var(--markdown-annotator-primary);
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);
}
```

## 响应式设计

组件默认是响应式的，但你可以通过媒体查询进一步定制：

```css
@media (max-width: 768px) {
  .markdown-annotator-sidebar {
    width: 100%;
    border-left: none;
    border-top: 1px solid var(--markdown-annotator-border);
  }
}
```

