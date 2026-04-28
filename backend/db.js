require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'lyf_gym_db',
  port: process.env.DB_PORT || 3306,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0
});

async function connect() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log('✅ MySQL 数据库连接成功');
  } catch (error) {
    console.error('❌ MySQL 连接失败:', error.message);
    process.exit(1);
  }
}

module.exports = { pool, connect };