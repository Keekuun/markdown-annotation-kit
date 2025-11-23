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

  while (i < len) {
    if (raw[i] === "<") {
      if (raw.startsWith("<mark_", i)) {
        let j = i + 6;
        let num = "";
        while (j < len && /[0-9]/.test(raw[j])) {
          num += raw[j++];
        }
        if (raw[j] === ">") {
          const id = Number(num);
          stack.push({ id, start: clean.length });
          i = j + 1;
          continue;
        }
      } else if (raw.startsWith("</mark_", i)) {
        let j = i + 7;
        let num = "";
        while (j < len && /[0-9]/.test(raw[j])) {
          num += raw[j++];
        }
        if (raw[j] === ">") {
          const id = Number(num);
          const openIndex = stack.findIndex((s) => s.id === id);
          if (openIndex !== -1) {
            const open = stack[openIndex];
            marks.push({ id, start: open.start, end: clean.length });
            stack.splice(openIndex, 1);
          }
          i = j + 1;
          continue;
        }
      }
    }
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
