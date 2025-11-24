# Markdown Annotation Kit

<div align="center">

![npm version](https://img.shields.io/npm/v/markdown-annotation-kit?style=flat-square)
![npm downloads](https://img.shields.io/npm/dm/markdown-annotation-kit?style=flat-square)
![License](https://img.shields.io/npm/l/markdown-annotation-kit?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square&logo=typescript)
![CI](https://img.shields.io/github/workflow/status/Keekuun/markdown-annotation-kit/CI?style=flat-square)

**A production-ready React component for annotating Markdown documents with selection-based comments and bidirectional anchoring.**

[Features](#-features) • [Installation](#-installation) • [Quick Start](#-quick-start) • [API Reference](#-api-reference) • [Examples](#-examples) • [Contributing](#-contributing)

</div>

---

## ✨ Features

- 🎯 **Precise Text Selection** - Select any text in Markdown to add annotations with context-based positioning that handles duplicate text accurately
- 🔗 **Bidirectional Anchoring** - Click annotation cards to navigate to text, click highlighted text to navigate to annotations
- 🏷️ **Tag System** - Uses `<mark_N></mark_N>` tags for data persistence and serialization
- 🔄 **Tag Echo** - Automatically recognizes and displays saved annotations from tagged markdown
- 🎨 **Modern UI** - Professional, polished interface with smooth animations and transitions
- 📦 **TypeScript** - Full TypeScript support with comprehensive type definitions
- 🎛️ **Controlled/Uncontrolled** - Supports both controlled and uncontrolled modes
- ⚡ **Lightweight** - Minimal dependencies, built on top of `react-markdown`
- ♿ **Accessible** - Keyboard navigation and ARIA attributes support
- 📱 **Touch Optimized** - Native text selection + responsive sidebar for mobile H5
- 🎨 **Customizable** - Easy to customize styles via CSS variables and classes
- 🧪 **Well Tested** - Comprehensive test coverage with Vitest
- 📚 **Well Documented** - Complete API documentation and examples

## 📦 Installation

```bash
# npm
npm install markdown-annotation-kit

# pnpm
pnpm add markdown-annotation-kit

# yarn
yarn add markdown-annotation-kit
```

### Peer Dependencies

This package requires React 17 or higher:

```bash
npm install react react-dom
```

## 🚀 Quick Start

### Basic Usage

```tsx
import { MarkdownAnnotator } from "markdown-annotation-kit";
import "markdown-annotation-kit/styles.css";

function App() {
  const markdown = `# Document Title

This is a paragraph that can be annotated.`;

  return <MarkdownAnnotator defaultValue={markdown} />;
}
```

### Controlled Mode

```tsx
import { useState } from "react";
import { MarkdownAnnotator } from "markdown-annotation-kit";
import type { AnnotationItem } from "markdown-annotation-kit";
import "markdown-annotation-kit/styles.css";

function App() {
  const [markdown, setMarkdown] = useState("# Document Title\n\nContent here...");
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);

  return (
    <MarkdownAnnotator
      value={markdown}
      onChange={setMarkdown}
      annotations={annotations}
      onAnnotationsChange={setAnnotations}
    />
  );
}
```

## 📖 API Reference

### `MarkdownAnnotator`

The main component for rendering and annotating Markdown content.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | Controlled mode: The markdown content with annotation tags |
| `defaultValue` | `string` | `""` | Uncontrolled mode: Initial markdown content |
| `onChange` | `(markdown: string) => void` | - | Controlled mode: Callback when markdown changes |
| `annotations` | `AnnotationItem[]` | - | Controlled mode: Array of annotation items |
| `defaultAnnotations` | `AnnotationItem[]` | `[]` | Uncontrolled mode: Initial annotations |
| `onAnnotationsChange` | `(annotations: AnnotationItem[]) => void` | - | Controlled mode: Callback when annotations change |
| `onPersistence` | `(data: {...}) => void \| Promise<void>` | - | Callback when annotation data changes (with debounce support) |
| `persistenceDebounce` | `number` | `500` | Debounce delay in milliseconds for `onPersistence` callback |
| `className` | `string` | - | Additional CSS class name for the container |

#### Type Definitions

```typescript
type AnnotationItem = {
  id: number;
  note: string;
};
```

### Tag Format

The component uses `<mark_N></mark_N>` tags to persist annotations in the markdown text:

```markdown
This is a <mark_1>highlighted text</mark_1> with an annotation.
```

When you load markdown with these tags, the component automatically:
1. Extracts the annotation positions
2. Displays them in the sidebar
3. Highlights the text in the content area

## 🎨 Customization

### CSS Variables

You can customize the appearance by overriding CSS variables:

```css
:root {
  --markdown-annotator-primary: #2563eb;
  --markdown-annotator-primary-hover: #1d4ed8;
  --markdown-annotator-bg: #ffffff;
  --markdown-annotator-text-primary: #111827;
  /* ... more variables */
}
```

See `src/styles.css` for the complete list of available CSS variables.

### Custom Styles

```tsx
<MarkdownAnnotator
  defaultValue={markdown}
  className="my-custom-annotator"
/>
```

```css
.my-custom-annotator .markdown-annotator-content {
  max-width: 1200px;
  margin: 0 auto;
}
```

## 📚 Examples

### Loading Saved Annotations

```tsx
const savedMarkdown = `# Title

This is <mark_1>annotated text</mark_1> with a saved annotation.`;

const savedAnnotations = [
  { id: 1, note: "This is a saved annotation" }
];

<MarkdownAnnotator
  defaultValue={savedMarkdown}
  defaultAnnotations={savedAnnotations}
/>
```

### Real-time Saving

```tsx
function App() {
  const [markdown, setMarkdown] = useState("");
  const [annotations, setAnnotations] = useState([]);

  useEffect(() => {
    // Save to localStorage or API
    localStorage.setItem("markdown", markdown);
    localStorage.setItem("annotations", JSON.stringify(annotations));
  }, [markdown, annotations]);

  return (
    <MarkdownAnnotator
      value={markdown}
      onChange={setMarkdown}
      annotations={annotations}
      onAnnotationsChange={setAnnotations}
    />
  );
}
```

## 🔧 Development

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Setup

```bash
# Clone the repository
git clone https://github.com/Keekuun/markdown-annotation-kit.git
cd markdown-annotation-kit

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run tests with coverage
- `pnpm lint` - Run linter
- `pnpm lint:fix` - Fix linting issues
- `pnpm format` - Format code
- `pnpm typecheck` - Type check
- `pnpm validate` - Run all checks (typecheck, lint, format, test)
- `pnpm release` - Release new version (auto-update version, CHANGELOG, and create tag)
  - `pnpm release:minor` - Release minor version
  - `pnpm release:major` - Release major version
  - `pnpm release:alpha` - Release alpha pre-release
  - `pnpm release:beta` - Release beta pre-release
  - `pnpm release:rc` - Release rc pre-release

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [react-markdown](https://github.com/remarkjs/react-markdown)
- Inspired by document annotation tools like Google Docs and Microsoft Word

## 📮 Support

- 🐛 [Report a bug](https://github.com/Keekuun/markdown-annotation-kit/issues)
- 💡 [Request a feature](https://github.com/Keekuun/markdown-annotation-kit/issues)
- 📖 [Read the documentation](https://github.com/Keekuun/markdown-annotation-kit#readme)

---

<div align="center">

Made with ❤️ by the Markdown Annotation Kit contributors

</div>
