const express = require('express');
const { pool } = require('../db');

const router = express.Router();

router.get('/test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.json({
      msg: '数据库连接正常',
      result: rows[0].solution
    });
  } catch (error) {
    res.status(500).json({ msg: '数据库连接失败', error: error.message });
  }
});

module.exports = router;