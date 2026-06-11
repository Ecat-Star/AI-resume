/**
 * JWT 认证中间件
 * 作用：从请求头中提取 token，验证用户身份
 * 用法：挂在需要登录的路由上，如 router.use(auth)
 */
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // 从请求头取出 token（格式：Bearer xxx）
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: '未提供认证令牌，请先登录' });
  }

  try {
    // 验证 token 是否有效，有效则把 userId 挂到 req 上供后续使用
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: '令牌无效或已过期，请重新登录' });
  }
};

module.exports = auth;
