import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useEffect, useRef } from "react";
import { ParsedMark } from "../utils/mark";

interface HighlightedMarkdownProps {
  content: string;
  marks: ParsedMark[];
  highlightRefs: React.MutableRefObject<Record<number, HTMLElement | null>>;
  onHighlightClick: (id: number) => void;
}

function buildHighlighted(
  clean: string,
  marks: ParsedMark[]
): string | { html: string; codeBlockMarks: ParsedMark[]; clean: string } {
  // 先清理 clean 中可能残留的未解析的 mark 标签（作为安全措施）
  // 这可以防止代码块检测逻辑有问题时，mark 标签被当作普通文本显示
  const sanitizedClean = clean.replace(/<mark_\d+>/g, "").replace(/<\/mark_\d+>/g, "");

  if (marks.length === 0) return sanitizedClean;

  // 检测哪些标注在代码块中
  const codeBlockRanges: Array<{ start: number; end: number }> = [];
  let inCodeBlock = false;
  let codeBlockStart = 0;

  for (let i = 0; i < sanitizedClean.length; i++) {
    if (sanitizedClean.startsWith("```", i)) {
      const beforeIsNewline =
        i === 0 || sanitizedClean[i - 1] === "\n" || sanitizedClean[i - 1] === "\r";
      const afterChar = i + 3 < sanitizedClean.length ? sanitizedClean[i + 3] : "";
      const isCodeBlockMarker =
        beforeIsNewline &&
        (afterChar === "\n" ||
          afterChar === "\r" ||
          afterChar === "" ||
          /[a-zA-Z0-9\s]/.test(afterChar));

      if (isCodeBlockMarker) {
        if (inCodeBlock) {
          // 代码块结束
          codeBlockRanges.push({ start: codeBlockStart, end: i });
          inCodeBlock = false;
        } else {
          // 代码块开始
          codeBlockStart = i;
          inCodeBlock = true;
        }
        i += 2; // 跳过 ```
        continue;
      }
    }
  }

  // 如果代码块没有结束，记录到末尾
  if (inCodeBlock) {
    codeBlockRanges.push({ start: codeBlockStart, end: sanitizedClean.length });
  }

  // 检查标注是否在代码块中
  const isMarkInCodeBlock = (mark: ParsedMark): boolean => {
    return codeBlockRanges.some((range) => mark.start >= range.start && mark.end <= range.end);
  };

  // 分离代码块内外的标注
  const marksInCodeBlocks: ParsedMark[] = [];
  const marksOutsideCodeBlocks: ParsedMark[] = [];

  for (const m of marks) {
    if (
      m.start < 0 ||
      m.end < 0 ||
      m.start >= m.end ||
      m.start > sanitizedClean.length ||
      m.end > sanitizedClean.length
    ) {
      continue;
    }
    if (isMarkInCodeBlock(m)) {
      marksInCodeBlocks.push(m);
    } else {
      marksOutsideCodeBlocks.push(m);
    }
  }

  // 为非代码块中的标注构建 HTML
  let out = "";
  let cursor = 0;
  for (const m of marksOutsideCodeBlocks) {
    out += sanitizedClean.slice(cursor, m.start);
    out += `<span class="annotation-highlight" data-id="${m.id}">`;
    out += sanitizedClean.slice(m.start, m.end);
    out += "</span>";
    cursor = m.end;
  }
  out += sanitizedClean.slice(cursor);

  return { html: out, codeBlockMarks: marksInCodeBlocks, clean: sanitizedClean };
}

