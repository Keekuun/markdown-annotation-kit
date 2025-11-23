import { useCallback, useRef, useState } from "react";
import { ParsedMark } from "../utils/mark";

export type { ParsedMark };

interface SelectionState {
  visible: boolean;
  x: number;
  y: number;
  height: number;
  text: string;
}

interface UseSelectionHandlerProps {
  markdownRef: React.RefObject<HTMLDivElement>;
  popoverRef: React.RefObject<HTMLDivElement>;
  onSelection: (text: string, context: { before: string; after: string }) => void;
}

export function useSelectionHandler({
  markdownRef,
  popoverRef,
  onSelection,
}: UseSelectionHandlerProps) {
  const [selection, setSelection] = useState<SelectionState>({
    visible: false,
    x: 0,
    y: 0,
    height: 0,
    text: "",
  });

  const tempSelectionSpanRef = useRef<HTMLSpanElement | null>(null);
  const tempSelectionIdRef = useRef<string>("");
  const selectionContextRef = useRef<{ before: string; after: string } | null>(null);

  // 清理临时选中的 span
  const cleanupTempSelection = useCallback(() => {
    if (tempSelectionSpanRef.current) {
      const parent = tempSelectionSpanRef.current.parentNode;
      if (parent) {
        parent.replaceChild(
          document.createTextNode(tempSelectionSpanRef.current.textContent || ""),
          tempSelectionSpanRef.current
        );
        parent.normalize();
      }
      tempSelectionSpanRef.current = null;
      tempSelectionIdRef.current = "";
    }
  }, []);

  // 获取选中文本的上下文
  const getSelectionContext = useCallback(
    (range: Range, container: HTMLElement): { before: string; after: string } => {
      const contextLength = 50;

      const beforeRange = range.cloneRange();
      beforeRange.setStart(container, 0);
      beforeRange.setEnd(range.startContainer, range.startOffset);

      const beforeContainer = document.createDocumentFragment();
      beforeContainer.appendChild(beforeRange.cloneContents());
      let beforeText = beforeContainer.textContent || "";
      if (beforeText.length > contextLength) {
        beforeText = beforeText.slice(-contextLength);
      }

      const afterRange = range.cloneRange();
      afterRange.setStart(range.endContainer, range.endOffset);
      afterRange.setEnd(container, container.childNodes.length);

      const afterContainer = document.createDocumentFragment();
      afterContainer.appendChild(afterRange.cloneContents());
      let afterText = afterContainer.textContent || "";
      if (afterText.length > contextLength) {
        afterText = afterText.slice(0, contextLength);
      }

      return { before: beforeText, after: afterText };
    },
    []
  );

  const handleSelection = useCallback(
    (event?: MouseEvent) => {
      // 如果点击的是弹窗内的元素，不处理选择逻辑
      if (event) {
        const target = event.target as Node;
        if (popoverRef.current && popoverRef.current.contains(target)) {
          // 阻止事件继续传播，避免触发其他逻辑
          event.stopPropagation();
          event.preventDefault();
          return;
        }
      }

      // 如果弹窗已经显示，检查点击目标是否在弹窗内
      // 如果点击的是弹窗内的元素，不处理选择逻辑，也不关闭弹窗
      if (selection.visible && event && popoverRef.current) {
        const target = event.target as Node;
        if (popoverRef.current.contains(target)) {
          // 点击的是弹窗内的元素，不处理选择逻辑，不关闭弹窗
          event.stopPropagation();
          event.preventDefault();
          return;
        }
      }

      cleanupTempSelection();

      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) {
        return;
      }

      const range = sel.getRangeAt(0);
      const selectedText = sel.toString().trim();
      if (!selectedText) {
        return;
      }

      if (!markdownRef.current) {
        setSelection((s) => ({ ...s, visible: false }));
        return;
      }

      if (markdownRef.current.contains(range.commonAncestorContainer)) {
        // 检查是否在已标记区域内
        const checkIfInMarkedArea = (node: Node): boolean => {
          let parent = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element);
          while (parent && parent !== markdownRef.current) {
            if (parent.classList && parent.classList.contains("annotation-highlight")) {
              return true;
            }
            parent = parent.parentElement;
          }
          return false;
        };

        if (checkIfInMarkedArea(range.startContainer) || checkIfInMarkedArea(range.endContainer)) {
          return;
        }

        const context = getSelectionContext(range, markdownRef.current);
        selectionContextRef.current = context;

        // 用临时 span 包裹选中的文本
        try {
          const span = document.createElement("span");
          const tempId = `temp-selection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          span.setAttribute("data-temp-selection-id", tempId);
          span.style.backgroundColor = "rgba(255, 235, 59, 0.3)";
          span.style.borderBottom = "2px solid #ffc107";
          span.style.cursor = "pointer";

          range.surroundContents(span);
          tempSelectionSpanRef.current = span;
          tempSelectionIdRef.current = tempId;

          const rect = range.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top;
          const height = rect.height;

          setSelection({
            visible: true,
            x,
            y,
            height,
            text: selectedText,
          });

          onSelection(selectedText, context);
        } catch (e) {
          console.warn("Failed to wrap selection with span:", e);
          const rect = range.getBoundingClientRect();
          const x = rect.left + rect.width / 2;
          const y = rect.top;
          const height = rect.height;

          setSelection({
            visible: true,
            x,
            y,
            height,
            text: selectedText,
          });

          onSelection(selectedText, context);
        }
      } else {
        setSelection((s) => ({ ...s, visible: false }));
      }
    },
    [
      markdownRef,
      popoverRef,
      selection.visible,
      cleanupTempSelection,
      getSelectionContext,
      onSelection,
      setSelection,
    ]
  );

  return {
    selection,
    setSelection,
    handleSelection,
    cleanupTempSelection,
    selectionContextRef,
    tempSelectionSpanRef,
  };
}
