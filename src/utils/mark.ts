export type ParsedMark = { id: number; start: number; end: number };

export type BoundaryMap = number[];

export type StripResult = {
  clean: string;
  boundaryMap: BoundaryMap;
  marks: ParsedMark[];
};

export function stripMarkTags(raw: string): StripResult {
  const boundaryMap: number[] = [];
  const marks: ParsedMark[] = [];
  let clean = "";
  let i = 0;
  const len = raw.length;
  const stack: { id: number; start: number }[] = [];

  // 跟踪是否在代码块中（``` 或 ```language）
  let inCodeBlock = false;

  // 跟踪是否在行内代码中（`）
  let inInlineCode = false;

  while (i < len) {
    // 检查代码块开始/结束（```）
    if (raw.startsWith("```", i)) {
      // 检查是否是代码块标记（前面是换行或字符串开始，后面是换行、空格、字母数字或字符串结束）
      const beforeIsNewlineOrStart = i === 0 || raw[i - 1] === "\n" || raw[i - 1] === "\r";
      const afterChar = i + 3 < len ? raw[i + 3] : "";
      const isCodeBlockMarker =
        beforeIsNewlineOrStart &&
        (afterChar === "\n" ||
          afterChar === "\r" ||
          afterChar === "" ||
          /[a-zA-Z0-9\s]/.test(afterChar));

      if (isCodeBlockMarker) {
        inCodeBlock = !inCodeBlock;
        // 将代码块标记作为普通文本处理
        // 处理完整的 ``` 标记（3个字符）
        for (let k = 0; k < 3 && i < len; k++) {
          boundaryMap.push(i);
          clean += raw[i];
          i += 1;
        }
        continue;
      }
    }

    // 检查行内代码（`），但不在代码块中
    if (!inCodeBlock && raw[i] === "`") {
      // 检查前后是否有其他字符（不是 ```）
      const prevChars = i >= 2 ? raw.slice(i - 2, i) : "";
      const nextChars = i + 3 <= len ? raw.slice(i + 1, i + 3) : "";
      // 简单的行内代码检测：不是 ``` 的一部分
      if (prevChars !== "``" && nextChars !== "``") {
        inInlineCode = !inInlineCode;
      }
    }

    // 检查 mark 标签（无论在代码块中还是不在）
    // 注意：即使在代码块中，我们也需要解析 mark 标签，以便后续在 DOM 中高亮显示
    if (raw[i] === "<") {
      // 检查是否是 mark 标签开始
      if (raw.startsWith("<mark_", i)) {
        let j = i + 6;
        let num = "";
        // 读取数字 ID
        while (j < len && /[0-9]/.test(raw[j])) {
          num += raw[j++];
        }
        // 检查是否是完整的 mark 标签（以 > 结尾）
        if (j < len && raw[j] === ">") {
          const id = Number(num);
          stack.push({ id, start: clean.length });
          // 跳过整个 <mark_id> 标签
          i = j + 1;
          continue;
        }
        // 如果不是完整的 mark 标签，当作普通文本处理
      } else if (raw.startsWith("</mark_", i)) {
        // 检查是否是 mark 标签结束
        let j = i + 7;
        let num = "";
        // 读取数字 ID
        while (j < len && /[0-9]/.test(raw[j])) {
          num += raw[j++];
        }
        // 检查是否是完整的 mark 标签（以 > 结尾）
        if (j < len && raw[j] === ">") {
          const id = Number(num);
          const openIndex = stack.findIndex((s) => s.id === id);
          if (openIndex !== -1) {
            const open = stack[openIndex];
            marks.push({ id, start: open.start, end: clean.length });
            stack.splice(openIndex, 1);
          }
          // 跳过整个 </mark_id> 标签
          i = j + 1;
          continue;
        }
        // 如果不是完整的 mark 标签，当作普通文本处理
      }
    }

    // 如果在行内代码中，不解析其他内容，直接作为普通文本
    // 注意：代码块中的内容也需要保留，但 mark 标签已经被解析了
    if (inInlineCode && raw[i] !== "<") {
      boundaryMap.push(i);
      clean += raw[i];
      i += 1;
      continue;
    }

    // 其他情况（包括代码块中的普通文本），正常处理
    boundaryMap.push(i);
    clean += raw[i];
    i += 1;
  }
  return { clean, boundaryMap, marks: marks.sort((a, b) => a.start - b.start) };
}

export function injectMarkTags(
  raw: string,
  boundaryMap: number[],
  startClean: number,
  endClean: number,
  id: number
): string {
  // 计算在 raw markdown 中的精确位置
  // boundaryMap[i] 表示 clean markdown 中第 i 个字符在 raw markdown 中的位置
  let startRaw: number;
  let endRaw: number;

  if (startClean < boundaryMap.length) {
    startRaw = boundaryMap[startClean];
  } else {
    // 如果超出范围，使用 raw 的末尾
    startRaw = raw.length;
  }

  if (endClean <= boundaryMap.length) {
    if (endClean === 0) {
      endRaw = 0;
    } else if (endClean === boundaryMap.length) {
      // 如果 endClean 等于 boundaryMap 长度，说明是最后一个字符之后
      endRaw = raw.length;
    } else {
      // endClean 位置在 raw 中的位置
      endRaw = boundaryMap[endClean];
    }
  } else {
    endRaw = raw.length;
  }

  // 确保 endRaw >= startRaw
  if (endRaw < startRaw) {
    endRaw = startRaw;
  }

  const left = raw.slice(0, startRaw);
  const mid = raw.slice(startRaw, endRaw);
  const right = raw.slice(endRaw);
  return `${left}<mark_${id}>${mid}</mark_${id}>${right}`;
}
