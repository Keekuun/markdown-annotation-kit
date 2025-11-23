# 交互式演示

在这里你可以直接体验 Markdown Annotation Kit 的所有功能。

## 在线演示

<div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin: 20px 0;">
  <iframe 
    src="/markdown-annotation-kit/demo.html" 
    style="width: 100%; height: 800px; border: none;"
    title="Markdown Annotation Kit 交互式演示"
  ></iframe>
</div>

## 本地演示

如果你想在本地运行完整的演示，可以：

1. 克隆仓库：
```bash
git clone https://github.com/Keekuun/markdown-annotation-kit.git
cd markdown-annotation-kit
```

2. 安装依赖：
```bash
pnpm install
```

3. 启动开发服务器：
```bash
pnpm dev
```

4. 访问 `http://localhost:5173` 查看完整演示

## 功能体验

在演示中，你可以：

- ✅ **选择文本** - 在 Markdown 内容中选择任意文本
- ✅ **添加批注** - 在弹出的输入框中输入批注内容
- ✅ **查看批注** - 在右侧侧边栏查看所有批注
- ✅ **编辑批注** - 点击批注卡片的编辑按钮修改内容
- ✅ **删除批注** - 点击批注卡片的删除按钮移除批注
- ✅ **双向锚定** - 点击高亮文本跳转到批注，点击批注跳转到文本
- ✅ **代码块批注** - 在代码块中选择代码进行批注

## 提示

- 选中文本后，会在文本上方弹出输入框
- 使用 `Esc` 键可以取消添加批注
- 使用 `Cmd/Ctrl + Enter` 可以快速确认添加批注
- 批注数据会自动保存到浏览器的 localStorage

