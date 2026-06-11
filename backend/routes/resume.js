const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createResume, getHistory, getResumeById,
  analyzeResumeStreamController,
  saveResume, deleteResume
} = require('../controllers/resumeController');

// 创建简历（粘贴文本）
router.post('/create', auth, createResume);
// 获取历史记录
router.get('/history', auth, getHistory);
// 获取简历详情
router.get('/:id', auth, getResumeById);
// 流式分析（SSE）
router.post('/:id/analyze-stream', auth, analyzeResumeStreamController);
// 保存分析结果
router.put('/:id', auth, saveResume);
// 删除简历
router.delete('/:id', auth, deleteResume);

module.exports = router;
