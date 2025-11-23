import { AnnotationItem } from "../MarkdownAnnotator";
import { ParsedMark } from "./mark";

/**
 * 批注数据的完整结构，用于持久化
 */
export interface AnnotationData {
  /**
   * 批注列表
   */
  annotations: AnnotationItem[];
  /**
   * 标记位置信息
   */
  marks: ParsedMark[];
  /**
   * 原始 Markdown 内容（包含标签）
   */
  markdown: string;
  /**
   * 清理后的 Markdown 内容（不包含标签）
   */
  cleanMarkdown: string;
  /**
   * 版本号，用于兼容性检查
   */
  version: string;
  /**
   * 创建时间戳
   */
  createdAt: number;
  /**
   * 更新时间戳
   */
  updatedAt: number;
}

/**
 * 导出批注数据为 JSON 字符串
 * @param markdown 包含标签的原始 Markdown
 * @param annotations 批注列表
 * @param marks 标记位置信息
 * @param cleanMarkdown 清理后的 Markdown（可选，如果不提供会自动计算）
 * @returns JSON 字符串
 */
export function exportAnnotationData(
  markdown: string,
  annotations: AnnotationItem[],
  marks: ParsedMark[],
  cleanMarkdown?: string
): string {
  const data: AnnotationData = {
    annotations,
    marks,
    markdown,
    cleanMarkdown: cleanMarkdown || markdown.replace(/<mark_\d+>|<\/mark_\d+>/g, ""),
    version: "1.0.0",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return JSON.stringify(data, null, 2);
}

/**
 * 从 JSON 字符串导入批注数据
 * @param jsonString JSON 字符串
 * @returns 批注数据对象
 * @throws 如果 JSON 格式不正确或版本不兼容
 */
export function importAnnotationData(jsonString: string): AnnotationData {
  try {
    const data = JSON.parse(jsonString) as AnnotationData;

    // 验证必需字段
    if (!data.annotations || !Array.isArray(data.annotations)) {
      throw new Error("Invalid annotation data: annotations must be an array");
    }

    if (!data.marks || !Array.isArray(data.marks)) {
      throw new Error("Invalid annotation data: marks must be an array");
    }

    if (typeof data.markdown !== "string") {
      throw new Error("Invalid annotation data: markdown must be a string");
    }

    // 更新时间戳
    data.updatedAt = Date.now();
    if (!data.createdAt) {
      data.createdAt = Date.now();
    }

    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON format: ${error.message}`);
    }
    throw error;
  }
}

/**
 * 导出批注数据为简化格式（仅包含批注和标记，不包含 Markdown）
 * 适用于只需要批注数据的场景
 */
export interface SimplifiedAnnotationData {
  annotations: AnnotationItem[];
  marks: ParsedMark[];
  version: string;
  updatedAt: number;
}

/**
 * 导出简化格式的批注数据
 * @param annotations 批注列表
 * @param marks 标记位置信息
 * @returns JSON 字符串
 */
export function exportSimplifiedAnnotationData(
  annotations: AnnotationItem[],
  marks: ParsedMark[]
): string {
  const data: SimplifiedAnnotationData = {
    annotations,
    marks,
    version: "1.0.0",
    updatedAt: Date.now(),
  };

  return JSON.stringify(data, null, 2);
}

/**
 * 从简化格式导入批注数据
 * @param jsonString JSON 字符串
 * @returns 简化格式的批注数据
 */
export function importSimplifiedAnnotationData(jsonString: string): SimplifiedAnnotationData {
  try {
    const data = JSON.parse(jsonString) as SimplifiedAnnotationData;

    if (!data.annotations || !Array.isArray(data.annotations)) {
      throw new Error("Invalid annotation data: annotations must be an array");
    }

    if (!data.marks || !Array.isArray(data.marks)) {
      throw new Error("Invalid annotation data: marks must be an array");
    }

    data.updatedAt = Date.now();

    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON format: ${error.message}`);
    }
    throw error;
  }
}

/**
 * 持久化回调函数的类型定义
 */
export type PersistenceCallback = (data: AnnotationData) => void | Promise<void>;

/**
 * 创建防抖的持久化函数
 * @param callback 持久化回调函数
 * @param delay 防抖延迟时间（毫秒），默认 500ms
 * @returns 防抖后的持久化函数
 */
export function createDebouncedPersistence(
  callback: PersistenceCallback,
  delay: number = 500
): (data: AnnotationData) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (data: AnnotationData) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      callback(data);
      timeoutId = null;
    }, delay);
  };
}

