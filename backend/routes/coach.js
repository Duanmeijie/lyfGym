const express = require('express');
const { pool } = require('../db');
const router = express.Router();

/**
 * GET /api/coaches - 获取教练列表
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM coaches ORDER BY id DESC');
    res.json({ code: 200, data: rows });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

/**
 * POST /api/coaches - 添加教练
 */
router.post('/', async (req, res) => {
  try {
    const { name, specialty, tags, experience, is_gold } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO coaches (name, specialty, tags, experience, is_gold) VALUES (?, ?, ?, ?, ?)',
      [name, specialty, tags, experience, is_gold]
    );
    
    res.json({ 
      code: 200, 
      data: { id: result.insertId, name, specialty, tags, experience, is_gold },
      message: '添加成功' 
    });
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
});

module.exports = router;