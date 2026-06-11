/**
 * AI 简历分析服务
 * 调用智谱AI，通过 SSE 流式推送分析结果给前端
 */

// 智谱AI 的接口地址和模型名
const AI_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const AI_MODEL = 'glm-4';

// 流式分析：把简历和岗位发给 AI，AI 的回复实时推给前端
const analyzeResumeStream = async (resumeText, jobDesc, res) => {
  // 拼接给 AI 的指令（prompt）
  const prompt = `你是一位资深HR，请分析以下简历与岗位的匹配度。

【岗位描述】
${jobDesc}

【简历内容】
${resumeText}

请先输出中文思考过程（岗位要求、匹配点、不足、优化方向），然后输出 ===JSON_START===，再输出JSON：{"matchScore":0-100整数,"missingKeywords":["缺失关键词"],"suggestions":["建议1","建议2"],"optimizedResume":"优化后简历"}
最后输出 ===JSON_END===

要求：suggestions每条独立不合并，不用编号前缀；思考过程用中文。`;

  // 设置 SSE 响应头（告诉浏览器：这是流式数据，别关连接）
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // 调用智谱AI 接口
    const aiRes = await fetch(AI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ZHIPU_API_KEY}`
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        stream: true  // 开启流式：AI 一个字一个字返回
      })
    });

    if (!aiRes.ok) {
      const errInfo = await aiRes.json().catch(() => ({}));
      throw new Error(errInfo.error?.message || `AI请求失败(${aiRes.status})`);
    }

    // 逐块读取 AI 返回的数据
    const reader = aiRes.body.getReader();
    // 解码器，把二进制数据转换为文本
    const decoder = new TextDecoder();
    let buf = '';  // 临时缓冲区，存还没处理完的数据

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;  // AI 说完了

      // 把收到的二进制数据解码成文字，追加到缓冲区
      buf += decoder.decode(value, { stream: true });

      // 按换行符拆分，逐行处理
      const lines = buf.split('\n');
      buf = lines.pop() || '';  // 最后一行可能不完整，留着下次处理

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;  // SSE 格式：只处理 data: 开头的行
        const data = trimmed.slice(5).trim();         // 去掉 "data:" 前缀
        if (data === '[DONE]') continue;              // 结束标记，跳过

        try {
          // 从 AI 返回的数据里提取文字内容
          const text = JSON.parse(data).choices?.[0]?.delta?.content;
          if (text) {
            // 把文字用 SSE 格式推给前端
            res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
          }
        } catch {}
      }
    }

    // AI 说完了，通知前端结束
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    // 出错了，把错误信息推给前端
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};

module.exports = { analyzeResumeStream };
