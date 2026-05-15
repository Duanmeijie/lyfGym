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
app.use('/api/ai', require('./routes/ai'));
app.use('/api/products', require('./routes/product'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/courses', require('./routes/course'));
app.use('/api/revenue', require('./routes/revenue'));
app.use('/api/announcements', require('./routes/announcement'));
app.use('/api/bookings', require('./routes/booking'));
app.use('/api/members', require('./routes/member_detail'));
app.use('/api', require('./routes/test'));

// 测试接口
app.get('/test', (req, res) => {
  res.json({ code: 200, message: '后端收到请求，连接成功！' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;