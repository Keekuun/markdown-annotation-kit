import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { injectMarkTags, stripMarkTags, ParsedMark } from "./utils/mark";
import "./styles.css";

export type AnnotationItem = { id: number; note: string };

export type MarkdownAnnotatorProps = {
  defaultValue?: string;
  value?: string;
  onChange?: (markdown: string) => void;
  defaultAnnotations?: AnnotationItem[];
  annotations?: AnnotationItem[];
  onAnnotationsChange?: (next: AnnotationItem[]) => void;
  className?: string;
};

function useControlled<T>(controlled: T | undefined, defaultValue: T) {
  const [inner, setInner] = useState(defaultValue);
  const isControlled = controlled !== undefined;
  return [isControlled ? controlled : inner, setInner, isControlled] as const;
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

export function MarkdownAnnotator(props: MarkdownAnnotatorProps) {
  const { defaultValue = "", value, onChange, defaultAnnotations = [], annotations, onAnnotationsChange, className } = props;

  const [rawMarkdown, setRawMarkdown, isMarkdownControlled] = useControlled<string>(value, defaultValue);
  const [ann, setAnn, isAnnControlled] = useControlled<AnnotationItem[]>(annotations, defaultAnnotations);

  const parse = useMemo(() => stripMarkTags(rawMarkdown), [rawMarkdown]);
  const clean = parse.clean;
  const marks = parse.marks;

  const highlightRefs = useRef<Record<number, HTMLElement | null>>({});
  const markdownRef = useRef<HTMLDivElement | null>(null);
  const floatWindowRef = useRef<HTMLDivElement | null>(null);

  const [floatWindow, setFloatWindow] = useState({ visible: false, x: 0, y: 0, text: "" });
  const [editIndex, setEditIndex] = useState<number>(-1);
  const [editValue, setEditValue] = useState<string>("");
  const selectionRangeRef = useRef<Range | null>(null);
  const tempSelectionSpanRef = useRef<HTMLSpanElement | null>(null);
  const tempSelectionIdRef = useRef<string>("");
  const selectionContextRef = useRef<{ before: string; after: string } | null>(null);

  const contentWithHighlights = useMemo(() => buildHighlighted(clean, marks), [clean, marks]);

  useEffect(() => {
    if (annotations && annotations.length) {
      setAnn(annotations);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotations]);

  // 清理临时选中的 span
  const cleanupTempSelection = useCallback(() => {
    if (tempSelectionSpanRef.current) {
      const parent = tempSelectionSpanRef.current.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(tempSelectionSpanRef.current.textContent || ''), tempSelectionSpanRef.current);
        parent.normalize();
      }
      tempSelectionSpanRef.current = null;
      tempSelectionIdRef.current = "";
    }
  }, []);

  const handleSelection = useCallback((event?: MouseEvent) => {
    // 如果点击的是浮窗内的元素，不处理选择逻辑
    if (event && floatWindowRef.current && floatWindowRef.current.contains(event.target as Node)) {
      return;
    }

    // 清理之前的临时选中标记
    cleanupTempSelection();

    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) {
      // 如果浮窗已经显示，点击外部区域才关闭
      if (floatWindow.visible) {
        setFloatWindow(s => ({ ...s, visible: false }));
      }
      return;
    }
    const range = sel.getRangeAt(0);
    const selectedText = sel.toString().trim();
    if (!selectedText) {
      // 如果浮窗已经显示，点击外部区域才关闭
      if (floatWindow.visible) {
        setFloatWindow(s => ({ ...s, visible: false }));
      }
      return;
    }
    if (markdownRef.current && markdownRef.current.contains(range.commonAncestorContainer)) {
      // 检查是否在已标记区域内
      const checkIfInMarkedArea = (node: Node): boolean => {
        let parent = node.nodeType === Node.TEXT_NODE 
          ? node.parentElement 
          : node as Element;
        while (parent && parent !== markdownRef.current) {
          if (parent.classList && parent.classList.contains('annotation-highlight')) {
            return true;
          }
          parent = parent.parentElement;
        }
        return false;
      };

      if (checkIfInMarkedArea(range.startContainer) || checkIfInMarkedArea(range.endContainer)) {
        // 选中的文本在已标记区域内，不允许重复标记
        return;
      }

      // 获取选中文本的上下文（前后各一定长度的文本）
      // 用于精确定位重复文本
      // 注意：必须获取纯文本，不包含 HTML 标签
      const getSelectionContext = (range: Range, container: HTMLElement): { before: string; after: string } => {
        const contextLength = 50; // 前后各取50个字符作为上下文
        
        // 获取选中文本前的上下文（使用 textContent 获取纯文本）
        const beforeRange = range.cloneRange();
        beforeRange.setStart(container, 0);
        beforeRange.setEnd(range.startContainer, range.startOffset);
        
        // 创建一个临时容器来获取纯文本
        const beforeContainer = document.createDocumentFragment();
        beforeContainer.appendChild(beforeRange.cloneContents());
        let beforeText = beforeContainer.textContent || '';
        if (beforeText.length > contextLength) {
          beforeText = beforeText.slice(-contextLength);
        }
        
        // 获取选中文本后的上下文（使用 textContent 获取纯文本）
        const afterRange = range.cloneRange();
        afterRange.setStart(range.endContainer, range.endOffset);
        afterRange.setEnd(container, container.childNodes.length);
        
        const afterContainer = document.createDocumentFragment();
        afterContainer.appendChild(afterRange.cloneContents());
        let afterText = afterContainer.textContent || '';
        if (afterText.length > contextLength) {
          afterText = afterText.slice(0, contextLength);
        }
        
        return { before: beforeText, after: afterText };
      };

      const context = getSelectionContext(range, markdownRef.current);
      selectionContextRef.current = context;

      // 用临时 span 包裹选中的文本
      try {
        const span = document.createElement('span');
        const tempId = `temp-selection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        span.setAttribute('data-temp-selection-id', tempId);
        span.style.backgroundColor = 'rgba(255, 235, 59, 0.3)';
        span.style.borderBottom = '2px solid #ffc107';
        span.style.cursor = 'pointer';
        
        range.surroundContents(span);
        tempSelectionSpanRef.current = span;
        tempSelectionIdRef.current = tempId;
        selectionRangeRef.current = range.cloneRange();
        
        const rect = range.getBoundingClientRect();
        const x = Math.max(0, rect.left + window.scrollX - 140 + rect.width / 2);
        const y = rect.top + window.scrollY - 100;
        setFloatWindow({ visible: true, x, y, text: selectedText });
      } catch (e) {
        // 如果 surroundContents 失败（比如选中跨越了多个节点），使用其他方法
        console.warn('Failed to wrap selection with span, using range method:', e);
        // 即使 surroundContents 失败，仍然保存 range 用于位置计算
        selectionRangeRef.current = range.cloneRange();
        const rect = range.getBoundingClientRect();
        const x = Math.max(0, rect.left + window.scrollX - 140 + rect.width / 2);
        const y = rect.top + window.scrollY - 100;
        setFloatWindow({ visible: true, x, y, text: selectedText });
      }
      
    } else {
      setFloatWindow(s => ({ ...s, visible: false }));
      selectionRangeRef.current = null;
    }
  }, [floatWindow.visible, cleanupTempSelection]);

  useEffect(() => {
    const onMouseUp = (event: MouseEvent) => handleSelection(event);
    document.addEventListener("mouseup", onMouseUp);
    return () => document.removeEventListener("mouseup", onMouseUp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleSelection]);

  // 使用 split 方法通过上下文精确定位重复文本
  // 这是简单粗暴但有效的方法：通过前后文本来唯一确定位置
  const getTextPositionByContext = useCallback((selectedText: string, context: { before: string; after: string }): { start: number; end: number } | null => {
    if (!selectedText || !context) {
      return null;
    }

    // 使用 split 方法分割文本
    const parts = clean.split(selectedText);
    
    if (parts.length < 2) {
      // 没有找到匹配的文本
      return null;
    }

    // 规范化上下文文本（去除多余空白）
    const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
    const normalizedBefore = normalize(context.before);
    const normalizedAfter = normalize(context.after);

    // 遍历所有可能的匹配位置，通过前后上下文来精确定位
    let currentPos = 0;
    let bestMatch: { start: number; end: number; beforeScore: number; afterScore: number } | null = null;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const beforePart = parts[i];
      
      // 计算当前位置
      currentPos += beforePart.length;
      const start = currentPos;
      const end = currentPos + selectedText.length;
      
      // 获取该位置前后的上下文
      const contextBefore = clean.slice(Math.max(0, start - Math.max(context.before.length, 100)), start);
      const contextAfter = clean.slice(end, Math.min(clean.length, end + Math.max(context.after.length, 100)));
      
      // 规范化获取的上下文
      const normalizedContextBefore = normalize(contextBefore);
      const normalizedContextAfter = normalize(contextAfter);
      
      // 计算匹配分数（匹配的字符数）
      let beforeScore = 0;
      let afterScore = 0;
      
      // 检查前文匹配：从后往前比较
      if (normalizedBefore.length > 0 && normalizedContextBefore.length > 0) {
        const minLen = Math.min(normalizedBefore.length, normalizedContextBefore.length);
        for (let j = 1; j <= minLen; j++) {
          if (normalizedContextBefore.slice(-j) === normalizedBefore.slice(-j)) {
            beforeScore = j;
          } else {
            break;
          }
        }
      }
      
      // 检查后文匹配：从前往后比较
      if (normalizedAfter.length > 0 && normalizedContextAfter.length > 0) {
        const minLen = Math.min(normalizedAfter.length, normalizedContextAfter.length);
        for (let j = 1; j <= minLen; j++) {
          if (normalizedContextAfter.slice(0, j) === normalizedAfter.slice(0, j)) {
            afterScore = j;
          } else {
            break;
          }
        }
      }
      
      // 如果前后文都完全匹配，直接返回
      if (beforeScore === normalizedBefore.length && afterScore === normalizedAfter.length) {
        return { start, end };
      }
      
      // 记录最佳匹配（优先选择前后文匹配都较好的）
      if (!bestMatch) {
        bestMatch = { start, end, beforeScore, afterScore };
      } else {
        const currentTotal = beforeScore + afterScore;
        const bestTotal = bestMatch.beforeScore + bestMatch.afterScore;
        // 如果当前匹配更好，或者总分相同但前后文都匹配更好
        if (currentTotal > bestTotal || 
            (currentTotal === bestTotal && beforeScore > 0 && afterScore > 0 && 
             (bestMatch.beforeScore === 0 || bestMatch.afterScore === 0))) {
          bestMatch = { start, end, beforeScore, afterScore };
        }
      }
      
      // 移动到下一个可能的位置
      currentPos += selectedText.length;
    }
    
    // 如果找到了匹配，返回最佳匹配
    // 要求前后文至少各有一些匹配，或者只有一个匹配位置
    if (bestMatch) {
      const minBeforeScore = Math.min(3, normalizedBefore.length);
      const minAfterScore = Math.min(3, normalizedAfter.length);
      
      // 如果前后文都有一定匹配，或者只有一个匹配位置，返回它
      if ((bestMatch.beforeScore >= minBeforeScore && bestMatch.afterScore >= minAfterScore) ||
          (bestMatch.beforeScore > 0 && bestMatch.afterScore > 0) ||
          parts.length === 2) {
        return { start: bestMatch.start, end: bestMatch.end };
      }
    }
    
    return null;
  }, [clean]);

  const confirmAnnotation = useCallback((note: string) => {
    const selectedText = floatWindow.text;
    if (!selectedText || !markdownRef.current) {
      cleanupTempSelection();
      setFloatWindow(s => ({ ...s, visible: false }));
      selectionRangeRef.current = null;
      selectionContextRef.current = null;
      return;
    }

    // 优先使用上下文方法（split + 前后文）精确定位
    let position: { start: number; end: number } | null = null;
    
    if (selectionContextRef.current) {
      position = getTextPositionByContext(selectedText, selectionContextRef.current);
    }
    
    // 如果上下文方法失败，尝试使用临时 span 方法
    if (!position && tempSelectionSpanRef.current) {
      const span = tempSelectionSpanRef.current;
      
      const walker = document.createTreeWalker(
        markdownRef.current,
        NodeFilter.SHOW_TEXT,
        null
      );

      let textOffset = 0;
      let startOffset = -1;
      let endOffset = -1;
      let foundSpanStart = false;

      let node: Node | null;
      while ((node = walker.nextNode())) {
        const textNode = node as Text;
        const textLength = textNode.textContent?.length || 0;
        
        let parent = textNode.parentElement;
        let isInTempSpan = false;
        while (parent && parent !== markdownRef.current) {
          if (parent === span) {
            isInTempSpan = true;
            break;
          }
          parent = parent.parentElement;
        }

        if (isInTempSpan) {
          if (!foundSpanStart) {
            startOffset = textOffset;
            foundSpanStart = true;
          }
          textOffset += textLength;
          endOffset = textOffset;
        } else {
          if (!foundSpanStart) {
            textOffset += textLength;
          } else {
            break;
          }
        }
      }

      if (startOffset >= 0 && endOffset >= 0 && endOffset > startOffset) {
        position = { start: startOffset, end: endOffset };
      }
    }
    
    // 如果所有方法都失败，拒绝标记
    if (!position) {
      console.error('Failed to calculate accurate position for annotation');
      cleanupTempSelection();
      setFloatWindow(s => ({ ...s, visible: false }));
      selectionRangeRef.current = null;
      selectionContextRef.current = null;
      return;
    }

    const { start, end } = position;
    
    // 验证位置是否在有效范围内
    if (start < 0 || end < 0 || start >= end || start > clean.length || end > clean.length) {
      console.error('Invalid position:', { start, end, cleanLength: clean.length });
      cleanupTempSelection();
      setFloatWindow(s => ({ ...s, visible: false }));
      selectionRangeRef.current = null;
      return;
    }
    
    // 验证位置对应的文本是否匹配（使用更宽松的匹配）
    const positionText = clean.slice(start, end);
    const normalizedPosition = positionText.replace(/\s+/g, ' ').trim();
    const normalizedSelected = selectedText.replace(/\s+/g, ' ').trim();
    if (positionText !== selectedText && 
        positionText.trim() !== selectedText.trim() &&
        normalizedPosition !== normalizedSelected &&
        !(normalizedPosition.length === normalizedSelected.length && normalizedPosition.length > 0)) {
      console.error('Position text mismatch:', {
        positionText,
        selectedText,
        normalizedPosition,
        normalizedSelected,
        start,
        end
      });
      cleanupTempSelection();
      setFloatWindow(s => ({ ...s, visible: false }));
      selectionRangeRef.current = null;
      return;
    }
    
    const maxId = ann.length ? Math.max(...ann.map(a => a.id)) : 0;
    const newId = Math.max(maxId, marks.length ? Math.max(...marks.map(m => m.id)) : 0) + 1;
    const nextRaw = injectMarkTags(rawMarkdown, parse.boundaryMap, start, end, newId);
    
    if (isMarkdownControlled) onChange && onChange(nextRaw); else setRawMarkdown(nextRaw);
    const nextAnn = [...ann, { id: newId, note }];
    if (isAnnControlled) onAnnotationsChange && onAnnotationsChange(nextAnn); else setAnn(nextAnn);
    
    // 清理临时选中标记
    cleanupTempSelection();
    window.getSelection()?.removeAllRanges();
    setFloatWindow(s => ({ ...s, visible: false }));
    selectionRangeRef.current = null;
    selectionContextRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floatWindow.text, clean, ann, marks, rawMarkdown, parse.boundaryMap, isMarkdownControlled, onChange, isAnnControlled, onAnnotationsChange, getTextPositionByContext, cleanupTempSelection]);

  const anchorToHighlight = useCallback((idx: number) => {
    const item = ann[idx];
    if (!item) return;
    const el = highlightRefs.current[item.id];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.style.backgroundColor = "rgba(37, 99, 235, 0.2)";
    setTimeout(() => { if (el) el.style.backgroundColor = "transparent"; }, 1000);
  }, [ann]);

  const handleEdit = useCallback((idx: number, cancel?: boolean) => {
    if (cancel) { setEditIndex(-1); setEditValue(""); return; }
    const item = ann[idx];
    if (!item) return;
    setEditIndex(idx);
    setEditValue(item.note);
  }, [ann]);

  const confirmEdit = useCallback((idx: number) => {
    if (!editValue.trim()) return;
    const next = ann.slice();
    next[idx] = { ...next[idx], note: editValue.trim() };
    if (isAnnControlled) onAnnotationsChange && onAnnotationsChange(next); else setAnn(next);
    setEditIndex(-1);
    setEditValue("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editValue, ann, isAnnControlled, onAnnotationsChange]);

  const deleteAnnotation = useCallback((idx: number) => {
    const item = ann[idx];
    if (!item) return;
    const id = item.id;
    const re = new RegExp(`<mark_${id}>(.*?)</mark_${id}>`, "g");
    const nextRaw = rawMarkdown.replace(re, "$1");
    if (isMarkdownControlled) onChange && onChange(nextRaw); else setRawMarkdown(nextRaw);
    const nextAnn = ann.filter((_, i) => i !== idx);
    if (isAnnControlled) onAnnotationsChange && onAnnotationsChange(nextAnn); else setAnn(nextAnn);
    delete highlightRefs.current[id];
    if (editIndex === idx) { setEditIndex(-1); setEditValue(""); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ann, rawMarkdown, isMarkdownControlled, onChange, isAnnControlled, onAnnotationsChange, editIndex]);

  return (
    <div className={`markdown-annotator-container ${className || ""}`}>
      <div ref={markdownRef} className="markdown-annotator-content">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={{
          span: ({ className, children, ...props }) => {
            if (className === "annotation-highlight") {
              const id = Number((props as { "data-id"?: string })["data-id"]);
              return (
                <span
                  ref={el => (highlightRefs.current[id] = el)}
                  className="annotation-highlight"
                  onClick={() => {
                    const index = ann.findIndex(a => a.id === id);
                    if (index !== -1) {
                      const cardEl = document.getElementById(`annotation-card-${index}`);
                      if (cardEl) {
                        cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
                        (cardEl as HTMLElement).style.borderColor = "#2563eb";
                        setTimeout(() => { (cardEl as HTMLElement).style.borderColor = editIndex === index ? "#2563eb" : "#e5e7eb"; }, 1000);
                      }
                    }
                  }}
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
          li: ({ children }) => <li>{children}</li>
        }}>
          {contentWithHighlights}
        </ReactMarkdown>
      </div>

      <div className="markdown-annotator-sidebar">
        <div className="markdown-annotator-sidebar-header">
          <div className="markdown-annotator-sidebar-icon">💡</div>
          <h3 className="markdown-annotator-sidebar-title">文档批注</h3>
        </div>
        {ann.length === 0 ? (
          <div className="markdown-annotator-empty">
            <div className="markdown-annotator-empty-icon">📝</div>
            <div>暂无批注</div>
            <div style={{ marginTop: "8px", fontSize: "12px" }}>选中文本添加批注吧～</div>
          </div>
        ) : (
          ann.map((a, index) => (
            <div key={a.id} id={`annotation-card-${index}`} className="annotation-card" onClick={() => anchorToHighlight(index)}>
              <div className="annotation-card-header">
                <div className="annotation-card-badge">
                  <span className="annotation-card-number">{index + 1}</span>
                  <span className="annotation-card-label">批注 {index + 1}</span>
                </div>
                <div className="annotation-card-actions">
                  <button className="annotation-card-button annotation-card-button-edit" onClick={(e) => { e.stopPropagation(); handleEdit(index); }}>编辑</button>
                  <button className="annotation-card-button annotation-card-button-delete" onClick={(e) => { e.stopPropagation(); deleteAnnotation(index); }}>删除</button>
                </div>
              </div>
              {editIndex === index ? (
                <div className="annotation-card-edit-area">
                  <textarea className="annotation-card-textarea" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                  <div className="annotation-card-edit-actions">
                    <button className="annotation-card-button-cancel" onClick={(e) => { e.stopPropagation(); handleEdit(index, true); }}>取消</button>
                    <button className="annotation-card-button-confirm" onClick={(e) => { e.stopPropagation(); confirmEdit(index); }} disabled={!editValue.trim()}>确认</button>
                  </div>
                </div>
              ) : (
                <p className="annotation-card-content">{a.note}</p>
              )}
            </div>
          ))
        )}
      </div>

      {floatWindow.visible && (
        <div 
          ref={floatWindowRef}
          onMouseDown={(e) => e.stopPropagation()}
          className="annotation-float-window"
          style={{ left: floatWindow.x, top: floatWindow.y }}
        >
          <div className="annotation-float-window-title">添加批注</div>
          <FloatEditor onConfirm={confirmAnnotation} onCancel={() => {
            cleanupTempSelection();
            setFloatWindow(s => ({ ...s, visible: false }));
            selectionRangeRef.current = null;
            selectionContextRef.current = null;
          }} />
        </div>
      )}
    </div>
  );
}

function FloatEditor({ onConfirm, onCancel }: { onConfirm: (v: string) => void; onCancel: () => void }) {
  const [val, setVal] = useState("");
  return (
    <div>
      <textarea 
        className="annotation-float-editor-textarea"
        value={val} 
        onChange={e => setVal(e.target.value)} 
        placeholder="输入你的批注内容..." 
      />
      <div className="annotation-float-editor-actions">
        <button className="annotation-float-button annotation-float-button-cancel" onClick={onCancel}>取消</button>
        <button 
          className="annotation-float-button annotation-float-button-confirm" 
          onClick={() => { if (val.trim()) { onConfirm(val.trim()); setVal(""); } }} 
          disabled={!val.trim()}
        >
          确认
        </button>
      </div>
    </div>
  );
}

export default MarkdownAnnotator;
