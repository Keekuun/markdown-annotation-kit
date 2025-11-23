/**
 * 使用 split 方法通过上下文精确定位重复文本
 * 这是简单粗暴但有效的方法：通过前后文本来唯一确定位置
 */
export function getTextPositionByContext(
  clean: string,
  selectedText: string,
  context: { before: string; after: string }
): { start: number; end: number } | null {
  if (!selectedText || !context) {
    return null;
  }

  // 使用 split 方法分割文本
  const parts = clean.split(selectedText);

  if (parts.length < 2) {
    // 没有找到匹配的文本
    return null;
  }

  // 规范化上下文文本（去除多余空白）
  const normalize = (text: string) => text.replace(/\s+/g, " ").trim();
  const normalizedBefore = normalize(context.before);
  const normalizedAfter = normalize(context.after);

  // 遍历所有可能的匹配位置，通过前后上下文来精确定位
  let currentPos = 0;
  let bestMatch: {
    start: number;
    end: number;
    beforeScore: number;
    afterScore: number;
  } | null = null;

  for (let i = 0; i < parts.length - 1; i++) {
    const beforePart = parts[i];

    // 计算当前位置
    currentPos += beforePart.length;
    const start = currentPos;
    const end = currentPos + selectedText.length;

    // 获取该位置前后的上下文
    const contextBefore = clean.slice(
      Math.max(0, start - Math.max(context.before.length, 100)),
      start
    );
    const contextAfter = clean.slice(
      end,
      Math.min(clean.length, end + Math.max(context.after.length, 100))
    );

    // 规范化获取的上下文
    const normalizedContextBefore = normalize(contextBefore);
    const normalizedContextAfter = normalize(contextAfter);

    // 计算匹配分数（匹配的字符数）
    let beforeScore = 0;
    let afterScore = 0;

    // 检查前文匹配：从后往前比较
    if (normalizedBefore.length > 0 && normalizedContextBefore.length > 0) {
      const minLen = Math.min(normalizedBefore.length, normalizedContextBefore.length);
      for (let j = 1; j <= minLen; j++) {
        if (normalizedContextBefore.slice(-j) === normalizedBefore.slice(-j)) {
          beforeScore = j;
        } else {
          break;
        }
      }
    }

    // 检查后文匹配：从前往后比较
    if (normalizedAfter.length > 0 && normalizedContextAfter.length > 0) {
      const minLen = Math.min(normalizedAfter.length, normalizedContextAfter.length);
      for (let j = 1; j <= minLen; j++) {
        if (normalizedContextAfter.slice(0, j) === normalizedAfter.slice(0, j)) {
          afterScore = j;
        } else {
          break;
        }
      }
    }

    // 如果前后文都完全匹配，直接返回
    if (beforeScore === normalizedBefore.length && afterScore === normalizedAfter.length) {
      return { start, end };
    }

    // 记录最佳匹配（优先选择前后文匹配都较好的）
    if (!bestMatch) {
      bestMatch = { start, end, beforeScore, afterScore };
    } else {
      const currentTotal = beforeScore + afterScore;
      const bestTotal = bestMatch.beforeScore + bestMatch.afterScore;
      // 如果当前匹配更好，或者总分相同但前后文都匹配更好
      if (
        currentTotal > bestTotal ||
        (currentTotal === bestTotal &&
          beforeScore > 0 &&
          afterScore > 0 &&
          (bestMatch.beforeScore === 0 || bestMatch.afterScore === 0))
      ) {
        bestMatch = { start, end, beforeScore, afterScore };
      }
    }

    // 移动到下一个可能的位置
    currentPos += selectedText.length;
  }

  // 如果找到了匹配，返回最佳匹配
  // 要求前后文至少各有一些匹配，或者只有一个匹配位置
  if (bestMatch) {
    const minBeforeScore = Math.min(3, normalizedBefore.length);
    const minAfterScore = Math.min(3, normalizedAfter.length);

    // 如果前后文都有一定匹配，或者只有一个匹配位置，返回它
    if (
      (bestMatch.beforeScore >= minBeforeScore && bestMatch.afterScore >= minAfterScore) ||
      (bestMatch.beforeScore > 0 && bestMatch.afterScore > 0) ||
      parts.length === 2
    ) {
      return { start: bestMatch.start, end: bestMatch.end };
    }
  }

  return null;
}
