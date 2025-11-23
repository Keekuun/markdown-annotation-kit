import { useState, useMemo } from 'react';
import { MarkdownAnnotator, AnnotationItem } from '../src/index';

// 包含大量重复文本和标注的测试用例
const TEST_MARKDOWN = `# Markdown 文档<mark_1>批注</mark_1>示例

## 功能<mark_2>特性</mark_2>

这是一个功能强大的 Markdown 批注组件，支持以下特性：

- **文本选择批注** - 选中任意文本即可添加批注

- **双向锚定** - 点击批注卡片定位到原文，点击高亮文本定<mark_3>位到批注</mark_3>

- **标签系统** - 使用 \`<mark_N></mark_N>\` 标签持久化批注数据

- **标签回显** - 自动识别并回显已保存的批注标签

## 重复文本测试区域

### 第一段：包含多个"批注"

这是第一段文本，其中包含<mark_4>批注</mark_4>这个词。这段文本的目的是测试当文档中有多个相同的"批注"文本时，组件能否准确标记每个位置。请注意，这里又出现了<mark_5>批注</mark_5>这个词，但位置不同。

### 第二段：更多重复文本

在第二段中，我们继续测试重复文本的标注功能。这里有一个<mark_6>批注</mark_6>，后面还有另一个<mark_7>批注</mark_7>。即使文本完全相同，每个<mark_8>批注</mark_8>都应该被独立标记。

### 第三段：连续重复

第三段展示了连续出现的重复文本：<mark_9>批注</mark_9>和<mark_10>批注</mark_10>紧挨着出现。这种情况特别考验组件的位置计算能力。

### 第四段：混合场景

第四段混合了已标记和未标记的文本。这里有一个已标记的<mark_11>批注</mark_11>，后面还有一个未标记的批注。用户应该能够继续标记未标记的批注。

## 长文本中的重复

这是一段较长的文本，用于测试在长文本中标记重复文本的能力。当文本很长时，位置计算可能会更加复杂。这里有一个<mark_12>批注</mark_12>出现在文本的中间位置。后面还有更多的内容，包括另一个<mark_13>批注</mark_13>出现在文本的末尾附近。

## 代码块中的文本

虽然代码块中的文本通常不应该被标记，但为了测试，我们也包含了一些示例：

\`\`\`typescript
// 这是一个代码示例
// 包含注释：批注功能测试
function addAnnotation(text: string) {
  return \`批注: \${text}\`;
}
\`\`\`

## 列表中的重复

- 列表项一：包含<mark_14>批注</mark_14>的列表项
- 列表项二：另一个包含<mark_15>批注</mark_15>的列表项
- 列表项三：第三个包含<mark_16>批注</mark_16>的列表项
- 列表项四：未标记的批注（可以继续标记）

## 标题中的重复

### 标题一：包含<mark_17>批注</mark_17>的标题

### 标题二：另一个包含<mark_18>批注</mark_18>的标题

### 标题三：未标记的批注标题

## 测试说明

### 测试步骤

1. **测试已标记文本的回显**
   - 检查所有已标记的"批注"是否正确高亮显示
   - 检查侧边栏是否正确显示所有批注卡片

2. **测试新标记的准确性**
   - 选中未标记的"批注"文本
   - 添加批注，检查是否正确标记到选中的位置
   - 验证不会影响其他已标记的文本

3. **测试重复文本的独立标记**
   - 依次标记所有未标记的"批注"
   - 验证每个"批注"都被独立标记，互不干扰
   - 检查批注序号是否正确递增

4. **测试位置计算的准确性**
   - 标记不同位置的相同文本
   - 验证每个标记都准确对应到选中的位置
   - 检查不会出现位置偏移或重复标记

### 预期结果

- 所有已标记的"批注"都应该正确高亮显示
- 新标记的"批注"应该准确标记到用户选中的位置
- 即使有多个相同的文本，每个标记都应该独立且准确
- 批注序号应该按标记顺序递增
- 点击批注卡片应该能准确跳转到对应的文本位置

### 边界情况测试

1. **连续重复文本**：测试标记连续出现的相同文本
2. **已标记区域附近**：测试在已标记文本附近标记新文本
3. **跨段落标记**：测试标记跨越多个段落的文本
4. **特殊字符**：测试包含特殊字符的文本标记

## 总结

这个测试用例包含了：
- 18 个已标记的"批注"文本
- 多个未标记的"批注"文本，可用于继续测试
- 各种场景：标题、段落、列表、代码块等
- 不同的位置：开头、中间、末尾、连续等

通过这个测试用例，可以全面验证组件在处理重复文本时的准确性和可靠性。`;

// 预定义的批注数据（对应 18 个已标记的文本）
const TEST_ANNOTATIONS: AnnotationItem[] = [
  { id: 1, note: '标题中的批注 - 标记位置：标题' },
  { id: 2, note: '功能特性中的批注 - 标记位置：功能特性标题' },
  { id: 3, note: '定位到批注 - 标记位置：双向锚定说明' },
  { id: 4, note: '第一段第一个批注 - 标记位置：第一段开头' },
  { id: 5, note: '第一段第二个批注 - 标记位置：第一段中间' },
  { id: 6, note: '第二段第一个批注 - 标记位置：第二段开头' },
  { id: 7, note: '第二段第二个批注 - 标记位置：第二段中间' },
  { id: 8, note: '第二段第三个批注 - 标记位置：第二段末尾' },
  { id: 9, note: '第三段第一个批注 - 标记位置：连续重复文本1' },
  { id: 10, note: '第三段第二个批注 - 标记位置：连续重复文本2' },
  { id: 11, note: '第四段已标记批注 - 标记位置：混合场景' },
  { id: 12, note: '长文本中间批注 - 标记位置：长文本中间' },
  { id: 13, note: '长文本末尾批注 - 标记位置：长文本末尾' },
  { id: 14, note: '列表项一批注 - 标记位置：列表第一项' },
  { id: 15, note: '列表项二批注 - 标记位置：列表第二项' },
  { id: 16, note: '列表项三批注 - 标记位置：列表第三项' },
  { id: 17, note: '标题一批注 - 标记位置：标题一' },
  { id: 18, note: '标题二批注 - 标记位置：标题二' },
];

function TestCaseApp() {
  const [markdown, setMarkdown] = useState(TEST_MARKDOWN);
  const [annotations, setAnnotations] = useState<AnnotationItem[]>(TEST_ANNOTATIONS);

  const markdownPreview = useMemo(() => {
    return markdown;
  }, [markdown]);

  const annotationsJson = useMemo(() => {
    return JSON.stringify(annotations, null, 2);
  }, [annotations]);

  const stats = useMemo(() => {
    const totalMarks = (markdown.match(/<mark_\d+>/g) || []).length;
    const totalAnnotations = annotations.length;
    const unmarkedText = (markdown.match(/批注/g) || []).length - totalMarks;
    return { totalMarks, totalAnnotations, unmarkedText };
  }, [markdown, annotations]);

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
          Markdown Annotation Kit - 重复文本测试用例
        </h1>
        <div style={{ display: 'flex', gap: '20px', marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>
          <span>已标记数量: <strong style={{ color: '#2563eb' }}>{stats.totalMarks}</strong></span>
          <span>批注数量: <strong style={{ color: '#2563eb' }}>{stats.totalAnnotations}</strong></span>
          <span>未标记"批注": <strong style={{ color: '#dc2626' }}>{stats.unmarkedText}</strong></span>
        </div>
        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
          测试场景：包含大量重复"批注"文本，验证组件能否准确标记每个位置
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

export default TestCaseApp;

