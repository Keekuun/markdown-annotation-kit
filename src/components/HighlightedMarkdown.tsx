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
  if (marks.length === 0) return clean;
  let out = "";
  let cursor = 0;
  for (const m of marks) {
    out += clean.slice(cursor, m.start);
    out += `<span class="annotation-highlight" data-id="${m.id}">`;
    out += clean.slice(m.start, m.end);
    out += "</span>";
    cursor = m.end;
  }
  out += clean.slice(cursor);
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
          h1: ({ children }) => <h1>{children}</h1>,
          h2: ({ children }) => <h2>{children}</h2>,
          h3: ({ children }) => <h3>{children}</h3>,
          p: ({ children }) => <p>{children}</p>,
          li: ({ children }) => <li>{children}</li>,
        }}
      >
        {contentWithHighlights}
      </ReactMarkdown>
    </div>
  );
}

