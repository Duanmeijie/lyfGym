const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connect } = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 数据库连接
connect();

// 路由挂载
app.use('/api/auth', require('./routes/auth'));
app.use('/api/members', require('./routes/member'));
app.use('/api/coaches', require('./routes/coach'));
app.use('/api', require('./routes/test'));

// 测试接口
app.get('/test', (req, res) => {
  res.json({ code: 200, message: '后端收到请求，连接成功！' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;