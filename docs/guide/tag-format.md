# 标签格式

组件使用 `<mark_N></mark_N>` 标签来标记批注文本。

## 标签规则

1. **格式**: `<mark_N>文本</mark_N>`，其中 `N` 是批注 ID
2. **ID 要求**: 必须为正整数，且唯一
3. **嵌套**: 标签不能嵌套，但可以相邻
4. **位置**: 标签可以出现在 Markdown 的任何位置，包括代码块中

## 示例

### 单个批注

```markdown
这是<mark_1>一段被标记的文本</mark_1>内容。
```

### 多个批注

```markdown
这是<mark_1>第一段</mark_1>批注，这是<mark_2>第二段</mark_2>批注。
```

### 相邻批注

```markdown
这是<mark_1>第一段</mark_1><mark_2>第二段</mark_2>批注。
```

### 代码块中的批注

```markdown
```typescript
const example = <mark_1>value</mark_1>;
```
```

注意：代码块中的批注标签会被保留在原始 Markdown 中，但不会在渲染时显示为 HTML，而是通过 DOM 操作添加高亮。

## ID 管理

- 组件会自动生成递增的批注 ID
- 新批注的 ID = max(现有批注 ID, 现有标签 ID) + 1
- 如果手动指定 ID，请确保唯一性

## 数据持久化

标签格式使得数据可以轻松序列化和反序列化：

```typescript
// 保存
const markdown = `# 标题\n\n这是<mark_1>批注文本</mark_1>。`;
const annotations = [{ id: 1, note: "这是批注内容" }];

// 加载
// Markdown 中已经包含了标签，直接使用即可
```