export function HighlightedMarkdown({
  content,
  marks,
  highlightRefs,
  onHighlightClick,
}: HighlightedMarkdownProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const result = buildHighlighted(content, marks);
  const contentWithHighlights = typeof result === "string" ? result : result.html;
  const cleanContent = typeof result === "string" ? content : result.clean;

  // 在代码块中应用高亮
  useEffect(() => {
    const codeBlockMarks = typeof result === "string" ? [] : result.codeBlockMarks;
    if (!contentRef.current || codeBlockMarks.length === 0) return;

    const applyCodeBlockHighlights = () => {
      const preElements = contentRef.current?.querySelectorAll("pre code");
      if (!preElements || preElements.length === 0) return;

      // 找到所有代码块在 clean content 中的位置
      const codeBlockRanges: Array<{ start: number; end: number; index: number }> = [];
      let inCodeBlock = false;
      let codeBlockStart = 0;
      let codeBlockIndex = 0;

      for (let i = 0; i < cleanContent.length; i++) {
        if (cleanContent.startsWith("```", i)) {
          const beforeIsNewline =
            i === 0 || cleanContent[i - 1] === "\n" || cleanContent[i - 1] === "\r";
          const afterChar = i + 3 < cleanContent.length ? cleanContent[i + 3] : "";
          const isCodeBlockMarker =
            beforeIsNewline &&
            (afterChar === "\n" ||
              afterChar === "\r" ||
              afterChar === "" ||
              /[a-zA-Z0-9\s]/.test(afterChar));

          if (isCodeBlockMarker) {
            if (inCodeBlock) {
              // 代码块结束
              let codeStart = codeBlockStart + 3; // 跳过 ```
              // 跳过语言标识符
              while (
                codeStart < cleanContent.length &&
                cleanContent[codeStart] !== "\n" &&
                cleanContent[codeStart] !== "\r"
              ) {
                codeStart++;
              }
              codeStart++; // 跳过换行
              codeBlockRanges.push({ start: codeStart, end: i, index: codeBlockIndex });
              codeBlockIndex++;
              inCodeBlock = false;
            } else {
              // 代码块开始
              codeBlockStart = i;
              inCodeBlock = true;
            }
            i += 2; // 跳过 ```
            continue;
          }
        }
      }

      // 为每个代码块应用标注
      codeBlockRanges.forEach((range) => {
        const preElement = preElements[range.index] as HTMLElement;
        if (!preElement) return;

        const codeText = preElement.textContent || "";
        if (!codeText) return;

        // 找到这个代码块范围内的标注
        const marksInThisBlock = codeBlockMarks.filter(
          (mark: ParsedMark) => mark.start >= range.start && mark.end <= range.end
        );

        if (marksInThisBlock.length === 0) return;

        // 按位置从后往前处理，避免位置偏移
        marksInThisBlock
          .sort((a, b) => b.start - a.start)
          .forEach((mark: ParsedMark) => {
            const markText = cleanContent.slice(mark.start, mark.end);
            const markStartInCode = mark.start - range.start;

            // 在代码块文本中查找匹配的位置
            const markIndex = codeText.indexOf(markText, Math.max(0, markStartInCode - 10));
            if (markIndex === -1) return;

            // 使用 TreeWalker 找到对应的文本节点
            const walker = document.createTreeWalker(preElement, NodeFilter.SHOW_TEXT, null);
            let textNode: Node | null = null;
            let offset = 0;
            let targetNode: Node | null = null;
            let targetOffset = 0;

            while ((textNode = walker.nextNode())) {
              const nodeLength = textNode.textContent?.length || 0;
              if (offset + nodeLength >= markIndex) {
                targetNode = textNode;
                targetOffset = markIndex - offset;
                break;
              }
              offset += nodeLength;
            }

            if (targetNode) {
              try {
                const range = document.createRange();
                range.setStart(targetNode, targetOffset);
                range.setEnd(
                  targetNode,
                  Math.min(targetOffset + markText.length, targetNode.textContent?.length || 0)
                );

                const span = document.createElement("span");
                span.className = "annotation-highlight";
                span.setAttribute("data-id", String(mark.id));
                span.style.textDecoration = "underline";
                span.style.textDecorationColor = "var(--markdown-annotator-primary)";
                span.style.textDecorationThickness = "2px";
                span.style.textUnderlineOffset = "4px";
                span.style.cursor = "pointer";
                span.onclick = () => onHighlightClick(mark.id);

                range.surroundContents(span);
                highlightRefs.current[mark.id] = span;
              } catch (e) {
                console.warn("Failed to highlight code block annotation:", e);
              }
            }
          });
      });
    };

    // 延迟执行，确保 DOM 已渲染
    const timer = setTimeout(applyCodeBlockHighlights, 100);
    return () => clearTimeout(timer);
  }, [content, marks, cleanContent, highlightRefs, onHighlightClick, result]);

  return (
    <div ref={contentRef} className="markdown-annotator-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          span: ({ className, children, ...props }) => {
            if (className === "annotation-highlight") {
              const id = Number((props as { "data-id"?: string })["data-id"]);
              return (
                <span
                  ref={(el) => (highlightRefs.current[id] = el)}
                  className="annotation-highlight"
                  onClick={() => onHighlightClick(id)}
                >
                  {children}
                </span>
              );
            }
            return <span {...props}>{children}</span>;
          },
          // 所有其他元素使用默认渲染，样式由 CSS 控制
        }}
      >
        {contentWithHighlights}
      </ReactMarkdown>
    </div>
  );
}
