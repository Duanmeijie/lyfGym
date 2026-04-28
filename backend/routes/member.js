const express = require('express');
const { pool } = require('../db');
const router = express.Router();

/**
 * GET /api/members - 获取所有会员列表
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM members ORDER BY id DESC');
    res.json({ code: 200, data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

/**
 * POST /api/members - 添加新会员
 */
router.post('/', async (req, res) => {
  try {
    const { name, phone, type, days_left } = req.body;
    const status = days_left > 0 ? '有效' : '过期';
    
    const [result] = await pool.query(
      'INSERT INTO members (name, phone, type, days_left, status) VALUES (?, ?, ?, ?, ?)',
      [name, phone, type, days_left, status]
    );
    
    res.json({ 
      code: 200, 
      data: { id: result.insertId, name, phone, type, days_left, status },
      message: '添加成功' 
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

/**
 * DELETE /api/members/:id - 删除会员
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM members WHERE id = ?', [id]);
    res.json({ code: 200, message: '删除成功' });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;