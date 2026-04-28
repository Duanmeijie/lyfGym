const express = require('express');
const router = express.Router();

/**
 * POST /api/auth/login
 * 登录接口（暂时硬编码验证 admin/123456）
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // 简单验证（生产环境请使用数据库查询 + BCrypt 比对）
  if (username === 'admin' && password === '123456') {
    // 模拟 Token（生产环境请使用 jsonwebtoken 库生成 JWT）
    const token = 'lyf-gym-token-' + Date.now();
    const userInfo = { id: 1, username: 'admin', role: 'admin' };

    res.json({
      code: 200,
      data: { token, userInfo },
      message: '登录成功'
    });
  } else {
    res.status(401).json({
      code: 401,
      message: '账号或密码错误'
    });
  }
});

module.exports = router;