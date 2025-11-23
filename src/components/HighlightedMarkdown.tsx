import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { ParsedMark } from "../utils/mark";

interface HighlightedMarkdownProps {
  content: string;
  marks: ParsedMark[];
  highlightRefs: React.MutableRefObject<Record<number, HTMLElement | null>>;
  onHighlightClick: (id: number) => void;
}

function buildHighlighted(clean: string, marks: ParsedMark[]): string {
  // 先清理 clean 中可能残留的未解析的 mark 标签（作为安全措施）
  // 这可以防止代码块检测逻辑有问题时，mark 标签被当作普通文本显示
  const sanitizedClean = clean.replace(/<mark_\d+>/g, "").replace(/<\/mark_\d+>/g, "");

  if (marks.length === 0) return sanitizedClean;
  let out = "";
  let cursor = 0;
  for (const m of marks) {
    // 确保 mark 的位置在有效范围内
    if (
      m.start < 0 ||
      m.end < 0 ||
      m.start >= m.end ||
      m.start > sanitizedClean.length ||
      m.end > sanitizedClean.length
    ) {
      continue;
    }
    out += sanitizedClean.slice(cursor, m.start);
    out += `<span class="annotation-highlight" data-id="${m.id}">`;
    out += sanitizedClean.slice(m.start, m.end);
    out += "</span>";
    cursor = m.end;
  }
  out += sanitizedClean.slice(cursor);
  return out;
}

export function HighlightedMarkdown({
  content,
  marks,
  highlightRefs,
  onHighlightClick,
}: HighlightedMarkdownProps) {
  const contentWithHighlights = buildHighlighted(content, marks);

  return (
    <div className="markdown-annotator-content">
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
