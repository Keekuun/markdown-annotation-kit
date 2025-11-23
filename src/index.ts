export { MarkdownAnnotator } from "./MarkdownAnnotator";
export type { MarkdownAnnotatorProps, AnnotationItem } from "./MarkdownAnnotator";
export { stripMarkTags, injectMarkTags } from "./utils/mark";
export type { ParsedMark, BoundaryMap, StripResult } from "./utils/mark";
export {
  exportAnnotationData,
  importAnnotationData,
  exportSimplifiedAnnotationData,
  importSimplifiedAnnotationData,
  createDebouncedPersistence,
} from "./utils/persistence";
export type {
  AnnotationData,
  SimplifiedAnnotationData,
  PersistenceCallback,
} from "./utils/persistence";

// Re-export styles for convenience
import "./styles.css";
