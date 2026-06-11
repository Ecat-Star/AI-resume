/**
 * AI 响应解析工具
 * 把 AI 返回的文字里提取出 JSON，转成结构化数据
 */

export const parseAIResponse = (text: string) => {
  // 从文字里找出 JSON（找第一个 { 到最后一个 } 之间的内容）
  const found = text.match(/\{[\s\S]*\}/)
  if (!found) {
    // 没找到 JSON，返回空结果
    return { matchScore: 0, missingKeywords: [] as string[], suggestions: [] as string[], optimizedResume: '' }
  }

  let jsonStr = found[0]
  let data: any

  try {
    // 第一次尝试：直接解析
    data = JSON.parse(jsonStr)
  } catch {
    // 解析失败，可能是 AI 在字符串里写了真实换行（应该写 \n）
    // 手动修复：把字符串值里的裸换行替换成 \n
    jsonStr = jsonStr.replace(/:\s*"([\s\S]*?)"\s*([,}])/g, (_: string, val: string, end: string) =>
      `: "${val.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')}"${end}`
    )
    try {
      data = JSON.parse(jsonStr)
    } catch {
      // 修复后还是失败，返回空结果
      return { matchScore: 0, missingKeywords: [] as string[], suggestions: [] as string[], optimizedResume: '' }
    }
  }

  // 返回结构化数据，每个字段都做类型检查，防止 AI 返回格式不对
  return {
    matchScore: typeof data.matchScore === 'number' ? data.matchScore : 0,
    missingKeywords: Array.isArray(data.missingKeywords) ? data.missingKeywords : [],
    suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
    optimizedResume: typeof data.optimizedResume === 'string' ? data.optimizedResume : ''
  }
}
