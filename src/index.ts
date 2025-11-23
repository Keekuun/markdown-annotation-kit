export { MarkdownAnnotator } from "./MarkdownAnnotator";
export type { MarkdownAnnotatorProps, AnnotationItem } from "./MarkdownAnnotator";
export { stripMarkTags, injectMarkTags } from "./utils/mark";
export type { ParsedMark, BoundaryMap, StripResult } from "./utils/mark";

// Re-export styles for convenience
import "./styles.css";
