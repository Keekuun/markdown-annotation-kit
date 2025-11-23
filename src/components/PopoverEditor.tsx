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
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

    // 将内部 ref 暴露给外部
    useImperativeHandle(forwardedRef, () => popoverRef.current as HTMLDivElement, []);

    // 检测全屏状态并选择合适的容器
    useEffect(() => {
      const getFullscreenElement = (): Element | null => {
        // 类型定义：浏览器前缀属性
        interface DocumentWithPrefixes extends Document {
          webkitFullscreenElement?: Element | null;
          mozFullScreenElement?: Element | null;
          msFullscreenElement?: Element | null;
        }
        const doc = document as DocumentWithPrefixes;
        return (
          document.fullscreenElement ||
          doc.webkitFullscreenElement ||
          doc.mozFullScreenElement ||
          doc.msFullscreenElement ||
          null
        );
      };

      const updatePortalContainer = () => {
        const fullscreenElement = getFullscreenElement();
        if (fullscreenElement && fullscreenElement instanceof HTMLElement) {
          // 如果在全屏模式，使用全屏元素作为容器
          setPortalContainer(fullscreenElement);
        } else {
          // 否则使用 document.body
          setPortalContainer(document.body);
        }
      };

      // 初始设置
      updatePortalContainer();

      // 监听全屏状态变化
      const events = [
        "fullscreenchange",
        "webkitfullscreenchange",
        "mozfullscreenchange",
        "MSFullscreenChange",
      ];

      events.forEach((event) => {
        document.addEventListener(event, updatePortalContainer);
      });

      return () => {
        events.forEach((event) => {
          document.removeEventListener(event, updatePortalContainer);
        });
      };
    }, []);

    // 智能定位：计算最佳位置，避免超出视口
    const popoverStyle = useMemo(() => {
      if (!visible || typeof window === "undefined" || !portalContainer) {
        return null;
      }

      // 获取全屏元素（如果存在）
      const getFullscreenElement = (): Element | null => {
        // 类型定义：浏览器前缀属性
        interface DocumentWithPrefixes extends Document {
          webkitFullscreenElement?: Element | null;
          mozFullScreenElement?: Element | null;
          msFullscreenElement?: Element | null;
        }
        const doc = document as DocumentWithPrefixes;
        return (
          document.fullscreenElement ||
          doc.webkitFullscreenElement ||
          doc.mozFullScreenElement ||
          doc.msFullscreenElement ||
          null
        );
      };

      const fullscreenElement = getFullscreenElement();
      const isFullscreen = fullscreenElement !== null;

      // 获取容器的边界信息
      let containerRect: DOMRect;
      if (isFullscreen && fullscreenElement instanceof HTMLElement) {
        containerRect = fullscreenElement.getBoundingClientRect();
      } else {
        containerRect = {
          left: 0,
          top: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        } as DOMRect;
      }

      // 选中文本的位置信息（相对于视口）
      const selectionTop = position.y;
      const selectionBottom = position.y + position.height;

      // 计算上方和下方可用空间（相对于容器）
      const spaceAbove = selectionTop - containerRect.top - 16;
      const spaceBelow = containerRect.top + containerRect.height - selectionBottom - 16;

      // 计算理想位置：优先放在上方，确保不遮挡选中文本
      let top: number;
      let placement: "top" | "bottom" = "top";

      // 计算上方理想位置：弹窗底部应该在选中文本顶部上方，留出足够的空间
      // 弹窗底部 = top + POPOVER_HEIGHT
      // 箭头从弹窗底部向下延伸 ARROW_SIZE (8px)
      // 箭头底部 = top + POPOVER_HEIGHT + ARROW_SIZE
      // 选中文本顶部 = selectionTop
      // 需要：箭头底部到选中文本顶部有足够的间距（100px）
      // 所以：top + POPOVER_HEIGHT + ARROW_SIZE <= selectionTop - LARGE_GAP
      // 即：top <= selectionTop - POPOVER_HEIGHT - ARROW_SIZE - LARGE_GAP
      const LARGE_GAP = 100; // 弹窗在上方时，箭头底部到选中文本的间距
      const idealTopAbove = selectionTop - POPOVER_HEIGHT - ARROW_SIZE - LARGE_GAP;
      const minTop = containerRect.top + 16;
      const maxTop = containerRect.top + containerRect.height - POPOVER_HEIGHT - 16;

      // 计算下方理想位置：弹窗顶部应该在选中文本底部下方，留出足够的空间
      // 弹窗顶部 = top
      // 选中文本底部 = selectionBottom
      // 需要：top >= selectionBottom + GAP
      const idealTopBelow = selectionBottom + GAP + ARROW_SIZE;

      // 判断是否可以放在上方（不遮挡文本且不超出边界）
      // 确保箭头底部（top + POPOVER_HEIGHT + ARROW_SIZE）不高于选中文本顶部（selectionTop - LARGE_GAP）
      const canPlaceAbove =
        idealTopAbove >= minTop &&
        idealTopAbove <= maxTop &&
        idealTopAbove + POPOVER_HEIGHT + ARROW_SIZE <= selectionTop - LARGE_GAP;

      // 判断是否可以放在下方（不遮挡文本且不超出边界）
      const canPlaceBelow =
        idealTopBelow >= minTop &&
        idealTopBelow <= maxTop &&
        idealTopBelow >= selectionBottom + GAP;

      if (canPlaceAbove) {
        // 可以放在上方，优先选择
        top = idealTopAbove;
        placement = "top";
      } else if (canPlaceBelow) {
        // 可以放在下方
        top = idealTopBelow;
        placement = "bottom";
      } else {
        // 上下都不理想，选择相对更好的位置
        if (spaceAbove > spaceBelow) {
          // 尝试放在上方，但确保不遮挡文本
          top = Math.max(minTop, Math.min(maxTop, idealTopAbove));
          placement = "top";
          // 如果会遮挡文本，强制调整
          if (top + POPOVER_HEIGHT > selectionTop - GAP) {
            // 上方会遮挡，改为下方
            top = Math.max(minTop, Math.min(maxTop, idealTopBelow));
            placement = "bottom";
            // 如果下方也会遮挡，至少保证最小间距
            if (top < selectionBottom + GAP) {
              top = selectionBottom + GAP;
            }
          }
        } else {
          // 放在下方
          top = Math.max(minTop, Math.min(maxTop, idealTopBelow));
          placement = "bottom";
          // 如果会遮挡文本，强制调整
          if (top < selectionBottom + GAP) {
            top = selectionBottom + GAP;
          }
        }
      }

      // 最终验证：确保不遮挡选中文本
      if (placement === "top") {
        // 弹窗在上方：确保箭头底部（top + POPOVER_HEIGHT + ARROW_SIZE）不高于选中文本顶部（留出 LARGE_GAP 空间）
        const arrowBottom = top + POPOVER_HEIGHT + ARROW_SIZE;
        if (arrowBottom > selectionTop - LARGE_GAP) {
          // 会遮挡文本，改为下方
          top = Math.max(idealTopBelow, selectionBottom + GAP);
          placement = "bottom";
        }
      } else {
        // 弹窗在下方：确保弹窗顶部不低于选中文本底部（留出 GAP 空间）
        if (top < selectionBottom + GAP) {
          top = selectionBottom + GAP;
        }
      }

      // 最终边界检查：确保不超出容器（但不能以遮挡文本为代价）
      if (top < minTop) {
        // 如果上方空间不足，尝试下方
        if (placement === "top" && idealTopBelow >= minTop && idealTopBelow <= maxTop) {
          top = idealTopBelow;
          placement = "bottom";
        } else {
          top = minTop;
        }
      }

      if (top + POPOVER_HEIGHT > maxTop + 16) {
        // 如果下方空间不足，尝试上方
        if (placement === "bottom" && idealTopAbove >= minTop && idealTopAbove <= maxTop) {
          top = idealTopAbove;
          placement = "top";
          // 再次验证不遮挡文本
          if (top + POPOVER_HEIGHT + ARROW_SIZE > selectionTop - LARGE_GAP) {
            // 仍然会遮挡，保持在下方但调整位置
            top = Math.max(minTop, selectionBottom + GAP);
            placement = "bottom";
          }
        } else {
          top = maxTop;
        }
      }

      // 水平定位：优先让箭头准确指向选中文本
      // position.x 是选中文本中心的视口坐标
      const selectionCenterX = position.x;
      const ARROW_MIN_MARGIN = 12; // 箭头到弹窗边缘的最小距离

      // 理想情况下，弹窗应该居中于选中文本
      // 但如果选中文本靠近边缘，我们需要调整弹窗位置，确保箭头能够指向选中文本
      let left = selectionCenterX - POPOVER_WIDTH / 2;
      const minLeft = containerRect.left + 16;
      const maxLeft = containerRect.left + containerRect.width - POPOVER_WIDTH - 16;

      // 如果弹窗需要调整位置（因为边界限制），我们需要确保箭头仍然能够指向选中文本
      // 计算箭头在弹窗内的理想位置
      const idealArrowLeft = selectionCenterX - left;

      // 如果理想箭头位置超出限制，调整弹窗位置以容纳箭头
      if (idealArrowLeft < ARROW_MIN_MARGIN) {
        // 箭头太靠左，调整弹窗向右移动
        left = selectionCenterX - ARROW_MIN_MARGIN;
        if (left < minLeft) {
          left = minLeft;
        }
      } else if (idealArrowLeft > POPOVER_WIDTH - ARROW_MIN_MARGIN) {
        // 箭头太靠右，调整弹窗向左移动
        left = selectionCenterX - (POPOVER_WIDTH - ARROW_MIN_MARGIN);
        if (left > maxLeft) {
          left = maxLeft;
        }
      } else {
        // 箭头位置在合理范围内，但弹窗可能因为边界限制需要调整
        if (left < minLeft) {
          left = minLeft;
        } else if (left > maxLeft) {
          left = maxLeft;
        }
      }

      // 重新计算箭头位置（基于调整后的弹窗位置）
      const arrowLeft = selectionCenterX - left;

      // 限制箭头位置，确保不会超出弹窗边界
      const clampedArrowLeft = Math.max(
        ARROW_MIN_MARGIN,
        Math.min(POPOVER_WIDTH - ARROW_MIN_MARGIN, arrowLeft)
      );

      return {
        top: `${top}px`,
        left: `${left}px`,
        placement,
        arrowLeft: `${clampedArrowLeft}px`,
      };
    }, [visible, position, portalContainer]);

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

    if (!visible || !popoverStyle || !portalContainer) {
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
      portalContainer
    );
  }
);

PopoverEditor.displayName = "PopoverEditor";
