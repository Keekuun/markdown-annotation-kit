import { useState, useEffect, useRef, useMemo, useImperativeHandle, forwardRef } from "react";
import { createPortal } from "react-dom";

interface PopoverEditorProps {
  visible: boolean;
  selectedText: string;
  position: { x: number; y: number; height: number };
  onConfirm: (note: string) => void;
  onCancel: () => void;
}

const POPOVER_WIDTH = 320;
const POPOVER_HEIGHT = 180;
const ARROW_SIZE = 8;
const GAP = 12;

export const PopoverEditor = forwardRef<HTMLDivElement, PopoverEditorProps>(
  ({ visible, selectedText, position, onConfirm, onCancel }, forwardedRef) => {
    const [note, setNote] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    // 将内部 ref 暴露给外部
    useImperativeHandle(forwardedRef, () => popoverRef.current as HTMLDivElement, []);

    // 智能定位：计算最佳位置，避免超出视口
    const popoverStyle = useMemo(() => {
      if (!visible || typeof window === "undefined") {
        return null;
      }

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      // 选中文本的位置信息
      const selectionTop = position.y;
      const selectionBottom = position.y + position.height;

      // 计算上方和下方可用空间
      const spaceAbove = selectionTop - scrollY - 16;
      const spaceBelow = scrollY + viewportHeight - selectionBottom - 16;

      // 默认位置：选中文本上方
      let top: number;
      let placement: "top" | "bottom" = "top";

      // 判断放在上方还是下方
      // 如果上方空间足够（至少能放下弹窗），优先放在上方
      // 如果上方空间不足，放在下方
      if (spaceAbove >= POPOVER_HEIGHT + GAP + ARROW_SIZE) {
        // 放在上方
        top = selectionTop - POPOVER_HEIGHT - GAP - ARROW_SIZE;
        placement = "top";
      } else if (spaceBelow >= POPOVER_HEIGHT + GAP + ARROW_SIZE) {
        // 放在下方
        top = selectionBottom + GAP + ARROW_SIZE;
        placement = "bottom";
      } else {
        // 如果上下空间都不足，选择空间更大的一侧
        if (spaceAbove > spaceBelow) {
          // 放在上方，但可能需要调整位置
          top = Math.max(scrollY + 16, selectionTop - POPOVER_HEIGHT - GAP - ARROW_SIZE);
          placement = "top";
        } else {
          // 放在下方，但可能需要调整位置
          top = Math.min(
            scrollY + viewportHeight - POPOVER_HEIGHT - 16,
            selectionBottom + GAP + ARROW_SIZE
          );
          placement = "bottom";
        }
      }

      // 确保不超出视口
      if (top < scrollY + 16) {
        top = scrollY + 16;
      }
      if (top + POPOVER_HEIGHT > scrollY + viewportHeight - 16) {
        top = scrollY + viewportHeight - POPOVER_HEIGHT - 16;
      }

      // 水平居中，但确保不超出视口
      let left = position.x - POPOVER_WIDTH / 2;
      const minLeft = scrollX + 16;
      const maxLeft = scrollX + viewportWidth - POPOVER_WIDTH - 16;

      if (left < minLeft) {
        left = minLeft;
      } else if (left > maxLeft) {
        left = maxLeft;
      }

      // 计算箭头位置（相对于选中文本中心）
      const arrowLeft = position.x - left;

      return {
        top: `${top}px`,
        left: `${left}px`,
        placement,
        arrowLeft: `${Math.max(20, Math.min(POPOVER_WIDTH - 20, arrowLeft))}px`,
      };
    }, [visible, position]);

    // 自动聚焦
    useEffect(() => {
      if (visible && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }, [visible]);

    // 重置状态
    useEffect(() => {
      if (!visible) {
        setNote("");
      }
    }, [visible]);

    // 键盘事件处理
    useEffect(() => {
      if (!visible) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          if (note.trim()) {
            onConfirm(note.trim());
          }
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [visible, note, onConfirm, onCancel]);

    // 点击外部关闭
    useEffect(() => {
      if (!visible) return;

      const handleClickOutside = (e: MouseEvent) => {
        // 如果点击的是弹窗内的任何元素（包括按钮），都不关闭
        // 只有点击外部区域才关闭
        const target = e.target as Node;
        if (popoverRef.current && popoverRef.current.contains(target)) {
          // 不阻止事件传播，让按钮的 onClick 可以正常触发
          return;
        }

        // 点击的是外部区域，关闭弹窗
        onCancel();
      };

      // 使用 capture 阶段捕获，但不在 capture 阶段阻止事件
      // 延迟添加事件监听，避免立即触发（给用户时间点击输入框）
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside, true);
      }, 200);

      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside, true);
      };
    }, [visible, onCancel]);

    if (!visible || !popoverStyle) {
      return null;
    }

    const handleConfirm = (e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      if (note.trim()) {
        onConfirm(note.trim());
        setNote("");
      }
    };

    return createPortal(
      <div
        ref={popoverRef}
        className="annotation-popover"
        style={{
          top: popoverStyle.top,
          left: popoverStyle.left,
        }}
        role="dialog"
        aria-label="添加批注"
        onMouseDown={(e) => {
          // 阻止事件冒泡，防止触发外部点击关闭逻辑
          e.stopPropagation();
        }}
        onClick={(e) => {
          // 阻止事件冒泡，防止触发外部点击关闭逻辑
          e.stopPropagation();
        }}
        onMouseUp={(e) => {
          // 阻止事件冒泡，防止触发外部点击关闭逻辑
          e.stopPropagation();
        }}
      >
        {/* 箭头 */}
        <div
          className={`annotation-popover-arrow annotation-popover-arrow-${popoverStyle.placement}`}
          style={{
            left: popoverStyle.arrowLeft,
          }}
        />

        {/* 内容 */}
        <div
          className="annotation-popover-content"
          onMouseDown={(e) => {
            // 阻止事件冒泡，防止触发外部点击关闭逻辑
            e.stopPropagation();
          }}
          onClick={(e) => {
            // 阻止事件冒泡，防止触发外部点击关闭逻辑
            e.stopPropagation();
          }}
          onMouseUp={(e) => {
            // 阻止事件冒泡，防止触发外部点击关闭逻辑
            e.stopPropagation();
          }}
        >
          <div className="annotation-popover-header">
            <div className="annotation-popover-title">添加批注</div>
            <button
              type="button"
              className="annotation-popover-close"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onCancel();
              }}
              onMouseDown={(e) => {
                // 阻止事件冒泡，防止触发外部点击关闭逻辑
                e.stopPropagation();
              }}
              aria-label="关闭"
            >
              ×
            </button>
          </div>

          <div
            className="annotation-popover-selected-text"
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {selectedText.length > 60 ? `${selectedText.slice(0, 60)}...` : selectedText}
          </div>

          <div
            className="annotation-popover-body"
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <label
              className="annotation-popover-label"
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              批注内容
            </label>
            <textarea
              ref={textareaRef}
              className="annotation-popover-textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onFocus={(e) => {
                e.stopPropagation();
              }}
              placeholder="输入你的批注内容..."
              rows={3}
            />
          </div>

          <div className="annotation-popover-footer">
            <button
              type="button"
              className="annotation-popover-button annotation-popover-button-cancel"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onCancel();
              }}
              onMouseDown={(e) => {
                // 阻止事件冒泡，防止触发外部点击关闭逻辑
                e.stopPropagation();
              }}
            >
              取消
            </button>
            <button
              type="button"
              className="annotation-popover-button annotation-popover-button-confirm"
              onClick={handleConfirm}
              onMouseDown={(e) => {
                // 阻止事件冒泡，防止触发外部点击关闭逻辑
                e.stopPropagation();
              }}
              disabled={!note.trim()}
            >
              确认
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }
);

PopoverEditor.displayName = "PopoverEditor";
