const Resume = require('../models/Resume');
const { analyzeResumeStream } = require('../services/aiService');

/**
 * 简历控制器
 * 核心流程：创建简历(存文本) → AI流式分析(返回匹配度+缺失关键词+建议) → 保存结果
 */

// 创建简历：只存原始文本和岗位描述
// 关键词匹配由 AI 分析时完成，更准确
const createResume = async (req, res) => {
  try {
    const { originalText, jobDescription } = req.body;

    if (!originalText || !originalText.trim()) {
      return res.status(400).json({ message: '请输入简历内容' });
    }
    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ message: '请输入岗位描述' });
    }

    const resume = new Resume({
      userId: req.userId,
      originalText,
      jobDescription
    });

    await resume.save();

    res.status(201).json({
      message: '简历创建成功',
      resume: {
        id: resume._id,
        originalText,
        jobDescription,
        createdAt: resume.createdAt
      }
    });
  } catch (error) {
    console.error('简历创建失败:', error);
    res.status(500).json({ message: '简历创建失败', error: error.message });
  }
};

// 获取历史记录列表
const getHistory = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.userId })
      .select('_id matchScore jobDescription createdAt')
      .sort({ createdAt: -1 });

    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: '获取历史记录失败', error: error.message });
  }
};

// 获取单条简历详情
const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.userId });
    if (!resume) {
      return res.status(404).json({ message: '简历不存在' });
    }
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: '获取简历详情失败', error: error.message });
  }
};

// 流式分析（SSE 推送）
// AI 先输出思考过程，再输出 JSON 结果，前端实时展示
const analyzeResumeStreamController = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.userId });
    if (!resume) {
      return res.status(404).json({ message: '简历不存在' });
    }

    await analyzeResumeStream(resume.originalText, resume.jobDescription, res);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ message: '简历分析失败', error: error.message });
    } else {
      console.error('流式分析中途出错:', error.message);
    }
  }
};

// 保存分析结果（前端分析完成后调用）
const saveResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.userId });
    if (!resume) {
      return res.status(404).json({ message: '简历不存在' });
    }

    if (req.body.optimizedResume) resume.optimizedResume = req.body.optimizedResume;
    if (req.body.matchScore !== undefined) resume.matchScore = req.body.matchScore;
    if (req.body.missingKeywords) resume.missingKeywords = req.body.missingKeywords;
    if (req.body.suggestions) resume.suggestions = req.body.suggestions;
    if (req.body.analysisResult) resume.analysisResult = req.body.analysisResult;
    await resume.save();

    res.json({ message: '保存成功', resume });
  } catch (error) {
    res.status(500).json({ message: '保存失败', error: error.message });
  }
};

// 删除简历
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!resume) {
      return res.status(404).json({ message: '简历不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除失败', error: error.message });
  }
};

module.exports = {
  createResume, getHistory, getResumeById,
  analyzeResumeStreamController,
  saveResume, deleteResume
};
