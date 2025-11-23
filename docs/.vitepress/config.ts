import { defineConfig } from "vitepress";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  title: "Markdown Annotation Kit",
  description:
    "A production-ready React component for annotating Markdown documents with selection-based comments and bidirectional anchoring",
  base: "/markdown-annotation-kit/",
  lang: "zh-CN",
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    ["meta", { name: "keywords", content: "react, markdown, annotation, 批注, 注释" }],
  ],
  vite: {
    plugins: [react()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "../../src"),
        "markdown-annotation-kit": resolve(__dirname, "../../src"),
      },
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-markdown", "remark-gfm", "rehype-raw"],
    },
    ssr: {
      noExternal: ["markdown-annotation-kit"],
    },
  },
  themeConfig: {
    logo: "/logo.svg",
    nav: [
      { text: "首页", link: "/" },
      { text: "指南", link: "/guide/" },
      { text: "API", link: "/api/" },
      { text: "示例", link: "/examples/" },
      { text: "更新日志", link: "/changelog" },
      {
        text: "GitHub",
        link: "https://github.com/Keekuun/markdown-annotation-kit",
      },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "开始使用",
          items: [
            { text: "介绍", link: "/guide/" },
            { text: "安装", link: "/guide/installation" },
            { text: "快速开始", link: "/guide/quick-start" },
          ],
        },
        {
          text: "核心概念",
          items: [
            { text: "受控与非受控", link: "/guide/controlled-uncontrolled" },
            { text: "标签格式", link: "/guide/tag-format" },
            { text: "交互行为", link: "/guide/interaction" },
          ],
        },
        {
          text: "高级用法",
          items: [
            { text: "持久化", link: "/guide/persistence" },
            { text: "自定义样式", link: "/guide/styling" },
            { text: "最佳实践", link: "/guide/best-practices" },
          ],
        },
      ],
      "/api/": [
        {
          text: "API 参考",
          items: [
            { text: "概述", link: "/api/" },
            { text: "MarkdownAnnotator", link: "/api/markdown-annotator" },
            { text: "类型定义", link: "/api/types" },
            { text: "工具函数", link: "/api/utils" },
          ],
        },
      ],
      "/examples/": [
        {
          text: "示例",
          items: [
            { text: "交互式演示", link: "/examples/" },
            { text: "基础示例", link: "/examples/basic" },
            { text: "受控模式", link: "/examples/controlled" },
            { text: "持久化", link: "/examples/persistence" },
            { text: "自定义样式", link: "/examples/styling" },
          ],
        },
      ],
    },
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/Keekuun/markdown-annotation-kit",
      },
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2024 Markdown Annotation Kit Contributors",
    },
    search: {
      provider: "local",
    },
  },
});

