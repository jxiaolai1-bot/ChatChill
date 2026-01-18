export const ANALYSIS_PROMPTS = {
  profile: `请根据提供的聊天记录，为"对方"（非"我"的一方）生成人物画像。
请以 JSON 格式返回，不要包含 markdown 格式标记（如 \`\`\`json），格式如下：
{
  "name": "推测的称呼或关系",
  "avatar": "", 
  "traits": ["性格关键词1", "性格关键词2", ...],
  "style": "沟通风格描述",
  "emotion": "情感倾向描述",
  "interests": ["兴趣1", "兴趣2", ...],
  "relationshipStatus": "推测的关系阶段",
  "statusDetail": "关系状态详细描述",
  "chatFrequency": "互动频率描述（基于数据统计）",
  "responseTime": "回复速度描述"
}`,

  decision: `请分析聊天记录中体现的决策模式。
请以 JSON 格式返回，不要包含 markdown 格式标记，格式如下：
{
  "preference": "决策偏好（如：情感驱动、理性分析）",
  "description": "详细描述",
  "issues": ["潜在问题1", "潜在问题2"],
  "suggestions": ["改进建议1", "建议2"],
  "recommendedPhrases": ["推荐沟通话术1", "话术2"]
}`,

  inspiration: `从聊天记录中提取潜在的灵感、待办事项或共同兴趣点。
请以 JSON 格式返回，不要包含 markdown 格式标记，是一个数组：
[
  {
    "id": 1,
    "title": "灵感标题",
    "category": "类别（如：约会计划、兴趣清单、话题储备）",
    "content": "原始内容摘要",
    "execution": "执行建议",
    "keyword": "关键词"
  }
]`,

  mood: `分析聊天记录中的情绪变化趋势。
请以 JSON 格式返回，不要包含 markdown 格式标记，格式如下：
{
  "summary": "情绪总体评价",
  "data": [
    { "day": "时间点（如周一、日期）", "开心": 0-100数值, "平淡": 0-100数值, "烦躁": 0-100数值 }
  ]
}`,

  relationship: `分析两人关系的亲密度变化。
请以 JSON 格式返回，不要包含 markdown 格式标记，格式如下：
{
  "summary": "关系变化总结",
  "data": [
    { "date": "日期", "热度": 0-100数值 }
  ]
}`,

  review: `生成月度复盘报告。
请以 JSON 格式返回，不要包含 markdown 格式标记，格式如下：
{
  "month": "月份",
  "keyword": "本月关键词",
  "summary": "本月沟通总结",
  "bestTopic": "最佳话题",
  "conflict": "主要冲突点（无则填无）",
  "suggestion": "下月建议"
}`
};
