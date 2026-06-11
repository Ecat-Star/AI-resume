/**
 * 简历数据模型
 * 存储简历文本、岗位描述和 AI 分析结果
 * 关键词匹配由 AI 分析时完成，不在这里存预匹配结果
 */
const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 用户粘贴的简历原文
  originalText: {
    type: String,
    required: true
  },
  // 目标岗位描述（JD）
  jobDescription: {
    type: String,
    required: true
  },
  // AI 分析的匹配分数（0-100）
  matchScore: {
    type: Number,
    default: null
  },
  // AI 分析出的缺失关键词
  missingKeywords: [{
    type: String
  }],
  // 分析结果摘要
  analysisResult: {
    type: String,
    default: ''
  },
  // AI 给出的优化建议
  suggestions: [{
    type: String
  }],
  // AI 优化后的简历
  optimizedResume: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resume', resumeSchema);
