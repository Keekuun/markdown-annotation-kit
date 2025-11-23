import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { injectMarkTags, stripMarkTags } from "./utils/mark";
import { getTextPositionByContext } from "./utils/positionCalculator";
import { AnnotationSidebar } from "./components/AnnotationSidebar";
import { HighlightedMarkdown } from "./components/HighlightedMarkdown";
import { PopoverEditor } from "./components/PopoverEditor";
import { useSelectionHandler } from "./hooks/useSelectionHandler";
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

export function MarkdownAnnotator(props: MarkdownAnnotatorProps) {
  const {
    defaultValue = "",
    value,
    onChange,
    defaultAnnotations = [],
    annotations,
    onAnnotationsChange,
    className,
  } = props;

  const [rawMarkdown, setRawMarkdown, isMarkdownControlled] = useControlled<string>(
    value,
    defaultValue
  );
  const [ann, setAnn, isAnnControlled] = useControlled<AnnotationItem[]>(
    annotations,
    defaultAnnotations
  );

  const parse = useMemo(() => stripMarkTags(rawMarkdown), [rawMarkdown]);
  const clean = parse.clean;
  const marks = parse.marks;

  const highlightRefs = useRef<Record<number, HTMLElement | null>>({});
  const markdownRef = useRef<HTMLDivElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const [editIndex, setEditIndex] = useState<number>(-1);
  const [editValue, setEditValue] = useState<string>("");

  // 使用选择处理 hook
  const {
    selection,
    setSelection,
    handleSelection,
    cleanupTempSelection,
    selectionContextRef,
    tempSelectionSpanRef,
  } = useSelectionHandler({
    markdownRef,
    popoverRef,
    onSelection: useCallback(() => {
      // 选择处理逻辑已在 hook 中完成
    }, []),
  });

  // 监听鼠标事件
  useEffect(() => {
    const onMouseUp = (event: MouseEvent) => handleSelection(event);
    document.addEventListener("mouseup", onMouseUp);
    return () => document.removeEventListener("mouseup", onMouseUp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleSelection]);

  // 同步外部 annotations
  useEffect(() => {
    if (annotations && annotations.length) {
      setAnn(annotations);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotations]);

  // 确认批注
  const confirmAnnotation = useCallback(
    (note: string) => {
      const selectedText = selection.text;
      if (!selectedText || !markdownRef.current) {
        cleanupTempSelection();
        setSelection({ visible: false, x: 0, y: 0, height: 0, text: "" });
        return;
      }

      // 优先使用上下文方法（split + 前后文）精确定位
      let position: { start: number; end: number } | null = null;

      if (selectionContextRef.current) {
        position = getTextPositionByContext(clean, selectedText, selectionContextRef.current);
      }

      // 如果上下文方法失败，尝试使用临时 span 方法
      if (!position && tempSelectionSpanRef.current && markdownRef.current) {
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
        console.error("Failed to calculate accurate position for annotation");
        cleanupTempSelection();
        setSelection({ visible: false, x: 0, y: 0, height: 0, text: "" });
        return;
      }

      const { start, end } = position;

      // 验证位置是否在有效范围内
      if (
        start < 0 ||
        end < 0 ||
        start >= end ||
        start > clean.length ||
        end > clean.length
      ) {
        console.error("Invalid position:", { start, end, cleanLength: clean.length });
        cleanupTempSelection();
        setSelection({ visible: false, x: 0, y: 0, height: 0, text: "" });
        return;
      }

      // 验证位置对应的文本是否匹配（使用更宽松的匹配）
      const positionText = clean.slice(start, end);
      const normalizedPosition = positionText.replace(/\s+/g, " ").trim();
      const normalizedSelected = selectedText.replace(/\s+/g, " ").trim();
      if (
        positionText !== selectedText &&
        positionText.trim() !== selectedText.trim() &&
        normalizedPosition !== normalizedSelected &&
        !(
          normalizedPosition.length === normalizedSelected.length &&
          normalizedPosition.length > 0
        )
      ) {
        console.error("Position text mismatch:", {
          positionText,
          selectedText,
          normalizedPosition,
          normalizedSelected,
          start,
          end,
        });
        cleanupTempSelection();
        setSelection({ visible: false, x: 0, y: 0, height: 0, text: "" });
        return;
      }

      const maxId = ann.length ? Math.max(...ann.map((a) => a.id)) : 0;
      const newId =
        Math.max(
          maxId,
          marks.length ? Math.max(...marks.map((m) => m.id)) : 0
        ) + 1;
      const nextRaw = injectMarkTags(rawMarkdown, parse.boundaryMap, start, end, newId);

      if (isMarkdownControlled) onChange && onChange(nextRaw);
      else setRawMarkdown(nextRaw);
      const nextAnn = [...ann, { id: newId, note }];
      if (isAnnControlled) onAnnotationsChange && onAnnotationsChange(nextAnn);
      else setAnn(nextAnn);

      // 清理临时选中标记
      cleanupTempSelection();
      window.getSelection()?.removeAllRanges();
      setSelection({ visible: false, x: 0, y: 0, height: 0, text: "" });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [
      selection.text,
      clean,
      ann,
      marks,
      rawMarkdown,
      parse.boundaryMap,
      isMarkdownControlled,
      onChange,
      isAnnControlled,
      onAnnotationsChange,
      cleanupTempSelection,
      setSelection,
      selectionContextRef,
      tempSelectionSpanRef,
      setRawMarkdown,
      setAnn,
    ]
  );

  // 锚点到高亮
  const anchorToHighlight = useCallback(
    (idx: number) => {
      const item = ann[idx];
      if (!item) return;
      const el = highlightRefs.current[item.id];
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.style.backgroundColor = "rgba(37, 99, 235, 0.2)";
      setTimeout(() => {
        if (el) el.style.backgroundColor = "transparent";
      }, 1000);
    },
    [ann]
  );

  // 处理编辑
  const handleEdit = useCallback(
    (idx: number, cancel?: boolean) => {
      if (cancel) {
        setEditIndex(-1);
        setEditValue("");
        return;
      }
      const item = ann[idx];
      if (!item) return;
      setEditIndex(idx);
      setEditValue(item.note);
    },
    [ann]
  );

  // 确认编辑
  const confirmEdit = useCallback(
    (idx: number) => {
      if (!editValue.trim()) return;
      const next = ann.slice();
      next[idx] = { ...next[idx], note: editValue.trim() };
      if (isAnnControlled) onAnnotationsChange && onAnnotationsChange(next);
      else setAnn(next);
      setEditIndex(-1);
      setEditValue("");
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [editValue, ann, isAnnControlled, onAnnotationsChange, setAnn]
  );

  // 删除批注
  const deleteAnnotation = useCallback(
    (idx: number) => {
      const item = ann[idx];
      if (!item) return;
      const id = item.id;
      const re = new RegExp(`<mark_${id}>(.*?)</mark_${id}>`, "g");
      const nextRaw = rawMarkdown.replace(re, "$1");
      if (isMarkdownControlled) onChange && onChange(nextRaw);
      else setRawMarkdown(nextRaw);
      const nextAnn = ann.filter((_, i) => i !== idx);
      if (isAnnControlled) onAnnotationsChange && onAnnotationsChange(nextAnn);
      else setAnn(nextAnn);
      delete highlightRefs.current[id];
      if (editIndex === idx) {
        setEditIndex(-1);
        setEditValue("");
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [
      ann,
      rawMarkdown,
      isMarkdownControlled,
      onChange,
      isAnnControlled,
      onAnnotationsChange,
      editIndex,
      setRawMarkdown,
      setAnn,
    ]
  );

  // 高亮点击处理
  const handleHighlightClick = useCallback(
    (id: number) => {
      const index = ann.findIndex((a) => a.id === id);
      if (index !== -1) {
        const cardEl = document.getElementById(`annotation-card-${index}`);
        if (cardEl) {
          cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
          (cardEl as HTMLElement).style.borderColor = "#2563eb";
          setTimeout(() => {
            (cardEl as HTMLElement).style.borderColor =
              editIndex === index ? "#2563eb" : "#e5e7eb";
          }, 1000);
        }
      }
    },
    [ann, editIndex]
  );

  // 取消批注
  const handleCancelAnnotation = useCallback(() => {
    cleanupTempSelection();
    setSelection({ visible: false, x: 0, y: 0, height: 0, text: "" });
    window.getSelection()?.removeAllRanges();
  }, [cleanupTempSelection, setSelection]);

  return (
    <div className={`markdown-annotator-container ${className || ""}`}>
      <div ref={markdownRef} className="markdown-annotator-markdown">
        <HighlightedMarkdown
          content={clean}
          marks={marks}
          highlightRefs={highlightRefs}
          onHighlightClick={handleHighlightClick}
        />
      </div>

      <AnnotationSidebar
        annotations={ann}
        editIndex={editIndex}
        editValue={editValue}
        onEdit={handleEdit}
        onEditChange={setEditValue}
        onConfirmEdit={confirmEdit}
        onDelete={deleteAnnotation}
        onAnchorToHighlight={anchorToHighlight}
      />

      <PopoverEditor
        ref={popoverRef}
        visible={selection.visible}
        selectedText={selection.text}
        position={{ x: selection.x, y: selection.y, height: selection.height }}
        onConfirm={confirmAnnotation}
        onCancel={handleCancelAnnotation}
      />
    </div>
  );
}

export default MarkdownAnnotator;
