/**
 * 后端入口文件
 * 启动 Express 服务、连接数据库、注册路由
 */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
// 加载环境变量
dotenv.config();
// 创建 Express 应用
const app = express();

// 配置 CORS
app.use(cors());
// 解析 JSON 请求体
app.use(express.json());

// 连接数据库，process.env.MONGODB_URI 从环境变量中获取
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB 连接成功'))
  .catch(err => console.error('MongoDB 连接失败:', err));

// 注册路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/resume', require('./routes/resume'));

// 健康检查
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 启动服务
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`服务器运行在端口 ${PORT}`));
