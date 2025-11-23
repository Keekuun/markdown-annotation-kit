<template>
  <div class="interactive-demo" :class="{ 'is-fullscreen': isFullscreen }" ref="demoRef">
    <div class="demo-header">
      <span class="demo-tip">💡 提示：选中下方文本即可添加批注，点击高亮文本可跳转到批注</span>
      <button class="demo-fullscreen-btn" @click="toggleFullscreen" :aria-label="isFullscreen ? '退出全屏' : '全屏'">
        <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
        </svg>
      </button>
    </div>
    <div ref="containerRef" class="demo-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const containerRef = ref<HTMLElement>()
const demoRef = ref<HTMLElement>()
const isFullscreen = ref(false)

let reactRoot: any = null

const toggleFullscreen = () => {
  if (!demoRef.value) return

  if (!isFullscreen.value) {
    // 进入全屏
    if (demoRef.value.requestFullscreen) {
      demoRef.value.requestFullscreen()
    } else if ((demoRef.value as any).webkitRequestFullscreen) {
      (demoRef.value as any).webkitRequestFullscreen()
    } else if ((demoRef.value as any).mozRequestFullScreen) {
      (demoRef.value as any).mozRequestFullScreen()
    } else if ((demoRef.value as any).msRequestFullscreen) {
      (demoRef.value as any).msRequestFullscreen()
    }
  } else {
    // 退出全屏
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen()
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen()
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen()
    }
  }
}

const handleFullscreenChange = () => {
  isFullscreen.value = !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  )
}

onMounted(async () => {
  // 监听全屏状态变化
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('mozfullscreenchange', handleFullscreenChange)
  document.addEventListener('MSFullscreenChange', handleFullscreenChange)

  if (!containerRef.value) return

  try {
    // 动态加载 React 和组件
    const [React, ReactDOM] = await Promise.all([
      import('react'),
      import('react-dom/client')
    ])

    // 从源码导入组件（VitePress 会处理）
    const { MarkdownAnnotator } = await import('markdown-annotation-kit')
    
    // 导入样式
    await import('markdown-annotation-kit/styles.css')

    const DEFAULT_MARKDOWN = `# Markdown 文档批注示例

## 功能特性

这是一个功能强大的 Markdown 批注组件，支持以下特性：

- **文本选择批注** - 选中任意文本即可添加批注
- **双向锚定** - 点击批注卡片定位到原文，点击高亮文本定位到批注
- **标签系统** - 使用 \`<mark_N></mark_N>\` 标签持久化批注数据
- **标签回显** - 自动识别并回显已保存的批注标签

> 这个组件是用来在 Markdown 文档中添加批注功能的。

> 你可以选中任意文本，在弹出的浮窗中输入批注内容，点击确认即可。

> 你可以点击批注卡片定位到原文，点击高亮文本定位到批注。

## 使用说明

1. **添加批注**：选中任意文本，在弹出的浮窗中输入批注内容，点击确认即可。

2. **查看批注**：侧边栏会显示所有批注卡片，点击卡片可以定位到原文位置。

3. **编辑批注**：点击批注卡片上的"编辑"按钮，修改批注内容。

4. **删除批注**：点击批注卡片上的"删除"按钮，移除批注。

## 代码示例

\`\`\`typescript
import { MarkdownAnnotator } from 'markdown-annotation-kit';

function App() {
  return (
    <MarkdownAnnotator
      defaultValue="# 标题\\n\\n这是内容。"
    />
  );
}
\`\`\`

## 更多信息

查看文档了解更多使用方法和 API 文档。`

    // 创建 React 根节点
    reactRoot = ReactDOM.createRoot(containerRef.value)
    
    // 渲染组件
    reactRoot.render(
      React.createElement(MarkdownAnnotator, {
        defaultValue: DEFAULT_MARKDOWN,
      })
    )
  } catch (error) {
    console.error('Failed to load React component:', error)
    if (containerRef.value) {
      containerRef.value.innerHTML = `
        <div style="padding: 40px; text-align: center; color: #666;">
          <p>无法加载演示组件。请确保已运行 <code>pnpm build</code> 构建组件。</p>
          <p style="margin-top: 20px; font-size: 14px; color: #999;">
            或者访问 <a href="http://localhost:5173" target="_blank">开发服务器</a> 查看完整演示。
          </p>
        </div>
      `
    }
  }
})

onUnmounted(() => {
  // 移除全屏监听
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
  document.removeEventListener('MSFullscreenChange', handleFullscreenChange)

  if (reactRoot) {
    reactRoot.unmount()
  }
})
</script>

<style scoped>
.interactive-demo {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  margin: 24px 0;
  background: var(--vp-c-bg);
  position: relative;
  transition: all 0.3s ease;
}

.interactive-demo.is-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  border-radius: 0;
  z-index: 9999;
  border: none;
}

.demo-header {
  padding: 12px 16px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.demo-tip {
  color: var(--vp-c-text-2);
  flex: 1;
}

.demo-fullscreen-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.demo-fullscreen-btn:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-brand);
}

.demo-fullscreen-btn:active {
  transform: scale(0.95);
}

.demo-fullscreen-btn svg {
  width: 16px;
  height: 16px;
}

.demo-container {
  height: 600px;
  min-height: 600px;
  position: relative;
}

.interactive-demo.is-fullscreen .demo-container {
  height: calc(100vh - 49px);
  min-height: calc(100vh - 49px);
}

@media (max-width: 768px) {
  .demo-container {
    height: 500px;
    min-height: 500px;
  }

  .interactive-demo.is-fullscreen .demo-container {
    height: calc(100vh - 49px);
    min-height: calc(100vh - 49px);
  }

  .demo-tip {
    font-size: 12px;
  }
}
</style>

