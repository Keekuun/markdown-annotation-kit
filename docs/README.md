# 文档开发指南

本文档使用 VitePress 构建。

## 开发

```bash
pnpm docs:dev
```

文档将在 `http://localhost:5173` 启动。

## 构建

```bash
pnpm docs:build
```

构建后的文件将输出到 `docs/.vitepress/dist` 目录。

## 预览构建结果

```bash
pnpm docs:preview
```

## 文档结构

```
docs/
├── .vitepress/
│   ├── config.ts          # VitePress 配置
│   └── theme/
│       └── index.ts       # 主题配置
├── api/                   # API 文档
│   ├── index.md
│   ├── markdown-annotator.md
│   ├── types.md
│   └── utils.md
├── examples/              # 示例文档
│   └── index.md
├── guide/                 # 指南文档
│   ├── index.md
│   ├── installation.md
│   ├── quick-start.md
│   ├── controlled-uncontrolled.md
│   ├── tag-format.md
│   ├── interaction.md
│   ├── persistence.md
│   ├── styling.md
│   └── best-practices.md
├── changelog.md           # 更新日志
└── index.md               # 首页
```

## 部署

文档可以部署到：

- GitHub Pages
- Vercel
- Netlify
- 其他静态网站托管服务

### GitHub Pages

1. 构建文档：`pnpm docs:build`
2. 将 `docs/.vitepress/dist` 目录推送到 `gh-pages` 分支
3. 在 GitHub 仓库设置中启用 GitHub Pages

### Vercel

1. 连接 GitHub 仓库到 Vercel
2. 设置构建命令：`pnpm docs:build`
3. 设置输出目录：`docs/.vitepress/dist`

