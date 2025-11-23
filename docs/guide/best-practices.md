# 最佳实践

本文档提供了一些使用组件的最佳实践建议。

## 性能优化

### 大量批注

如果文档中有大量批注（> 100 个），建议：

- 使用虚拟滚动（需要自行实现）
- 分页加载批注
- 延迟渲染非可见区域的批注

### 长文档

对于长文档（> 10000 行），建议：

- 分页加载内容
- 使用代码分割
- 考虑使用服务端渲染

## 数据管理

### 实时保存

使用 `onPersistence` 回调进行实时保存，并设置合适的防抖延迟：

```tsx
const handlePersistence = createDebouncedPersistence(
  async (data) => {
    await saveToServer(data);
  },
  1000 // 1 秒防抖
);
```

### 错误处理

始终处理保存失败的情况：

```tsx
const handlePersistence = createDebouncedPersistence(async (data) => {
  try {
    await saveToServer(data);
  } catch (error) {
    console.error("保存失败:", error);
    // 显示错误提示
    showErrorToast("保存失败，请重试");
  }
});
```

## 用户体验

### 加载状态

在加载数据时显示加载状态：

```tsx
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadData().finally(() => setLoading(false));
}, []);

if (loading) {
  return <LoadingSpinner />;
}
```

### 保存状态

显示保存状态，让用户知道数据已保存：

```tsx
const [saved, setSaved] = useState(true);

const handlePersistence = createDebouncedPersistence(async (data) => {
  setSaved(false);
  await saveToServer(data);
  setSaved(true);
});
```

## 安全性

### 输入验证

验证用户输入的批注内容：

```tsx
const handleAnnotationsChange = (annotations: AnnotationItem[]) => {
  // 验证批注内容
  const validAnnotations = annotations.filter((ann) => {
    return ann.note.trim().length > 0 && ann.note.length < 1000;
  });
  setAnnotations(validAnnotations);
};
```

### XSS 防护

组件已经内置了 XSS 防护，但建议：

- 不要在批注内容中存储敏感信息
- 对从服务器加载的数据进行验证

## 可访问性

### 键盘导航

组件支持键盘导航：

- `Tab`: 在批注卡片之间导航
- `Enter`: 激活批注卡片
- `Esc`: 关闭弹窗

### ARIA 属性

组件已经包含了必要的 ARIA 属性，无需额外配置。

## 测试

### 单元测试

为使用组件的代码编写单元测试：

```tsx
import { render, screen } from "@testing-library/react";
import { MarkdownAnnotator } from "markdown-annotation-kit";

test("renders markdown content", () => {
  render(<MarkdownAnnotator defaultValue="# Title" />);
  expect(screen.getByText("Title")).toBeInTheDocument();
});
```

### 集成测试

测试完整的用户流程：

```tsx
test("user can add annotation", async () => {
  const { user } = render(<MarkdownAnnotator defaultValue="Test" />);
  // 选择文本
  // 输入批注
  // 确认
  // 验证批注已添加
});
```

